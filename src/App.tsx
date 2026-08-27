import React, { useEffect, useMemo, useState } from "react";
type Building = {
  id: string;
  name: string;
  icon: string;
  level: number;
  maxLevel: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  cost: {
    food: number;
    metal: number;
    fuel: number;
    power: number;
  };
  produces?: {
    type: "food" | "metal" | "fuel" | "power";
    amount: number;
  };
};
type Resources = {
  food: number;
  metal: number;
  fuel: number;
  power: number;
};
const initialBuildings: Building[] = [
  {
    id: "command",
    name: "Command Center",
    icon: "🏢",
    level: 1,
    maxLevel: 10,
    x: 42,
    y: 28,
    width: 17,
    height: 22,
    hp: 100,
    maxHp: 100,
    cost: { food: 500, metal: 300, fuel: 100, power: 100 },
  },
  {
    id: "farm",
    name: "Farm",
    icon: "🌾",
    level: 2,
    maxLevel: 10,
    x: 9,
    y: 25,
    width: 15,
    height: 17,
    hp: 100,
    maxHp: 100,
    cost: { food: 250, metal: 150, fuel: 50, power: 30 },
    produces: { type: "food", amount: 12 },
  },
  {
    id: "metal",
    name: "Metal Factory",
    icon: "⛏️",
    level: 1,
    maxLevel: 10,
    x: 76,
    y: 25,
    width: 15,
    height: 17,
    hp: 100,
    maxHp: 100,
    cost: { food: 250, metal: 150, fuel: 50, power: 30 },
    produces: { type: "metal", amount: 8 },
  },
  {
    id: "refinery",
    name: "Refinery",
    icon: "🛢️",
    level: 1,
    maxLevel: 10,
    x: 9,
    y: 58,
    width: 15,
    height: 17,
    hp: 100,
    maxHp: 100,
    cost: { food: 250, metal: 180, fuel: 60, power: 40 },
    produces: { type: "fuel", amount: 6 },
  },
  {
    id: "power",
    name: "Power Plant",
    icon: "⚡",
    level: 1,
    maxLevel: 10,
    x: 76,
    y: 58,
    width: 15,
    height: 17,
    hp: 100,
    maxHp: 100,
    cost: { food: 200, metal: 200, fuel: 50, power: 0 },
    produces: { type: "power", amount: 5 },
  },
  {
    id: "warehouse",
    name: "Warehouse",
    icon: "📦",
    level: 1,
    maxLevel: 10,
    x: 27,
    y: 66,
    width: 15,
    height: 16,
    hp: 100,
    maxHp: 100,
    cost: { food: 300, metal: 200, fuel: 70, power: 50 },
  },
  {
    id: "hospital",
    name: "Hospital",
    icon: "🏥",
    level: 1,
    maxLevel: 10,
    x: 58,
    y: 66,
    width: 15,
    height: 16,
    hp: 100,
    maxHp: 100,
    cost: { food: 300, metal: 250, fuel: 80, power: 60 },
  },
  {
    id: "barracks",
    name: "Barracks",
    icon: "🪖",
    level: 1,
    maxLevel: 10,
    x: 27,
    y: 43,
    width: 15,
    height: 16,
    hp: 100,
    maxHp: 100,
    cost: { food: 350, metal: 250, fuel: 80, power: 50 },
  },
  {
    id: "research",
    name: "Research Center",
    icon: "🔬",
    level: 1,
    maxLevel: 10,
    x: 58,
    y: 43,
    width: 15,
    height: 16,
    hp: 100,
    maxHp: 100,
    cost: { food: 400, metal: 350, fuel: 100, power: 80 },
  },
];
const initialResources: Resources = {
  food: 3000,
  metal: 2200,
  fuel: 1500,
  power: 1200,
};
function App() {
  const [resources, setResources] = useState<Resources>(initialResources);
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [army, setArmy] = useState(30);
  const [wounded, setWounded] = useState(0);
  const [zombies, setZombies] = useState(350);
  const [training, setTraining] = useState(false);
  const [trainingSeconds, setTrainingSeconds] = useState(0);
  const [message, setMessage] = useState(
    "Добре дошъл в New Hope. Градът е под твой контрол."
  );
  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedId) ?? null,
    [buildings, selectedId]
  );
  /*
   * РЕАЛНО ПРОИЗВОДСТВО
   * На всеки 2 секунди сградите добавят ресурси.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setResources((old) => {
        const next = { ...old };
        buildings.forEach((building) => {
          if (!building.produces || building.hp <= 0) return;
          const amount =
            building.produces.amount * building.level;
          next[building.produces.type] += amount;
        });
        return next;
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, [buildings]);
  /*
   * ТРЕНИРОВКА НА ВОЙНИЦИ
   */
  useEffect(() => {
    if (!training) return;
    const timer = window.setInterval(() => {
      setTrainingSeconds((old) => {
        if (old <= 1) {
          setTraining(false);
          setArmy((armyOld) => armyOld + 5);
          setMessage("Обучението завърши. +5 войници.");
          return 0;
        }
        return old - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [training]);
  /*
   * UPGRADE
   */
  const upgradeBuilding = () => {
    if (!selectedBuilding) return;
    if (selectedBuilding.level >= selectedBuilding.maxLevel) {
      setMessage("Тази сграда вече е на максимално ниво.");
      return;
    }
    const cost = selectedBuilding.cost;
    if (
      resources.food < cost.food ||
      resources.metal < cost.metal ||
      resources.fuel < cost.fuel ||
      resources.power < cost.power
    ) {
      setMessage("Нямаш достатъчно ресурси за този upgrade.");
      return;
    }
    setResources((old) => ({
      food: old.food - cost.food,
      metal: old.metal - cost.metal,
      fuel: old.fuel - cost.fuel,
      power: old.power - cost.power,
    }));
    setBuildings((old) =>
      old.map((building) =>
        building.id === selectedBuilding.id
          ? {
              ...building,
              level: building.level + 1,
              maxHp: building.maxHp + 20,
              hp: building.maxHp + 20,
            }
          : building
      )
    );
    setMessage(
      `${selectedBuilding.name} е подобрена до ниво ${
        selectedBuilding.level + 1
      }.`
    );
  };
  /*
   * REPAIR
   */
  const repairBuilding = () => {
    if (!selectedBuilding) return;
    if (selectedBuilding.hp >= selectedBuilding.maxHp) {
      setMessage("Сградата няма нужда от ремонт.");
      return;
    }
    const repairCost = Math.max(
      50,
      Math.floor((selectedBuilding.maxHp - selectedBuilding.hp) * 2)
    );
    if (resources.metal < repairCost) {
      setMessage("Нямаш достатъчно метал за ремонта.");
      return;
    }
    setResources((old) => ({
      ...old,
      metal: old.metal - repairCost,
    }));
    setBuildings((old) =>
      old.map((building) =>
        building.id === selectedBuilding.id
          ? { ...building, hp: building.maxHp }
          : building
      )
    );
    setMessage(`${selectedBuilding.name} е напълно ремонтирана.`);
  };
  /*
   * TRAIN
   */
  const trainArmy = () => {
    if (training) return;
    const cost = 150;
    if (resources.food < cost || resources.metal < 80) {
      setMessage("Нямаш достатъчно ресурси за обучение.");
      return;
    }
    setResources((old) => ({
      ...old,
      food: old.food - cost,
      metal: old.metal - 80,
    }));
    setTraining(true);
    setTrainingSeconds(10);
    setMessage("Обучаваме 5 нови войници...");
  };
  /*
   * ATTACK
   */
  const attackZombie = () => {
    if (army <= 0) {
      setMessage("Нямаш войници.");
      return;
    }
    const damage = Math.min(army * 12, zombies);
    setZombies((old) => Math.max(0, old - damage));
    const losses = Math.max(
      1,
      Math.floor(Math.random() * Math.max(1, army / 8))
    );
    setArmy((old) => Math.max(0, old - losses));
    setWounded((old) => old + Math.floor(losses / 2));
    setMessage(
      `Атаката нанесе ${damage} щети. Загуби: ${losses} войници.`
    );
  };
  /*
   * SAVE
   */
  useEffect(() => {
    const save = {
      resources,
      buildings,
      army,
      wounded,
      zombies,
    };
    localStorage.setItem("afterfall-save", JSON.stringify(save));
  }, [resources, buildings, army, wounded, zombies]);
  /*
   * LOAD
   */
  useEffect(() => {
    const saved = localStorage.getItem("afterfall-save");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.resources) setResources(data.resources);
      if (data.buildings) setBuildings(data.buildings);
      if (typeof data.army === "number") setArmy(data.army);
      if (typeof data.wounded === "number") setWounded(data.wounded);
      if (typeof data.zombies === "number") setZombies(data.zombies);
      setMessage("Запазената игра е заредена.");
    } catch {
      console.log("Save file invalid.");
    }
  }, []);
  const resetGame = () => {
    localStorage.removeItem("afterfall-save");
    setResources(initialResources);
    setBuildings(initialBuildings);
    setArmy(30);
    setWounded(0);
    setZombies(350);
    setSelectedId(null);
    setTraining(false);
    setTrainingSeconds(0);
    setMessage("Новата игра започна.");
  };
  return (
    <div className="afterfall">
      <header className="topbar">
        <div className="brand">
          <strong>AFTERFALL</strong>
          <small>NEW HOPE</small>
        </div>
        <div className="resources">
          <div className="resource">🍖 {resources.food.toLocaleString()}</div>
          <div className="resource">🔩 {resources.metal.toLocaleString()}</div>
          <div className="resource">⛽ {resources.fuel.toLocaleString()}</div>
          <div className="resource">⚡ {resources.power.toLocaleString()}</div>
        </div>
        <div className="city-level">
          CITY LV.
          <b>
            {Math.max(
              1,
              buildings.find((b) => b.id === "command")?.level ?? 1
            )}
          </b>
        </div>
      </header>
      <main>
        <section className="city">
          <div className="sky" />
          <div className="city-title">
            <span>NEW HOPE</span>
            <small>SURVIVOR SETTLEMENT</small>
          </div>
          <div className="road vertical" />
          <div className="road horizontal" />
          <div className="moving-person person-one">🧍</div>
          <div className="moving-person person-two">🚶</div>
          <div className="moving-person person-three">🚶</div>
          <div className="moving-car">🚙</div>
          {buildings.map((building) => (
            <button
              key={building.id}
              className={`building ${
                selectedId === building.id ? "selected" : ""
              } ${
                building.hp < building.maxHp ? "damaged" : ""
              }`}
              style={{
                left: `${building.x}%`,
                top: `${building.y}%`,
                width: `${building.width}%`,
                height: `${building.height}%`,
              }}
              onClick={() => setSelectedId(building.id)}
            >
              <div className="building-roof" />
              <div className="building-body">
                <div className="building-icon">
                  {building.icon}
                </div>
                <div className="building-name">
                  {building.name}
                </div>
                <div className="building-lvl">
                  LV.{building.level}
                </div>
                <div className="building-hp">
                  <div
                    style={{
                      width: `${
                        (building.hp / building.maxHp) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </button>
          ))}
          <div className="zombie-line">
            🧟 🧟 🧟 🧟
          </div>
        </section>
        <nav className="bottom-nav">
          <button className="nav-button active">
            <span>🏙️</span>
            CITY
          </button>
          <button
            className="nav-button"
            onClick={() => {
              const barracks = buildings.find(
                (b) => b.id === "barracks"
              );
              if (barracks) setSelectedId("barracks");
            }}
          >
            <span>🪖</span>
            ARMY
          </button>
          <button
            className="nav-button"
            onClick={() => setSelectedId("research")}
          >
            <span>🔬</span>
            RESEARCH
          </button>
          <button
            className="nav-button"
            onClick={() =>
              document
                .getElementById("attack")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <span>⚔️</span>
            ATTACK
          </button>
        </nav>
        <section className="panel">
          <div className="message">
            {message}
          </div>
          {!selectedBuilding && (
            <>
              <div className="panel-heading">
                <span>🏙️</span>
                <div>
                  <h2>NEW HOPE</h2>
                  <small>SURVIVOR SETTLEMENT</small>
                </div>
              </div>
              <p>
                Това вече е реално управляем град.
                Натисни произволна сграда.
              </p>
              <div className="city-stats">
                <div>
                  <b>
                    {
                      buildings.find(
                        (b) => b.id === "command"
                      )?.level
                    }
                  </b>
                  <span>CITY LEVEL</span>
                </div>
                <div>
                  <b>{army}</b>
                  <span>ARMY</span>
                </div>
                <div>
                  <b>{wounded}</b>
                  <span>WOUNDED</span>
                </div>
              </div>
              <div id="attack" className="enemy">
                <div className="enemy-icon">🧟</div>
                <div>
                  <h3>ZOMBIE HORDE</h3>
                  <span>THREAT LEVEL</span>
                </div>
                <div className="enemy-power">
                  {zombies}
                  <small>POWER</small>
                </div>
              </div>
              <div className="war-buttons">
                <button
                  className="attack-button"
                  onClick={attackZombie}
                  disabled={army <= 0 || zombies <= 0}
                >
                  ⚔️ ATTACK
                </button>
                <button
                  className="secondary-button"
                  onClick={trainArmy}
                  disabled={training}
                >
                  🪖 TRAIN
                  <small>
                    {training
                      ? `${trainingSeconds}s`
                      : "5 soldiers"}
                  </small>
                </button>
              </div>
            </>
          )}
          {selectedBuilding && (
            <>
              <div className="panel-heading">
                <span>{selectedBuilding.icon}</span>
                <div>
                  <h2>{selectedBuilding.name}</h2>
                  <small>
                    LEVEL {selectedBuilding.level}
                  </small>
                </div>
              </div>
              <div className="building-details">
                <div className="detail-row">
                  <span>HP</span>
                  <strong>
                    {selectedBuilding.hp}/
                    {selectedBuilding.maxHp}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>LEVEL</span>
                  <strong>
                    {selectedBuilding.level}/
                    {selectedBuilding.maxLevel}
                  </strong>
                </div>
                {selectedBuilding.produces && (
                  <div className="production">
                    ⚙️ Производство: +
                    {selectedBuilding.produces.amount *
                      selectedBuilding.level}
                    {" "}
                    {selectedBuilding.produces.type}
                    {" "}
                    / 2 сек.
                  </div>
                )}
                <div className="cost">
                  <span>
                    🍖 {selectedBuilding.cost.food}
                  </span>
                  <span>
                    🔩 {selectedBuilding.cost.metal}
                  </span>
                  <span>
                    ⛽ {selectedBuilding.cost.fuel}
                  </span>
                  <span>
                    ⚡ {selectedBuilding.cost.power}
                  </span>
                </div>
                <div className="building-actions">
                  <button
                    className="main-button"
                    onClick={upgradeBuilding}
                    disabled={
                      selectedBuilding.level >=
                      selectedBuilding.maxLevel
                    }
                  >
                    ⬆️ UPGRADE
                  </button>
                  <button
                    className="secondary-button"
                    onClick={repairBuilding}
                    disabled={
                      selectedBuilding.hp >=
                      selectedBuilding.maxHp
                    }
                  >
                    🔧 REPAIR
                  </button>
                </div>
              </div>
            </>
          )}
          <button
            className="reset"
            onClick={resetGame}
          >
            RESET GAME
          </button>
        </section>
      </main>
    </div>
  );
}
export default App;