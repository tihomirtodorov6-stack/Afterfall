import { useEffect, useMemo, useState } from "react";
import "./styles.css";

type Tab = "city" | "army" | "research" | "world";

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
  | "research"
  | "wall";

type UnitId =
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

type Army = Record<UnitId, number>;
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
  wounded: number;
  enemyStrength: number;
  enemyScouted: boolean;
  zombieWave: number;
  battleReport: string;
};

type Training = {
  type: UnitId;
  amount: number;
  finish: number;
} | null;

const SAVE_KEY = "afterfall-save-v3";

const initialState: GameState = {
  cityLevel: 1,

  resources: {
    food: 2500,
    metal: 2000,
    fuel: 1200,
    energy: 800,
  },

  buildings: {
    command: 1,
    farm: 2,
    metal: 1,
    refinery: 1,
    power: 1,
    warehouse: 1,
    hospital: 1,
    barracks: 1,
    vehicle: 0,
    weapons: 0,
    research: 1,
    wall: 1,
  },

  army: {
    recruit: 20,
    rifleman: 10,
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

  wounded: 0,
  enemyStrength: 900,
  enemyScouted: false,
  zombieWave: 1,
  battleReport: "Добре дошъл в New Hope. Градът чака твоите заповеди.",
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
    description: "Главният център на града. Определя нивото на селището.",
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
    description: "Обучава пехотни войници.",
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
    description: "Произвежда специализирани бойни единици.",
    max: 30,
  },
  research: {
    name: "RESEARCH CENTER",
    icon: "🔬",
    description: "Развива технологиите на града.",
    max: 30,
  },
  wall: {
    name: "CITY WALL",
    icon: "🧱",
    description: "Защитава града от играчи и zombie waves.",
    max: 30,
  },
};

const unitInfo: Record<
  UnitId,
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
    time: 3,
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
    time: 5,
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
    time: 8,
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
    time: 10,
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
    time: 12,
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
    time: 15,
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
    time: 20,
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
    time: 30,
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
    time: 25,
    attack: 160,
    defense: 80,
  },
};

function number(value: number) {
  return Math.floor(value).toLocaleString("en-GB");
}

function totalArmy(army: Army) {
  return Object.values(army).reduce((a, b) => a + b, 0);
}

function loadGame(): GameState {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) return initialState;

    const parsed = JSON.parse(saved);

    return {
      ...initialState,
      ...parsed,
      resources: {
        ...initialState.resources,
        ...parsed.resources,
      },
      buildings: {
        ...initialState.buildings,
        ...parsed.buildings,
      },
      army: {
        ...initialState.army,
        ...parsed.army,
      },
      research: {
        ...initialState.research,
        ...parsed.research,
      },
    };
  } catch {
    return initialState;
  }
}

export default function App() {
  const [game, setGame] = useState<GameState>(loadGame);
  const [tab, setTab] = useState<Tab>("city");
  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingId | null>(null);

  const [training, setTraining] =
    useState<Training>(null);

  const [researching, setResearching] =
    useState<keyof Research | null>(null);

  const [now, setNow] = useState(Date.now());

  const [message, setMessage] = useState(
    "Добре дошъл в New Hope."
  );

  /*
   * SAVE
   */

  useEffect(() => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );
  }, [game]);

  /*
   * CLOCK
   */

  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(Date.now()),
      500
    );

    return () =>
      window.clearInterval(timer);
  }, []);

  /*
   * RESOURCE PRODUCTION
   */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGame((current) => {
        const economy =
          1 +
          current.research.economy * 0.08;

        const capacity =
          3000 +
          current.buildings.warehouse * 1500;

        return {
          ...current,

          resources: {
            food: Math.min(
              capacity,
              current.resources.food +
                current.buildings.farm *
                  4 *
                  economy
            ),

            metal: Math.min(
              capacity,
              current.resources.metal +
                current.buildings.metal *
                  3 *
                  economy
            ),

            fuel: Math.min(
              capacity,
              current.resources.fuel +
                current.buildings.refinery *
                  2 *
                  economy
            ),

            energy: Math.min(
              capacity,
              current.resources.energy +
                current.buildings.power *
                  3
            ),
          },
        };
      });
    }, 1000);

    return () =>
      window.clearInterval(timer);
  }, []);

  /*
   * FINISH TRAINING
   */

  useEffect(() => {
    if (!training) return;

    if (now >= training.finish) {
      const name =
        unitInfo[training.type].name;

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
        `✅ ${name} ×${training.amount} е готова.`
      );

      setTraining(null);
    }
  }, [now, training]);

  /*
   * ARMY POWER
   */

  const armyPower = useMemo(() => {
    let attack = 0;
    let defense = 0;

    (
      Object.keys(
        unitInfo
      ) as UnitId[]
    ).forEach((type) => {
      attack +=
        game.army[type] *
        unitInfo[type].attack;

      defense +=
        game.army[type] *
        unitInfo[type].defense;
    });

    attack *=
      1 +
      game.research.infantry * 0.08;

    attack *=
      1 +
      game.research.vehicles * 0.1;

    defense *=
      1 +
      game.research.defense * 0.1;

    return {
      attack: Math.floor(attack),
      defense: Math.floor(defense),
      total: Math.floor(
        attack + defense
      ),
    };
  }, [
    game.army,
    game.research,
  ]);

  /*
   * UPGRADE BUILDING
   */

  const upgradeBuilding = (
    id: BuildingId
  ) => {
    const level = game.buildings[id];

    if (
      level >=
      buildingInfo[id].max
    ) {
      setMessage("MAXIMUM LEVEL.");
      return;
    }

    if (
      id !== "command" &&
      level >= game.cityLevel
    ) {
      setMessage(
        `Command Center Level ${
          level + 1
        } is required.`
      );
      return;
    }

    const foodCost =
      100 * (level + 1);

    const metalCost =
      80 * (level + 1);

    const fuelCost =
      id === "vehicle" ||
      id === "refinery"
        ? 30 * (level + 1)
        : 0;

    if (
      game.resources.food <
        foodCost ||
      game.resources.metal <
        metalCost ||
      game.resources.fuel <
        fuelCost
    ) {
      setMessage(
        "❌ Недостатъчно ресурси."
      );
      return;
    }

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,
        food:
          current.resources.food -
          foodCost,
        metal:
          current.resources.metal -
          metalCost,
        fuel:
          current.resources.fuel -
          fuelCost,
      },

      buildings: {
        ...current.buildings,
        [id]:
          current.buildings[id] + 1,
      },

      cityLevel:
        id === "command"
          ? Math.min(
              30,
              current.cityLevel + 1
            )
          : current.cityLevel,
    }));

    setMessage(
      `🏗️ ${buildingInfo[id].name} → LEVEL ${
        level + 1
      }`
    );
  };

  /*
   * TRAIN UNIT
   */

  const trainUnit = (
    type: UnitId,
    amount: number
  ) => {
    if (training) {
      setMessage(
        "⏳ Вече има производство."
      );
      return;
    }

    const info = unitInfo[type];

    const buildingLevel =
      game.buildings[
        info.building
      ];

    if (buildingLevel <= 0) {
      setMessage(
        `Първо построй ${buildingInfo[
          info.building
        ].name}.`
      );
      return;
    }

    /*
     * Higher building level unlocks
     * larger production batches.
     */

    if (
      amount >= 10 &&
      buildingLevel < 2
    ) {
      setMessage(
        "Нужен е Building Level 2 за производство ×10."
      );
      return;
    }

    const food =
      info.food * amount;

    const metal =
      info.metal * amount;

    const fuel =
      info.fuel * amount;

    if (
      game.resources.food <
        food ||
      game.resources.metal <
        metal ||
      game.resources.fuel <
        fuel
    ) {
      setMessage(
        "❌ Нямаш достатъчно ресурси."
      );
      return;
    }

    const speed =
      1 +
      game.research.production *
        0.1;

    const duration =
      (info.time *
        amount *
        1000) /
      speed;

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,

        food:
          current.resources.food -
          food,

        metal:
          current.resources.metal -
          metal,

        fuel:
          current.resources.fuel -
          fuel,
      },
    }));

    setTraining({
      type,
      amount,
      finish:
        Date.now() + duration,
    });

    setMessage(
      `🪖 Производство: ${info.name} ×${amount}`
    );
  };

  /*
   * RESEARCH
   */

  const researchNames: Record<
    keyof Research,
    {
      name: string;
      icon: string;
      description: string;
    }
  > = {
    infantry: {
      name: "INFANTRY WEAPONS",
      icon: "🔫",
      description:
        "+8% Infantry attack per level.",
    },
    vehicles: {
      name: "VEHICLE TECHNOLOGY",
      icon: "🚙",
      description:
        "+10% vehicle attack per level.",
    },
    production: {
      name: "PRODUCTION",
      icon: "🏭",
      description:
        "Faster army production.",
    },
    economy: {
      name: "ECONOMY",
      icon: "📈",
      description:
        "Higher resource production.",
    },
    defense: {
      name: "CITY DEFENSE",
      icon: "🛡️",
      description:
        "Stronger city defense.",
    },
  };

  const research = (
    type: keyof Research
  ) => {
    if (researching) {
      setMessage(
        "⏳ Вече провеждаш research."
      );
      return;
    }

    const level =
      game.research[type];

    if (level >= 10) {
      setMessage("MAX RESEARCH.");
      return;
    }

    const food =
      300 * (level + 1);

    const metal =
      400 * (level + 1);

    if (
      game.resources.food <
        food ||
      game.resources.metal <
        metal
    ) {
      setMessage(
        "❌ Недостатъчно ресурси."
      );
      return;
    }

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,
        food:
          current.resources.food -
          food,
        metal:
          current.resources.metal -
          metal,
      },
    }));

    setResearching(type);

    window.setTimeout(() => {
      setGame((current) => ({
        ...current,

        research: {
          ...current.research,
          [type]:
            current.research[type] +
            1,
        },
      }));

      setResearching(null);

      setMessage(
        `🧪 ${researchNames[type].name} → LEVEL ${
          level + 1
        }`
      );
    }, 5000);
  };

  /*
   * SCOUT
   */

  const scout = () => {
    if (
      game.resources.fuel < 50
    ) {
      setMessage(
        "Нужни са 50 Fuel."
      );
      return;
    }

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,
        fuel:
          current.resources.fuel -
          50,
      },

      enemyScouted: true,
    }));

    setMessage(
      `🛰️ Enemy strength: ${game.enemyStrength}`
    );
  };

  /*
   * PLAYER ATTACK
   */

  const attack = () => {
    if (!game.enemyScouted) {
      setMessage(
        "Първо разузнай противника."
      );
      return;
    }

    if (
      armyPower.attack < 100
    ) {
      setMessage(
        "Армията е прекалено малка."
      );
      return;
    }

    const chance =
      armyPower.attack /
      (
        armyPower.attack +
        game.enemyStrength
      );

    const won =
      Math.random() < chance;

    const soldiers =
      totalArmy(game.army);

    if (won) {
      const casualties = Math.min(
        soldiers,
        Math.max(
          1,
          Math.floor(
            soldiers *
              (0.04 +
                Math.random() *
                  0.08)
          )
        )
      );

      setGame((current) => ({
        ...current,

        wounded:
          current.wounded +
          casualties,

        resources: {
          ...current.resources,
          food:
            current.resources.food +
            500,
          metal:
            current.resources.metal +
            350,
          fuel:
            current.resources.fuel +
            200,
        },

        enemyStrength: Math.floor(
          current.enemyStrength *
            1.15
        ),

        enemyScouted: false,

        battleReport:
          `🏆 VICTORY! Загубени войници: ${casualties}. Получени ресурси: 500 Food / 350 Metal / 200 Fuel.`,
      }));

      setMessage(
        "🏆 ПОБЕДА! Вражеската база е разграбена."
      );
    } else {
      const casualties = Math.min(
        soldiers,
        Math.max(
          1,
          Math.floor(
            soldiers *
              (0.12 +
                Math.random() *
                  0.18)
          )
        )
      );

      setGame((current) => ({
        ...current,

        wounded:
          current.wounded +
          casualties,

        enemyStrength: Math.floor(
          current.enemyStrength *
            1.05
        ),

        enemyScouted: false,

        battleReport:
          `💀 DEFEAT! Армията беше отблъсната. Ранени войници: ${casualties}.`,
      }));

      setMessage(
        "💀 ПОРАЖЕНИЕ. Подготви по-силна армия."
      );
    }
  };

  /*
   * ZOMBIE WAVE
   */

  const zombieAttack = () => {
    const zombiePower =
      game.zombieWave * 350;

    const defense =
      armyPower.defense +
      game.buildings.wall *
        100 *
        (
          1 +
          game.research.defense *
            0.1
        );

    if (
      defense >= zombiePower
    ) {
      setGame((current) => ({
        ...current,

        resources: {
          ...current.resources,
          food:
            Math.max(
              0,
              current.resources.food -
                100
            ),
        },

        zombieWave:
          current.zombieWave + 1,

        battleReport:
          `🧟 Zombie Wave ${current.zombieWave} е отблъсната!`,
      }));

      setMessage(
        `🧟 Градът отблъсна Wave ${game.zombieWave}.`
      );
    } else {
      const loss = Math.min(
        totalArmy(game.army),
        Math.floor(
          totalArmy(game.army) *
            0.1
        )
      );

      setGame((current) => ({
        ...current,

        wounded:
          current.wounded +
          loss,

        resources: {
          ...current.resources,
          food:
            Math.max(
              0,
              current.resources.food -
                300
            ),
          metal:
            Math.max(
              0,
              current.resources.metal -
                200
            ),
        },

        zombieWave:
          current.zombieWave + 1,

        battleReport:
          `🧟 Зомбитата пробиха защитата! ${loss} войници са ранени.`,
      }));

      setMessage(
        "⚠️ Зомбитата атакуваха града!"
      );
    }
  };

  /*
   * HEAL
   */

  const healWounded = () => {
    if (game.wounded <= 0) {
      setMessage(
        "Няма ранени войници."
      );
      return;
    }

    if (
      game.buildings.hospital <= 0
    ) {
      setMessage(
        "Нямаш Hospital."
      );
      return;
    }

    const capacity =
      game.buildings.hospital *
      25;

    const healed = Math.min(
      capacity,
      game.wounded
    );

    const food =
      healed * 5;

    if (
      game.resources.food <
      food
    ) {
      setMessage(
        "Нужен е Food за лечение."
      );
      return;
    }

    setGame((current) => ({
      ...current,

      wounded:
        current.wounded -
        healed,

      resources: {
        ...current.resources,
        food:
          current.resources.food -
          food,
      },
    }));

    setMessage(
      `🏥 Излекувани: ${healed} войници.`
    );
  };

  /*
   * RESET
   */

  const reset = () => {
    localStorage.removeItem(
      SAVE_KEY
    );

    window.location.reload();
  };

  /*
   * RENDER
   */

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
            value={
              game.resources.food
            }
          />

          <Resource
            icon="🔩"
            value={
              game.resources.metal
            }
          />

          <Resource
            icon="⛽"
            value={
              game.resources.fuel
            }
          />

          <Resource
            icon="⚡"
            value={
              game.resources.energy
            }
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
          <small>
            SURVIVOR SETTLEMENT
          </small>
        </div>

        <div className="road vertical" />
        <div className="road horizontal" />

        {(
          Object.keys(
            game.buildings
          ) as BuildingId[]
        )
          .filter(
            (id) =>
              id !== "wall" &&
              game.buildings[id] >
                0
          )
          .map((id, index) => (
            <BuildingVisual
              key={id}
              id={id}
              level={
                game.buildings[id]
              }
              selected={
                selectedBuilding ===
                id
              }
              onClick={() =>
                setSelectedBuilding(
                  id
                )
              }
              index={index}
            />
          ))}

        <div className="city-people">

          <span className="person p1">
            🚶
          </span>

          <span className="person p2">
            🧍
          </span>

          <span className="person p3">
            🚶
          </span>

          <span className="person p4">
            🧍
          </span>

          <span className="vehicle-moving">
            🚙
          </span>

        </div>

        <div className="zombie-zone">
          🧟　🧟　🧟
        </div>

        <div className="trees">
          🌲　🌲　🌲　🌲　🌲
        </div>

      </section>

      <nav className="bottom-nav">

        <NavButton
          active={
            tab === "city"
          }
          icon="🏙️"
          label="CITY"
          onClick={() =>
            setTab("city")
          }
        />

        <NavButton
          active={
            tab === "army"
          }
          icon="🪖"
          label="ARMY"
          onClick={() =>
            setTab("army")
          }
        />

        <NavButton
          active={
            tab === "research"
          }
          icon="🔬"
          label="RESEARCH"
          onClick={() =>
            setTab("research")
          }
        />

        <NavButton
          active={
            tab === "world"
          }
          icon="🗺️"
          label="WORLD"
          onClick={() =>
            setTab("world")
          }
        />

      </nav>

      <section className="panel">

        <div className="message">
          {message}
        </div>

        {tab === "city" && (
          <CityPanel
            game={game}
            selected={
              selectedBuilding
            }
            onUpgrade={
              upgradeBuilding
            }
            onZombieAttack={
              zombieAttack
            }
            onHeal={
              healWounded
            }
          />
        )}

        {tab === "army" && (
          <ArmyPanel
            game={game}
            training={
              training
            }
            now={now}
            onTrain={
              trainUnit
            }
            armyPower={
              armyPower
            }
          />
        )}

        {tab === "research" && (
          <ResearchPanel
            game={game}
            info={
              researchNames
            }
            researching={
              researching
            }
            onResearch={
              research
            }
          />
        )}

        {tab === "world" && (
          <WorldPanel
            game={game}
            armyPower={
              armyPower
            }
            onScout={scout}
            onAttack={attack}
          />
        )}

        <button
          className="reset"
          onClick={reset}
        >
          RESET GAME
        </button>

      </section>

    </main>
  );
}

/* =====================================================
   RESOURCE
===================================================== */

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
      <b>{number(value)}</b>
    </div>
  );
}

/* =====================================================
   NAV
===================================================== */

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

/* =====================================================
   BUILDING VISUAL
===================================================== */

function BuildingVisual({
  id,
  level,
  selected,
  onClick,
  index,
}: {
  id: BuildingId;
  level: number;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  const info =
    buildingInfo[id];

  return (
    <button
      className={`building building-${index} ${
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

/* =====================================================
   CITY PANEL
===================================================== */

function CityPanel({
  game,
  selected,
  onUpgrade,
  onZombieAttack,
  onHeal,
}: {
  game: GameState;
  selected: BuildingId | null;
  onUpgrade: (
    id: BuildingId
  ) => void;
  onZombieAttack: () => void;
  onHeal: () => void;
}) {
  if (selected) {
    const info =
      buildingInfo[selected];

    const level =
      game.buildings[selected];

    const food =
      100 * (level + 1);

    const metal =
      80 * (level + 1);

    return (
      <div className="building-panel">

        <div className="panel-heading">

          <span>
            {info.icon}
          </span>

          <div>

            <h2>
              {info.name}
            </h2>

            <small>
              LEVEL {level} /{" "}
              {info.max}
            </small>

          </div>

        </div>

        <p>
          {info.description}
        </p>

        <div className="production">

          {selected === "farm" &&
            `🌾 +${level * 4} Food / sec`}

          {selected === "metal" &&
            `🔩 +${level * 3} Metal / sec`}

          {selected ===
            "refinery" &&
            `⛽ +${level * 2} Fuel / sec`}

          {selected === "power" &&
            `⚡ +${level * 3} Energy / sec`}

          {selected === "warehouse" &&
            `📦 Capacity +${
              level * 1500
            }`}

          {selected === "hospital" &&
            `🏥 Capacity ${
              level * 25
            } wounded`}

          {selected === "wall" &&
            `🧱 Defense ${
              level * 100
            }`}

          {selected === "barracks" &&
            "🪖 Infantry production"}

          {selected === "vehicle" &&
            "🚙 Vehicle production"}

          {selected === "weapons" &&
            "🔫 Advanced military production"}

          {selected === "research" &&
            "🔬 Technology development"}

          {selected === "command" &&
            "🏢 Controls city level"}

        </div>

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
              selected !==
                "command" &&
              level >=
                game.cityLevel
            )
          }
          onClick={() =>
            onUpgrade(selected)
          }
        >
          {level >= info.max
            ? "MAX LEVEL"
            : "UPGRADE"}
        </button>

        {selected !==
          "command" &&
          level >=
            game.cityLevel && (
            <small className="warning">
              COMMAND CENTER LV.
              {level + 1}
              {" "}REQUIRED
            </small>
          )}

        {selected ===
          "hospital" && (
          <button
            className="secondary-button"
            onClick={onHeal}
            style={{
              width: "100%",
              marginTop: 10,
            }}
          >
            🏥 HEAL WOUNDED (
            {game.wounded})
          </button>
        )}

        <button
          className="attack-button"
          onClick={onZombieAttack}
          style={{
            width: "100%",
            marginTop: 10,
          }}
        >
          🧟 ZOMBIE WAVE{" "}
          {game.zombieWave}
        </button>

      </div>
    );
  }

  return (
    <div>

      <h2>
        🏙️ NEW HOPE
      </h2>

      <p>
        Това вече е управляем град.
        Натисни сграда и използвай
        нейните функции.
      </p>

      <div className="city-stats">

        <div>
          <b>
            {game.cityLevel}
          </b>
          <span>
            CITY LEVEL
          </span>
        </div>

        <div>
          <b>
            {totalArmy(game.army)}
          </b>
          <span>
            ARMY
          </span>
        </div>

        <div>
          <b>
            {game.wounded}
          </b>
          <span>
            WOUNDED
          </span>
        </div>

      </div>

      <div className="battle-report">

        <h3>
          🧟 THREAT
        </h3>

        <p>
          NEXT ZOMBIE WAVE:{" "}
          {game.zombieWave}
        </p>

        <p>
          ZOMBIE POWER:{" "}
          {game.zombieWave * 350}
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   ARMY PANEL
===================================================== */

function ArmyPanel({
  game,
  training,
  now,
  onTrain,
  armyPower,
}: {
  game: GameState;
  training: Training;
  now: number;
  onTrain: (
    type: UnitId,
    amount: number
  ) => void;
  armyPower: {
    attack: number;
    defense: number;
    total: number;
  };
}) {
  const remaining =
    training
      ? Math.max(
          0,
          training.finish - now
        )
      : 0;

  const duration =
    training
      ? unitInfo[
          training.type
        ].time *
        training.amount *
        1000
      : 1;

  const progress =
    training
      ? Math.min(
          100,
          Math.max(
            0,
            100 -
              (
                remaining /
                duration
              ) *
                100
          )
        )
      : 0;

  return (
    <div>

      <div className="army-header">

        <div>
          <h2>
            🪖 ARMY
          </h2>

          <span>
            {totalArmy(game.army)} UNITS
          </span>
        </div>

        <div className="power">
          ⚔️ {number(
            armyPower.attack
          )}
          <small>
            ATTACK
          </small>
        </div>

        <div className="power">
          🛡️ {number(
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
            TRAINING
          </b>

          <span>
            {unitInfo[
              training.type
            ].icon}{" "}
            {
              unitInfo[
                training.type
              ].name
            } ×
            {training.amount}
          </span>

          <div className="progress">

            <div
              style={{
                width:
                  `${progress}%`,
              }}
            />

          </div>

          <small>
            {Math.ceil(
              remaining / 1000
            )} seconds
          </small>

        </div>
      )}

      <div className="army-grid">

        {(
          Object.keys(
            unitInfo
          ) as UnitId[]
        ).map((type) => {
          const info =
            unitInfo[type];

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
                🍖 {info.food}
                {" "}
                🔩 {info.metal}
                {" "}
                ⛽ {info.fuel}
              </small>

              {!unlocked ? (
                <em>
                  🔒 BUILD{" "}
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
                      training !==
                      null
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
                      training !==
                      null
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
                      training !==
                      null
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
        })}

      </div>

    </div>
  );
}

/* =====================================================
   RESEARCH
===================================================== */

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
        Развивай военните и
        икономическите технологии.
      </p>

      <div className="research-grid">

        {(
          Object.keys(
            info
          ) as (keyof Research)[]
        ).map((type) => {

          const level =
            game.research[type];

          const food =
            300 * (level + 1);

          const metal =
            400 * (level + 1);

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
                🍖 {food}
                <br />
                🔩 {metal}
              </div>

              <button
                className="main-button"
                disabled={
                  researching !==
                    null ||
                  level >= 10
                }
                onClick={() =>
                  onResearch(
                    type
                  )
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
        })}

      </div>

    </div>
  );
}

/* =====================================================
   WORLD
===================================================== */

function WorldPanel({
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

      <h2>
        🗺️ WORLD MAP
      </h2>

      <p>
        Открий вражески селища,
        разузнай ги и започни война.
      </p>

      <div className="world-map">

        <div className="map-grid" />

        <div className="map-base player-base">
          🏰
          <small>
            NEW HOPE
          </small>
        </div>

        <div className="map-base enemy-base">
          🏯
          <small>
            ENEMY
          </small>
        </div>

        <div className="map-base enemy-two">
          🏚️
          <small>
            UNKNOWN
          </small>
        </div>

        <div className="map-zombie">
          🧟
        </div>

        <div className="map-zombie z2">
          🧟
        </div>

        <div className="map-zombie z3">
          🧟
        </div>

      </div>

      <div className="enemy">

        <div className="enemy-icon">
          🏯
        </div>

        <div>
          <h3>
            ENEMY SETTLEMENT
          </h3>

          <span>
            PLAYER 002
          </span>
        </div>

        <div className="enemy-power">
          {game.enemyScouted
            ? number(
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
            {number(
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
              ? number(
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
            {number(
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
            50 Fuel
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