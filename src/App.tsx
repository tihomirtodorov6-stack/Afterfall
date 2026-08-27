import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./styles.css";
type Building = {
  id: string;
  name: string;
  icon: string;
  level: number;
  x: number;
  z: number;
  color: number;
};
const BUILDINGS: Building[] = [
  { id: "command", name: "COMMAND CENTER", icon: "🏢", level: 3, x: 0, z: 0, color: 0x667064 },
  { id: "farm", name: "FARM", icon: "🌾", level: 2, x: -7, z: -4, color: 0x65704b },
  { id: "metal", name: "METAL FACTORY", icon: "⛏️", level: 1, x: 7, z: -4, color: 0x59615f },
  { id: "refinery", name: "REFINERY", icon: "🛢️", level: 1, x: 7, z: 4, color: 0x57514a },
  { id: "power", name: "POWER PLANT", icon: "⚡", level: 1, x: -7, z: 4, color: 0x655d43 },
  { id: "vehicle", name: "VEHICLE FACTORY", icon: "🚙", level: 2, x: 4, z: 7, color: 0x4f5b55 },
  { id: "weapons", name: "WEAPONS FACTORY", icon: "🔫", level: 1, x: -4, z: 7, color: 0x554d4a },
  { id: "barracks", name: "BARRACKS", icon: "🪖", level: 1, x: -10, z: 8, color: 0x53604f },
  { id: "hospital", name: "HOSPITAL", icon: "🏥", level: 1, x: 10, z: 8, color: 0x6a6258 },
  { id: "research", name: "RESEARCH CENTER", icon: "🔬", level: 1, x: -10, z: -8, color: 0x4e5e65 },
  { id: "warehouse", name: "WAREHOUSE", icon: "📦", level: 1, x: 10, z: -8, color: 0x66584c },
];
function createBuilding(data: Building) {
  const group = new THREE.Group();
  group.position.set(data.x, 0, data.z);
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(
      data.id === "command" ? 4.5 : 3.2,
      data.id === "command" ? 3.2 : 2.4,
      data.id === "command" ? 4.5 : 3.2
    ),
    new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.85,
    })
  );
  base.position.y = data.id === "command" ? 1.6 : 1.2;
  group.add(base);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(
      data.id === "command" ? 3.3 : 2.4,
      1.4,
      4
    ),
    new THREE.MeshStandardMaterial({
      color: 0x292d29,
      roughness: 1,
    })
  );
  roof.position.y = data.id === "command" ? 3.8 : 3;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 1.2, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x181b18,
    })
  );
  door.position.set(0, 0.6, data.id === "command" ? 2.28 : 1.63);
  group.add(door);
  if (
    data.id === "factory" ||
    data.id === "metal" ||
    data.id === "refinery" ||
    data.id === "power" ||
    data.id === "vehicle" ||
    data.id === "weapons"
  ) {
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 2, 8),
      new THREE.MeshStandardMaterial({
        color: 0x303431,
      })
    );
    chimney.position.set(0.9, 3.3, -0.8);
    group.add(chimney);
  }
  group.userData = data;
  return group;
}
export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [selected, setSelected] = useState<Building | null>(null);
  const [resources, setResources] = useState({
    food: 1256,
    metal: 419,
    fuel: 1603,
    energy: 2383,
  });
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x172019);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(
      48,
      mountRef.current.clientWidth /
        mountRef.current.clientHeight,
      0.1,
      200
    );
    camera.position.set(25, 27, 25);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    const ambient = new THREE.HemisphereLight(
      0xb8c4b5,
      0x20251f,
      2.2
    );
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(
      0xffe0aa,
      3
    );
    sun.position.set(20, 35, 15);
    sun.castShadow = true;
    scene.add(sun);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      new THREE.MeshStandardMaterial({
        color: 0x344235,
        roughness: 1,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const roadMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x191d1a,
        roughness: 1,
      });
    const road1 = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.08, 70),
      roadMaterial
    );
    road1.position.y = 0.04;
    scene.add(road1);
    const road2 = new THREE.Mesh(
      new THREE.BoxGeometry(70, 0.08, 7),
      roadMaterial
    );
    road2.position.y = 0.05;
    scene.add(road2);
    const buildings: THREE.Group[] = [];
    BUILDINGS.forEach((data) => {
      const building = createBuilding(data);
      building.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(building);
      buildings.push(building);
    });
    const trees: THREE.Mesh[] = [];
    for (let i = 0; i < 35; i++) {
      const tree = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 2.8, 7),
        new THREE.MeshStandardMaterial({
          color: 0x263728,
        })
      );
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      if (Math.abs(x) < 14 && Math.abs(z) < 14) {
        continue;
      }
      tree.position.set(x, 1.4, z);
      scene.add(tree);
      trees.push(tree);
    }
    const soldiers: THREE.Group[] = [];
    for (let i = 0; i < 8; i++) {
      const soldier = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18, 0.55, 4, 8),
        new THREE.MeshStandardMaterial({
          color: 0x5b674e,
        })
      );
      body.position.y = 0.55;
      soldier.add(body);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xb58d70,
        })
      );
      head.position.y = 1.05;
      soldier.add(head);
      soldier.position.set(
        (Math.random() - 0.5) * 10,
        0,
        (Math.random() - 0.5) * 10
      );
      scene.add(soldier);
      soldiers.push(soldier);
    }
    const zombies: THREE.Group[] = [];
    for (let i = 0; i < 12; i++) {
      const zombie = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.2, 0.65, 4, 8),
        new THREE.MeshStandardMaterial({
          color: 0x4e6250,
        })
      );
      body.position.y = 0.6;
      zombie.add(body);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0x71816c,
        })
      );
      head.position.y = 1.12;
      zombie.add(head);
      zombie.position.set(
        (Math.random() - 0.5) * 35,
        0,
        (Math.random() - 0.5) * 35
      );
      scene.add(zombie);
      zombies.push(zombie);
    }
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const click = (event: MouseEvent) => {
      const rect =
        renderer.domElement.getBoundingClientRect();
      mouse.x =
        ((event.clientX - rect.left) /
          rect.width) *
          2 -
        1;
      mouse.y =
        -(
          (event.clientY - rect.top) /
          rect.height
        ) *
          2 +
        1;
      raycaster.setFromCamera(
        mouse,
        camera
      );
      const hits =
        raycaster.intersectObjects(
          buildings,
          true
        );
      if (!hits.length) return;
      let object:
        | THREE.Object3D
        | null =
        hits[0].object;
      while (
        object &&
        !object.userData?.id
      ) {
        object = object.parent;
      }
      if (object?.userData?.id) {
        setSelected(
          object.userData as Building
        );
      }
    };
    renderer.domElement.addEventListener(
      "click",
      click
    );
    let animationFrame = 0;
    const animate = () => {
      animationFrame =
        requestAnimationFrame(
          animate
        );
      const time =
        performance.now() * 0.001;
      buildings.forEach(
        (building, index) => {
          building.position.y =
            Math.sin(
              time * 1.5 + index
            ) * 0.015;
        }
      );
      soldiers.forEach(
        (soldier, index) => {
          const angle =
            time * 0.25 +
            index;
          soldier.position.x =
            Math.sin(angle) * 7;
          soldier.position.z =
            Math.cos(angle) * 7;
          soldier.rotation.y =
            angle;
        }
      );
      zombies.forEach(
        (zombie, index) => {
          const angle =
            time * 0.12 +
            index;
          zombie.position.x =
            Math.sin(angle) * 20;
          zombie.position.z =
            Math.cos(angle) * 20;
          zombie.rotation.y =
            angle + Math.PI;
        }
      );
      renderer.render(
        scene,
        camera
      );
    };
    animate();
    const resize = () => {
      if (!mountRef.current) return;
      camera.aspect =
        mountRef.current.clientWidth /
        mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
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
        "click",
        click
      );
      renderer.dispose();
      if (
        mountRef.current?.contains(
          renderer.domElement
        )
      ) {
        mountRef.current.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setResources((current) => ({
        food: current.food + 3,
        metal: current.metal + 2,
        fuel: current.fuel + 1,
        energy: current.energy + 3,
      }));
    }, 1000);
    return () =>
      window.clearInterval(timer);
  }, []);
  return (
    <main className="game">
      <header className="topbar">
        <div className="logo">
          <strong>AFTERFALL</strong>
          <small>NEW HOPE</small>
        </div>
        <div className="resources">
          <div>🍖 {resources.food}</div>
          <div>🔩 {resources.metal}</div>
          <div>⛽ {resources.fuel}</div>
          <div>⚡ {resources.energy}</div>
        </div>
        <div className="city-level">
          CITY
          <b>3</b>
        </div>
      </header>
      <section className="world">
        <div
          ref={mountRef}
          className="three-container"
        />
        <div className="location">
          <strong>NEW HOPE</strong>
          <span>SURVIVOR SETTLEMENT</span>
        </div>
        {selected && (
          <div className="building-info">
            <div className="building-title">
              <span>{selected.icon}</span>
              <div>
                <strong>
                  {selected.name}
                </strong>
                <small>
                  LEVEL {selected.level}
                </small>
              </div>
            </div>
            <button
              onClick={() =>
                setSelected(null)
              }
            >
              CLOSE
            </button>
          </div>
        )}
      </section>
      <nav className="nav">
        <button className="active">
          🏙️
          <span>CITY</span>
        </button>
        <button>
          🪖
          <span>ARMY</span>
        </button>
        <button>
          🔬
          <span>RESEARCH</span>
        </button>
        <button>
          🌍
          <span>WORLD</span>
        </button>
        <button>
          ⚔️
          <span>WAR</span>
        </button>
      </nav>
    </main>
  );
}