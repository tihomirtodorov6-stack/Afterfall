import { useEffect, useMemo, useState, useRef } from "react"; import "./style.css"; type Tab = "city" | "world" | "army" | "research" | "attack"; type BuildingId = "command" | "farm" | "metal" | "refinery" | "power" | "warehouse" | "hospital" | "barracks" | "vehicle" | "weapons" | "research"; type ArmyId = "recruit" | "rifleman" | "heavy" | "sniper" | "machinegunner" | "rocket" | "apc" | "tank" | "special"; type Resources = { food: number; metal: number; fuel: number; energy: number; gold: number; }; type Army = Record; type Buildings = Record; type Research = { infantry: number; vehicles: number; production: number; economy: number; defense: number; }; type TrainingQueue = { type: ArmyId; amount: number; finish: number; } | null; type ResearchQueue = { type: keyof Research; finish: number; } | null; type GameState = { cityLevel: number; power: number; resources: Resources; buildings: Buildings; army: Army; wounded: Army; research: Research; training: TrainingQueue; researching: ResearchQueue; enemyStrength: number; enemyScouted: boolean; battleReport: string; lastSaved: number; }; const SAVE_KEY = "afterfall-save-v3"; const initialState: GameState = { cityLevel: 15, power: 28949348, resources: { food: 1700000, metal: 4800000, fuel: 474366, energy: 200, gold: 829963 }, buildings: { command: 15, farm: 12, metal: 12, refinery: 12, power: 12, warehouse: 12, hospital: 10, barracks: 12, vehicle: 12, weapons: 11, research: 12 }, army: { recruit: 200, rifleman: 150, heavy: 80, sniper: 40, machinegunner: 30, rocket: 20, apc: 15, tank: 8, special: 5 }, wounded: { recruit: 0, rifleman: 0, heavy: 0, sniper: 0, machinegunner: 0, rocket: 0, apc: 0, tank: 0, special: 0 }, research: { infantry: 5, vehicles: 4, production: 6, economy: 7, defense: 5 }, training: null, researching: null, enemyStrength: 6500, enemyScouted: false, battleReport: "Ð Ð°Ð·ÑƒÐ·Ð½Ð°Ð¹ Ð¿Ñ€Ð¾Ñ‚Ð¸Ð²Ð½Ð¸ÐºÐ° Ð¸ Ð¿Ð¾Ð´Ð³Ð¾Ñ‚Ð²Ð¸ Ð°Ñ€Ð¼Ð¸ÑÑ‚Ð° ÑÐ¸.", lastSaved: Date.now(), }; const buildingInfo: Record = { command: { name: "COMMAND CENTER", icon: "ðŸ¢", desc: "Ð¡ÑŠÑ€Ñ†ÐµÑ‚Ð¾ Ð½Ð° New Hope. Ð”Ð°Ð²Ð° Power.", max: 30, base: { food: 200, metal: 150 } }, farm: { name: "FARM", icon: "ðŸŒ¾", desc: "ÐŸÑ€Ð¾Ð¸Ð·Ð²ÐµÐ¶Ð´Ð° Food.", max: 30, base: { food: 50, metal: 20 } }, metal: { name: "STEEL MILL", icon: "ðŸ­", desc: "Ð”Ð¾Ð±Ð¸Ð²Ð° Metal.", max: 30, base: { food: 60, metal: 40 } }, refinery: { name: "REFINERY", icon: "ðŸ›¢ï¸", desc: "ÐŸÑ€Ð¾Ð¸Ð·Ð²ÐµÐ¶Ð´Ð° Fuel.", max: 30, base: { food: 70, metal: 60 } }, power: { name: "POWER PLANT", icon: "âš¡", desc: "ÐŸÑ€Ð¾Ð¸Ð·Ð²ÐµÐ¶Ð´Ð° Energy.", max: 30, base: { food: 80, metal: 80 } }, warehouse: { name: "WAREHOUSE", icon: "ðŸ“¦", desc: "+1000 Capacity.", max: 30, base: { food: 80, metal: 100 } }, hospital: { name: "HOSPITAL", icon: "ðŸ¥", desc: "Ð¡Ð¿Ð°ÑÑÐ²Ð° 30% Ñ€Ð°Ð½ÐµÐ½Ð¸.", max: 30, base: { food: 100, metal: 100 } }, barracks: { name: "BARRACKS", icon: "ðŸª–", desc: "ÐŸÐµÑ…Ð¾Ñ‚Ð°.", max: 30, base: { food: 90, metal: 70 } }, vehicle: { name: "GARAGE", icon: "ðŸš™", desc: "APC Ð¸ Tank.", max: 30, base: { food: 150, metal: 200 } }, weapons: { name: "ARSENAL", icon: "ðŸ”«", desc: "Ð¡Ð¿ÐµÑ† Ð¾Ñ€ÑŠÐ¶Ð¸Ñ.", max: 30, base: { food: 120, metal: 180 } }, research: { name: "LAB", icon: "ðŸ”¬", desc: "Ð¢ÐµÑ…Ð½Ð¾Ð»Ð¾Ð³Ð¸Ð¸.", max: 30, base: { food: 150, metal: 200 } }, }; const armyInfo: Record = { recruit: { name: "Recruit", icon: "ðŸ‘¤", building: "barracks", food: 20, metal: 5, fuel: 0, time: 4, attack: 5, defense: 4 }, rifleman: { name: "Rifleman", icon: "ðŸ”«", building: "barracks", food: 35, metal: 20, fuel: 0, time: 8, attack: 10, defense: 8 }, heavy: { name: "Heavy", icon: "ðŸª–", building: "barracks", food: 60, metal: 45, fuel: 0, time: 14, attack: 20, defense: 18 }, sniper: { name: "Sniper", icon: "ðŸŽ¯", building: "weapons", food: 50, metal: 55, fuel: 0, time: 18, attack: 35, defense: 10 }, machinegunner: { name: "MG Gunner", icon: "ðŸ’¥", building: "weapons", food: 65, metal: 60, fuel: 0, time: 20, attack: 30, defense: 20 }, rocket: { name: "Rocket", icon: "ðŸš€", building: "weapons", food: 80, metal: 90, fuel: 15, time: 25, attack: 55, defense: 12 }, apc: { name: "APC", icon: "ðŸš™", building: "vehicle", food: 80, metal: 150, fuel: 60, time: 35, attack: 60, defense: 80 }, tank: { name: "Tank", icon: "ðŸ›¡ï¸", building: "vehicle", food: 120, metal: 240, fuel: 100, time: 55, attack: 120, defense: 150 }, special: { name: "SpecOps", icon: "âš”ï¸", building: "weapons", food: 150, metal: 180, fuel: 40, time: 50, attack: 160, defense: 80 }, }; function formatNumber(v: number) { if (v >= 1000000) return (v / 1000000).toFixed(1) + "M"; if (v >= 1000) return (v / 1000).toFixed(0) + "K"; return Math.floor(v).toString(); } function loadGame(): GameState { try { const saved = localStorage.getItem(SAVE_KEY); if (!saved) return initialState; const p = JSON.parse(saved); return { ...initialState, ...p, resources: { ...initialState.resources, ...p.resources } }; } catch { return initialState; } } export default function App() { const [game, setGame] = useState(() => loadGame()); const [tab, setTab] = useState("city"); const [selected, setSelected] = useState("command"); const [msg, setMsg] = useState("Ð”Ð¾Ð±Ñ€Ðµ Ð´Ð¾ÑˆÑŠÐ» Ð² New Hope, Commander."); const saveRef = useRef(0); useEffect(() => { if (Date.now() - saveRef.current < 2000) return; saveRef.current = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify({ ...game, lastSaved: Date.now() })); }, [game]); useEffect(() => { const id = setInterval(() => { setGame(c => { const bonus = 1 + c.research.economy * 0.08; const cap = 5000000 + c.buildings.warehouse * 250000; let next = { ...c, resources: { ...c.resources, food: Math.min(cap, c.resources.food + c.buildings.farm * 12 * bonus), metal: Math.min(cap, c.resources.metal + c.buildings.metal * 15 * bonus), fuel: Math.min(cap, c.resources.fuel + c.buildings.refinery * 8 * bonus), gold: c.resources.gold, energy: Math.min(cap, c.resources.energy + c.buildings.power * 5), } }; if (c.training && Date.now() >= c.training.finish) { next = { ...next, army: { ...next.army, [c.training.type]: next.army[c.training.type] + c.training.amount }, training: null }; setMsg(`${armyInfo[c.training.type].name} Ã—${c.training.amount} Ð³Ð¾Ñ‚Ð¾Ð²!`); } if (c.researching && Date.now() >= c.researching.finish) { next = { ...next, research: { ...next.research, [c.researching.type]: next.research[c.researching.type] + 1 }, researching: null }; } return next; }); }, 1000); return () => clearInterval(id); }, []); const armyPower = useMemo(() => { let a = 0, d = 0; (Object.keys(game.army) as ArmyId[]).forEach(t => { a += game.army[t] * armyInfo[t].attack; d += game.army[t] * armyInfo[t].defense; }); a *= 1 + game.research.infantry * 0.08; a *= 1 + game.research.vehicles * 0.1; d *= 1 + game.research.defense * 0.1; return { attack: Math.floor(a), defense: Math.floor(d), total: Math.floor(a + d) }; }, [game.army, game.research]); const upgrade = (id: BuildingId) => { const lvl = game.buildings[id]; const info = buildingInfo[id]; if (lvl >= info.max) { setMsg("MAX LEVEL"); return; } if (id !== "command" && lvl >= game.cityLevel) { setMsg(`ÐÑƒÐ¶ÐµÐ½ Ðµ COMMAND CENTER Lv.${lvl + 1}`); return; } const costF = info.base.food * (lvl + 1) * 2; const costM = info.base.metal * (lvl + 1) * 2; if (game.resources.food < costF || game.resources.metal < costM) { setMsg("ÐÑÐ¼Ð° Ñ€ÐµÑÑƒÑ€ÑÐ¸!"); return; } setGame(c => ({ ...c, resources: { ...c.resources, food: c.resources.food - costF, metal: c.resources.metal - costM }, buildings: { ...c.buildings, [id]: c.buildings[id] + 1 }, cityLevel: id === "command" ? c.cityLevel + 1 : c.cityLevel, power: c.power + 150 * (lvl + 1) })); setMsg(`${info.name} -> Lv.${lvl + 1}`); }; const train = (type: ArmyId, amount: number) => { if (game.training) { setMsg("Ð§Ð°ÐºÐ°Ð¹ Ð¿Ñ€Ð¾Ð¸Ð·Ð²Ð¾Ð´ÑÑ‚Ð²Ð¾Ñ‚Ð¾!"); return; } const info = armyInfo[type]; if (game.buildings[info.building] === 0) { setMsg(`ÐŸÐ¾ÑÑ‚Ñ€Ð¾Ð¹ ${buildingInfo[info.building].name}`); return; } const cf = info.food * amount, cm = info.metal * amount, cfu = info.fuel * amount; if (game.resources.food < cf || game.resources.metal < cm || game.resources.fuel < cfu) { setMsg("ÐÐµÐ´Ð¾ÑÑ‚Ð°Ñ‚ÑŠÑ‡Ð½Ð¾ Ñ€ÐµÑÑƒÑ€ÑÐ¸"); return; } const time = (info.time * amount * 1000) / (1 + game.research.production * 0.1); setGame(c => ({ ...c, resources: { ...c.resources, food: c.resources.food - cf, metal: c.resources.metal - cm, fuel: c.resources.fuel - cfu } })); setGame(c => ({ ...c, training: { type, amount, finish: Date.now() + time } } as any)); setMsg(`Ð¢Ñ€ÐµÐ½Ð¸Ñ€Ð°: ${info.name} Ã—${amount}`); }; const research = (t: keyof typeof game.research) => { if (game.researching) { setMsg("Ð’ÐµÑ‡Ðµ research-Ð²Ð°Ñˆ!"); return; } const lvl = game.research[t]; if (lvl >= 10) { setMsg("MAX"); return; } const cf = 200 * (lvl + 1) * 5, cm = 250 * (lvl + 1) * 5; if (game.resources.food < cf || game.resources.metal < cm) { setMsg("ÐÑÐ¼Ð° Ñ€ÐµÑÑƒÑ€ÑÐ¸"); return; } setGame(c => ({ ...c, resources: { ...c.resources, food: c.resources.food - cf, metal: c.resources.metal - cm }, researching: { type: t, finish: Date.now() + 8000 } })); setMsg(`Research: ${t}...`); }; return (
50â˜…
VIP 11
Lv.{game.cityLevel}
ðŸ’° {formatNumber(game.resources.gold)}
ðŸŒ¾ {formatNumber(game.resources.food)}
â›ï¸ {formatNumber(game.resources.metal)}
ðŸ›¢ï¸ {formatNumber(game.resources.fuel)}
âš¡ {formatNumber(game.power)}
ðŸŽâš™ï¸
{tab === "world" ? (
Server Time 2026/8/26 23:48:41
{Array.from({ length: 12 }).map((_, i) => (
))}
ðŸ°
My City
Alliance Leader
Ally
Alliance Territory
) : (
âš¡ {formatNumber(game.power)} POWER
{(Object.keys(buildingInfo) as BuildingId[]).map(id => { const lvl = game.buildings[id]; if (lvl <= 0 && id !== "command") return (  setSelected(id)}>ðŸ§±BUILD ); return (  setSelected(id)}>
{buildingInfo[id].icon}
{buildingInfo[id].name}
Lv.{lvl}
{id === "command" &&
}  ); })}
{Object.entries(game.army).filter(([, v]) => v > 0).slice(0, 6).map(([k, v]) => (
{armyInfo[k as ArmyId].icon} {v}
))}
)}
setTab("city")}>ðŸ™ï¸CITY  setTab("world")}>ðŸŒWORLD  setTab("army")}>ðŸª–ARMY
{Object.values(game.army).reduce((a, b) => a + b, 0)}
  setTab("research")}>ðŸ”¬RESEARCH setTab("attack")}>âš”ï¸WAR
{msg}
{tab === "city" && selected && (
{buildingInfo[selected].icon}
{buildingInfo[selected].name}

LEVEL {game.buildings[selected]} / {buildingInfo[selected].max}
{buildingInfo[selected].desc}

ðŸ– {buildingInfo[selected].base.food * (game.buildings[selected] + 1) * 2} | ðŸ”© {buildingInfo[selected].base.metal * (game.buildings[selected] + 1) * 2}
upgrade(selected)}>UPGRADE - {game.buildings[selected] >= buildingInfo[selected].max ? "MAX" : `Lv.${game.buildings[selected] + 1}`}
)} {tab === "army" && (
âš”ï¸ {armyPower.attack} ATTACK | ðŸ›¡ï¸ {armyPower.defense} DEFENSE

{game.training &&
Ð¢Ñ€ÐµÐ½Ð¸Ñ€Ð°: {armyInfo[game.training.type].name} Ã—{game.training.amount} - {Math.ceil((game.training.finish - Date.now()) / 1000)}s
}
{(Object.keys(armyInfo) as ArmyId[]).map(t => { const unlocked = game.buildings[armyInfo[t].building] > 0; return (
{armyInfo[t].icon}
{armyInfo[t].name}{game.army[t]} âš”ï¸{armyInfo[t].attack} ðŸ›¡ï¸{armyInfo[t].defense} {unlocked ?
train(t, 1)}>+1train(t, 5)}>+5train(t, 10)}>+10
: ðŸ”’ {buildingInfo[armyInfo[t].building].name}}
); })}
)} {tab === "research" && (
{(Object.keys(game.research) as (keyof Research)[]).map(k => (
{k.toUpperCase()} Lv.{game.research[k]} research(k)}>{game.researching?.type === k ? "RESEARCHING..." : "RESEARCH"}
))}
)} {tab === "attack" && (
âš”ï¸ WAR ROOM - ENEMY {game.enemyStrength}

{game.battleReport}

{ if (game.resources.fuel < 30) { setMsg("ÐÑƒÐ¶Ð½Ð¸ 30 Fuel"); return; } setGame(c => ({ ...c, resources: { ...c.resources, fuel: c.resources.fuel - 30 }, enemyScouted: true })); setMsg(`Ð’Ñ€Ð°Ð³: ${game.enemyStrength} Power`); }}>ðŸ›°ï¸ SCOUT (30 Fuel){ const won = armyPower.attack * (0.85 + Math.random() * 0.3) >= game.enemyStrength; setGame(c => ({ ...c, enemyStrength: Math.floor(c.enemyStrength * (won ? 1.12 : 1.05)), enemyScouted: false, battleReport: won ? `ÐŸÐžÐ‘Ð•Ð”Ð! ÐŸÐ»ÑÑ‡ÐºÐ°: 500 Food` : `Ð—ÐÐ“Ð£Ð‘Ð!` })); setMsg(won ? "ÐŸÐžÐ‘Ð•Ð”Ð!" : "Ð—ÐÐ“Ð£Ð‘Ð!"); }}>âš”ï¸ ATTACK
)}  { localStorage.removeItem(SAVE_KEY); location.reload(); }}>RESET
ðŸ“œQuest 2  ðŸŽ’Bag  âœ‰ï¸Mail 31  â­Alliance 24  ðŸ‘¤My Info
); }