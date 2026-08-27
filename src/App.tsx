import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./styles.css";

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87927e);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );

    camera.position.set(0, 28, 32);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
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

    /* LIGHT */

    const ambient = new THREE.HemisphereLight(
      0xdde5d5,
      0x252b24,
      2
    );

    scene.add(ambient);

    const sun = new THREE.DirectionalLight(
      0xffe3b0,
      3
    );

    sun.position.set(30, 50, 20);
    sun.castShadow = true;

    scene.add(sun);

    /* TERRAIN */

    const terrainGeometry =
      new THREE.PlaneGeometry(
        100,
        100,
        30,
        30
      );

    const terrainMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x465342,
        roughness: 1,
      });

    const terrain = new THREE.Mesh(
      terrainGeometry,
      terrainMaterial
    );

    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;

    scene.add(terrain);

    /* ROAD */

    const roadMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x202321,
      });

    const road1 = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.08, 100),
      roadMaterial
    );

    road1.position.y = 0.04;

    scene.add(road1);

    const road2 = new THREE.Mesh(
      new THREE.BoxGeometry(100, 0.08, 12),
      roadMaterial
    );

    road2.position.y = 0.05;

    scene.add(road2);

    /* BUILDING FUNCTION */

    function createBuilding(
      x: number,
      z: number,
      width: number,
      height: number,
      depth: number,
      color: number
    ) {
      const group = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.8,
        })
      );

      body.position.y =
        height / 2;

      body.castShadow = true;
      body.receiveShadow = true;

      group.add(body);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(
          width + 0.6,
          0.5,
          depth + 0.6
        ),
        new THREE.MeshStandardMaterial({
          color: 0x292c28,
        })
      );

      roof.position.y =
        height + 0.25;

      roof.castShadow = true;

      group.add(roof);

      group.position.set(
        x,
        0,
        z
      );

      scene.add(group);

      return group;
    }

    /* CITY */

    createBuilding(
      0,
      0,
      9,
      7,
      8,
      0x70756d
    );

    createBuilding(
      -17,
      -12,
      7,
      4,
      7,
      0x66725d
    );

    createBuilding(
      17,
      -12,
      7,
      5,
      7,
      0x626961
    );

    createBuilding(
      -18,
      14,
      8,
      5,
      7,
      0x59645a
    );

    createBuilding(
      18,
      14,
      8,
      6,
      7,
      0x6b6e67
    );

    createBuilding(
      -32,
      0,
      6,
      3,
      6,
      0x50584f
    );

    createBuilding(
      32,
      0,
      6,
      4,
      6,
      0x50584f
    );

    /* WATER TOWER */

    const tower = new THREE.Group();

    const towerBody =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          1.2,
          1.5,
          6,
          16
        ),
        new THREE.MeshStandardMaterial({
          color: 0x555b55,
        })
      );

    towerBody.position.y = 3;

    tower.add(towerBody);

    const tank =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          2.4,
          2.4,
          2,
          20
        ),
        new THREE.MeshStandardMaterial({
          color: 0x77776e,
        })
      );

    tank.position.y = 6.5;

    tower.add(tank);

    tower.position.set(
      27,
      0,
      -25
    );

    scene.add(tower);

    /* TREES */

    function createTree(
      x: number,
      z: number
    ) {
      const tree =
        new THREE.Group();

      const trunk =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.3,
            0.4,
            2,
            8
          ),
          new THREE.MeshStandardMaterial({
            color: 0x40362b,
          })
        );

      trunk.position.y = 1;

      tree.add(trunk);

      const leaves =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            2,
            5,
            8
          ),
          new THREE.MeshStandardMaterial({
            color: 0x273b29,
          })
        );

      leaves.position.y = 4;

      tree.add(leaves);

      tree.position.set(
        x,
        0,
        z
      );

      tree.scale.setScalar(
        0.7 + Math.random() * 0.5
      );

      scene.add(tree);
    }

    for (let i = 0; i < 45; i++) {
      const x =
        (Math.random() - 0.5) * 90;

      const z =
        (Math.random() - 0.5) * 90;

      if (
        Math.abs(x) < 25 &&
        Math.abs(z) < 25
      ) {
        continue;
      }

      createTree(x, z);
    }

    /* MOVING VEHICLE */

    const vehicle =
      new THREE.Group();

    const vehicleBody =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          3.2,
          1,
          5
        ),
        new THREE.MeshStandardMaterial({
          color: 0x303a31,
        })
      );

    vehicleBody.position.y = 1;

    vehicle.add(vehicleBody);

    const vehicleTop =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.2,
          0.8,
          2
        ),
        new THREE.MeshStandardMaterial({
          color: 0x252b26,
        })
      );

    vehicleTop.position.y = 1.8;

    vehicle.add(vehicleTop);

    const wheels: THREE.Mesh[] = [];

    for (const x of [-1.7, 1.7]) {
      for (const z of [-1.5, 1.5]) {
        const wheel =
          new THREE.Mesh(
            new THREE.CylinderGeometry(
              0.65,
              0.65,
              0.45,
              16
            ),
            new THREE.MeshStandardMaterial({
              color: 0x151716,
            })
          );

        wheel.rotation.z =
          Math.PI / 2;

        wheel.position.set(
          x,
          0.65,
          z
        );

        vehicle.add(wheel);
        wheels.push(wheel);
      }
    }

    vehicle.position.set(
      -45,
      0,
      0
    );

    scene.add(vehicle);

    /* CAMERA DRAG */

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (
      event: PointerEvent
    ) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onPointerUp = () => {
      dragging = false;
    };

    const onPointerMove = (
      event: PointerEvent
    ) => {
      if (!dragging) return;

      const dx =
        event.clientX - lastX;

      const dy =
        event.clientY - lastY;

      camera.position.x -=
        dx * 0.04;

      camera.position.z +=
        dy * 0.04;

      camera.lookAt(
        camera.position.x,
        0,
        camera.position.z - 20
      );

      lastX = event.clientX;
      lastY = event.clientY;
    };

    renderer.domElement.addEventListener(
      "pointerdown",
      onPointerDown
    );

    renderer.domElement.addEventListener(
      "pointerup",
      onPointerUp
    );

    renderer.domElement.addEventListener(
      "pointermove",
      onPointerMove
    );

    /* ZOOM */

    const onWheel = (
      event: WheelEvent
    ) => {
      event.preventDefault();

      camera.position.y +=
        event.deltaY * 0.025;

      camera.position.z +=
        event.deltaY * 0.035;

      camera.position.y =
        THREE.MathUtils.clamp(
          camera.position.y,
          12,
          65
        );

      camera.position.z =
        THREE.MathUtils.clamp(
          camera.position.z,
          12,
          70
        );

      camera.lookAt(0, 0, 0);
    };

    renderer.domElement.addEventListener(
      "wheel",
      onWheel,
      { passive: false }
    );

    /* ANIMATION */

    let animationId = 0;

    const clock =
      new THREE.Clock();

    const animate = () => {
      animationId =
        requestAnimationFrame(
          animate
        );

      const time =
        clock.getElapsedTime();

      vehicle.position.x =
        -45 +
        ((time * 5) % 90);

      vehicle.position.y =
        Math.sin(time * 5) * 0.03;

      wheels.forEach(
        (wheel) => {
          wheel.rotation.x +=
            0.15;
        }
      );

      tower.rotation.y =
        Math.sin(time * 0.2) *
        0.03;

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    /* RESIZE */

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
        animationId
      );

      window.removeEventListener(
        "resize",
        resize
      );

      renderer.domElement.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      renderer.domElement.removeEventListener(
        "pointerup",
        onPointerUp
      );

      renderer.domElement.removeEventListener(
        "pointermove",
        onPointerMove
      );

      renderer.domElement.removeEventListener(
        "wheel",
        onWheel
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

  return (
    <div className="game">

      <div
        ref={mountRef}
        className="game-world"
      />

      <header className="hud">

        <div className="logo">
          AFTERFALL
          <small>NEW HOPE</small>
        </div>

        <div className="resources">

          <span>🍖 1,000</span>
          <span>🔩 800</span>
          <span>⛽ 500</span>
          <span>⚡ 200</span>

        </div>

        <div className="city-level">
          CITY
          <b>1</b>
        </div>

      </header>

      <div className="location">
        NEW HOPE
        <small>SURVIVOR SETTLEMENT</small>
      </div>

      <nav className="bottom-menu">

        <button>CITY</button>
        <button>ARMY</button>
        <button>RESEARCH</button>
        <button>WORLD</button>
        <button>WAR</button>

      </nav>

    </div>
  );
}