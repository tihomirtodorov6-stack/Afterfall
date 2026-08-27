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
  | "research";

type UnitId =
  | "recruit"
  | "rifleman"
  | "heavy"
  | "sniper"
  | "machinegunner"
  | "rocket"
  | "apc"
  | "tank";

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
  xp: number;
  missions: number;
};

const SAVE_KEY = "afterfall-game-v4";

const initialGame: GameState = {
  cityLevel: 1,

  resources: {
    food: 2500,
    metal: 1800,
    fuel: 900,
    energy: 500,
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
  xp: 0,
  missions: 0,
};

const buildingInfo: Record<
  BuildingId,
  {
    name: string;
    icon: string;
    description: string;
    baseCost: number;
  }
> = {
  command: {
    name: "COMMAND CENTER",
    icon: "🏢",
    description: "Центърът на селището.",
    baseCost: 500,
  },

  farm: {
    name: "FARM",
    icon: "🌾",
    description: "Произвежда Food.",
    baseCost: 100,
  },

  metal: {
    name: "METAL FACTORY",
    icon: "⛏️",
    description: "Произвежда Metal.",
    baseCost: 140,
  },

  refinery: {
    name: "REFINERY",
    icon: "🛢️",
    description: "Произвежда Fuel.",
    baseCost: 180,
  },

  power: {
    name: "POWER PLANT",
    icon: "⚡",
    description: "Произвежда Energy.",
    baseCost: 150,
  },

  warehouse: {
    name: "WAREHOUSE",
    icon: "📦",
    description: "Увеличава капацитета.",
    baseCost: 130,
  },

  hospital: {
    name: "HOSPITAL",
    icon: "🏥",
    description: "Лекува ранени войници.",
    baseCost: 160,
  },

  barracks: {
    name: "BARRACKS",
    icon: "🪖",
    description: "Обучава пехота.",
    baseCost: 180,
  },

  vehicle: {
    name: "VEHICLE FACTORY",
    icon: "🚙",
    description: "Произвежда бронирани машини.",
    baseCost: 300,
  },

  weapons: {
    name: "WEAPONS FACTORY",
    icon: "🔫",
    description: "Произвежда тежко въоръжение.",
    baseCost: 280,
  },

  research: {
    name: "RESEARCH CENTER",
    icon: "🔬",
    description: "Развива технологиите.",
    baseCost: 250,
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
    attack: number;
    defense: number;
    time: number;
  }
> = {
  recruit: {
    name: "Recruit",
    icon: "🧍",
    building: "barracks",
    food: 20,
    metal: 5,
    fuel: 0,
    attack: 5,
    defense: 4,
    time: 3,
  },

  rifleman: {
    name: "Rifleman",
    icon: "🔫",
    building: "barracks",
    food: 35,
    metal: 20,
    fuel: 0,
    attack: 10,
    defense: 8,
    time: 5,
  },

  heavy: {
    name: "Heavy Infantry",
    icon: "🪖",
    building: "barracks",
    food: 60,
    metal: 45,
    fuel: 0,
    attack: 20,
    defense: 18,
    time: 8,
  },

  sniper: {
    name: "Sniper",
    icon: "🎯",
    building: "weapons",
    food: 50,
    metal: 55,
    fuel: 0,
    attack: 35,
    defense: 10,
    time: 10,
  },

  machinegunner: {
    name: "Machine Gunner",
    icon: "💥",
    building: "weapons",
    food: 65,
    metal: 60,
    fuel: 0,
    attack: 30,
    defense: 20,
    time: 12,
  },

  rocket: {
    name: "Rocket Soldier",
    icon: "🚀",
    building: "weapons",
    food: 80,
    metal: 90,
    fuel: 15,
    attack: 55,
    defense: 12,
    time: 15,
  },

  apc: {
    name: "APC",
    icon: "🚙",
    building: "vehicle",
    food: 80,
    metal: 150,
    fuel: 60,
    attack: 60,
    defense: 80,
    time: 20,
  },

  tank: {
    name: "Tank",
    icon: "🛡️",
    building: "vehicle",
    food: 120,
    metal: 240,
    fuel: 100,
    attack: 120,
    defense: 150,
    time: 30,
  },
};

function formatNumber(value: number) {
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

function totalArmy(army: Army) {
  return Object.values(army).reduce(
    (sum, value) => sum + value,
    0
  );
}

function armyPower(
  army: Army,
  research: Research
) {
  let attack = 0;
  let defense = 0;

  (
    Object.keys(army) as UnitId[]
  ).forEach((type) => {
    attack +=
      army[type] *
      unitInfo[type].attack;

    defense +=
      army[type] *
      unitInfo[type].defense;
  });

  attack *=
    1 + research.infantry * 0.08;

  attack *=
    1 + research.vehicles * 0.1;

  defense *=
    1 + research.defense * 0.1;

  return {
    attack: Math.floor(attack),
    defense: Math.floor(defense),
  };
}

function App() {
  const [game, setGame] =
    useState<GameState>(loadGame);

  const [tab, setTab] =
    useState<Tab>("city");

  const [selected, setSelected] =
    useState<BuildingId | null>(null);

  const [message, setMessage] =
    useState(
      "Добре дошъл в New Hope. Градът е под твой контрол."
    );

  const [training, setTraining] =
    useState<{
      unit: UnitId;
      amount: number;
      finish: number;
    } | null>(null);

  const [researching, setResearching] =
    useState<keyof Research | null>(null);

  const [now, setNow] =
    useState(Date.now());

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
    const timer =
      window.setInterval(() => {
        setNow(Date.now());
      }, 500);

    return () =>
      window.clearInterval(timer);
  }, []);

  /*
   * RESOURCE PRODUCTION
   */

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setGame((current) => {
          const economy =
            1 +
            current.research.economy *
              0.08;

          const capacity =
            2000 +
            current.buildings.warehouse *
              1000;

          return {
            ...current,

            resources: {
              food: Math.min(
                capacity,
                current.resources.food +
                  current.buildings.farm *
                    3 *
                    economy
              ),

              metal: Math.min(
                capacity,
                current.resources.metal +
                  current.buildings.metal *
                    2.5 *
                    economy
              ),

              fuel: Math.min(
                capacity,
                current.resources.fuel +
                  current.buildings.refinery *
                    1.5 *
                    economy
              ),

              energy: Math.min(
                capacity,
                current.resources.energy +
                  current.buildings.power *
                    2
              ),
            },
          };
        });
      }, 1000);

    return () =>
      window.clearInterval(timer);
  }, []);

  /*
   * TRAINING FINISH
   */

  useEffect(() => {
    if (!training) return;

    if (now >= training.finish) {
      setGame((current) => ({
        ...current,

        army: {
          ...current.army,

          [training.unit]:
            current.army[training.unit] +
            training.amount,
        },

        xp: current.xp + 5,
      }));

      setMessage(
        `${unitInfo[training.unit].icon} ${unitInfo[training.unit].name} ×${training.amount} е готова.`
      );

      setTraining(null);
    }
  }, [now, training]);

  /*
   * BUILDING UPGRADE
   */

  function upgradeBuilding(
    id: BuildingId
  ) {
    const level =
      game.buildings[id];

    if (
      id !== "command" &&
      level >= game.cityLevel
    ) {
      setMessage(
        `Нужен е Command Center Level ${
          level + 1
        }.`
      );
      return;
    }

    if (level >= 30) {
      setMessage(
        "Тази сграда е Level 30."
      );
      return;
    }

    const cost =
      buildingInfo[id].baseCost *
      (level + 1);

    const foodCost = cost;
    const metalCost =
      Math.floor(cost * 0.75);

    if (
      game.resources.food <
        foodCost ||
      game.resources.metal <
        metalCost
    ) {
      setMessage(
        "Няма достатъчно Food / Metal."
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

      xp: current.xp + 10,
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
        "В момента вече произвеждаш войници."
      );
      return;
    }

    const info =
      unitInfo[unit];

    if (
      game.buildings[info.building] <= 0
    ) {
      setMessage(
        `Построй ${buildingInfo[
          info.building
        ].name}.`
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
        "Няма достатъчно ресурси."
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

  function researchTech(
    type: keyof Research
  ) {
    if (researching) {
      setMessage(
        "Research Center вече работи."
      );
      return;
    }

    const level =
      game.research[type];

    if (level >= 10) {
      setMessage(
        "Технологията е максимална."
      );
      return;
    }

    const food =
      250 * (level + 1);

    const metal =
      300 * (level + 1);

    if (
      game.resources.food < food ||
      game.resources.metal < metal
    ) {
      setMessage(
        "Няма достатъчно ресурси за research."
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

    setMessage(
      "Research започна..."
    );

    window.setTimeout(() => {
      setGame((current) => ({
        ...current,

        research: {
          ...current.research,

          [type]:
            current.research[type] + 1,
        },

        xp: current.xp + 20,
      }));

      setResearching(null);

      setMessage(
        `${type.toUpperCase()} research завърши.`
      );
    }, 5000);
  }

  /*
   * ZOMBIE ATTACK
   */

  function attackWave() {
    const power =
      armyPower(
        game.army,
        game.research
      );

    if (
      power.attack <
      game.zombiePower
    ) {
      const losses = Math.min(
        totalArmy(game.army),
        Math.max(
          1,
          Math.floor(
            totalArmy(game.army) *
              0.15
          )
        )
      );

      setGame((current) => {
        const newArmy = {
          ...current.army,
        };

        let remaining = losses;

        (
          Object.keys(
            newArmy
          ) as UnitId[]
        ).forEach((unit) => {
          if (remaining <= 0) return;

          const lost = Math.min(
            newArmy[unit],
            remaining
          );

          newArmy[unit] -= lost;
          remaining -= lost;
        });

        return {
          ...current,

          army: newArmy,

          wounded:
            current.wounded +
            Math.floor(losses * 0.5),

          zombieWave:
            current.zombieWave + 1,

          zombiePower:
            Math.floor(
              current.zombiePower *
                1.18
            ),
        };
      });

      setMessage(
        "⚠️ Вълната от зомбита проби защитата!"
      );

      return;
    }

    const reward =
      400 +
      game.zombieWave * 150;

    setGame((current) => ({
      ...current,

      resources: {
        ...current.resources,

        food:
          current.resources.food +
          reward,

        metal:
          current.resources.metal +
          reward,

        fuel:
          current.resources.fuel +
          Math.floor(
            reward * 0.3
          ),
      },

      zombieWave:
        current.zombieWave + 1,

      zombiePower:
        Math.floor(
          current.zombiePower *
            1.18
        ),

      xp: current.xp + 50,

      missions:
        current.missions + 1,
    }));

    setMessage(
      `🧟 Вълната е унищожена! +${reward} ресурси.`
    );
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

    const healed = Math.min(
      game.wounded,
      game.buildings.hospital * 5
    );

    setGame((current) => ({
      ...current,

      wounded:
        current.wounded -
        healed,

      resources: {
        ...current.resources,

        food:
          Math.max(
            0,
            current.resources.food -
              healed * 5
          ),
      },
    }));

    setMessage(
      `🏥 Лекувани: ${healed} войници.`
    );
  }

  /*
   * RESET
   */

  function resetGame() {
    localStorage.removeItem(
      SAVE_KEY
    );

    setGame(initialGame);

    setTab("city");

    setSelected(null);

    setTraining(null);

    setResearching(null);

    setMessage(
      "Новото селище New Hope е започнато."
    );
  }

  const power = useMemo(
    () =>
      armyPower(
        game.army,
        game.research
      ),
    [game.army, game.research]
  );

  return (
    <main className="afterfall">

      {/* TOP BAR */}

      <header className="topbar">

        <div className="brand">
          <strong>
            AFTERFALL
          </strong>

          <small>
            NEW HOPE
          </small>
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
          CITY
          <b>
            {game.cityLevel}
          </b>
        </div>

      </header>

      {/* CITY */}

      <section className="city">

        <div className="sky" />

        <div className="city-title">
          <strong>
            NEW HOPE
          </strong>

          <small>
            SURVIVOR SETTLEMENT
          </small>
        </div>

        <div className="road road-v" />
        <div className="road road-h" />

        <CityBuilding
          id="command"
          game={game}
          selected={
            selected === "command"
          }
          onClick={() =>
            setSelected("command")
          }
          className="command"
        />

        <CityBuilding
          id="farm"
          game={game}
          selected={
            selected === "farm"
          }
          onClick={() =>
            setSelected("farm")
          }
          className="farm"
        />

        <CityBuilding
          id="metal"
          game={game}
          selected={
            selected === "metal"
          }
          onClick={() =>
            setSelected("metal")
          }
          className="metal"
        />

        <CityBuilding
          id="refinery"
          game={game}
          selected={
            selected === "refinery"
          }
          onClick={() =>
            setSelected("refinery")
          }
          className="refinery"
        />

        <CityBuilding
          id="power"
          game={game}
          selected={
            selected === "power"
          }
          onClick={() =>
            setSelected("power")
          }
          className="powerplant"
        />

        <CityBuilding
          id="warehouse"
          game={game}
          selected={
            selected === "warehouse"
          }
          onClick={() =>
            setSelected("warehouse")
          }
          className="warehouse"
        />

        <CityBuilding
          id="hospital"
          game={game}
          selected={
            selected === "hospital"
          }
          onClick={() =>
            setSelected("hospital")
          }
          className="hospital"
        />

        <CityBuilding
          id="barracks"
          game={game}
          selected={
            selected === "barracks"
          }
          onClick={() =>
            setSelected("barracks")
          }
          className="barracks"
        />

        <CityBuilding
          id="research"
          game={game}
          selected={
            selected === "research"
          }
          onClick={() =>
            setSelected("research")
          }
          className="research"
        />

        <CityBuilding
          id="vehicle"
          game={game}
          selected={
            selected === "vehicle"
          }
          onClick={() =>
            setSelected("vehicle")
          }
          className="vehicle"
        />

        <CityBuilding
          id="weapons"
          game={game}
          selected={
            selected === "weapons"
          }
          onClick={() =>
            setSelected("weapons")
          }
          className="weapons"
        />

        {/* MOVING PEOPLE */}

        <div className="people">

          <span className="person p1">
            🧍
          </span>

          <span className="person p2">
            🚶
          </span>

          <span className="person p3">
            🧍
          </span>

          <span className="person p4">
            🚶
          </span>

          <span className="vehicle-moving">
            🚙
          </span>

        </div>

        {/* ZOMBIES */}

        <div className="zombies">

          <span>
            🧟
          </span>

          <span>
            🧟
          </span>

          <span>
            🧟
          </span>

        </div>

        <div className="trees">
          🌲　🌲　🌲　🌲　🌲
        </div>

      </section>

      {/* NAV */}

      <nav className="bottom-nav">

        <NavButton
          active={tab === "city"}
          icon="🏙️"
          label="CITY"
          onClick={() =>
            setTab("city")
          }
        />

        <NavButton
          active={tab === "army"}
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
          active={tab === "world"}
          icon="🗺️"
          label="WORLD"
          onClick={() =>
            setTab("world")
          }
        />

      </nav>

      {/* GAME PANEL */}

      <section className="panel">

        <div className="message">
          {message}
        </div>

        {tab === "city" && (
          <CityPanel
            game={game}
            selected={selected}
            onUpgrade={
              upgradeBuilding
            }
            onHeal={
              healWounded
            }
          />
        )}

        {tab === "army" && (
          <ArmyPanel
            game={game}
            training={training}
            now={now}
            power={power}
            onTrain={trainUnit}
          />
        )}

        {tab === "research" && (
          <ResearchPanel
            game={game}
            researching={
              researching
            }
            onResearch={
              researchTech
            }
          />
        )}

        {tab === "world" && (
          <WorldPanel
            game={game}
            power={power}
            onAttack={
              attackWave
            }
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
      <span>
        {icon}
      </span>

      <b>
        {formatNumber(value)}
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
      <span>
        {icon}
      </span>

      {label}
    </button>
  );
}

/* =====================================================
   CITY BUILDING
===================================================== */

function CityBuilding({
  id,
  game,
  selected,
  onClick,
  className,
}: {
  id: BuildingId;
  game: GameState;
  selected: boolean;
  onClick: () => void;
  className: string;
}) {
  const level =
    game.buildings[id];

  const info =
    buildingInfo[id];

  return (
    <button
      className={`city-building ${className} ${
        selected ? "selected" : ""
      } ${
        level === 0
          ? "unbuilt"
          : ""
      }`}
      onClick={onClick}
    >

      <div className="building-roof" />

      <div className="building-body">

        <span className="building-icon">
          {level > 0
            ? info.icon
            : "🏚️"}
        </span>

        <strong>
          {info.name}
        </strong>

        <small>
          {level > 0
            ? `LV.${level}`
            : "BUILD"}
        </small>

      </div>

      {level >= 3 && (
        <div className="smoke">
          ●
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
  onHeal,
}: {
  game: GameState;
  selected: BuildingId | null;
  onUpgrade: (
    id: BuildingId
  ) => void;
  onHeal: () => void;
}) {
  if (selected) {
    const info =
      buildingInfo[selected];

    const level =
      game.buildings[selected];

    const cost =
      info.baseCost *
      (level + 1);

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
              LEVEL {level} / 30
            </small>
          </div>

        </div>

        <p>
          {info.description}
        </p>

        {selected === "farm" && (
          <div className="production">
            🍖 +{level * 3} Food / sec
          </div>
        )}

        {selected === "metal" && (
          <div className="production">
            🔩 +{level * 2.5} Metal / sec
          </div>
        )}

        {selected === "refinery" && (
          <div className="production">
            ⛽ +{level * 1.5} Fuel / sec
          </div>
        )}

        {selected === "power" && (
          <div className="production">
            ⚡ +{level * 2} Energy / sec
          </div>
        )}

        {selected === "warehouse" && (
          <div className="production">
            📦 Capacity +
            {level * 1000}
          </div>
        )}

        {selected === "hospital" && (
          <>
            <div className="production">
              🏥 Wounded:{" "}
              {game.wounded}
            </div>

            <button
              className="secondary-button full"
              onClick={onHeal}
            >
              HEAL WOUNDED
            </button>
          </>
        )}

        <div className="cost">

          <span>
            🍖 {formatNumber(cost)}
          </span>

          <span>
            🔩{" "}
            {formatNumber(
              Math.floor(
                cost * 0.75
              )
            )}
          </span>

        </div>

        <button
          className="main-button"
          disabled={
            level >= 30
          }
          onClick={() =>
            onUpgrade(selected)
          }
        >
          {level >= 30
            ? "MAX LEVEL"
            : `UPGRADE → LV.${
                level + 1
              }`}
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
        Натисни сграда директно върху
        картата.
      </p>

      <div className="city-stats">

        <Stat
          value={game.cityLevel}
          label="CITY LEVEL"
        />

        <Stat
          value={totalArmy(game.army)}
          label="ARMY"
        />

        <Stat
          value={game.wounded}
          label="WOUNDED"
        />

      </div>

      <div className="threat-box">

        <strong>
          🧟 ZOMBIE THREAT
        </strong>

        <span>
          NEXT WAVE:{" "}
          {game.zombieWave}
        </span>

        <span>
          POWER:{" "}
          {formatNumber(
            game.zombiePower
          )}
        </span>

      </div>

    </div>
  );
}

/* =====================================================
   STAT
===================================================== */

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="stat">
      <b>
        {formatNumber(value)}
      </b>

      <span>
        {label}
      </span>
    </div>
  );
}

/* =====================================================
   ARMY
===================================================== */

function ArmyPanel({
  game,
  training,
  now,
  power,
  onTrain,
}: {
  game: GameState;
  training: {
    unit: UnitId;
    amount: number;
    finish: number;
  } | null;
  now: number;
  power: {
    attack: number;
    defense: number;
  };
  onTrain: (
    unit: UnitId,
    amount: number
  ) => void;
}) {
  const remaining =
    training
      ? Math.max(
          0,
          training.finish - now
        )
      : 0;

  return (
    <div>

      <div className="army-header">

        <div>
          <h2>
            🪖 ARMY
          </h2>

          <small>
            {totalArmy(game.army)} UNITS
          </small>
        </div>

        <div className="power-box">
          ⚔️
          <b>
            {formatNumber(
              power.attack
            )}
          </b>
          <small>
            ATTACK
          </small>
        </div>

        <div className="power-box">
          🛡️
          <b>
            {formatNumber(
              power.defense
            )}
          </b>
          <small>
            DEFENSE
          </small>
        </div>

      </div>

      {training && (
        <div className="training">

          <strong>
            TRAINING{" "}
            {unitInfo[
              training.unit
            ].name}
          </strong>

          <span>
            ×{training.amount}
          </span>

          <div className="progress">
            <div
              style={{
                width: `${Math.min(
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
                )}%`,
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
              className={`unit-card ${
                !unlocked
                  ? "locked"
                  : ""
              }`}
              key={unit}
            >

              <div className="unit-icon">
                {info.icon}
              </div>

              <strong>
                {info.name}
              </strong>

              <b>
                {game.army[unit]}
              </b>

              <small>
                ⚔️ {info.attack}
                {"  "}
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
  const techs: {
    id: keyof Research;
    name: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: "infantry",
      name: "INFANTRY",
      icon: "🔫",
      description:
        "Увеличава атаката на пехотата.",
    },
    {
      id: "vehicles",
      name: "VEHICLES",
      icon: "🚙",
      description:
        "Увеличава силата на машините.",
    },
    {
      id: "production",
      name: "PRODUCTION",
      icon: "🏭",
      description:
        "Ускорява обучението.",
    },
    {
      id: "economy",
      name: "ECONOMY",
      icon: "📈",
      description:
        "Увеличава производството.",
    },
    {
      id: "defense",
      name: "DEFENSE",
      icon: "🛡️",
      description:
        "Увеличава защитата.",
    },
  ];

  return (
    <div>

      <h2>
        🔬 RESEARCH CENTER
      </h2>

      <p>
        Развивай технологиите на New
        Hope.
      </p>

      <div className="research-grid">

        {techs.map((tech) => {
          const level =
            game.research[
              tech.id
            ];

          const food =
            250 *
            (level + 1);

          const metal =
            300 *
            (level + 1);

          return (
            <div
              className="research-card"
              key={tech.id}
            >

              <div className="research-icon">
                {tech.icon}
              </div>

              <div>
                <strong>
                  {tech.name}
                </strong>

                <small>
                  LEVEL {level}
                </small>

                <p>
                  {tech.description}
                </p>
              </div>

              <div className="research-cost">
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
                    tech.id
                  )
                }
              >
                {researching ===
                tech.id
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
  power,
  onAttack,
}: {
  game: GameState;
  power: {
    attack: number;
    defense: number;
  };
  onAttack: () => void;
}) {
  return (
    <div>

      <h2>
        🗺️ WORLD MAP
      </h2>

      <p>
        Светът около New Hope е пълен
        със заразени зони.
      </p>

      <div className="world-map">

        <div className="map-grid" />

        <div className="map-city">
          🏙️
          <small>
            NEW HOPE
          </small>
        </div>

        <div className="map-zombie z1">
          🧟
        </div>

        <div className="map-zombie z2">
          🧟
        </div>

        <div className="map-zombie z3">
          🧟
        </div>

        <div className="map-base b1">
          🏚️
        </div>

        <div className="map-base b2">
          🏚️
        </div>

      </div>

      <div className="world-info">

        <div>
          <span>
            NEXT ZOMBIE WAVE
          </span>

          <strong>
            {game.zombieWave}
          </strong>
        </div>

        <div>
          <span>
            ZOMBIE POWER
          </span>

          <strong>
            {formatNumber(
              game.zombiePower
            )}
          </strong>
        </div>

        <div>
          <span>
            YOUR ATTACK
          </span>

          <strong>
            {formatNumber(
              power.attack
            )}
          </strong>
        </div>

      </div>

      <button
        className="attack-button world-attack"
        onClick={onAttack}
      >
        ⚔️ ATTACK ZOMBIE WAVE
      </button>

      <div className="mission">

        <strong>
          🎯 SURVIVOR MISSION
        </strong>

        <p>
          Унищожавай zombie waves,
          събирай ресурси и развивай
          New Hope.
        </p>

        <span>
          COMPLETED:{" "}
          {game.missions}
        </span>

      </div>

    </div>
  );
}

export default App;