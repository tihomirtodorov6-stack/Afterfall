import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type BuildingInfo = {
  id: string;
  name: string;
  icon: string;
  description: string;
  level: number;
};

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cityLevel, setCityLevel] = useState(1);
  const [food, setFood] = useState(500);
  const [metal, setMetal] = useState(300);
  const [fuel] = useState(200);

  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingInfo | null>(null);

  const [buildingLevels, setBuildingLevels] =
    useState<Record<string, number>>({
      command: 1,
      hospital: 1,
      barracks: 1,
      research: 1,
      warehouse: 1,
    });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x18201c);

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth /
        container.clientHeight,
      0.1,
      500
    );

    camera.position.set(15, 15, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 1.8)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    container.appendChild(
      renderer.domElement
    );

    /* LIGHT */

    const ambient =
      new THREE.HemisphereLight(
        0xcbd5c2,
        0x30352d,
        2
      );

    scene.add(ambient);

    const sun =
      new THREE.DirectionalLight(
        0xffe5bd,
        3
      );

    sun.position.set(15, 25, 10);
    sun.castShadow = true;

    scene.add(sun);

    /* MATERIALS */

    const groundMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x343a32,
        roughness: 1,
      });

    const roadMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x252525,
        roughness: 1,
      });

    const concreteMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x68665e,
        roughness: 0.95,
      });

    const darkConcrete =
      new THREE.MeshStandardMaterial({
        color: 0x3f403b,
        roughness: 1,
      });

    const metalMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x252727,
        metalness: 0.6,
        roughness: 0.7,
      });

    const glassMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x52666a,
        roughness: 0.35,
      });

    const vegetationMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x293d2b,
        roughness: 1,
      });

    /* GROUND */

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.4, 30),
      groundMaterial
    );

    ground.position.y = -0.2;
    ground.receiveShadow = true;

    scene.add(ground);

    /* ROADS */

    const roadVertical =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3.5,
          0.08,
          30
        ),
        roadMaterial
      );

    roadVertical.position.y = 0.04;

    scene.add(roadVertical);

    const roadHorizontal =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          30,
          0.08,
          3.5
        ),
        roadMaterial
      );

    roadHorizontal.position.y = 0.05;

    scene.add(roadHorizontal);

    /* ROAD MARKINGS */

    for (
      let i = -13;
      i <= 13;
      i += 2.5
    ) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.18,
          0.03,
          1.1
        ),
        new THREE.MeshStandardMaterial({
          color: 0xa19d83,
        })
      );

      line.position.set(
        0,
        0.11,
        i
      );

      scene.add(line);
    }

    for (
      let i = -13;
      i <= 13;
      i += 2.5
    ) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(
          1.1,
          0.03,
          0.18
        ),
        new THREE.MeshStandardMaterial({
          color: 0xa19d83,
        })
      );

      line.position.set(
        i,
        0.12,
        0
      );

      scene.add(line);
    }

    /* BUILDING FUNCTION */

    const createBuilding = (
      id: string,
      x: number,
      z: number,
      width: number,
      height: number,
      depth: number,
      material: THREE.Material
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        material
      );

      mesh.position.set(
        x,
        height / 2,
        z
      );

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      mesh.userData.buildingId = id;

      scene.add(mesh);

      return mesh;
    };

    /* COMMAND CENTER */

    createBuilding(
      "command",
      0,
      0,
      4.8,
      3.4,
      4.8,
      concreteMaterial
    );

    const commandRoof =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          3.7,
          1.4,
          4
        ),
        darkConcrete
      );

    commandRoof.position.set(
      0,
      4.1,
      0
    );

    commandRoof.rotation.y =
      Math.PI / 4;

    commandRoof.userData.buildingId =
      "command";

    scene.add(commandRoof);

    /* COMMAND TOWER */

    const tower = createBuilding(
      "command",
      0,
      -3,
      1.2,
      5,
      1.2,
      metalMaterial
    );

    tower.userData.buildingId =
      "command";

    /* HOSPITAL */

    createBuilding(
      "hospital",
      -6,
      -5,
      4,
      2.7,
      3.5,
      concreteMaterial
    );

    const hospitalRoof =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          4.3,
          0.35,
          3.8
        ),
        darkConcrete
      );

    hospitalRoof.position.set(
      -6,
      2.85,
      -5
    );

    hospitalRoof.userData.buildingId =
      "hospital";

    scene.add(hospitalRoof);

    /* BARRACKS */

    createBuilding(
      "barracks",
      6,
      -5,
      4,
      2.4,
      3.5,
      darkConcrete
    );

    /* RESEARCH CENTER */

    createBuilding(
      "research",
      -6,
      5,
      4,
      3,
      3.5,
      concreteMaterial
    );

    /* WAREHOUSE */

    createBuilding(
      "warehouse",
      6,
      5,
      4.5,
      2.1,
      3.5,
      darkConcrete
    );

    /* WINDOWS */

    const addWindow = (
      x: number,
      y: number,
      z: number
    ) => {
      const window =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.55,
            0.65,
            0.08
          ),
          glassMaterial
        );

      window.position.set(
        x,
        y,
        z
      );

      scene.add(window);
    };

    addWindow(
      -7.2,
      1.5,
      -3.2
    );

    addWindow(
      -5,
      1.5,
      -3.2
    );

    addWindow(
      5,
      1.4,
      -3.2
    );

    addWindow(
      7.2,
      1.4,
      -3.2
    );

    /* RUINS */

    const createRuin = (
      x: number,
      z: number,
      scale: number
    ) => {
      const ruin = new THREE.Mesh(
        new THREE.BoxGeometry(
          2.4 * scale,
          1.5 * scale,
          2.4 * scale
        ),
        darkConcrete
      );

      ruin.position.set(
        x,
        0.75 * scale,
        z
      );

      ruin.rotation.z =
        (Math.random() - 0.5) *
        0.2;

      ruin.castShadow = true;

      scene.add(ruin);
    };

    createRuin(-10, -8, 1);
    createRuin(10, -8, 0.8);
    createRuin(-10, 8, 0.9);
    createRuin(10, 8, 1.1);

    /* WALL */

    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x30322f,
        roughness: 1,
      });

    const wallHeight = 2.5;

    const northWall =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          26,
          wallHeight,
          0.8
        ),
        wallMaterial
      );

    northWall.position.set(
      0,
      wallHeight / 2,
      -13
    );

    scene.add(northWall);

    const southWall =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          26,
          wallHeight,
          0.8
        ),
        wallMaterial
      );

    southWall.position.set(
      0,
      wallHeight / 2,
      13
    );

    scene.add(southWall);

    const westWall =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.8,
          wallHeight,
          26
        ),
        wallMaterial
      );

    westWall.position.set(
      -13,
      wallHeight / 2,
      0
    );

    scene.add(westWall);

    const eastWall =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.8,
          wallHeight,
          26
        ),
        wallMaterial
      );

    eastWall.position.set(
      13,
      wallHeight / 2,
      0
    );

    scene.add(eastWall);

    /* GATE */

    const gateLeft =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3,
          4,
          1
        ),
        wallMaterial
      );

    gateLeft.position.set(
      -2.5,
      2,
      13
    );

    scene.add(gateLeft);

    const gateRight =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3,
          4,
          1
        ),
        wallMaterial
      );

    gateRight.position.set(
      2.5,
      2,
      13
    );

    scene.add(gateRight);

    const gateRoof =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          8,
          1,
          1.3
        ),
        wallMaterial
      );

    gateRoof.position.set(
      0,
      4.3,
      13
    );

    scene.add(gateRoof);

    /* TREES */

    const createTree = (
      x: number,
      z: number,
      scale: number
    ) => {
      const trunk =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.18 * scale,
            0.25 * scale,
            1.8 * scale,
            7
          ),
          new THREE.MeshStandardMaterial({
            color: 0x40352a,
          })
        );

      trunk.position.set(
        x,
        0.9 * scale,
        z
      );

      scene.add(trunk);

      const crown =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            1.1 * scale,
            2.5 * scale,
            7
          ),
          vegetationMaterial
        );

      crown.position.set(
        x,
        2.4 * scale,
        z
      );

      crown.castShadow = true;

      scene.add(crown);
    };

    createTree(-11, -2, 1);
    createTree(11, -2, 0.8);
    createTree(-11, 2, 0.9);
    createTree(11, 2, 1.1);
    createTree(-8, -11, 0.8);
    createTree(8, -11, 1);

    /* RUBBLE */

    for (let i = 0; i < 35; i++) {
      const rubble =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.25 +
              Math.random() * 0.45,
            0.2 +
              Math.random() * 0.35,
            0.25 +
              Math.random() * 0.45
          ),
          darkConcrete
        );

      const x =
        (Math.random() - 0.5) *
        24;

      const z =
        (Math.random() - 0.5) *
        24;

      rubble.position.set(
        x,
        0.2,
        z
      );

      rubble.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
      );

      scene.add(rubble);
    }

    /* =========================
       BUILDING CLICK
    ========================= */

    const raycaster =
      new THREE.Raycaster();

    const pointer =
      new THREE.Vector2();

    const clickBuilding = (
      event: PointerEvent
    ) => {
      const rect =
        renderer.domElement.getBoundingClientRect();

      pointer.x =
        ((event.clientX - rect.left) /
          rect.width) *
          2 -
        1;

      pointer.y =
        -(
          (event.clientY - rect.top) /
            rect.height
        ) *
          2 +
        1;

      raycaster.setFromCamera(
        pointer,
        camera
      );

      const objects =
        raycaster.intersectObjects(
          scene.children,
          true
        );

      for (const hit of objects) {
        let object:
          | THREE.Object3D
          | null = hit.object;

        while (
          object &&
          !object.userData.buildingId
        ) {
          object = object.parent;
        }

        if (
          object &&
          object.userData.buildingId
        ) {
          const id =
            object.userData.buildingId;

          const names: Record<
            string,
            BuildingInfo
          > = {
            command: {
              id: "command",
              name: "COMMAND CENTER",
              icon: "🏢",
              description:
                "Главният център на града.",
              level:
                buildingLevels.command,
            },

            hospital: {
              id: "hospital",
              name: "HOSPITAL",
              icon: "🏥",
              description:
                "Лекува ранените войници.",
              level:
                buildingLevels.hospital,
            },

            barracks: {
              id: "barracks",
              name: "BARRACKS",
              icon: "🪖",
              description:
                "Обучава и поддържа войниците.",
              level:
                buildingLevels.barracks,
            },

            research: {
              id: "research",
              name: "RESEARCH CENTER",
              icon: "🔬",
              description:
                "Развива технологиите на града.",
              level:
                buildingLevels.research,
            },

            warehouse: {
              id: "warehouse",
              name: "WAREHOUSE",
              icon: "📦",
              description:
                "Съхранява ресурсите на града.",
              level:
                buildingLevels.warehouse,
            },
          };

          setSelectedBuilding(
            names[id]
          );

          return;
        }
      }
    };

    renderer.domElement.addEventListener(
      "pointerup",
      clickBuilding
    );

    /* CAMERA */

    let dragging = false;
    let previousX = 0;

    const pointerDown = (
      event: PointerEvent
    ) => {
      dragging = true;
      previousX =
        event.clientX;
    };

    const pointerUp = () => {
      dragging = false;
    };

    const pointerMove = (
      event: PointerEvent
    ) => {
      if (!dragging) return;

      const movement =
        event.clientX -
        previousX;

      scene.rotation.y +=
        movement * 0.006;

      previousX =
        event.clientX;
    };

    renderer.domElement.addEventListener(
      "pointerdown",
      pointerDown
    );

    renderer.domElement.addEventListener(
      "pointerup",
      pointerUp
    );

    renderer.domElement.addEventListener(
      "pointerleave",
      pointerUp
    );

    renderer.domElement.addEventListener(
      "pointermove",
      pointerMove
    );

    /* ANIMATION */

    let frame = 0;

    const animate = () => {
      frame =
        requestAnimationFrame(
          animate
        );

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    /* RESIZE */

    const resize = () => {
      camera.aspect =
        container.clientWidth /
        container.clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );
    };

    window.addEventListener(
      "resize",
      resize
    );

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        resize
      );

      renderer.domElement.removeEventListener(
        "pointerup",
        clickBuilding
      );

      renderer.domElement.removeEventListener(
        "pointerdown",
        pointerDown
      );

      renderer.domElement.removeEventListener(
        "pointerup",
        pointerUp
      );

      renderer.domElement.removeEventListener(
        "pointerleave",
        pointerUp
      );

      renderer.domElement.removeEventListener(
        "pointermove",
        pointerMove
      );

      renderer.dispose();

      if (
        container.contains(
          renderer.domElement
        )
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, [buildingLevels]);

  const upgradeBuilding = () => {
    if (!selectedBuilding) return;

    if (food < 200 || metal < 150) {
      return;
    }

    setFood(
      value => value - 200
    );

    setMetal(
      value => value - 150
    );

    setBuildingLevels(
      levels => ({
        ...levels,
        [selectedBuilding.id]:
          levels[
            selectedBuilding.id
          ] + 1,
      })
    );

    setSelectedBuilding(
      current =>
        current
          ? {
              ...current,
              level:
                current.level + 1,
            }
          : null
    );
  };

  const upgradeCity = () => {
    if (
      food < 100 ||
      metal < 100
    ) {
      return;
    }

    setFood(
      value => value - 100
    );

    setMetal(
      value => value - 100
    );

    setCityLevel(
      value => value + 1
    );
  };

  return (
    <main className="game">

      <header className="topbar">

        <div className="logo">
          AFTERFALL
        </div>

        <div className="resources">

          <span>
            🍖 {food}
          </span>

          <span>
            🔩 {metal}
          </span>

          <span>
            ⛽ {fuel}
          </span>

        </div>

      </header>

      <section className="game-area">

        <div
          ref={containerRef}
          className="city-canvas"
        />

        <div className="city-info">

          <div>
            CITY LEVEL {cityLevel}
          </div>

          <div className="city-name">
            NEW HOPE
          </div>

        </div>

        {selectedBuilding && (
          <div className="building-panel">

            <button
              className="close-panel"
              onClick={() =>
                setSelectedBuilding(
                  null
                )
              }
            >
              ✕
            </button>

            <div className="building-icon">
              {selectedBuilding.icon}
            </div>

            <h2>
              {selectedBuilding.name}
            </h2>

            <div className="building-level">
              LEVEL{" "}
              {selectedBuilding.level}
            </div>

            <p>
              {selectedBuilding.description}
            </p>

            <div className="upgrade-cost">
              <span>
                🍖 200
              </span>

              <span>
                🔩 150
              </span>
            </div>

            <button
              className="upgrade-button"
              onClick={
                upgradeBuilding
              }
            >
              UPGRADE
            </button>

          </div>
        )}

        {!selectedBuilding && (
          <div className="quest-panel">

            <h2>
              📜 FIRST QUEST
            </h2>

            <p>
              Възстанови разрушения
              град.
            </p>

            <button
              onClick={
                upgradeCity
              }
            >
              ВЪЗСТАНОВИ ГРАДА
            </button>

            <small>
              Необходими ресурси:
              <br />
              🍖 100 Food
              <br />
              🔩 100 Metal
            </small>

          </div>
        )}

      </section>

    </main>
  );
}