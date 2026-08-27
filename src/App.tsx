import { useEffect, useMemo, useState } from "react";

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
  | "research";

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
  zombieWave: number;
  zombiePower: number;
  lastBattle: string;
};

const SAVE_KEY = "afterfall-real-game-v1";

const initialGame: GameState = {
  cityLevel: 1,

  resources: {
    food: 1500,
    metal: 1000,
    fuel: 600,
    energy: 400,
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
    vehicle: 0,
    weapons: 0,
    research: 1,
  },

  army: {
    recruit: 30,
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

  wounded: 0,
  zombieWave: 1,
  zombiePower: 350,
  lastBattle: "New Hope е готов за оцеляване.",
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
    description: "Центърът на селището.",
    max: 30,
  },
  farm: {
    name: "FARM",
    icon: "🌾",
    description: "Произвежда храна.",
    max: 30,
  },
  metal: {
    name: "METAL FACTORY",
    icon: "⛏️",
    description: "Произвежда метал.",
    max: 30,
  },
  refinery: {
    name: "REFINERY",
    icon: "🛢️",
    description: "Произвежда гориво.",
    max: 30,
  },
  power: {
    name: "POWER PLANT",
    icon: "⚡",
    description: "Произвежда енергия.",
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
    description: "Обучава пехота.",
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
    description: "Развива технологиите.",
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

const researchInfo: Record<
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
    description: "Увеличава атаката на пехотата.",
  },
  vehicles: {
    name: "VEHICLE TECHNOLOGY",
    icon: "🚙",
    description: "Подобрява бронираните части.",
  },
  production: {
    name: "PRODUCTION",
    icon: "🏭",
    description: "Ускорява производството.",
  },
  economy: {
    name: "ECONOMY",
    icon: "📈",
    description: "Увеличава производството на ресурси.",
  },
  defense: {
    name: "CITY DEFENSE",
    icon: "🛡️",
    description: "Увеличава защитата на града.",
  },
};

function number(value: number) {
  return Math.floor(value).toLocaleString("en-GB");
}

function loadGame(): GameState {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return initialGame;
    }

    return {
      ...initialGame,
      ...JSON.parse(saved),
    };
  } catch {
    return initialGame;
  }
}

export default function App() {
  const [game, setGame] = useState<GameState>(loadGame);
  const [tab, setTab] = useState<Tab>("city");
  const [selected, setSelected] =
    useState<BuildingId>("command");

  const [message, setMessage] = useState(
    "Добре дошъл в New Hope."
  );

  const [training, setTraining] = useState<{
    unit: UnitId;
    amount: number;
    finish: number;
  } | null>(null);

  const [researching, setResearching] =
    useState<keyof Research | null>(null);

  const [now, setNow] = useState(Date.now());

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
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => clearInterval(timer);
  }, []);

  /*
   * RESOURCE PRODUCTION
   */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGame((current) => {
        const bonus =
          1 + current.research.economy * 0.08;

        const capacity =
          2000 +
          current.buildings.warehouse * 1200;

        return {
          ...current,

          resources: {
            food: Math.min(
              capacity,
              current.resources.food +
                current.buildings.farm *
                  4 *
                  bonus
            ),

            metal: Math.min(
              capacity,
              current.resources.metal +
                current.buildings.metal *
                  3 *
                  bonus
            ),

            fuel: Math.min(
              capacity,
              current.resources.fuel +
                current.buildings.refinery *
                  2 *
                  bonus
            ),

            energy: Math.min(
              capacity,
              current.resources.energy +
                current.buildings.power * 3
            ),
          },
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /*
   * TRAINING
   */

  useEffect(() => {
    if (!training) return;

    if (now < training.finish) return;

    setGame((current) => ({
      ...current,

      army: {
        ...current.army,

        [training.unit]:
          current.army[training.unit] +
          training.amount,
      },
    }));

    setMessage(
      `${unitInfo[training.unit].name} ×${training.amount} е готово.`
    );

    setTraining(null);
  }, [now, training]);

  /*
   * ARMY POWER
   */

  const armyPower = useMemo(() => {
    let attack = 0;
    let defense = 0;

    (
      Object.keys(game.army) as UnitId[]
    ).forEach((unit) => {
      const amount = game.army[unit];

      attack +=
        amount *
        unitInfo[unit].attack;

      defense +=
        amount *
        unitInfo[unit].defense;
    });

    attack *=
      1 + game.research.infantry * 0.08;

    attack *=
      1 + game.research.vehicles * 0.1;

    defense *=
      1 + game.research.defense * 0.1;

    return {
      attack: Math.floor(attack),
      defense: Math.floor(defense),
      total: Math.floor(
        attack + defense
      ),
    };
  }, [game.army, game.research]);

  /*
   * TOTAL ARMY
   */

  const totalArmy = Object.values(
    game.army
  ).reduce(
    (sum, value) => sum + value,
    0
  );

  /*
   * UPGRADE
   */

  function upgradeBuilding(id: BuildingId) {
    const level = game.buildings[id];

    if (level >= buildingInfo[id].max) {
      setMessage("Тази сграда е MAX.");
      return;
    }

    if (
      id !== "command" &&
      level >= game.cityLevel
    ) {
      setMessage(
        `Нужно е Command Center Level ${
          level + 1
        }.`
      );
      return;
    }

    const food =
      100 * (level + 1);

    const metal =
      80 * (level + 1);

    if (
      game.resources.food < food ||
      game.resources.metal < metal
    ) {
      setMessage(
        "Нямаш достатъчно ресурси."
      );
      return;
    }

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,
        food:
          current.resources.food - food,
        metal:
          current.resources.metal - metal,
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
      `${buildingInfo[id].name} → Level ${
        level + 1
      }`
    );
  }

  /*
   * TRAIN
   */

  function trainUnit(
    unit: UnitId,
    amount: number
  ) {
    if (training) {
      setMessage(
        "Вече има производство."
      );
      return;
    }

    const info = unitInfo[unit];

    if (
      game.buildings[info.building] <= 0
    ) {
      setMessage(
        `Първо построй ${
          buildingInfo[
            info.building
          ].name
        }.`
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
      game.resources.food < food ||
      game.resources.metal < metal ||
      game.resources.fuel < fuel
    ) {
      setMessage(
        "Недостатъчно ресурси."
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
        food:
          current.resources.food - food,

        metal:
          current.resources.metal -
          metal,

        fuel:
          current.resources.fuel -
          fuel,

        energy:
          Math.max(
            0,
            current.resources.energy -
              amount
          ),
      },
    }));

    setTraining({
      unit,
      amount,
      finish:
        Date.now() + duration,
    });

    setMessage(
      `Производство: ${info.name} ×${amount}`
    );
  }

  /*
   * RESEARCH
   */

  function research(type: keyof Research) {
    if (researching) {
      setMessage(
        "Вече провеждаш research."
      );
      return;
    }

    const level =
      game.research[type];

    if (level >= 10) {
      setMessage("Технологията е MAX.");
      return;
    }

    const food =
      200 * (level + 1);

    const metal =
      250 * (level + 1);

    if (
      game.resources.food < food ||
      game.resources.metal < metal
    ) {
      setMessage(
        "Недостатъчно ресурси."
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
            current.research[type] + 1,
        },
      }));

      setResearching(null);

      setMessage(
        `${researchInfo[type].name} → Level ${
          level + 1
        }`
      );
    }, 5000);
  }

  /*
   * ZOMBIE ATTACK
   */

  function attackZombies() {
    if (totalArmy <= 0) {
      setMessage(
        "Нямаш армия."
      );
      return;
    }

    const random =
      0.85 +
      Math.random() * 0.3;

    const power =
      armyPower.attack *
      random;

    if (
      power >= game.zombiePower
    ) {
      const casualties =
        Math.min(
          totalArmy,
          Math.floor(
            totalArmy *
              (0.05 +
                Math.random() *
                  0.1)
          )
        );

      setGame((current) => ({
        ...current,

        wounded:
          current.wounded +
          casualties,

        zombieWave:
          current.zombieWave + 1,

        zombiePower:
          Math.floor(
            current.zombiePower *
              1.2
          ),

        lastBattle:
          `ПОБЕДА! Загубени ${casualties} войници. Следващата вълна ще бъде по-силна.`,
      }));

      setMessage(
        "🧟 Вълната е отблъсната!"
      );
    } else {
      const casualties =
        Math.min(
          totalArmy,
          Math.floor(
            totalArmy *
              (0.2 +
                Math.random() *
                  0.25)
          )
        );

      setGame((current) => ({
        ...current,

        wounded:
          current.wounded +
          casualties,

        zombiePower:
          Math.floor(
            current.zombiePower *
              1.1
          ),

        lastBattle:
          `ПОРАЖЕНИЕ! ${casualties} войници са ранени.`,
      }));

      setMessage(
        "🧟 Зомбитата пробиха отбраната!"
      );
    }
  }

  /*
   * HEAL
   */

  function healWounded() {
    if (game.wounded <= 0) {
      setMessage(
        "Няма ранени войници."
      );
      return;
    }

    const cost =
      game.wounded * 5;

    if (
      game.resources.food <
      cost
    ) {
      setMessage(
        "Нямаш достатъчно Food за лечение."
      );
      return;
    }

    setGame((current) => ({
      ...current,

      wounded: 0,

      resources: {
        ...current.resources,
        food:
          current.resources.food -
          cost,
      },
    }));

    setMessage(
      "🏥 Всички ранени са излекувани."
    );
  }

  /*
   * RESET
   */

  function resetGame() {
    localStorage.removeItem(
      SAVE_KEY
    );

    window.location.reload();
  }

  return (
    <main className="afterfall">

      {/* TOP BAR */}

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
          <b>
            {game.cityLevel}
          </b>
        </div>

      </header>

      {/* CITY */}

      {tab === "city" && (
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

          <CityBuilding
            id="command"
            level={
              game.buildings.command
            }
            selected={
              selected ===
              "command"
            }
            onClick={() =>
              setSelected(
                "command"
              )
            }
          />

          <CityBuilding
            id="farm"
            level={
              game.buildings.farm
            }
            selected={
              selected === "farm"
            }
            onClick={() =>
              setSelected("farm")
            }
          />

          <CityBuilding
            id="metal"
            level={
              game.buildings.metal
            }
            selected={
              selected === "metal"
            }
            onClick={() =>
              setSelected("metal")
            }
          />

          <CityBuilding
            id="refinery"
            level={
              game.buildings.refinery
            }
            selected={
              selected ===
              "refinery"
            }
            onClick={() =>
              setSelected(
                "refinery"
              )
            }
          />

          <CityBuilding
            id="power"
            level={
              game.buildings.power
            }
            selected={
              selected === "power"
            }
            onClick={() =>
              setSelected("power")
            }
          />

          <CityBuilding
            id="barracks"
            level={
              game.buildings.barracks
            }
            selected={
              selected ===
              "barracks"
            }
            onClick={() =>
              setSelected(
                "barracks"
              )
            }
          />

          <CityBuilding
            id="hospital"
            level={
              game.buildings.hospital
            }
            selected={
              selected ===
              "hospital"
            }
            onClick={() =>
              setSelected(
                "hospital"
              )
            }
          />

          <CityBuilding
            id="research"
            level={
              game.buildings.research
            }
            selected={
              selected ===
              "research"
            }
            onClick={() =>
              setSelected(
                "research"
              )
            }
          />

          <CityBuilding
            id="warehouse"
            level={
              game.buildings.warehouse
            }
            selected={
              selected ===
              "warehouse"
            }
            onClick={() =>
              setSelected(
                "warehouse"
              )
            }
          />

          <CityPeople />

          <div className="zombies">
            🧟　🧟　🧟
          </div>

          <div className="trees">
            🌲　🌲　🌲　🌲　🌲
          </div>

        </section>
      )}

      {/* WORLD */}

      {tab === "world" && (
        <WorldMap
          zombiePower={
            game.zombiePower
          }
          wave={
            game.zombieWave
          }
          onAttack={
            attackZombies
          }
        />
      )}

      {/* NAV */}

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

      {/* PANEL */}

      <section className="panel">

        <div className="message">
          {message}
        </div>

        {tab === "city" && (
          <CityPanel
            game={game}
            selected={
              selected
            }
            onUpgrade={
              upgradeBuilding
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
            researching={
              researching
            }
            onResearch={
              research
            }
          />
        )}

        {tab === "world" && (
          <div>
            <h2>
              🗺️ WORLD MAP
            </h2>

            <p>
              Зомби вълната се приближава към New Hope.
            </p>

            <div className="battle-stats">

              <div>
                <b>
                  {game.zombieWave}
                </b>
                <span>
                  ZOMBIE WAVE
                </span>
              </div>

              <div>
                <b>
                  {number(
                    game.zombiePower
                  )}
                </b>
                <span>
                  ZOMBIE POWER
                </span>
              </div>

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

            </div>

            <button
              className="attack-button"
              onClick={
                attackZombies
              }
            >
              ⚔️ DEFEND NEW HOPE
            </button>

            <button
              className="secondary-button"
              onClick={
                healWounded
              }
              style={{
                marginTop: 8,
                width: "100%",
              }}
            >
              🏥 HEAL WOUNDED
              <small>
                {game.wounded} WOUNDED
              </small>
            </button>

            <div className="battle-report">
              <h3>
                📜 LAST BATTLE
              </h3>

              <p>
                {game.lastBattle}
              </p>
            </div>

          </div>
        )}

        <button
          className="reset"
          onClick={
            resetGame
          }
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
      <b>
        {number(value)}
      </b>
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
   CITY BUILDING
===================================================== */

function CityBuilding({
  id,
  level,
  selected,
  onClick,
}: {
  id: BuildingId;
  level: number;
  selected: boolean;
  onClick: () => void;
}) {
  const info =
    buildingInfo[id];

  const positions: Record<
    BuildingId,
    string
  > = {
    command: "command",
    farm: "farm",
    metal: "metal",
    refinery: "refinery",
    power: "power",
    warehouse: "warehouse",
    hospital: "hospital",
    barracks: "barracks",
    vehicle: "vehicle",
    weapons: "weapons",
    research: "research",
  };

  return (
    <button
      className={`building ${positions[id]} ${
        selected
          ? "selected"
          : ""
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

      {level >= 2 && (
        <div className="worker worker-one">
          🚶
        </div>
      )}

      {level >= 3 && (
        <div className="worker worker-two">
          🧍
        </div>
      )}

      {level >= 4 && (
        <div className="smoke">
          •
        </div>
      )}

    </button>
  );
}

/* =====================================================
   PEOPLE
===================================================== */

function CityPeople() {
  return (
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

      <span className="car">
        🚙
      </span>
    </div>
  );
}

/* =====================================================
   CITY PANEL
===================================================== */

function CityPanel({
  game,
  selected,
  onUpgrade,
}: {
  game: GameState;
  selected: BuildingId;
  onUpgrade: (
    id: BuildingId
  ) => void;
}) {
  const info =
    buildingInfo[selected];

  const level =
    game.buildings[selected];

  const food =
    100 * (level + 1);

  const metal =
    80 * (level + 1);

  return (
    <div>

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

        {selected ===
          "farm" &&
          `+${level * 4} Food / sec`}

        {selected ===
          "metal" &&
          `+${level * 3} Metal / sec`}

        {selected ===
          "refinery" &&
          `+${level * 2} Fuel / sec`}

        {selected ===
          "power" &&
          `+${level * 3} Energy / sec`}

        {selected ===
          "warehouse" &&
          `CAPACITY ${
            2000 +
            level * 1200
          }`}

        {selected ===
          "hospital" &&
          `WOUNDED: ${game.wounded}`}

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
          level >=
            info.max ||
          (
            selected !==
              "command" &&
            level >=
              game.cityLevel
          )
        }
        onClick={() =>
          onUpgrade(
            selected
          )
        }
      >
        {level >=
        info.max
          ? "MAX LEVEL"
          : "UPGRADE"}
      </button>

      {selected !==
        "command" &&
        level >=
          game.cityLevel && (
        <small className="warning">
          COMMAND CENTER LV.
          {level + 1} REQUIRED
        </small>
      )}

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
            {Object.values(
              game.buildings
            ).filter(
              (x) => x > 0
            ).length}
          </b>
          <span>
            BUILDINGS
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
  training: {
    unit: UnitId;
    amount: number;
    finish: number;
  } | null;
  now: number;
  onTrain: (
    unit: UnitId,
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
          training.finish -
            now
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
            {
              Object.values(
                game.army
              ).reduce(
                (a, b) =>
                  a + b,
                0
              )
            }{" "}
            UNITS
          </span>
        </div>

        <div className="power">
          ⚔️{" "}
          {number(
            armyPower.attack
          )}
          <small>
            ATTACK
          </small>
        </div>

        <div className="power">
          🛡️{" "}
          {number(
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
            {
              unitInfo[
                training.unit
              ].name
            }
          </b>

          <span>
            ×{training.amount}
          </span>

          <div className="progress">

            <div
              style={{
                width: `${
                  Math.min(
                    100,
                    Math.max(
                      5,
                      100 -
                        (remaining /
                          (unitInfo[
                            training.unit
                          ].time *
                            training.amount *
                            1000)) *
                          100
                    )
                  )
                }%`,
              }}
            />

          </div>

          <small>
            {Math.ceil(
              remaining / 1000
            )}
            s
          </small>

        </div>
      )}

      <div className="army-grid">

        {(
          Object.keys(
            unitInfo
          ) as UnitId[]
        ).map((unit) => {
          const info =
            unitInfo[unit];

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
              key={unit}
            >

              <div className="unit-icon">
                {info.icon}
              </div>

              <b>
                {info.name}
              </b>

              <strong>
                {game.army[unit]}
              </strong>

              <small>
                ⚔️ {info.attack}
                {" "}
                🛡️ {info.defense}
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
                    onClick={() =>
                      onTrain(
                        unit,
                        1
                      )
                    }
                  >
                    +1
                  </button>

                  <button
                    onClick={() =>
                      onTrain(
                        unit,
                        5
                      )
                    }
                  >
                    +5
                  </button>

                  <button
                    onClick={() =>
                      onTrain(
                        unit,
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
  researching,
  onResearch,
}: {
  game: GameState;
  researching:
    | keyof Research
    | null;
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
        Развивай технологиите на New Hope.
      </p>

      <div className="research-grid">

        {(
          Object.keys(
            researchInfo
          ) as (keyof Research)[]
        ).map((type) => {
          const level =
            game.research[type];

          const food =
            200 * (level + 1);

          const metal =
            250 * (level + 1);

          return (
            <div
              className="research-card"
              key={type}
            >

              <div className="research-icon">
                {
                  researchInfo[
                    type
                  ].icon
                }
              </div>

              <div>

                <b>
                  {
                    researchInfo[
                      type
                    ].name
                  }
                </b>

                <small>
                  LEVEL {level}
                </small>

                <p>
                  {
                    researchInfo[
                      type
                    ].description
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
   WORLD MAP
===================================================== */

function WorldMap({
  zombiePower,
  wave,
  onAttack,
}: {
  zombiePower: number;
  wave: number;
  onAttack: () => void;
}) {
  return (
    <section className="world-map">

      <div className="world-title">
        WORLD MAP
      </div>

      <div className="map-grid">

        <div className="map-location city-location">
          🏙️
          <span>
            NEW HOPE
          </span>
        </div>

        <div className="map-location zombie-location z1">
          🧟
          <span>
            ZOMBIE CAMP
          </span>
        </div>

        <div className="map-location zombie-location z2">
          🧟
          <span>
            INFECTED AREA
          </span>
        </div>

        <div className="map-location resource-location r1">
          ⛏️
          <span>
            METAL MINE
          </span>
        </div>

        <div className="map-location resource-location r2">
          ⛽
          <span>
            FUEL DEPOT
          </span>
        </div>

        <div className="map-road road-one" />
        <div className="map-road road-two" />

      </div>

      <div className="map-info">

        <h2>
          🧟 ZOMBIE THREAT
        </h2>

        <div className="battle-stats">

          <div>
            <b>
              {wave}
            </b>
            <span>
              WAVE
            </span>
          </div>

          <div>
            <b>
              {number(
                zombiePower
              )}
            </b>
            <span>
              POWER
            </span>
          </div>

          <div>
            <b>
              ACTIVE
            </b>
            <span>
              THREAT
            </span>
          </div>

        </div>

        <button
          className="attack-button"
          onClick={
            onAttack
          }
        >
          ⚔️ ATTACK ZOMBIE CAMP
        </button>

      </div>

    </section>
  );
}