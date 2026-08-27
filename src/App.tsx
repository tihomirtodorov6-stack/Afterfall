import { useEffect, useState, useRef } from 'react'
const SIZE = 11
const CENTER = Math.floor(SIZE/2)
type BuildingType = 'wall' | 'tower' | 'farm' | 'barracks'
type CellData = { x:number, y:number, building?: BuildingType, hp?: number }
type Zombie = { id:number, x:number, y:number, hp:number, maxHp:number }
type Projectile = { id:number, x:number, y:number, tx:number, ty:number }

const BUILDINGS: Record<BuildingType, { name:string, icon:string, cost:{ metal:number, food?:number, people?:number }, hp:number }> = {
  wall: { name:'СТЕНА', icon:'🧱', cost:{metal:15}, hp:200 },
  tower: { name:'КУЛА', icon:'🗼', cost:{metal:40, people:1}, hp:120 },
  farm: { name:'ФЕРМА', icon:'🌾', cost:{metal:20}, hp:80 },
  barracks: { name:'БАРАКА', icon:'🏚️', cost:{metal:30, food:10}, hp:100 },
}

export default function App(){
  const [grid, setGrid] = useState<CellData[][]>(() => Array.from({length:SIZE}, (_,y) => Array.from({length:SIZE}, (_,x) => ({x,y}))))
  const [metal, setMetal] = useState(120)
  const [food, setFood] = useState(60)
  const [people, setPeople] = useState(3)
  const [maxPeople, setMaxPeople] = useState(5)
  const [baseHp, setBaseHp] = useState(500)
  const [wave, setWave] = useState(1)
  const [zombies, setZombies] = useState<Zombie[]>([])
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [selected, setSelected] = useState<BuildingType>('wall')
  const [log, setLog] = useState('Добре дошъл в Afterfall. Построй защита!')
  const [gameOver, setGameOver] = useState(false)
  const [isWaveActive, setIsWaveActive] = useState(false)
  const zId = useRef(0)
  const pId = useRef(0)

  const placeBuilding = (x:number, y:number) => {
    if (gameOver || (x===CENTER && y===CENTER) || grid[y][x].building || zombies.some(z=>z.x===x && z.y===y)) return
    const def = BUILDINGS[selected]
    if (metal < def.cost.metal || (def.cost.food && food < def.cost.food) || (def.cost.people && people < def.cost.people)) { setLog('Нямаш ресурси!'); return }
    setMetal(m=>m-def.cost.metal)
    if (def.cost.food) setFood(f=>f-def.cost.food)
    if (selected==='barracks') setMaxPeople(m=>m+5)
    setGrid(g => { const ng = g.map(r=>[...r]); ng[y][x] = {...ng[y][x], building:selected, hp:def.hp}; return ng })
    setLog(`Построи ${def.name}`)
  }

  const startWave = () => {
    if (isWaveActive || gameOver) return
    setIsWaveActive(true)
    const count = 4 + wave*2
    const newZ: Zombie[] = []
    for(let i=0;i<count;i++){
      let x=0,y=0; const side=Math.floor(Math.random()*4)
      if(side===0){ x=Math.floor(Math.random()*SIZE); y=0 }
      else if(side===1){ x=SIZE-1; y=Math.floor(Math.random()*SIZE) }
      else if(side===2){ x=Math.floor(Math.random()*SIZE); y=SIZE-1 }
      else { x=0; y=Math.floor(Math.random()*SIZE) }
      newZ.push({id:zId.current++, x, y, hp: 50+wave*12, maxHp: 50+wave*12})
    }
    setZombies(z=>[...z,...newZ])
    setLog(`ВЪЛНА ${wave}: ${count} зомбита!`)
  }

  useEffect(() => {
    if(zombies.length===0){ if(isWaveActive){ setIsWaveActive(false); setMetal(m=>m+20+wave*8); setFood(f=>f+10+wave*4); if(wave%3===0) setPeople(p=>Math.min(p+1,maxPeople)); setLog(`Вълна ${wave} изчистена!`); setWave(w=>w+1)} return }
    const interval = setInterval(()=>{
      setZombies(prev => {
        let newBaseHp = baseHp
        const newGrid = grid.map(r=>[...r])
        const next = prev.map(z=>{
          if(Math.abs(z.x-CENTER)+Math.abs(z.y-CENTER)<=1){ newBaseHp-=8; return z }
          if(grid[z.y][z.x].building){ const b=newGrid[z.y][z.x]; if(b.hp){ b.hp-=12; if(b.hp<=0) newGrid[z.y][z.x]={x:z.x,y:z.y} } return z }
          let nx=z.x, ny=z.y
          if(Math.abs(CENTER-z.x) > Math.abs(CENTER-z.y)) nx+=Math.sign(CENTER-z.x)
          else ny+=Math.sign(CENTER-z.y)
          return {...z, x:Math.max(0,Math.min(SIZE-1,nx)), y:Math.max(0,Math.min(SIZE-1,ny))}
        })
        setGrid(newGrid); setBaseHp(newBaseHp)
        if(newBaseHp<=0){ setGameOver(true); setLog('БАЗАТА ПАДНА!') }
        return next
      })
    }, 450)
    return ()=>clearInterval(interval)
  }, [zombies.length, grid, baseHp, wave, maxPeople, isWaveActive])

  useEffect(()=>{
    const interval = setInterval(()=>{
      const towers: any[] = []; grid.forEach(r=>r.forEach(c=>{ if(c.building==='tower') towers.push(c) }))
      if(towers.length===0 || zombies.length===0) return
      let shots: Projectile[] = []; let damagedZ = [...zombies]
      towers.forEach(t=>{
        let target = damagedZ.filter(z=> Math.abs(z.x-t.x)+Math.abs(z.y-t.y) <=3).sort((a,b)=> (Math.abs(a.x-CENTER)+Math.abs(a.y-CENTER)) - (Math.abs(b.x-CENTER)+Math.abs(b.y-CENTER)))[0]
        if(target){ shots.push({id:pId.current++, x:t.x, y:t.y, tx:target.x, ty:target.y}); target.hp-=28 }
      })
      damagedZ = damagedZ.filter(z=>z.hp>0)
      if(shots.length>0){ setProjectiles(p=>[...p,...shots]); setTimeout(()=>setProjectiles([]), 180); setZombies(damagedZ) }
    }, 650)
    return ()=>clearInterval(interval)
  }, [grid, zombies])

  useEffect(()=>{
    const id = setInterval(()=>{ let farms=0; grid.forEach(r=>r.forEach(c=>{ if(c.building==='farm') farms++ })); if(farms>0) setFood(f=>f+farms*2) }, 10000)
    return ()=>clearInterval(id)
  }, [grid])

  return (
    <div className="game-root">
      <div className="top-bar"><div className="logo">AFTER<span>FALL</span></div><div className="stats"><div className="stat">🪓 <b>{metal}</b></div><div className="stat">🌽 <b>{food}</b></div><div className="stat">🧍 <b>{people}/{maxPeople}</b></div><div className="stat">💀 <b>{wave}</b></div></div></div>
      <div className="hp-bar"><div className="hp-fill" style={{width:`${Math.max(0, baseHp/5)}%`}}></div></div>
      <div className="grid-wrap"><div className="grid" style={{gridTemplateColumns:`repeat(${SIZE}, 1fr)`}}>
        {grid.map((row,y)=> row.map((cell,x)=>{
          const z = zombies.find(z=>z.x===x && z.y===y); const isBase = x===CENTER && y===CENTER; const proj = projectiles.find(p=>p.tx===x && p.ty===y)
          let cls = 'cell' + (isBase?' base':'') + (cell.building?` ${cell.building}`:'') + (z?' zombie':'')
          return <div key={`${x}-${y}`} className={cls} onClick={()=>placeBuilding(x,y)}>{isBase?'🏛️':cell.building?BUILDINGS[cell.building].icon:''}{z?'🧟':''}{proj?'💥':''}{cell.building && cell.hp && <div className="hp" style={{width:`${(cell.hp/BUILDINGS[cell.building as BuildingType].hp)*100}%`}}></div>}{z && <div className="hp" style={{width:`${(z.hp/z.maxHp)*100}%`, background:'#ff4d4d'}}></div>}</div>
        }))}
      </div></div>
      <div className="build-bar">
        <div className="build-title">ПОСТРОЙ • БАЗА HP: {baseHp}</div>
        <div className="builds">{(Object.keys(BUILDINGS) as BuildingType[]).map(t=>{const b=BUILDINGS[t]; const afford=metal>=b.cost.metal && (!b.cost.food || food>=b.cost.food) && (!b.cost.people || people>=b.cost.people); return <div key={t} className={`b-card ${selected===t?'active':''} ${!afford?'disabled':''}`} onClick={()=>setSelected(t)}><div className="icon">{b.icon}</div><div className="name">{b.name}</div><div className="cost">{b.cost.metal}м {b.cost.food?`+${b.cost.food}х`:''}</div></div>})}</div>
        <div className="actions"><button className="btn btn-clear" onClick={()=>{ setGrid(Array.from({length:SIZE}, (_,y) => Array.from({length:SIZE}, (_,x) => ({x,y})))); setMetal(120); setFood(60); setPeople(3); setMaxPeople(5); setBaseHp(500); setWave(1); setZombies([]); setGameOver(false); setLog('Рестарт!') }}>Рестарт</button><button className="btn btn-wave" disabled={isWaveActive || gameOver} onClick={startWave}>{isWaveActive? 'ИДВАТ...' : `ВЪЛНА ${wave}`}</button></div>
        <div className="log">{log}</div>{gameOver && <div style={{textAlign:'center', color:'#ff4d4d', fontWeight:900, marginTop:6}}>☠️ GAME OVER ☠️</div>}
      </div>
    </div>
  )
}