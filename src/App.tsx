import { useState, useEffect, useRef } from 'react'

type Tab = 'city' | 'map' | 'hero' | 'tech' | 'battle'
type Res = { food:number, metal:number, oil:number, gold:number }

type Building = { id:string, name:string, icon:string, level:number, max:10, desc:string }
const CITY_BUILDINGS: Building[] = [
  { id:'hq', name:'ЩАБ', icon:'🏛️', level:1, max:10, desc:'Отключва всичко' },
  { id:'wall', name:'СТЕНА', icon:'🧱', level:1, max:10, desc:'+ защита' },
  { id:'barracks', name:'КАЗАРМА', icon:'🪖', level:1, max:10, desc:'+ армия' },
  { id:'farm', name:'ФЕРМА', icon:'🌾', level:1, max:10, desc:'+ храна / час' },
  { id:'oil', name:'ПЕТРОЛ', icon:'🛢️', level:0, max:10, desc:'+ петрол / час' },
  { id:'lab', name:'ЛАБ', icon:'🔬', level:0, max:10, desc:'Технологии' },
]

const WORLD = Array.from({length:15}, (_,i)=> ({
  id:i, x: Math.random()*85+5, y: Math.random()*70+5,
  type: i%4===0? 'boss' : i%3===0? 'resource' : 'zombie',
  lvl: Math.floor(Math.random()*5)+1,
  name: i%4===0? 'БОС' : i%3===0? 'Ресурс' : 'Орда'
}))

// --- Малката битка от v0.1, сега е вътре в таб БИТКА ---
function BattleMini(){
  const SIZE=9, CENTER=4
  const [grid,setGrid]=useState(()=>Array.from({length:SIZE},(_,y)=>Array.from({length:SIZE},(_,x)=>({x,y, b:null as any}))))
  const [zombies,setZombies]=useState<any[]>([])
  const [wave,setWave]=useState(1)
  const [metal,setMetal]=useState(100)
  const sel = useRef('wall')
  const place=(x:number,y:number)=>{
    if(x===CENTER&&y===CENTER) return
    if(grid[y][x].b) return
    if(metal<15) return
    setMetal(m=>m-15)
    setGrid(g=>{ const ng=g.map(r=>[...r]); ng[y][x].b='wall'; return ng})
  }
  const startWave=()=>{
    const count=3+wave
    const nz=Array.from({length:count},(_,i)=>({id:Date.now()+i,x:Math.random()>0.5?0:SIZE-1,y:Math.floor(Math.random()*SIZE),hp:50+wave*10}))
    setZombies(nz)
  }
  useEffect(()=>{
    if(!zombies.length) return
    const id=setInterval(()=>{ setZombies(z=>z.map(v=>({...v,x:v.x+(v.x<CENTER?1:-1)})).filter(v=>v.x!==CENTER)) },600)
    return()=>clearInterval(id)
  },[zombies])
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0'}}><span>Метал: {metal}</span><button onClick={startWave} style={{background:'#ff4d4d', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px', fontWeight:800}}>ВЪЛНА {wave}</button></div>
      <div style={{display:'grid', gridTemplateColumns:`repeat(${SIZE},1fr)`, gap:'2px', background:'#1e2a22', padding:'4px', borderRadius:'8px'}}>
        {grid.map((row,y)=>row.map((c,x)=>{
          const z=zombies.find((z:any)=>z.x===x&&z.y===y)
          return <div key={x+'-'+y} onClick={()=>place(x,y)} style={{width:'32px',height:'32px', background: x===CENTER&&y===CENTER? '#2a3a2e' : '#121814', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'3px'}}>{z?'🧟':c.b?'🧱': x===CENTER&&y===CENTER?'🏛️':''}</div>
        }))}
      </div>
    </div>
  )
}

export default function App(){
  const [tab,setTab]=useState<Tab>('city')
  const [res,setRes]=useState<Res>({food:500, metal:800, oil:300, gold:100})
  const [city,setCity]=useState(CITY_BUILDINGS)
  const [log,setLog]=useState('Добре дошъл Командир! Построй града си.')

  const upgrade=(id:string)=>{
    const b=city.find(x=>x.id===id)!
    const cost = (b.level+1)*50
    if(res.metal < cost){ setLog('Няма метал!'); return }
    setRes(r=>({...r, metal:r.metal-cost}))
    setCity(c=>c.map(x=> x.id===id? {...x, level:x.level+1} : x))
    setLog(`${b.name} -> Ниво ${b.level+1}`)
  }

  return (
    <div style={{maxWidth:'600px', margin:'0 auto', background:'#0f1210', minHeight:'100vh', color:'#e8e8e8', display:'flex', flexDirection:'column'}}>
      {/* TOP RESOURCES */}
      <div style={{display:'flex', justifyContent:'space-around', padding:'10px', background:'#1a1f1c', borderBottom:'2px solid #2a3a2e', fontSize:'13px', fontWeight:700}}>
        <span>🌽 {res.food}</span><span>🪓 {res.metal}</span><span>🛢️ {res.oil}</span><span>💰 {res.gold}</span>
      </div>

      {/* CONTENT */}
      <div style={{flex:1, padding:'12px', overflowY:'auto'}}>
        {tab==='city' && (
          <div>
            <h3>🏛️ ГРАД - Ниво Щаб {city.find(b=>b.id==='hq')?.level}</h3>
            <p style={{fontSize:'11px', color:'#8a9a8a', margin:'6px 0'}}>{log}</p>
            {city.map(b=>(
              <div key={b.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#1a1f1c', border:'1px solid #2a3a2e', borderRadius:'8px', padding:'10px', marginBottom:'8px'}}>
                <div><span style={{fontSize:'20px'}}>{b.icon}</span> <b>{b.name}</b> <small>Lv.{b.level}</small><div style={{fontSize:'10px', color:'#8a9a8a'}}>{b.desc}</div></div>
                <button disabled={b.level>=b.max} onClick={()=>upgrade(b.id)} style={{background: b.level>=b.max? '#333' : '#7cff6b', color:'black', border:'none', padding:'6px 10px', borderRadius:'6px', fontWeight:800, fontSize:'11px'}}>{b.level>=b.max?'MAX':`UP ${(b.level+1)*50}м`}</button>
              </div>
            ))}
          </div>
        )}

        {tab==='map' && (
          <div>
            <h3>🗺️ СВЕТОВНА КАРТА</h3>
            <div style={{position:'relative', height:'400px', background:'radial-gradient(circle, #1a2a1e, #0f1210)', border:'2px solid #2a3a2e', borderRadius:'12px', marginTop:'10px'}}>
              {WORLD.map(n=>(
                <div key={n.id} onClick={()=>{ setRes(r=>({...r, food:r.food+n.lvl*20, metal:r.metal+n.lvl*15})); setLog(`Оплячкоса ${n.name} +${n.lvl*20} храна`)}}
                  style={{position:'absolute', left:`${n.x}%`, top:`${n.y}%`, background: n.type==='boss'?'#ff4d4d': n.type==='resource'?'#4a8aff':'#2a3a2e', width:'36px', height:'36px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', border:'2px solid #fff', cursor:'pointer'}}>
                  {n.type==='boss'?'👹': n.type==='resource'?'💎':'🧟'}
                </div>
              ))}
            </div>
            <p style={{fontSize:'11px', color:'#8a9a8a', textAlign:'center', marginTop:'8px'}}>Цъкни на ордите за да ги нападнеш (мок) - после тук ще има сървъри и други играчи</p>
          </div>
        )}

        {tab==='hero' && (
          <div>
            <h3>🦸 ГЕРОЙ</h3>
            <div style={{background:'#1a1f1c', padding:'20px', borderRadius:'12px', textAlign:'center', marginTop:'10px'}}>
              <div style={{fontSize:'60px'}}>🦸‍♂️</div>
              <h2>Командир Тишо</h2>
              <p>Ниво 1 | Сила 150</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'16px'}}>
                <div style={{background:'#121814', padding:'10px', borderRadius:'8px'}}>⚔️ Атака: 45</div>
                <div style={{background:'#121814', padding:'10px', borderRadius:'8px'}}>🛡️ Защита: 30</div>
              </div>
              <button style={{marginTop:'16px', width:'100%', padding:'12px', background:'#7cff6b', border:'none', borderRadius:'8px', fontWeight:900}}>ТРЕНИРАЙ АРМИЯ (100 храна)</button>
            </div>
          </div>
        )}

        {tab==='tech' && (
          <div>
            <h3>🔬 ЛАБОРАТОРИЯ</h3>
            {[
              {name:'По-здрави стени', lvl:0, max:5},
              {name:'По-силни кули', lvl:1, max:5},
              {name:'Икономика +20%', lvl:0, max:3},
            ].map(t=>(
              <div key={t.name} style={{display:'flex', justifyContent:'space-between', background:'#1a1f1c', padding:'12px', borderRadius:'8px', marginBottom:'8px', marginTop:'10px'}}>
                <span>{t.name} Lv.{t.lvl}/{t.max}</span><button style={{background:'#4a8aff', border:'none', color:'white', padding:'4px 10px', borderRadius:'6px'}}>ИЗСЛЕДВАЙ</button>
              </div>
            ))}
          </div>
        )}

        {tab==='battle' && (
          <div>
            <h3>⚔️ ЗАЩИТА НА ГРАДА</h3>
            <p style={{fontSize:'11px', color:'#8a9a8a'}}>Това е бойната система от v0.1 - сега е част от града</p>
            <BattleMini />
          </div>
        )}
      </div>

      {/* BOTTOM TABS */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', background:'#1a1f1c', borderTop:'2px solid #2a3a2e'}}>
        {[
          {id:'city', icon:'🏛️', label:'ГРАД'},
          {id:'map', icon:'🗺️', label:'КАРТА'},
          {id:'hero', icon:'🦸', label:'ГЕРОЙ'},
          {id:'tech', icon:'🔬', label:'ТЕХ'},
          {id:'battle', icon:'⚔️', label:'БИТКА'},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as Tab)} style={{background: tab===t.id? '#2a3a2e' : 'transparent', border:'none', color: tab===t.id? '#7cff6b' : '#8a9a8a', padding:'10px 2px', fontSize:'10px', fontWeight:800}}>
            <div style={{fontSize:'18px'}}>{t.icon}</div>{t.label}
          </button>
        ))}
      </div>
    </div>
  )
}