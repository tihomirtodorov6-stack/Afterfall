import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./styles.css";
type BuildingType =
  | "command"
  | "farm"
  | "metal"
  | "refinery"
  | "power"
  | "barracks"
  | "hospital"
  | "research"
  | "warehouse"
  | "weapons"
  | "vehicle";
type Building = {
  id: BuildingType;
  name: string;
  level: number;
  x: number;
  z: number;
};
const buildings: Building[] = [
  { id: "command", name: "COMMAND CENTER", level: 1, x: 0, z: 0 },
  { id: "farm", name: "FARM", level: 2, x: -9, z: -5 },
  { id: "metal", name: "METAL FACTORY", level: 1, x: 9, z: -5 },
  { id: "refinery", name: "REFINERY", level: 1, x: -9, z: 5 },
  { id: "power", name: "POWER PLANT", level: 1, x: 9, z: 5 },
  { id: "barracks", name: "BARRACKS", level: 1, x: -5, z: 10 },
  { id: "hospital", name: "HOSPITAL", level: 1, x: 5, z: 10 },
  { id: "research", name: "RESEARCH CENTER", level: 1, x: -13, z: 11 },
  { id: "warehouse", name: "WAREHOUSE", level: 1, x: 13, z: 11 },
  { id: "weapons", name: "WEAPONS FACTORY", level: 0, x: -14, z: -11 },
  { id: "vehicle", name: "VEHICLE FACTORY", level: 0, x: 14, z: -11 },
];
function createBuilding(building: Building) {
  const group = new THREE.Group();
  const level = Math.max(1, building.level);
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 1.2, 3.4),
    new THREE.MeshStandardMaterial({
      color: 0x555c58,
      roughness: 0.85,
    })
  );
  base.position.y = 0.6;
  group.add(base);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 2.8 + level * 0.15, 2.8),
    new THREE.MeshStandardMaterial({
      color:
        building.id === "command"
          ? 0x6d6250
          : 0x464e4a,
      roughness: 0.8,
    })
  );
  body.position.y = 2.3;
  group.add(body);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.7, 1.2, 4),
    new THREE.MeshStandardMaterial({
      color: 0x292e2b,
      roughness: 0.9,
    })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.2;
  group.add(roof);
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 1.4, 0.15),
    new THREE.MeshStandardMaterial({
      color: 0x171b19,
    })
  );
  door.position.set(0, 1.35, 1.43);
  group.add(door);
  for (let i = 0; i < 3; i++) {
    const window = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.55, 0.12),
      new THREE.MeshStandardMaterial({
        color: 0x87938c,
        emissive: 0x17201c,
        emissiveIntensity: 0.35,
      })
    );
    window.position.set(
      -1.15 + i * 1.15,
      2.7,
      1.43
    );
    group.add(window);
  }
  if (building.id === "command") {
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 3.2, 0.55),
      new THREE.MeshStandardMaterial({
        color: 0x303632,
      })
    );
    tower.position.y = 5.3;
    group.add(tower);
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.05,
        0.05,
        2.4,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0x9d9f95,
      })
    );
    antenna.position.y = 8;
    group.add(antenna);
  }
  group.position.set(
    building.x,
    0,
    building.z
  );
  group.userData.buildingId = building.id;
  return group;
}
function createPerson(
  x: number,
  z: number,
  color: number
) {
  const person = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 0.55, 4, 8),
    new THREE.MeshStandardMaterial({
      color,
    })
  );
  body.position.y = 0.65;
  person.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xc49a76,
    })
  );
  head.position.y = 1.15;
  person.add(head);
  person.position.set(x, 0, z);
  person.userData.speed =
    0.4 + Math.random() * 0.5;
  person.userData.offset =
    Math.random() * Math.PI * 2;
  return person;
}
function createZombie(
  x: number,
  z: number
) {
  const zombie = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.65, 4, 8),
    new THREE.MeshStandardMaterial({
      color: 0x52634d,
    })
  );
  body.position.y = 0.7;
  zombie.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0x70836a,
    })
  );
  head.position.y = 1.3;
  zombie.add(head);
  zombie.position.set(x, 0, z);
  zombie.userData.angle =
    Math.random() * Math.PI * 2;
  zombie.userData.radius =
    16 + Math.random() * 8;
  zombie.userData.speed =
    0.15 + Math.random() * 0.2;
  return zombie;
}
export default function App() {
  const mountRef =
    useRef<HTMLDivElement>(null);
  const sceneRef =
    useRef<THREE.Scene | null>(null);
  const cameraRef =
    useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef =
    useRef<THREE.WebGLRenderer | null>(null);
  const [selected, setSelected] =
    useState<Building | null>(null);
  const [food, setFood] =
    useState(1250);
  const [metal, setMetal] =
    useState(900);
  const [fuel, setFuel] =
    useState(500);
  const [energy, setEnergy] =
    useState(300);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background =
      new THREE.Color(0x8d948b);
    scene.fog = new THREE.Fog(
      0x8d948b,
      30,
      75
    );
    sceneRef.current = scene;
    const camera =
      new THREE.PerspectiveCamera(
        45,
        mount.clientWidth /
          mount.clientHeight,
        0.1,
        200
      );
    camera.position.set(
      27,
      30,
      34
    );
    camera.lookAt(
      0,
      0,
      2
    );
    cameraRef.current = camera;
    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
      });
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );
    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight
    );
    renderer.shadowMap.enabled = true;
    mount.appendChild(
      renderer.domElement
    );
    rendererRef.current =
      renderer;
    const ambient =
      new THREE.HemisphereLight(
        0xc8d0c8,
        0x252925,
        2
      );
    scene.add(ambient);
    const sun =
      new THREE.DirectionalLight(
        0xffe0ad,
        3
      );
    sun.position.set(
      -20,
      35,
      15
    );
    sun.castShadow = true;
    scene.add(sun);
    const ground =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          100,
          100
        ),
        new THREE.MeshStandardMaterial({
          color: 0x3f513f,
          roughness: 1,
        })
      );
    ground.rotation.x =
      -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const roadMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x252a27,
        roughness: 0.95,
      });
    const road1 =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          7,
          70
        ),
        roadMaterial
      );
    road1.rotation.x =
      -Math.PI / 2;
    road1.position.y = 0.02;
    scene.add(road1);
    const road2 =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          70,
          7
        ),
        roadMaterial
      );
    road2.rotation.x =
      -Math.PI / 2;
    road2.position.y = 0.03;
    scene.add(road2);
    buildings.forEach(
      (building) => {
        if (building.level <= 0)
          return;
        const mesh =
          createBuilding(
            building
          );
        mesh.traverse(
          (object) => {
            if (
              object instanceof
              THREE.Mesh
            ) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
          }
        );
        scene.add(mesh);
      }
    );
    const people: THREE.Group[] =
      [];
    for (
      let i = 0;
      i < 14;
      i++
    ) {
      const person =
        createPerson(
          -14 +
            Math.random() * 28,
          -14 +
            Math.random() * 28,
          i % 3 === 0
            ? 0x384b3b
            : 0x6b5540
        );
      scene.add(person);
      people.push(person);
    }
    const zombies: THREE.Group[] =
      [];
    for (
      let i = 0;
      i < 8;
      i++
    ) {
      const zombie =
        createZombie(
          -25 +
            Math.random() * 50,
          -25 +
            Math.random() * 50
        );
      scene.add(zombie);
      zombies.push(zombie);
    }
    const trees: THREE.Group[] =
      [];
    for (
      let i = 0;
      i < 25;
      i++
    ) {
      const tree =
        new THREE.Group();
      const trunk =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.2,
            0.3,
            1.4,
            7
          ),
          new THREE.MeshStandardMaterial({
            color: 0x493b2b,
          })
        );
      trunk.position.y =
        0.7;
      tree.add(trunk);
      const crown =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            1.1,
            3,
            7
          ),
          new THREE.MeshStandardMaterial({
            color: 0x263d2a,
          })
        );
      crown.position.y =
        2.5;
      tree.add(crown);
      tree.position.set(
        -28 +
          Math.random() * 56,
        0,
        -28 +
          Math.random() * 56
      );
      const distance =
        Math.sqrt(
          tree.position.x *
            tree.position.x +
            tree.position.z *
              tree.position.z
        );
      if (distance > 18) {
        scene.add(tree);
        trees.push(tree);
      }
    }
    const raycaster =
      new THREE.Raycaster();
    const pointer =
      new THREE.Vector2();
    const onPointerDown = (
      event: PointerEvent
    ) => {
      const rect =
        renderer.domElement.getBoundingClientRect();
      pointer.x =
        ((event.clientX -
          rect.left) /
          rect.width) *
          2 -
        1;
      pointer.y =
        -(
          (event.clientY -
            rect.top) /
          rect.height
        ) *
          2 +
        1;
      raycaster.setFromCamera(
        pointer,
        camera
      );
      const hits =
        raycaster.intersectObjects(
          scene.children,
          true
        );
      for (const hit of hits) {
        let object:
          | THREE.Object3D
          | null =
          hit.object;
        while (
          object &&
          !object.userData
            .buildingId
        ) {
          object =
            object.parent;
        }
        if (
          object &&
          object.userData
            .buildingId
        ) {
          const building =
            buildings.find(
              (item) =>
                item.id ===
                object!.userData
                  .buildingId
            );
          if (building) {
            setSelected(
              building
            );
          }
          break;
        }
      }
    };
    renderer.domElement.addEventListener(
      "pointerdown",
      onPointerDown
    );
    let animationFrame = 0;
    const clock =
      new THREE.Clock();
    const animate = () => {
      const elapsed =
        clock.getElapsedTime();
      people.forEach(
        (person, index) => {
          const angle =
            elapsed *
              person.userData
                .speed +
            person.userData
              .offset;
          person.position.x =
            Math.cos(angle) *
              (5 +
                (index % 3) * 2);
          person.position.z =
            Math.sin(angle) *
              (5 +
                (index % 3) * 2);
          person.position.y =
            Math.abs(
              Math.sin(
                elapsed * 5 +
                  index
              )
            ) *
            0.08;
        }
      );
      zombies.forEach(
        (zombie) => {
          zombie.userData.angle +=
            zombie.userData.speed *
            0.01;
          zombie.position.x =
            Math.cos(
              zombie.userData.angle
            ) *
            zombie.userData.radius;
          zombie.position.z =
            Math.sin(
              zombie.userData.angle
            ) *
            zombie.userData.radius;
          zombie.position.y =
            Math.abs(
              Math.sin(
                elapsed * 3
              )
            ) *
            0.08;
        }
      );
      renderer.render(
        scene,
        camera
      );
      animationFrame =
        requestAnimationFrame(
          animate
        );
    };
    animate();
    const resize = () => {
      if (!mount) return;
      camera.aspect =
        mount.clientWidth /
        mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mount.clientWidth,
        mount.clientHeight
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
        onPointerDown
      );
      renderer.dispose();
      if (
        mount.contains(
          renderer.domElement
        )
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);
  return (
    <div className="game">
      <header className="hud">
        <div className="logo">
          AFTERFALL
          <small>
            NEW HOPE
          </small>
        </div>
        <div className="resources">
          <div>
            🍖
            <b>
              {food.toLocaleString()}
            </b>
          </div>
          <div>
            🔩
            <b>
              {metal.toLocaleString()}
            </b>
          </div>
          <div>
            ⛽
            <b>
              {fuel.toLocaleString()}
            </b>
          </div>
          <div>
            ⚡
            <b>
              {energy.toLocaleString()}
            </b>
          </div>
        </div>
        <div className="city-level">
          CITY
          <strong>1</strong>
        </div>
      </header>
      <main
        ref={mountRef}
        className="scene"
      />
      <div className="city-label">
        <strong>
          NEW HOPE
        </strong>
        <span>
          SURVIVOR SETTLEMENT
        </span>
      </div>
      {selected && (
        <div className="building-window">
          <button
            className="close"
            onClick={() =>
              setSelected(null)
            }
          >
            ×
          </button>
          <div className="building-title">
            <span>
              {selected.name}
            </span>
            <strong>
              LV.{selected.level}
            </strong>
          </div>
          <div className="building-info">
            {selected.id ===
              "farm" &&
              "Производство на Food"}
            {selected.id ===
              "metal" &&
              "Производство на Metal"}
            {selected.id ===
              "refinery" &&
              "Производство на Fuel"}
            {selected.id ===
              "power" &&
              "Производство на Energy"}
            {selected.id ===
              "barracks" &&
              "Производство на Infantry"}
            {selected.id ===
              "vehicle" &&
              "Производство на APC и Tank"}
            {selected.id ===
              "weapons" &&
              "Производство на тежко въоръжение"}
            {selected.id ===
              "hospital" &&
              "Лечение на ранени войници"}
            {selected.id ===
              "research" &&
              "Военни и икономически технологии"}
            {selected.id ===
              "warehouse" &&
              "Съхранение на ресурси"}
            {selected.id ===
              "command" &&
              "Център за управление на града"}
          </div>
          <button
            className="upgrade"
            onClick={() => {
              setMetal(
                (value) =>
                  Math.max(
                    0,
                    value - 100
                  )
              );
              setFood(
                (value) =>
                  Math.max(
                    0,
                    value - 100
                  )
              );
            }}
          >
            UPGRADE
          </button>
        </div>
      )}
      <nav className="bottom">
        <button>
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
          🗺️
          <span>WORLD</span>
        </button>
      </nav>
    </div>
  );
}