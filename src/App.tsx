// @ts-nocheck
import { useEffect, useMemo, useState, useRef } from "react";
import "./style.css";

type BuildingId = "command" | "farm" | "metal" | "refinery" | "power" | "warehouse" | "hospital" | "barracks" | "vehicle" | "weapons" | "research";
type ArmyId = "recruit" | "rifleman" | "heavy" | "sniper" | "machinegunner" | "rocket" | "apc" | "tank" | "special";

const SAVE_KEY = "afterfall-save-v3";
const initial = {
  cityLevel: 15,
  power: 28949348,
  resources: { food: 1700000, metal: 4800000, fuel: 474366, energy: 200, gold: 829963 },
  buildings: { command: 15, farm: 12, metal: 12, refinery: 12, power: 12, warehouse: 12, hospital: 10, barracks: 12, vehicle: 12, weapons: 11, research: 12 },
  army: { recruit: 200, rifleman: 150, heavy: 80, sniper: 40, machinegunner: 30, rocket: 20, apc: 15, tank: 8, special: 5 },
  research: { infantry: 5, vehicles: 4, production: 6, economy: 7, defense: 5 },
  training: null,
  researching: null,
  enemyStrength: 6500,
  enemyScouted: false,
  battleReport: "Разузнай противника!",
  lastSaved: Date.now(),
};

const bInfo = {
  command: { name: "COMMAND CENTER", icon: "🏢", desc: "Сърцето на New Hope.", max: 30, food: 200, metal: 150 },
  farm: { name: "FARM", icon: "🌾", desc: "Food.", max: 30, food: 50, metal: 20 },
  metal: { name: "STEEL MILL", icon: "🏭", desc: "Metal.", max: 30, food: 60, metal: 40 },
  refinery: { name: "REFINERY", icon: "🛢️", desc: "Fuel.", max: 30, food: 70, metal: 60 },
  power: { name: "POWER PLANT", icon: "⚡", desc: "Energy.", max: 30, food: 80, metal: 80 },
  warehouse: { name: "WAREHOUSE", icon: "📦", desc: "Capacity.", max: 30, food: 80, metal: 100 },
  hospital: { name: "HOSPITAL", icon: "🏥", desc: "Спасява ранени.", max: 30, food: 100, metal: 100 },
  barracks: { name: "BARRACKS", icon: "🪖", desc: "Пехота.", max: 30, food: 90, metal: 70 },
  vehicle: { name: "GARAGE", icon: "🚙", desc: "Танкове.", max: 30, food: 150, metal: 200 },
  weapons: { name: "ARSENAL", icon: "🔫", desc: "ОрЪжия.", max: 30, food: 120, metal: 180 },
  research: { name: "LAB", icon: "🔬", desc: "Технологии.", max: 30, food: 150, metal: 200 },
};

const aInfo = {
  recruit: { name: "Recruit", icon: "👤", building: "barracks", food: 20, metal: 5, fuel: 0, time: 4, attack: 5, defense: 4 },
  rifleman: { name: "Rifleman", icon: "🔫", building: "barracks", food: 35, metal: 20, fuel: 0, time: 8, attack: 10, defense: 8 },
  heavy: { name: "Heavy", icon: "🪖", building: "barracks", food: 60, metal: 45, fuel: 0, time: 14, attack: 20, defense: 18 },
  sniper: { name: "Sniper", icon: "🎯", building: "weapons", food: 50, metal: 55, fuel: 0, time: 18, attack: 35, defense: 10 },
  machinegunner: { name: "MG", icon: "💥", building: "weapons", food: 65, metal: 60, fuel: 0, time: 20, attack: 30, defense: 20 },
  rocket: { name: "Rocket", icon: "🚀", building: "weapons", food: 80, metal: 90, fuel: 15, time: 25, attack: 55, defense: 12 },
  apc: { name: "APC", icon: "🚙", building: "vehicle", food: 80, metal: 150, fuel: 60, time: 35, attack: 60, defense: 80 },
  tank: { name: "Tank", icon: "🛡️", building: "vehicle", food: 120, metal: 240, fuel: 100, time: 55, attack: 120, defense: 150 },
  special: { name: "SpecOps", icon: "⚔️", building: "weapons", food: 150, metal: 180, fuel: 40, time: 50, attack: 160, defense: 80 },
};

function fmt(v){ if(v>=1000000) return (v/1000000).toFixed(1)+"M"; if(v>=1000) return Math.floor(v/1000)+"K"; return Math.floor(v).toString(); }
function load(){ try{ const s=localStorage.getItem(SAVE_KEY); if(!s) return initial; return {...initial,...JSON.parse(s)} }catch{ return initial } }

export default function App(){
  const [game,setGame]=useState(()=>load());
  const [tab,setTab]=useState("city");
  const [sel,setSel]=useState("command");
  const [msg,setMsg]=useState("Добре дошъл, Commander!");
  const saveRef=useRef(0);
  useEffect(()=>{ if(Date.now()-saveRef.current<2000) return; saveRef.current=Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify({...game, lastSaved: Date.now()})); },[game]);
  useEffect(()=>{
    const id=setInterval(()=>{ setGame(c=>{
      const bonus=1+c.research.economy*0.08; const cap=5000000+c.buildings.warehouse*250000;
      let n={...c, resources:{...c.resources, food:Math.min(cap,c.resources.food+c.buildings.farm*12*bonus), metal:Math.min(cap,c.resources.metal+c.buildings.metal*15*bonus), fuel:Math.min(cap,c.resources.fuel+c.buildings.refinery*8*bonus)}};
      if(c.training && Date.now()>=c.training.finish){ n={...n, army:{...n.army, [c.training.type]:n.army[c.training.type]+c.training.amount}, training:null}; setMsg(`${aInfo[c.training.type].name} готов!`); }
      if(c.researching && Date.now()>=c.researching.finish){ n={...n, research:{...n.research, [c.researching.type]:n.research[c.researching.type]+1}, researching:null}; }
      return n;
    })},1000); return()=>clearInterval(id);
  },[]);
  const power=useMemo(()=>{ let a=0,d=0; Object.keys(game.army).forEach(t=>{ a+=game.army[t]*aInfo[t].attack; d+=game.army[t]*aInfo[t].defense }); a*=1+game.research.infantry*0.08; a*=1+game.research.vehicles*0.1; d*=1+game.research.defense*0.1; return {attack:Math.floor(a), defense:Math.floor(d)} },[game.army, game.research]);
  const upgrade=(id)=>{ const lvl=game.buildings[id]; const inf=bInfo[id]; if(lvl>=inf.max){setMsg("MAX");return;} const cf=inf.food*(lvl+1)*2, cm=inf.metal*(lvl+1)*2; if(game.resources.food<cf||game.resources.metal<cm){setMsg("Няма ресурси");return;} setGame(c=>({...c, resources:{...c.resources, food:c.resources.food-cf, metal:c.resources.metal-cm}, buildings:{...c.buildings,[id]:c.buildings[id]+1}, cityLevel:id==="command"?c.cityLevel+1:c.cityLevel, power:c.power+150*(lvl+1)})); setMsg(`${inf.name} Lv.${lvl+1}`); };
  const train=(type,amt)=>{ if(game.training){setMsg("Чакай!");return;} const inf=aInfo[type]; const cf=inf.food*amt, cm=inf.metal*amt, cfu=inf.fuel*amt; if(game.resources.food<cf||game.resources.metal<cm||game.resources.fuel<cfu){setMsg("Няма ресурси");return;} const t=(inf.time*amt*1000)/(1+game.research.production*0.1); setGame(c=>({...c, resources:{...c.resources, food:c.resources.food-cf, metal:c.resources.metal-cm, fuel:c.resources.fuel-cfu}, training:{type, amount:amt, finish:Date.now()+t}})); };
  return(
    <main className="afterfall">
      <header className="topbar">
        <div className="avatar">50<span>★</span></div><div className="vip">VIP 11</div><div className="level-badge">Lv.{game.cityLevel}</div>
        <div className="res"><div className="res-item">💰 <b>{fmt(game.resources.gold)}</b></div><div className="res-item">🌾 <b>{fmt(game.resources.food)}</b></div><div className="res-item">⛏️ <b>{fmt(game.resources.metal)}</b></div><div className="res-item">🛢️ <b>{fmt(game.resources.fuel)}</b></div><div className="res-item">⚡ <b>{fmt(game.power)}</b></div></div>
      </header>

      {tab==="world"? (
        <section className="worldmap"><div className="world-header">Server Time 2026/8/26 23:48:41</div><div className="world-territory" style={{left:"20%",top:"15%",width:"60%",height:"55%"}}></div><div className="world-pin green" style={{left:"52%",top:"42%"}}></div><div className="world-pin green" style={{left:"55%",top:"45%"}}></div><div className="world-pin green" style={{left:"58%",top:"40%"}}></div><div className="city-mini" style={{left:"55%",top:"50%"}}>🏰</div><div className="world-info"><div><span className="dot" style={{background:"#ffcc00"}}></span> My City</div><div><span className="dot" style={{background:"#ff7b00"}}></span> Alliance</div><div><span className="dot" style={{background:"#2eff7a"}}></span> Ally</div></div></section>
      ):(
        <section className="city"><div className="power-display">⚡ {fmt(game.power)} POWER</div>
          {Object.keys(bInfo).map(id=>{ const lvl=game.buildings[id]; return (<button key={id} className={`building ${id} ${sel===id?"selected":""} ${lvl<=0?"ruined":""}`} onClick={()=>setSel(id)}><div className="b-icon">{bInfo[id].icon}</div><div className="b-name">{bInfo[id].name}</div><div className="b-lvl">Lv.{lvl}</div>{id==="command" && <div className="shield"></div>}</button>); })}
        </section>
      )}

      <nav className="bottom-nav">
        <button className={`nav-btn ${tab==="city"?"active":""}`} onClick={()=>setTab("city")}><span>🏙️</span>CITY</button>
        <button className={`nav-btn ${tab==="world"?"active":""}`} onClick={()=>setTab("world")}><span>🌍</span>WORLD</button>
        <button className={`nav-btn ${tab==="army"?"active":""}`} onClick={()=>setTab("army")}><span>🪖</span>ARMY</button>
        <button className={`nav-btn ${tab==="research"?"active":""}`} onClick={()=>setTab("research")}><span>🔬</span>LAB</button>
        <button className={`nav-btn ${tab==="attack"?"active":""}`} onClick={()=>setTab("attack")}><span>⚔️</span>WAR</button>
      </nav>

      <section className="panel">
        <div className="message">{msg}</div>
        {tab==="city" && sel && (<div className="building-panel"><div className="panel-head"><span>{bInfo[sel].icon}</span><div><h2>{bInfo[sel].name}</h2><small>LEVEL {game.buildings[sel]}</small></div></div><p>{bInfo[sel].desc}</p><div className="cost">🍖 {bInfo[sel].food*(game.buildings[sel]+1)*2} | 🔩 {bInfo[sel].metal*(game.buildings[sel]+1)*2}</div><button className="main-btn" onClick={()=>upgrade(sel)}>UPGRADE TO Lv.{game.buildings[sel]+1}</button></div>)}
        {tab==="army" && (<div><h3>⚔️ {power.attack} | 🛡️ {power.defense}</h3>{game.training && <div className="training-bar">{aInfo[game.training.type].name} ×{game.training.amount} - {Math.ceil((game.training.finish-Date.now())/1000)}s</div>}<div className="army-grid">{Object.keys(aInfo).map(t=>{ const un=game.buildings[aInfo[t].building]>0; return (<div key={t} className={`unit-card ${!un?"locked":""}`}><div>{aInfo[t].icon}</div><b>{aInfo[t].name}</b><strong>{game.army[t]}</strong>{un? <div className="train-row"><button onClick={()=>train(t,1)}>+1</button><button onClick={()=>train(t,5)}>+5</button><button onClick={()=>train(t,10)}>+10</button></div> : <em>🔒</em>}</div>); })}</div></div>)}
        {tab==="research" && (<div className="research-grid">{Object.keys(game.research).map(k=>(<div key={k} className="research-card"><b>{k.toUpperCase()} Lv.{game.research[k]}</b><button className="main-btn" disabled={!!game.researching} onClick={()=>{ if(game.researching)return; const lvl=game.research[k]; setGame(c=>({...c, researching:{type:k, finish:Date.now()+5000}})); }}>RESEARCH</button></div>))}</div>)}
        {tab==="attack" && (<div><h2>WAR ROOM - {game.enemyStrength}</h2><p>{game.battleReport}</p><button className="main-btn" onClick={()=>setGame(c=>({...c, enemyScouted:true}))}>🛰️ SCOUT (30 Fuel)</button><button className="attack-btn" disabled={!game.enemyScouted} onClick={()=>{ const won=power.attack*(0.85+Math.random()*0.3)>=game.enemyStrength; setGame(c=>({...c, enemyStrength:Math.floor(c.enemyStrength*(won?1.12:1.05)), enemyScouted:false, battleReport:won?"ПОБЕДА!":"ЗАГУБА!"})); }}>⚔️ ATTACK</button></div>)}
        <button className="reset" onClick={()=>{localStorage.removeItem(SAVE_KEY); location.reload();}}>RESET</button>
      </section>

      <footer className="game-footer">
        <button><span>📜</span>Quest <i className="badge">2</i></button><button><span>🎒</span>Bag</button><button><span>✉️</span>Mail <i className="badge">31</i></button><button className="active"><span>⭐</span>Alliance <i className="badge">24</i></button><button><span>👤</span>My Info</button>
      </footer>
    </main>
  );
}