import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cityLevel, setCityLevel] = useState(1);
  const [food, setFood] = useState(500);
  const [metal, setMetal] = useState(300);
  const [fuel] = useState(200);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x18201c);

    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );

    camera.position.set(15, 15, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    /* =========================
       LIGHTING
    ========================= */

    const ambient = new THREE.HemisphereLight(
      0xcbd5c2,
      0x30352d,
      2
    );

    scene.add(ambient);

    const sun = new THREE.DirectionalLight(
      0xffe5bd,
      3
    );

    sun.position.set(15, 25, 10);
    sun.castShadow = true;

    scene.add(sun);

    /* =========================
       MATERIALS
    ========================= */

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
        metalness: 0.1,
        roughness: 0.35,
      });

    const vegetationMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x293d2b,
        roughness: 1,
      });

    /* =========================
       GROUND
    ========================= */

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.4, 30),
      groundMaterial
    );

    ground.position.y = -0.2;
    ground.receiveShadow = true;

    scene.add(ground);

    /* =========================
       ROADS
    ========================= */

    const roadVertical = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.08, 30),
      roadMaterial
    );

    roadVertical.position.y = 0.04;

    scene.add(roadVertical);

    const roadHorizontal = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.08, 3.5),
      roadMaterial
    );

    roadHorizontal.position.y = 0.05;

    scene.add(roadHorizontal);

    /* =========================
       ROAD MARKINGS
    ========================= */

    for (let i = -13; i <= 13; i += 2.5) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.03, 1.1),
        new THREE.MeshStandardMaterial({
          color: 0xa19d83,
        })
      );

      line.position.set(0, 0.11, i);

      scene.add(line);
    }

    for (let i = -13; i <= 13; i += 2.5) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.03, 0.18),
        new THREE.MeshStandardMaterial({
          color: 0xa19d83,
        })
      );

      line.position.set(i, 0.12, 0);

      scene.add(line);
    }

    /* =========================
       BUILDING FUNCTION
    ========================= */

    const building = (
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

      scene.add(mesh);

      return mesh;
    };

    /* =========================
       COMMAND CENTER
    ========================= */

    const command = building(
      0,
      0,
      4.8,
      3.4,
      4.8,
      concreteMaterial
    );

    const commandRoof = new THREE.Mesh(
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

    commandRoof.castShadow = true;

    scene.add(commandRoof);

    /* =========================
       COMMAND TOWER
    ========================= */

    const tower = building(
      0,
      -3,
      1.2,
      5,
      1.2,
      metalMaterial
    );

    const towerTop =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.7,
          0.7,
          0.5,
          8
        ),
        metalMaterial
      );

    towerTop.position.set(
      0,
      5.3,
      -3
    );

    scene.add(towerTop);

    /* =========================
       HOSPITAL
    ========================= */

    building(
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

    scene.add(hospitalRoof);

    /* =========================
       BARRACKS
    ========================= */

    building(
      6,
      -5,
      4,
      2.4,
      3.5,
      darkConcrete
    );

    /* =========================
       RESEARCH CENTER
    ========================= */

    building(
      -6,
      5,
      4,
      3,
      3.5,
      concreteMaterial
    );

    /* =========================
       WAREHOUSE
    ========================= */

    building(
      6,
      5,
      4.5,
      2.1,
      3.5,
      darkConcrete
    );

    /* =========================
       WINDOWS
    ========================= */

    const addWindow = (
      x: number,
      y: number,
      z: number
    ) => {
      const window = new THREE.Mesh(
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

    addWindow(-7.2, 1.5, -3.2);
    addWindow(-5, 1.5, -3.2);
    addWindow(5, 1.4, -3.2);
    addWindow(7.2, 1.4, -3.2);

    /* =========================
       RUINS
    ========================= */

    const ruin = (
      x: number,
      z: number,
      scale: number
    ) => {
      const base = building(
        x,
        z,
        2.4 * scale,
        1.5 * scale,
        2.4 * scale,
        darkConcrete
      );

      base.rotation.y =
        (Math.random() - 0.5) * 0.25;

      base.rotation.z =
        (Math.random() - 0.5) * 0.15;

      return base;
    };

    ruin(-10, -8, 1);
    ruin(10, -8, 0.8);
    ruin(-10, 8, 0.9);
    ruin(10, 8, 1.1);

    /* =========================
       CITY WALL
    ========================= */

    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x30322f,
        roughness: 1,
      });

    const wallHeight = 2.5;

    const northWall = new THREE.Mesh(
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

    northWall.castShadow = true;

    scene.add(northWall);

    const southWall = new THREE.Mesh(
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

    southWall.castShadow = true;

    scene.add(southWall);

    const westWall = new THREE.Mesh(
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

    westWall.castShadow = true;

    scene.add(westWall);

    const eastWall = new THREE.Mesh(
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

    eastWall.castShadow = true;

    scene.add(eastWall);

    /* =========================
       GATE
    ========================= */

    const gateLeft = new THREE.Mesh(
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

    const gateRight = new THREE.Mesh(
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

    const gateRoof = new THREE.Mesh(
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

    /* =========================
       TREES
    ========================= */

    const createTree = (
      x: number,
      z: number,
      scale: number
    ) => {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.18 * scale,
          0.25 * scale,
          1.8 * scale,
          7
        ),
        new THREE.MeshStandardMaterial({
          color: 0x40352a
        })
      );

      trunk.position.set(
        x,
        0.9 * scale,
        z
      );

      trunk.castShadow = true;

      scene.add(trunk);

      const crown = new THREE.Mesh(
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

    /* =========================
       RUBBLE
    ========================= */

    for (let i = 0; i < 35; i++) {
      const rubble = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.25 + Math.random() * 0.45,
          0.2 + Math.random() * 0.35,
          0.25 + Math.random() * 0.45
        ),
        darkConcrete
      );

      const x =
        (Math.random() - 0.5) * 24;

      const z =
        (Math.random() - 0.5) * 24;

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

      rubble.castShadow = true;

      scene.add(rubble);
    }

    /* =========================
       CAMERA CONTROL
    ========================= */

    let dragging = false;
    let previousX = 0;

    const pointerDown = (
      event: PointerEvent
    ) => {
      dragging = true;
      previousX = event.clientX;
    };

    const pointerUp = () => {
      dragging = false;
    };

    const pointerMove = (
      event: PointerEvent
    ) => {
      if (!dragging) return;

      const movement =
        event.clientX - previousX;

      scene.rotation.y +=
        movement * 0.006;

      previousX = event.clientX;
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

    /* =========================
       ANIMATION
    ========================= */

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

    /* =========================
       RESIZE
    ========================= */

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
  }, []);

  const upgradeCity = () => {
    if (food < 100 || metal < 100) {
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

          <span>🍖 {food}</span>

          <span>🔩 {metal}</span>

          <span>⛽ {fuel}</span>

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

        <div className="quest-panel">

          <h2>
            📜 FIRST QUEST
          </h2>

          <p>
            Възстанови разрушения
            град.
          </p>

          <button
            onClick={upgradeCity}
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

      </section>

    </main>
  );
}