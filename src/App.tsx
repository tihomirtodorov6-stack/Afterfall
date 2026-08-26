import { useEffect, useMemo, useState, useRef } from "react";
import "./style.css";

type Tab = "city" | "army" | "research" | "attack";
type BuildingId = "command" | "farm" | "metal" | "refinery" | "power" | "warehouse" | "hospital" | "barracks" | "vehicle" | "weapons" | "research";
type ArmyId = "recruit" | "rifleman" | "heavy" | "sniper" | "machinegunner" | "rocket" | "apc" | "tank" | "special";
type Resources = { food: number; metal: number; fuel: number; energy: number; };
type Army = Record<ArmyId, number>;
type Buildings = Record<BuildingId, number>;
type Research = { infantry: number; vehicles: number; production: number; economy: number; defense: number; };

type TrainingQueue = { type: ArmyId; amount: number; finish: number; } | null;
type ResearchQueue = { type: keyof Research; finish: number; } | null;

type GameState = {
  cityLevel: number;
  resources: Resources;
  buildings: Buildings;
  army: Army;
  wounded: Army;
  research: Research;
  training: TrainingQueue;
  researching: ResearchQueue;
  enemyStrength: number;
  enemyScouted: boolean;
  battleReport: string;
  lastSaved: number;
};

const SAVE_KEY = "afterfall-save-v2";

const initialState: GameState = {
  cityLevel: 1,
  resources: { food: 1000, metal: 800, fuel: 500, energy: 200 },
  buildings: { command: 1, farm: 1, metal: 1, refinery: 1, power: 1, warehouse: 1, hospital: 1, barracks: 1, vehicle: 0, weapons: 0, research: 1 },
  army: { recruit: 20, rifleman: 0, heavy: 0, sniper: 0, machinegunner: 0, rocket: 0, apc: 0, tank: 0, special: 0 },
  wounded: { recruit: 0, rifleman: 0, heavy: 0, sniper: 0, machinegunner: 0, rocket: 0, apc: 0, tank: 0, special: 0 },
  research: { infantry: 0, vehicles: 0, production: 0, economy: 0, defense: 0 },
  training: null,
  researching: null,
  enemyStrength: 650,
  enemyScouted: false,
  battleReport: "Разузнай противника и подготви армията си.",
  lastSaved: Date.now(),
};

const buildingInfo: Record<BuildingId, { name: string; icon: string; description: string; max: number; baseCost: { food: number, metal: number } }> = {
  command: { name: "COMMAND CENTER", icon: "🏢", description: "Сърцето на New Hope. Определя макс ниво на всички сгради.", max: 30, baseCost: { food: 200, metal: 150 } },
  farm: { name: "FARM", icon: "🌾", description: "Произвежда Food.", max: 30, baseCost: { food: 50, metal: 20 } },
  metal: { name: "METAL FACTORY", icon: "⛏️", description: "Добива Metal.", max: 30, baseCost: { food: 60, metal: 40 } },
  refinery: { name: "REFINERY", icon: "🛢️", description: "Произвежда Fuel.", max: 30, baseCost: { food: 70, metal: 60 } },
  power: { name: "POWER PLANT", icon: "⚡", description: "Произвежда Energy.", max: 30, baseCost: { food: 80, metal: 80 } },
  warehouse: { name: "WAREHOUSE", icon: "📦", description: "Увеличава капацитета с 1000.", max: 30, baseCost: { food: 80, metal: 100 } },
  hospital: { name: "HOSPITAL", icon: "🏥", description: "Спасява 30% от ранените. Капацитет = LVL * 50", max: 30, baseCost: { food: 100, metal: 100 } },
  barracks: { name: "BARRACKS", icon: "🪖", description: "Произвежда пехота.", max: 30, baseCost: { food: 90, metal: 70 } },
  vehicle: { name: "VEHICLE FACTORY", icon: "🚙", description: "Произвежда APC и Tank.", max: 30, baseCost: { food: 150, metal: 200 } },
  weapons: { name: "WEAPONS FACTORY", icon: "🔫", description: "Спец оръжия.", max: 30, baseCost: { food: 120, metal: 180 } },
  research: { name: "RESEARCH CENTER", icon: "🔬", description: "Технологии.", max: 30, baseCost: { food: 150, metal: 200 } },
};

const armyInfo: Record<ArmyId, { name: string; icon: string; building: BuildingId; food: number; metal: number; fuel: number; time: number; attack: number; defense: number; }> = {
  recruit: { name: "Recruit", icon: "👤", building: "barracks", food: 20, metal: 5, fuel: 0, time: 4, attack: 5, defense: 4 },
  rifleman: { name: "Rifleman", icon: "🔫", building: "barracks", food: 35, metal: 20, fuel: 0, time: 8, attack: 10, defense: 8 },
  heavy: { name: "Heavy Infantry", icon: "🪖", building: "barracks", food: 60, metal: 45, fuel: 0, time: 14, attack: 20, defense: 18 },
  sniper: { name: "Sniper", icon: "🎯", building: "weapons", food: 50, metal: 55, fuel: 0, time: 18, attack: 35, defense: 10 },
  machinegunner: { name: "Machine Gunner", icon: "💥", building: "weapons", food: 65, metal: 60, fuel: 0, time: 20, attack: 30, defense: 20 },
  rocket: { name: "Rocket Soldier", icon: "🚀", building: "weapons", food: 80, metal: 90, fuel: 15, time: 25, attack: 55, defense: 12 },
  apc: { name: "APC", icon: "🚙", building: "vehicle", food: 80, metal: 150, fuel: 60, time: 35, attack: 60, defense: 80 },
  tank: { name: "Tank", icon: "🛡️", building: "vehicle", food: 120, metal: 240, fuel: 100, time: 55, attack: 120, defense: 150 },
  special: { name: "Special Forces", icon: "⚔️", building: "weapons", food: 150, metal: 180, fuel: 40, time: 50, attack: 160, defense: 80 },
};

function formatNumber(v: number) { return Math.floor(v).toLocaleString("en-GB"); }

function loadGame(): GameState {
  try {
    const saved = localStorage.getItem(SAVE_KEY) || localStorage.getItem("afterfall-save-v1");
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    // offline progress
    const elapsedSec = Math.min(24*3600, Math.floor((Date.now() - (parsed.lastSaved || Date.now())) / 1000));
    if (elapsedSec > 10) {
      const b = parsed.buildings; const r = parsed.research;
      const bonus = 1 + (r?.economy || 0)*0.08;
      const cap = 2000 + (b?.warehouse || 0)*1000;
      parsed.resources.food = Math.min(cap, parsed.resources.food + (b.farm*3*bonus)*elapsedSec);
      parsed.resources.metal = Math.min(cap, parsed.resources.metal + (b.metal*2.5*bonus)*elapsedSec);
      parsed.resources.fuel = Math.min(cap, parsed.resources.fuel + (b.refinery*1.5*bonus)*elapsedSec);
      parsed.resources.energy = Math.min(cap, parsed.resources.energy + (b.power*3)*elapsedSec);
    }
    return {...initialState,...parsed, wounded: parsed.wounded || initialState.wounded, training: parsed.training || null, researching: parsed.researching || null };
  } catch { return initialState; }
}

export default function App() {
  const [game, setGame] = useState<GameState>(() => loadGame());
  const [tab, setTab] = useState<Tab>("city");
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingId | null>(null);
  const [message, setMessage] = useState("Добре дошъл в New Hope.");
  const lastSaveRef = useRef(0);

  useEffect(() => {
    if (Date.now() - lastSaveRef.current < 3000) return;
    lastSaveRef.current = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify({...game, lastSaved: Date.now() }));
  }, [game]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGame((cur) => {
        const economyBonus = 1 + cur.research.economy * 0.08;
        const capacity = 2000 + cur.buildings.warehouse * 1000;
        let next = {...cur,
          resources: {
            food: Math.min(capacity, cur.resources.food + cur.buildings.farm * 3 * economyBonus),
            metal: Math.min(capacity, cur.resources.metal + cur.buildings.metal * 2.5 * economyBonus),
            fuel: Math.min(capacity, cur.resources.fuel + cur.buildings.refinery * 1.5 * economyBonus),
            energy: Math.min(capacity, cur.resources.energy + cur.buildings.power * 3),
          }
        };
        // check training
        if (cur.training && Date.now() >= cur.training.finish) {
          next = {...next, army: {...next.army, [cur.training.type]: next.army[cur.training.type] + cur.training.amount }, training: null };
          setMessage(`${armyInfo[cur.training.type].name} ×${cur.training.amount} е готова.`);
        }
        // check research
        if (cur.researching && Date.now() >= cur.researching.finish) {
          next = {...next, research: {...next.research, [cur.researching.type]: next.research[cur.researching.type] + 1 }, researching: null };
          setMessage(`${cur.researching.type} достигна Level ${next.research[cur.researching.type]}.`);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const armyPower = useMemo(() => {
    let atk = 0, def = 0;
    (Object.keys(game.army) as ArmyId[]).forEach(t => { atk += game.army[t]*armyInfo[t].attack; def += game.army[t]*armyInfo[t].defense; });
    atk *= 1 + game.research.infantry*0.08; atk *= 1 + game.research.vehicles*0.1;
    def *= 1 + game.research.defense*0.1;
    return { attack: Math.floor(atk), defense: Math.floor(def), total: Math.floor(atk+def) };
  }, [game.army, game.research]);

  //... upgradeBuilding, trainUnit, researchTech, scout, attack - същите като твоите но с функционален setGame и hospital логика
  // заради лимита на чата ти давам пълния файл като артефакт по-долу
  return null as any
}