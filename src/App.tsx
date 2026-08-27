import { useEffect, useMemo, useState } from "react";
import "./style.css";

type Tab = "city" | "army" | "research" | "attack";

type BuildingId =
  | "command"
  | "farm"
  | "metal"
  | "refinery"
  | "power"
  | "warehouse"
  | "hospital"
  | "barracks"
  | "vehicle"
  | "weapons"
  | "research";

type ArmyId =
  | "recruit"
  | "rifleman"
  | "heavy"
  | "sniper"
  | "machinegunner"
  | "rocket"
  | "apc"
  | "tank"
  | "special";

type Resources = {
  food: number;
  metal: number;
  fuel: number;
  energy: number;
};

type Army = Record<ArmyId, number>;
type Buildings = Record<BuildingId, number>;

type Research = {
  infantry: number;
  vehicles: number;
  production: number;
  economy: number;
  defense: number;
};

type GameState = {
  cityLevel: number;
  resources: Resources;
  buildings: Buildings;
  army: Army;
  research: Research;
  hospitalCapacity: number;
  power: number;
  enemyStrength: number;
  enemyScouted: boolean;
  battleReport: string;
  lastSaved: number;
};

const SAVE_KEY = "afterfall-save-v2";

const initialState: GameState = {
  cityLevel: 1,

  resources: {
    food: 1000,
    metal: 800,
    fuel: 500,
    energy: 300,
  },

  buildings: {
    command: 1,
    farm: 1,
    metal: 1,
    refinery: 1,
    power: 1,
    warehouse: 1,
    hospital: 1,
    barracks: 1,
    vehicle: 1,
    weapons: 1,
    research: 1,
  },

  army: {
    recruit: 20,
    rifleman: 0,
    heavy: 0,
    sniper: 0,
    machinegunner: 0,
    rocket: 0,
    apc: 0,
    tank: 0,
    special: 0,
  },

  research: {
    infantry: 0,
    vehicles: 0,
    production: 0,
    economy: 0,
    defense: 0,
  },

  hospitalCapacity: 50,
  power: 130,

  enemyStrength: 650,
  enemyScouted: false,

  battleReport:
    "Разузнай противника и подготви армията си.",

  lastSaved: Date.now(),
};

const buildingInfo: Record<
  BuildingId,
  {
    name: string;
    icon: string;
    description: string;
    max: number;
  }
> = {
  command: {
    name: "COMMAND CENTER",
    icon: "🏢",
    description: "Сърцето на New Hope.",
    max: 30,
  },

  farm: {
    name: "FARM",
    icon: "🌾",
    description: "Произвежда Food.",
    max: 30,
  },

  metal: {
    name: "METAL FACTORY",
    icon: "⛏️",
    description: "Произвежда Metal.",
    max: 30,
  },

  refinery: {
    name: "REFINERY",
    icon: "🛢️",
    description: "Произвежда Fuel.",
    max: 30,
  },

  power: {
    name: "POWER PLANT",
    icon: "⚡",
    description: "Произвежда Energy.",
    max: 30,
  },

  warehouse: {
    name: "WAREHOUSE",
    icon: "📦",
    description: "Увеличава капацитета на ресурсите.",
    max: 30,
  },

  hospital: {
    name: "HOSPITAL",
    icon: "🏥",
    description: "Лекува ранени войници.",
    max: 30,
  },

  barracks: {
    name: "BARRACKS",
    icon: "🪖",
    description: "Произвежда пехота.",
    max: 30,
  },

  vehicle: {
    name: "VEHICLE FACTORY",
    icon: "🚙",
    description: "Произвежда бронирани машини.",
    max: 30,
  },

  weapons: {
    name: "WEAPONS FACTORY",
    icon: "🔫",
    description: "Произвежда тежко въоръжение.",
    max: 30,
  },

  research: {
    name: "RESEARCH CENTER",
    icon: "🔬",
    description: "Развива военни и икономически технологии.",
    max: 30,
  },
};

const armyInfo: Record<
  ArmyId,
  {
    name: string;
    icon: string;
    building: BuildingId;
    food: number;
    metal: number;
    fuel: number;
    time: number;
    attack: number;
    defense: number;
  }
> = {
  recruit: {
    name: "Recruit",
    icon: "👤",
    building: "barracks",
    food: 20,
    metal: 5,
    fuel: 0,
    time: 4,
    attack: 5,
    defense: 4,
  },

  rifleman: {
    name: "Rifleman",
    icon: "🔫",
    building: "barracks",
    food: 35,
    metal: 20,
    fuel: 0,
    time: 8,
    attack: 10,
    defense: 8,
  },

  heavy: {
    name: "Heavy Infantry",
    icon: "🪖",
    building: "barracks",
    food: 60,
    metal: 45,
    fuel: 0,
    time: 14,
    attack: 20,
    defense: 18,
  },

  sniper: {
    name: "Sniper",
    icon: "🎯",
    building: "weapons",
    food: 50,
    metal: 55,
    fuel: 0,
    time: 18,
    attack: 35,
    defense: 10,
  },

  machinegunner: {
    name: "Machine Gunner",
    icon: "💥",
    building: "weapons",
    food: 65,
    metal: 60,
    fuel: 0,
    time: 20,
    attack: 30,
    defense: 20,
  },

  rocket: {
    name: "Rocket Soldier",
    icon: "🚀",
    building: "weapons",
    food: 80,
    metal: 90,
    fuel: 15,
    time: 25,
    attack: 55,
    defense: 12,
  },

  apc: {
    name: "APC",
    icon: "🚙",
    building: "vehicle",
    food: 80,
    metal: 150,
    fuel: 60,
    time: 35,
    attack: 60,
    defense: 80,
  },

  tank: {
    name: "Tank",
    icon: "🛡️",
    building: "vehicle",
    food: 120,
    metal: 240,
    fuel: 100,
    time: 55,
    attack: 120,
    defense: 150,
  },

  special: {
    name: "Special Forces",
    icon: "⚔️",
    building: "weapons",
    food: 150,
    metal: 180,
    fuel: 40,
    time: 50,
    attack: 160,
    defense: 80,
  },
};

function formatNumber(value: number) {
  return Math.floor(value).toLocaleString("en-GB");
}

function loadGame(): GameState {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return {
        ...initialState,
        lastSaved: Date.now(),
      };
    }

    const parsed = JSON.parse(saved);

    return {
      ...initialState,
      ...parsed,
      resources: {
        ...initialState.resources,
        ...(parsed.resources || {}),
      },
      buildings: {
        ...initialState.buildings,
        ...(parsed.buildings || {}),
      },
      army: {
        ...initialState.army,
        ...(parsed.army || {}),
      },
      research: {
        ...initialState.research,
        ...(parsed.research || {}),
      },
    };
  } catch {
    return initialState;
  }
}

export default function App() {
  const [game, setGame] = useState<GameState>(() => loadGame());

  const [tab, setTab] = useState<Tab>("city");

  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingId | null>(null);

  const [training, setTraining] = useState<{
    type: ArmyId;
    amount: number;
    finish: number;
    duration: number;
  } | null>(null);

  const [message, setMessage] = useState(
    "Добре дошъл в New Hope."
  );

  const [researching, setResearching] =
    useState<keyof Research | null>(null);

  /* SAVE */

  useEffect(() => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...game,
        lastSaved: Date.now(),
      })
    );
  }, [game]);

  /* RESOURCE PRODUCTION */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setGame((current) => {
        const buildings = current.buildings;
        const research = current.research;

        const economyBonus =
          1 + research.economy * 0.08;

        const foodProduction =
          buildings.farm * 3 * economyBonus;

        const metalProduction =
          buildings.metal * 2.5 * economyBonus;

        const fuelProduction =
          buildings.refinery * 1.5 * economyBonus;

        const energyProduction =
          buildings.power * 3;

        const capacity =
          2000 + buildings.warehouse * 1000;

        return {
          ...current,

          resources: {
            food: Math.min(
              capacity,
              current.resources.food + foodProduction
            ),

            metal: Math.min(
              capacity,
              current.resources.metal + metalProduction
            ),

            fuel: Math.min(
              capacity,
              current.resources.fuel + fuelProduction
            ),

            energy: Math.min(
              capacity,
              current.resources.energy + energyProduction
            ),
          },

          power: 100 + buildings.power * 30,
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  /* TRAINING */

  useEffect(() => {
    if (!training) return;

    const timer = window.setInterval(() => {
      if (Date.now() >= training.finish) {
        setGame((current) => ({
          ...current,

          army: {
            ...current.army,

            [training.type]:
              current.army[training.type] +
              training.amount,
          },
        }));

        setMessage(
          `${armyInfo[training.type].name} ×${training.amount} е готова.`
        );

        setTraining(null);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, [training]);

  /* BUILDING UPGRADE */

  const upgradeBuilding = (id: BuildingId) => {
    const level = game.buildings[id];

    if (level >= buildingInfo[id].max) {
      setMessage("Тази сграда е на максимално ниво.");
      return;
    }

    if (id !== "command" && level >= game.cityLevel) {
      setMessage(
        `Първо повиши Command Center до Level ${level + 1}.`
      );
      return;
    }

    const foodCost = 100 * (level + 1);
    const metalCost = 80 * (level + 1);

    if (
      game.resources.food < foodCost ||
      game.resources.metal < metalCost
    ) {
      setMessage("Нямаш достатъчно ресурси.");
      return;
    }

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,
        food: current.resources.food - foodCost,
        metal: current.resources.metal - metalCost,
      },

      buildings: {
        ...current.buildings,
        [id]: current.buildings[id] + 1,
      },

      cityLevel:
        id === "command"
          ? Math.min(30, current.cityLevel + 1)
          : current.cityLevel,
    }));

    setMessage(
      `${buildingInfo[id].name} е подобрена до Level ${level + 1}.`
    );
  };

  /* TRAIN ARMY */

  const trainUnit = (type: ArmyId, amount: number) => {
    if (training) {
      setMessage(
        "Изчакай текущото производство да завърши."
      );
      return;
    }

    const info = armyInfo[type];

    if (game.buildings[info.building] <= 0) {
      setMessage(
        `Построй ${buildingInfo[info.building].name} първо.`
      );
      return;
    }

    const foodCost = info.food * amount;
    const metalCost = info.metal * amount;
    const fuelCost = info.fuel * amount;

    if (
      game.resources.food < foodCost ||
      game.resources.metal < metalCost ||
      game.resources.fuel < fuelCost
    ) {
      setMessage(
        "Недостатъчно ресурси за производство."
      );
      return;
    }

    const productionBonus =
      1 + game.research.production * 0.1;

    const duration =
      (info.time * amount * 1000) /
      productionBonus;

    setGame((current) => ({
      ...current,

      resources: {
        food: current.resources.food - foodCost,
        metal: current.resources.metal - metalCost,
        fuel: current.resources.fuel - fuelCost,
        energy: Math.max(
          0,
          current.resources.energy - amount
        ),
      },
    }));

    setTraining({
      type,
      amount,
      finish: Date.now() + duration,
      duration,
    });

    setMessage(
      `Производство: ${info.name} ×${amount}.`
    );
  };

  /* RESEARCH */

  const researchInfo = {
    infantry: {
      name: "INFANTRY WEAPONS",
      icon: "🔫",
      description:
        "Увеличава атаката на пехотата.",
    },

    vehicles: {
      name: "VEHICLE TECHNOLOGY",
      icon: "🚙",
      description:
        "Увеличава атаката и защитата на машините.",
    },

    production: {
      name: "PRODUCTION",
      icon: "🏭",
      description:
        "Ускорява производството на армия.",
    },

    economy: {
      name: "ECONOMY",
      icon: "📈",
      description:
        "Увеличава производството на ресурси.",
    },

    defense: {
      name: "CITY DEFENSE",
      icon: "🛡️",
      description:
        "Увеличава защитата на града.",
    },
  } as const;

  const researchTech = (type: keyof Research) => {
    if (researching) {
      setMessage("Вече провеждаш research.");
      return;
    }

    const level = game.research[type];

    if (level >= 10) {
      setMessage("Тази технология е максимална.");
      return;
    }

    const foodCost = 200 * (level + 1);
    const metalCost = 250 * (level + 1);

    if (
      game.resources.food < foodCost ||
      game.resources.metal < metalCost
    ) {
      setMessage("Нямаш достатъчно ресурси.");
      return;
    }

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,
        food: current.resources.food - foodCost,
        metal: current.resources.metal - metalCost,
      },
    }));

    setResearching(type);

    window.setTimeout(() => {
      setGame((current) => ({
        ...current,

        research: {
          ...current.research,
          [type]: current.research[type] + 1,
        },
      }));

      setResearching(null);

      setMessage(
        `${researchInfo[type].name} достигна Level ${level + 1}.`
      );
    }, 5000);
  };

  /* ARMY POWER */

  const armyPower = useMemo(() => {
    let attack = 0;
    let defense = 0;

    (Object.keys(game.army) as ArmyId[]).forEach(
      (type) => {
        const amount = game.army[type];

        attack +=
          amount * armyInfo[type].attack;

        defense +=
          amount * armyInfo[type].defense;
      }
    );

    attack *=
      1 + game.research.infantry * 0.08;

    attack *=
      1 + game.research.vehicles * 0.1;

    defense *=
      1 + game.research.defense * 0.1;

    return {
      attack: Math.floor(attack),
      defense: Math.floor(defense),
      total: Math.floor(attack + defense),
    };
  }, [game.army, game.research]);

  /* TOTAL ARMY */

  const totalArmy = () => {
    return Object.values(game.army).reduce(
      (sum, value) => sum + value,
      0
    );
  };

  /* REMOVE CASUALTIES */

  const removeCasualties = (
    army: Army,
    casualties: number
  ): Army => {
    const result = { ...army };

    let remaining = casualties;

    const priority: ArmyId[] = [
      "recruit",
      "rifleman",
      "heavy",
      "sniper",
      "machinegunner",
      "rocket",
      "apc",
      "tank",
      "special",
    ];

    for (const type of priority) {
      if (remaining <= 0) break;

      const lost = Math.min(
        result[type],
        remaining
      );

      result[type] -= lost;
      remaining -= lost;
    }

    return result;
  };

  /* SCOUT */

  const scoutEnemy = () => {
    if (game.resources.fuel < 30) {
      setMessage(
        "Нужни са 30 Fuel за разузнаване."
      );
      return;
    }

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,
        fuel: current.resources.fuel - 30,
      },

      enemyScouted: true,
    }));

    setMessage(
      `Разузнаването приключи. Силата на врага е приблизително ${game.enemyStrength}.`
    );
  };

  /* ATTACK */

  const attackEnemy = () => {
    if (!game.enemyScouted) {
      setMessage(
        "Първо разузнай противника."
      );
      return;
    }

    const power = armyPower.attack;

    if (power < 100) {
      setMessage(
        "Армията ти е прекалено малка."
      );
      return;
    }

    const enemy = game.enemyStrength;

    const random =
      0.85 + Math.random() * 0.3;

    const effectivePower =
      power * random;

    const won =
      effectivePower >= enemy;

    const currentTotal = totalArmy();

    if (won) {
      const lootFood =
        Math.floor(
          200 + Math.random() * 500
        );

      const lootMetal =
        Math.floor(
          150 + Math.random() * 450
        );

      const lootFuel =
        Math.floor(
          50 + Math.random() * 150
        );

      const casualties = Math.min(
        currentTotal,
        Math.floor(
          currentTotal *
            (0.05 + Math.random() * 0.12)
        )
      );

      const newArmy =
        removeCasualties(
          game.army,
          casualties
        );

      setGame((current) => ({
        ...current,

        resources: {
          food:
            current.resources.food +
            lootFood,

          metal:
            current.resources.metal +
            lootMetal,

          fuel:
            current.resources.fuel +
            lootFuel,

          energy:
            current.resources.energy,
        },

        army: newArmy,

        enemyStrength:
          Math.floor(enemy * 1.12),

        enemyScouted: false,

        battleReport:
          `ПОБЕДА! Врагът е победен. Загуби: ${casualties} войници. Плячка: ${lootFood} Food, ${lootMetal} Metal, ${lootFuel} Fuel.`,
      }));

      setMessage(
        "ПОБЕДА! Получи ресурси от врага."
      );
    } else {
      const casualties = Math.min(
        currentTotal,
        Math.floor(
          currentTotal *
            (0.15 + Math.random() * 0.2)
        )
      );

      setGame((current) => ({
        ...current,

        army: removeCasualties(
          current.army,
          casualties
        ),

        enemyStrength:
          Math.floor(enemy * 1.05),

        enemyScouted: false,

        battleReport:
          `ПОРАЖЕНИЕ! Армията ти е отблъсната. Загуби: ${casualties} войници.`,
      }));

      setMessage(
        "ПОРАЖЕНИЕ. Трябва ти по-силна армия."
      );
    }
  };

  /* RESET */

  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  };

  /* RENDER */

  return (
    <main className="afterfall">

      <header className="topbar">

        <div className="brand">
          <strong>AFTERFALL</strong>
          <small>NEW HOPE</small>
        </div>

        <div className="resources">

          <Resource
            icon="🍖"
            value={game.resources.food}
          />

          <Resource
            icon="🔩"
            value={game.resources.metal}
          />

          <Resource
            icon="⛽"
            value={game.resources.fuel}
          />

          <Resource
            icon="⚡"
            value={game.resources.energy}
          />

        </div>

        <div className="city-level">
          CITY LV.
          <b>{game.cityLevel}</b>
        </div>

      </header>

      <section className="city">

        <div className="sky" />

        <div className="city-title">
          <span>NEW HOPE</span>
          <small>SURVIVOR SETTLEMENT</small>
        </div>

        <div className="road vertical" />
        <div className="road horizontal" />

        <BuildingVisual
          id="command"
          level={game.buildings.command}
          selected={selectedBuilding === "command"}
          onClick={() =>
            setSelectedBuilding("command")
          }
          className="command"
        />

        <BuildingVisual
          id="farm"
          level={game.buildings.farm}
          selected={selectedBuilding === "farm"}
          onClick={() =>
            setSelectedBuilding("farm")
          }
          className="farm"
        />

        <BuildingVisual
          id="metal"
          level={game.buildings.metal}
          selected={selectedBuilding === "metal"}
          onClick={() =>
            setSelectedBuilding("metal")
          }
          className="metal"
        />

        <BuildingVisual
          id="refinery"
          level={game.buildings.refinery}
          selected={selectedBuilding === "refinery"}
          onClick={() =>
            setSelectedBuilding("refinery")
          }
          className="refinery"
        />

        <BuildingVisual
          id="power"
          level={game.buildings.power}
          selected={selectedBuilding === "power"}
          onClick={() =>
            setSelectedBuilding("power")
          }
          className="powerplant"
        />

        <BuildingVisual
          id="vehicle"
          level={game.buildings.vehicle}
          selected={selectedBuilding === "vehicle"}
          onClick={() =>
            setSelectedBuilding("vehicle")
          }
          className="vehicle"
        />

        <BuildingVisual
          id="weapons"
          level={game.buildings.weapons}
          selected={selectedBuilding === "weapons"}
          onClick={() =>
            setSelectedBuilding("weapons")
          }
          className="weapons"
        />

        <BuildingVisual
          id="barracks"
          level={game.buildings.barracks}
          selected={selectedBuilding === "barracks"}
          onClick={() =>
            setSelectedBuilding("barracks")
          }
          className="barracks"
        />

        <BuildingVisual
          id="hospital"
          level={game.buildings.hospital}
          selected={selectedBuilding === "hospital"}
          onClick={() =>
            setSelectedBuilding("hospital")
          }
          className="hospital"
        />

        <BuildingVisual
          id="research"
          level={game.buildings.research}
          selected={selectedBuilding === "research"}
          onClick={() =>
            setSelectedBuilding("research")
          }
          className="research"
        />

        <BuildingVisual
          id="warehouse"
          level={game.buildings.warehouse}
          selected={selectedBuilding === "warehouse"}
          onClick={() =>
            setSelectedBuilding("warehouse")
          }
          className="warehouse"
        />

        <div className="trees">
          🌲　🌲　🌲　🌲　🌲
        </div>

      </section>

      <nav className="bottom-nav">

        <NavButton
          active={tab === "city"}
          icon="🏙️"
          label="CITY"
          onClick={() => setTab("city")}
        />

        <NavButton
          active={tab === "army"}
          icon="🪖"
          label="ARMY"
          onClick={() => setTab("army")}
        />

        <NavButton
          active={tab === "research"}
          icon="🔬"
          label="RESEARCH"
          onClick={() => setTab("research")}
        />

        <NavButton
          active={tab === "attack"}
          icon="⚔️"
          label="ATTACK"
          onClick={() => setTab("attack")}
        />

      </nav>

      <section className="panel">

        <div className="message">
          {message}
        </div>

        {tab === "city" && (
          <CityPanel
            game={game}
            selectedBuilding={selectedBuilding}
            onUpgrade={upgradeBuilding}
          />
        )}

        {tab === "army" && (
          <ArmyPanel
            game={game}
            training={training}
            onTrain={trainUnit}
            armyPower={armyPower}
          />
        )}

        {tab === "research" && (
          <ResearchPanel
            game={game}
            info={researchInfo}
            researching={researching}
            onResearch={researchTech}
          />
        )}

        {tab === "attack" && (
          <AttackPanel
            game={game}
            armyPower={armyPower}
            onScout={scoutEnemy}
            onAttack={attackEnemy}
          />
        )}

        <button
          className="reset"
          onClick={resetGame}
        >
          RESET GAME
        </button>

      </section>

    </main>
  );
}

/* COMPONENTS */

function Resource({
  icon,
  value,
}: {
  icon: string;
  value: number;
}) {
  return (
    <div className="resource">
      <span>{icon}</span>
      <b>{formatNumber(value)}</b>
    </div>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "nav-button active"
          : "nav-button"
      }
      onClick={onClick}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function BuildingVisual({
  id,
  level,
  selected,
  onClick,
  className,
}: {
  id: BuildingId;
  level: number;
  selected: boolean;
  onClick: () => void;
  className: string;
}) {
  const info = buildingInfo[id];

  return (
    <button
      className={`building ${className} ${
        selected ? "selected" : ""
      }`}
      onClick={onClick}
    >
      <div className="building-roof" />

      <div className="building-body">

        <span className="building-icon">
          {info.icon}
        </span>

        <span className="building-name">
          {info.name}
        </span>

        <span className="building-lvl">
          LV.{level}
        </span>

      </div>

      {level >= 3 && (
        <div className="smoke">
          •
        </div>
      )}
    </button>
  );
}

function CityPanel({
  game,
  selectedBuilding,
  onUpgrade,
}: {
  game: GameState;
  selectedBuilding: BuildingId | null;
  onUpgrade: (id: BuildingId) => void;
}) {
  if (selectedBuilding) {

    const info =
      buildingInfo[selectedBuilding];

    const level =
      game.buildings[selectedBuilding];

    const food =
      100 * (level + 1);

    const metal =
      80 * (level + 1);

    let production = "";

    if (selectedBuilding === "farm") {
      production =
        `+${level * 3} Food / sec`;
    }

    if (selectedBuilding === "metal") {
      production =
        `+${level * 2.5} Metal / sec`;
    }

    if (selectedBuilding === "refinery") {
      production =
        `+${level * 1.5} Fuel / sec`;
    }

    if (selectedBuilding === "power") {
      production =
        `+${level * 3} Energy / sec`;
    }

    if (selectedBuilding === "warehouse") {
      production =
        `Capacity: ${
          2000 + level * 1000
        }`;
    }

    return (
      <div className="building-panel">

        <div className="panel-heading">

          <span>{info.icon}</span>

          <div>

            <h2>
              {info.name}
            </h2>

            <small>
              LEVEL {level} / {info.max}
            </small>

          </div>

        </div>

        <p>
          {info.description}
        </p>

        {production && (
          <div className="production">
            {production}
          </div>
        )}

        <div className="cost">

          <span>
            🍖 {food}
          </span>

          <span>
            🔩 {metal}
          </span>

        </div>

        <button
          className="main-button"
          disabled={
            level >= info.max ||
            (
              selectedBuilding !==
                "command" &&
              level >= game.cityLevel
            )
          }
          onClick={() =>
            onUpgrade(selectedBuilding)
          }
        >
          {level >= info.max
            ? "MAX LEVEL"
            : "UPGRADE"}
        </button>

        {selectedBuilding !==
          "command" &&
          level >= game.cityLevel && (
            <small className="warning">
              COMMAND CENTER LV.
              {level + 1} REQUIRED
            </small>
          )}

      </div>
    );
  }

  return (
    <div>

      <h2>🏙️ NEW HOPE</h2>

      <p>
        Градът произвежда ресурси
        автоматично. Натисни сграда,
        за да я развиваш.
      </p>

      <div className="city-stats">

        <div>
          <b>{game.cityLevel}</b>
          <span>CITY LEVEL</span>
        </div>

        <div>
          <b>
            {game.buildings.command}
          </b>
          <span>COMMAND</span>
        </div>

        <div>
          <b>
            {
              Object.values(
                game.buildings
              ).filter(
                (x) => x > 0
              ).length
            }
          </b>
          <span>BUILDINGS</span>
        </div>

      </div>

    </div>
  );
}

function ArmyPanel({
  game,
  training,
  onTrain,
  armyPower,
}: {
  game: GameState;
  training: {
    type: ArmyId;
    amount: number;
    finish: number;
    duration: number;
  } | null;

  onTrain: (
    type: ArmyId,
    amount: number
  ) => void;

  armyPower: {
    attack: number;
    defense: number;
    total: number;
  };
}) {
  const [now, setNow] =
    useState(Date.now());

  useEffect(() => {
    const timer =
      window.setInterval(
        () => setNow(Date.now()),
        500
      );

    return () =>
      window.clearInterval(timer);
  }, []);

  const remaining =
    training
      ? Math.max(
          0,
          training.finish - now
        )
      : 0;

  const progress =
    training
      ? Math.min(
          100,
          Math.max(
            0,
            100 -
              (remaining /
                training.duration) *
                100
          )
        )
      : 0;

  return (
    <div>

      <div className="army-header">

        <div>
          <h2>🪖 ARMY</h2>

          <span>
            {
              Object.values(
                game.army
              ).reduce(
                (a, b) => a + b,
                0
              )
            }{" "}
            UNITS
          </span>
        </div>

        <div className="power">
          ⚔️{" "}
          {formatNumber(
            armyPower.attack
          )}

          <small>
            ATTACK
          </small>
        </div>

        <div className="power">
          🛡️{" "}
          {formatNumber(
            armyPower.defense
          )}

          <small>
            DEFENSE
          </small>
        </div>

      </div>

      {training && (
        <div className="training">

          <b>
            TRAINING{" "}
            {armyInfo[
              training.type
            ].name}
          </b>

          <span>
            ×{training.amount}
          </span>

          <div className="progress">
            <div
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <small>
            {Math.ceil(
              remaining / 1000
            )}
            s remaining
          </small>

        </div>
      )}

      <div className="army-grid">

        {(Object.keys(
          armyInfo
        ) as ArmyId[]).map(
          (type) => {

            const info =
              armyInfo[type];

            const unlocked =
              game.buildings[
                info.building
              ] > 0;

            return (
              <div
                className={
                  unlocked
                    ? "unit-card"
                    : "unit-card locked"
                }
                key={type}
              >

                <div className="unit-icon">
                  {info.icon}
                </div>

                <b>
                  {info.name}
                </b>

                <strong>
                  {game.army[type]}
                </strong>

                <small>
                  ⚔️ {info.attack}{" "}
                  🛡️ {info.defense}
                </small>

                <small>
                  🍖 {info.food}{" "}
                  🔩 {info.metal}
                  {info.fuel > 0 &&
                    ` ⛽ ${info.fuel}`}
                </small>

                {!unlocked ? (
                  <em>
                    🔒{" "}
                    {
                      buildingInfo[
                        info.building
                      ].name
                    }
                  </em>
                ) : (
                  <div className="train-buttons">

                    <button
                      disabled={
                        training !== null
                      }
                      onClick={() =>
                        onTrain(
                          type,
                          1
                        )
                      }
                    >
                      +1
                    </button>

                    <button
                      disabled={
                        training !== null
                      }
                      onClick={() =>
                        onTrain(
                          type,
                          5
                        )
                      }
                    >
                      +5
                    </button>

                    <button
                      disabled={
                        training !== null
                      }
                      onClick={() =>
                        onTrain(
                          type,
                          10
                        )
                      }
                    >
                      +10
                    </button>

                  </div>
                )}

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}

function ResearchPanel({
  game,
  info,
  researching,
  onResearch,
}: {
  game: GameState;

  info: Record<
    keyof Research,
    {
      name: string;
      icon: string;
      description: string;
    }
  >;

  researching:
    keyof Research | null;

  onResearch: (
    type: keyof Research
  ) => void;
}) {
  return (
    <div>

      <h2>
        🔬 RESEARCH CENTER
      </h2>

      <p>
        Развивай технологиите на
        New Hope.
      </p>

      <div className="research-grid">

        {(Object.keys(
          info
        ) as (keyof Research)[]).map(
          (type) => {

            const level =
              game.research[type];

            const costFood =
              200 * (level + 1);

            const costMetal =
              250 * (level + 1);

            return (
              <div
                className="research-card"
                key={type}
              >

                <div className="research-icon">
                  {info[type].icon}
                </div>

                <div>

                  <b>
                    {info[type].name}
                  </b>

                  <small>
                    LEVEL {level}
                  </small>

                  <p>
                    {
                      info[type]
                        .description
                    }
                  </p>

                </div>

                <div className="cost">
                  🍖 {costFood}
                  <br />
                  🔩 {costMetal}
                </div>

                <button
                  className="main-button"
                  disabled={
                    researching !==
                      null ||
                    level >= 10
                  }
                  onClick={() =>
                    onResearch(type)
                  }
                >
                  {researching ===
                  type
                    ? "RESEARCHING..."
                    : level >= 10
                    ? "MAX"
                    : "RESEARCH"}
                </button>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}

function AttackPanel({
  game,
  armyPower,
  onScout,
  onAttack,
}: {
  game: GameState;

  armyPower: {
    attack: number;
    defense: number;
    total: number;
  };

  onScout: () => void;
  onAttack: () => void;
}) {
  return (
    <div>

      <h2>⚔️ WAR ROOM</h2>

      <p>
        Разузнай противника и
        изпрати армията си.
      </p>

      <div className="enemy">

        <div className="enemy-icon">
          🏰
        </div>

        <div>
          <h3>
            UNKNOWN SETTLEMENT
          </h3>

          <span>
            ENEMY PLAYER
          </span>
        </div>

        <div className="enemy-power">

          {game.enemyScouted
            ? formatNumber(
                game.enemyStrength
              )
            : "???"}

          <small>
            POWER
          </small>

        </div>

      </div>

      <div className="battle-stats">

        <div>
          <b>
            {formatNumber(
              armyPower.attack
            )}
          </b>

          <span>
            YOUR ATTACK
          </span>
        </div>

        <div>
          <b>
            {game.enemyScouted
              ? formatNumber(
                  game.enemyStrength
                )
              : "???"}
          </b>

          <span>
            ENEMY POWER
          </span>
        </div>

        <div>
          <b>
            {formatNumber(
              armyPower.defense
            )}
          </b>

          <span>
            YOUR DEFENSE
          </span>
        </div>

      </div>

      <div className="war-buttons">

        <button
          className="secondary-button"
          onClick={onScout}
        >
          🛰️ SCOUT

          <small>
            30 Fuel
          </small>
        </button>

        <button
          className="attack-button"
          disabled={
            !game.enemyScouted
          }
          onClick={onAttack}
        >
          ⚔️ ATTACK
        </button>

      </div>

      <div className="battle-report">

        <h3>
          📜 BATTLE REPORT
        </h3>

        <p>
          {game.battleReport}
        </p>

      </div>

    </div>
  );
}