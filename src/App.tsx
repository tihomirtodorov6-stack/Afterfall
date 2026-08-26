import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cityLevel, setCityLevel] = useState(1);
  const [food, setFood] = useState(500);
  const [metal, setMetal] = useState(300);
  const [fuel, setFuel] = useState(200);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x11151a);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    camera.position.set(10, 9, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    /*
     * LIGHT
     */

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.8
      );

    scene.add(ambientLight);

    const sun =
      new THREE.DirectionalLight(
        0xffffff,
        2.5
      );

    sun.position.set(
      10,
      20,
      10
    );

    sun.castShadow = true;

    scene.add(sun);

    /*
     * GROUND
     */

    const ground =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          24,
          0.5,
          24
        ),
        new THREE.MeshStandardMaterial({
          color: 0x30352f
        })
      );

    ground.position.y = -0.25;

    ground.receiveShadow = true;

    scene.add(ground);

    /*
     * ROAD
     */

    const road =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3,
          0.05,
          24
        ),
        new THREE.MeshStandardMaterial({
          color: 0x202020
        })
      );

    road.position.y = 0.03;

    scene.add(road);

    const road2 =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          24,
          0.05,
          3
        ),
        new THREE.MeshStandardMaterial({
          color: 0x202020
        })
      );

    road2.position.y = 0.04;

    scene.add(road2);

    /*
     * CITY BUILDING FUNCTION
     */

    const createBuilding = (
      x: number,
      z: number,
      width: number,
      height: number,
      depth: number,
      color: number
    ) => {
      const building =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            width,
            height,
            depth
          ),
          new THREE.MeshStandardMaterial({
            color
          })
        );

      building.position.set(
        x,
        height / 2,
        z
      );

      building.castShadow = true;

      building.receiveShadow = true;

      scene.add(building);

      return building;
    };

    /*
     * COMMAND CENTER
     */

    createBuilding(
      0,
      0,
      4,
      3,
      4,
      0x555555
    );

    /*
     * HOSPITAL
     */

    createBuilding(
      -5,
      -4,
      3,
      2,
      3,
      0x6b6b6b
    );

    /*
     * BARRACKS
     */

    createBuilding(
      5,
      -4,
      3,
      2,
      3,
      0x505050
    );

    /*
     * RESEARCH CENTER
     */

    createBuilding(
      -5,
      4,
      3,
      2.5,
      3,
      0x464646
    );

    /*
     * WAREHOUSE
     */

    createBuilding(
      5,
      4,
      3,
      1.8,
      3,
      0x3f3f3f
    );

    /*
     * RUINED BUILDINGS
     */

    const ruin1 =
      createBuilding(
        -9,
        -7,
        2,
        2,
        2,
        0x292929
      );

    ruin1.rotation.z =
      -0.12;

    const ruin2 =
      createBuilding(
        9,
        -7,
        2,
        1.5,
        2,
        0x252525
      );

    ruin2.rotation.z =
      0.08;

    const ruin3 =
      createBuilding(
        -9,
        7,
        2,
        2.5,
        2,
        0x303030
      );

    ruin3.rotation.z =
      -0.1;

    /*
     * CITY WALL
     */

    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x242424
      });

    const wallNorth =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          22,
          2,
          0.7
        ),
        wallMaterial
      );

    wallNorth.position.set(
      0,
      1,
      -10
    );

    wallNorth.castShadow = true;

    scene.add(wallNorth);

    const wallSouth =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          22,
          2,
          0.7
        ),
        wallMaterial
      );

    wallSouth.position.set(
      0,
      1,
      10
    );

    wallSouth.castShadow = true;

    scene.add(wallSouth);

    const wallWest =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.7,
          2,
          22
        ),
        wallMaterial
      );

    wallWest.position.set(
      -10,
      1,
      0
    );

    wallWest.castShadow = true;

    scene.add(wallWest);

    const wallEast =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.7,
          2,
          22
        ),
        wallMaterial
      );

    wallEast.position.set(
      10,
      1,
      0
    );

    wallEast.castShadow = true;

    scene.add(wallEast);

    /*
     * CAMERA TOUCH ROTATION
     */

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

      const difference =
        event.clientX -
        previousX;

      scene.rotation.y +=
        difference * 0.006;

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

    /*
     * ANIMATION
     */

    let animationFrame = 0;

    const animate = () => {
      animationFrame =
        requestAnimationFrame(
          animate
        );

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    /*
     * RESIZE
     */

    const resize = () => {
      if (!container) return;

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
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        resize
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
  }, []);

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