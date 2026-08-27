import { useState, useEffect } from 'react'

type Res = { food:number, oil:number, steel:number }
type Building = { id:string, name:string, icon:string, lvl:number, unlocked:boolean, ruined:boolean }

const COSTS = {
  farm1: { oil:270, food:0 }, // Real Camel cost
  oil1: { food:270, oil:0 },
  depot1: { food:0, oil:0 },
}

export default function App(){
  const [res, setRes] = useState<Res>({ food:500, oil:500, steel:0 })
  const [mainHall, setMainHall] = useState(1)
  const [buildings, setBuildings] = useState<Building[]>([
    { id:'main', name:'Main Hall', icon:'🏛️', lvl:1, unlocked:true, ruined:false },
    { id:'farm', name:'Farm', icon:'🌾', lvl:0, unlocked:false, ruined:true },
    { id:'oil', name:'Oil Refinery', icon:'🛢️', lvl:0, unlocked:false, ruined:true },
    { id:'depot', name:'Depot', icon:'🏦', lvl:0, unlocked:false, ruined:true },
    { id:'wall', name:'City Wall', icon:'🧱', lvl:0, unlocked:false, ruined:true },
    { id:'garage', name:'Garage', icon:'🚛', lvl:0, unlocked:false, ruined:true },
  ])
  const [log, setLog] = useState('Командир! Градът е в руини. Изчисти зомбитата за да построиш Farm.')

  // Производство на ресурси - истинските 400/час от Camel
  useEffect(()=>{
    const id=setInterval(()=>{
      const farmLvl = buildings.find(b=>b.id==='farm')?.lvl || 0
      const oilLvl = buildings.find(b=>b.id==='oil')?.lvl || 0
      if(farmLvl>0) setRes(r=>({...r, food: r.food + (400*farmLvl)/3600 }))
      if(oilLvl>0) setRes(r=>({...r, oil: r.oil + (400*oilLvl)/3600 }))
    },1000)
    return()=>clearInterval(id)
  },[buildings])

  const clearRuins = (id:string) => {
    // мини битка - изчистване
    setBuildings(bs=>bs.map(b=> b.id===id? {...b, ruined:false, unlocked:true} : b))
    setLog(`Изчисти ${id}! Сега можеш да построиш.`)
  }

  const build = (id:string) => {
    const cost = id==='farm'? COSTS.farm1 : id==='oil'? COSTS.oil1 : COSTS.depot1
    if(res.food < (cost.food||0) || res.oil < (cost.oil||0)){ setLog('Няма ресурси! Събирай!'); return }
    setRes(r=>({ food:r.food-(cost.food||0), oil:r.oil-(cost.oil||0), steel:r.steel }))
    setBuildings(bs=>bs.map(b=> b.id===id? {...b, lvl:1} : b))
    setLog(`${id} построен Lv.1! Дава 400/час.`)
  }

  return (
    <div style={{maxWidth:'600px', margin:'0 auto', background:'#0f1210', minHeight:'100vh', color:'#e8e8e8', padding:'12px'}}>
      <div style={{display:'flex', justifyContent:'space-around', background:'#1a1f1c', padding:'10px', borderRadius:'8px', fontWeight:700}}>
        <span>🌽 {Math.floor(res.food)}</span>
        <span>🛢️ {Math.floor(res.oil)}</span>
        <span>Main Hall Lv.{mainHall}</span>
      </div>
      <p style={{fontSize:'12px', color:'#7cff6b', margin:'10px 0', background:'#1a2a1a', padding:'8px', borderRadius:'6px'}}>{log}</p>

      {buildings.map(b=>(
        <div key={b.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:b.ruined?'#2a1a1a':'#1a1f1c', border:'1px solid #2a3a2e', padding:'12px', borderRadius:'8px', marginBottom:'8px', opacity:b.ruined?0.7:1}}>
          <div><span style={{fontSize:'24px'}}>{b.ruined?'💀':b.icon}</span> <b>{b.name}</b> {b.lvl>0?`Lv.${b.lvl}`:''} {b.ruined && <small style={{color:'#ff4d4d'}}> - В РУИНИ, ЗОМБИТА!</small>}</div>
          {b.ruined? (
            <button onClick={()=>clearRuins(b.id)} style={{background:'#ff4d4d', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', fontWeight:800}}>ИЗЧИСТИ</button>
          ) : b.lvl===0? (
            <button onClick={()=>build(b.id)} style={{background:'#7cff6b', color:'black', border:'none', padding:'6px 12px', borderRadius:'6px', fontWeight:800}}>
              {b.id==='farm'? '270 Oil' : b.id==='oil'? '270 Food' : 'FREE'} - СТРОЙ
            </button>
          ) : (
            <span style={{color:'#7cff6b'}}>✓ Работи {b.lvl*400}/час</span>
          )}
        </div>
      ))}
      <div style={{marginTop:'16px', fontSize:'11px', color:'#8a9a8a'}}>
        Това е реалния старт: Farm 400/час, Oil 400/час, Depot безплатен. Main Hall определя максимума. След това идва Garage за fleets.
      </div>
    </div>
  )
}