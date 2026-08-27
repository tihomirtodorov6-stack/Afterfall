import { useState, useEffect } from 'react'

type B = { id:string, name:string, icon:string, x:number, y:number, lvl:number, upgrading?:number }

export default function App(){
  const [buildings, setBuildings] = useState<B[]>([
    { id:'hq', name:'Headquarters', icon:'🏛️', x:22, y:18, lvl:30 },
    { id:'b1', name:'Barracks', icon:'🏢', x:52, y:42, lvl:30 },
    { id:'b2', name:'Factory', icon:'🏭', x:48, y:55, lvl:30 },
    { id:'b3', name:'Oil Rig', icon:'🛢️', x:70, y:62, lvl:30 },
    { id:'b4', name:'Oil Rig', icon:'🛢️', x:78, y:78, lvl:25 },
    { id:'wall', name:'City Wall', icon:'🧱', x:15, y:75, lvl:35 },
    { id:'lab', name:'Lightning Orbs', icon:'⚡', x:55, y:32, lvl:30, upgrading:65 },
  ])
  const [selected, setSelected] = useState<string|null>(null)
  const [gold, setGold] = useState(1154123)
  const [res, setRes] = useState({ food:1.5, oil:4.6, metal:121.4, gems:498812 })
  const [popups, setPopups] = useState<{id:number,x:number,y:number,text:string}[]>([])

  const upgrade = (id:string) => {
    setBuildings(bs=>bs.map(b=>{
      if(b.id===id && b.lvl<40){
        const newLvl=b.lvl+1
        // анимация за ресурс
        setPopups(p=>[...p,{id:Date.now(),x:b.x,y:b.y,text:`+Lv.${newLvl}`}])
        setTimeout(()=>setPopups(p=>p.slice(1)),1200)
        return {...b, lvl:newLvl, upgrading:0}
      }
      return b
    }))
  }

  return (
    <div className="game-root">
      {/* TOP като Camel */}
      <div className="top-camel">
        <div className="top-row1">
          <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
            <div style={{width:'32px',height:'32px',background:'#333',borderRadius:'4px',border:'2px solid gold'}}>👨‍🦳</div>
            <div className="vip">VIP 11</div>
            <div>🏆 Lv.15</div>
            <div style={{color:'var(--gold)'}}>💰 {gold.toLocaleString()}</div>
          </div>
          <div>🔷 14359</div>
        </div>
        <div className="res-row">
          <span>⭐ 192</span>
          <span>🌾 {res.food}M</span>
          <span>🛢️ {res.oil}M</span>
          <span>🪓 {res.metal}K</span>
          <span>💎 130</span>
          <span>🔰 {res.gems}</span>
        </div>
        <div className="res-row" style={{justifyContent:'flex-end'}}>
          <span style={{background:'#2a1a0a'}}>🎁 Newbie Pack</span>
          <span style={{background:'#4a2a0a'}}>📦 Specials !</span>
          <span>🎀 03:58:44</span>
        </div>
      </div>

      {/* CITY */}
      <div className="city-wrap">
        <div className="city-grid">
          {buildings.map(b=>(
            <div key={b.id} className={`building ${b.id==='hq'?'hq':''} ${selected===b.id?'selected':''}`}
              style={{left:`${b.x}%`, top:`${b.y}%`}}
              onClick={()=>{ setSelected(b.id); if(b.upgrading===undefined) upgrade(b.id)}}
            >
              <div className="icon">{b.icon}</div>
              <div style={{fontSize:'8px', marginTop:'2px'}}>{b.name}</div>
              <div className="lvl">{b.lvl}</div>
              {b.upgrading!==undefined && (
                <div className="progress"><div className="progress-fill" style={{width:`${b.upgrading}%`}}></div></div>
              )}
            </div>
          ))}
          {popups.map(p=>(
            <div key={p.id} style={{position:'absolute', left:`${p.x}%`, top:`${p.y}%`, color:'var(--gold)', fontWeight:900, fontSize:'14px', animation:'resourcePop 1.2s forwards', pointerEvents:'none'}}>{p.text}</div>
          ))}
        </div>

        {/* TROOPS като в снимката долу */}
        <div className="troops-field">
          {Array.from({length:18}).map((_,i)=>(
            <div key={i} className="troop" style={{left:`${(i%6)*12}%`, top:`${Math.floor(i/6)*18}px`, animationDelay:`${i*0.3}s`}}>🪖</div>
          ))}
        </div>

        <div style={{position:'absolute', bottom:'10px', left:'10px', right:'10px', background:'rgba(0,0,0,0.7)', padding:'6px 10px', borderRadius:'6px', fontSize:'11px', color:'#7cff6b', border:'1px solid #2a3f2a'}}>
          ▶ Start upgrading the City Wall to Lv.6 {selected? `| Selected: ${buildings.find(b=>b.id===selected)?.name} Lv.${buildings.find(b=>b.id===selected)?.lvl}`:''}
        </div>
      </div>

      {/* BOTTOM като Camel */}
      <div className="bottom-camel">
        <button className="b-btn active"><span className="ic">📖</span>Quest</button>
        <button className="b-btn"><span className="ic">🎒</span>Bag</button>
        <button className="b-btn"><span className="ic">✉️</span>Mail<span className="badge">9</span></button>
        <button className="b-btn"><span className="ic">⭐</span>Alliance<span className="badge">25</span></button>
        <button className="b-btn"><span className="ic">🧔</span>My Info</button>
      </div>
    </div>
  )
}