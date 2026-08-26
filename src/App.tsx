import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type BuildingId =
  | "command"
  | "hospital"
  | "barracks"
  | "research"
  | "warehouse";

type BuildingInfo = {
  id: BuildingId;
  name: string;
  icon: string;
  description: string;
  level: number;
  restored: boolean;
};

type BuildingObject = {
  group: THREE.Group;
  id: BuildingId;
};

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [cityLevel, setCityLevel] = useState(1);
  const [food, setFood] = useState(500);
  const [metal, setMetal] = useState(300);
  const [fuel] = useState(200);

  const [cityRestored, setCityRestored] = useState(false);

  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingInfo | null>(null);

  const [buildingLevels, setBuildingLevels] =
    useState<Record<BuildingId, number>>({
      command: 1,
      hospital: 0,
      barracks: 0,
      research: 0,
      warehouse: 0,
    });

  const [buildingRestored, setBuildingRestored] =
    useState<Record<BuildingId, boolean>>({
      command: false,
      hospital: false,
      barracks: false,
      research: false,
      warehouse: false,
    });

  const buildingLevelsRef =
    useRef(buildingLevels);

  const buildingRestoredRef =
    useRef(buildingRestored);

  const cityRestoredRef =
    useRef(cityRestored);

  useEffect(() => {
    buildingLevelsRef.current = buildingLevels;
  }, [buildingLevels]);

  useEffect(() => {
    buildingRestoredRef.current = buildingRestored;
  }, [buildingRestored]);

  useEffect(() => {
    cityRestoredRef.current = cityRestored;
  }, [cityRestored]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    /* =====================================================
       SCENE
    ===================================================== */

    const scene = new THREE.Scene();

    scene.background =
      new THREE.Color(0x111713);

    scene.fog = new THREE.Fog(
      0x111713,
      25,
      70
    );

    const camera =
      new THREE.PerspectiveCamera(
        48,
        container.clientWidth /
          container.clientHeight,
        0.1,
        300
      );

    camera.position.set(
      18,
      18,
      20
    );

    camera.lookAt(
      0,
      0,
      0
    );

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        powerPreference:
          "high-performance",
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.7
      )
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.shadowMap.enabled =
      true;

    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    container.appendChild(
      renderer.domElement
    );

    /* =====================================================
       LIGHTING
    ===================================================== */

    const hemisphere =
      new THREE.HemisphereLight(
        0xb8c6bb,
        0x1b211d,
        2.2
      );

    scene.add(hemisphere);

    const sun =
      new THREE.DirectionalLight(
        0xffd7a3,
        3.2
      );

    sun.position.set(
      18,
      28,
      12
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width =
      2048;

    sun.shadow.mapSize.height =
      2048;

    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;

    scene.add(sun);

    /* =====================================================
       MATERIALS
    ===================================================== */

    const groundMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x30352f,
        roughness: 1,
      });

    const asphaltMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x202321,
        roughness: 1,
      });

    const concreteMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x66655e,
        roughness: 0.9,
      });

    const concreteDark =
      new THREE.MeshStandardMaterial({
        color: 0x41433e,
        roughness: 0.95,
      });

    const metalMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x252a29,
        metalness: 0.65,
        roughness: 0.65,
      });

    const glassMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x40585b,
        metalness: 0.2,
        roughness: 0.25,
      });

    const woodMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x4b3728,
        roughness: 1,
      });

    const vegetationMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x26382a,
        roughness: 1,
      });

    const rustMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x594137,
        roughness: 1,
      });

    /* =====================================================
       CITY ROOT
    ===================================================== */

    const cityRoot =
      new THREE.Group();

    scene.add(cityRoot);

    /* =====================================================
       GROUND
    ===================================================== */

    const ground =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          34,
          0.4,
          34
        ),
        groundMaterial
      );

    ground.position.y = -0.2;

    ground.receiveShadow = true;

    cityRoot.add(ground);

    /* =====================================================
       ROADS
    ===================================================== */

    const roadVertical =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          4,
          0.08,
          34
        ),
        asphaltMaterial
      );

    roadVertical.position.y =
      0.03;

    cityRoot.add(
      roadVertical
    );

    const roadHorizontal =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          34,
          0.08,
          4
        ),
        asphaltMaterial
      );

    roadHorizontal.position.y =
      0.04;

    cityRoot.add(
      roadHorizontal
    );

    /* =====================================================
       ROAD MARKINGS
    ===================================================== */

    const markingMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xaaa68d,
        roughness: 1,
      });

    for (
      let i = -15;
      i <= 15;
      i += 3
    ) {
      const line =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.18,
            0.025,
            1.2
          ),
          markingMaterial
        );

      line.position.set(
        0,
        0.09,
        i
      );

      cityRoot.add(line);
    }

    for (
      let i = -15;
      i <= 15;
      i += 3
    ) {
      const line =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            1.2,
            0.025,
            0.18
          ),
          markingMaterial
        );

      line.position.set(
        i,
        0.1,
        0
      );

      cityRoot.add(line);
    }

    /* =====================================================
       BUILDING STORAGE
    ===================================================== */

    const buildingObjects: BuildingObject[] =
      [];

    /* =====================================================
       HELPERS
    ===================================================== */

    const addBox = (
      parent: THREE.Object3D,
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number
    ) => {
      const mesh =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            width,
            height,
            depth
          ),
          material
        );

      mesh.position.set(
        x,
        y,
        z
      );

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      parent.add(mesh);

      return mesh;
    };

    const addWindow = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      width = 0.55,
      height = 0.7
    ) => {
      return addBox(
        parent,
        width,
        height,
        0.08,
        glassMaterial,
        x,
        y,
        z
      );
    };

    const addAntenna = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number
    ) => {
      const pole =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.06,
            0.08,
            1.7,
            8
          ),
          metalMaterial
        );

      pole.position.set(
        x,
        y,
        z
      );

      pole.castShadow = true;

      parent.add(pole);

      const top =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.13,
            10,
            10
          ),
          rustMaterial
        );

      top.position.set(
        x,
        y + 0.85,
        z
      );

      parent.add(top);
    };

    /* =====================================================
       COMMAND CENTER
    ===================================================== */

    const createCommandCenter =
      () => {
        const group =
          new THREE.Group();

        group.userData.buildingId =
          "command";

        /* Foundation */

        addBox(
          group,
          5.4,
          0.35,
          5.4,
          concreteDark,
          0,
          0.18,
          0
        );

        /* Main building */

        addBox(
          group,
          4.7,
          3.1,
          4.7,
          concreteMaterial,
          0,
          1.75,
          0
        );

        /* Side supports */

        addBox(
          group,
          0.45,
          3.8,
          0.45,
          metalMaterial,
          -2.25,
          2,
          -2.25
        );

        addBox(
          group,
          0.45,
          3.8,
          0.45,
          metalMaterial,
          2.25,
          2,
          -2.25
        );

        /* Roof */

        const roof =
          new THREE.Mesh(
            new THREE.ConeGeometry(
              3.6,
              1.35,
              4
            ),
            concreteDark
          );

        roof.position.y =
          4.05;

        roof.rotation.y =
          Math.PI / 4;

        roof.castShadow = true;

        group.add(roof);

        /* Tower */

        addBox(
          group,
          1.15,
          4.8,
          1.15,
          metalMaterial,
          0,
          2.5,
          -2.9
        );

        /* Tower platform */

        addBox(
          group,
          1.8,
          0.2,
          1.8,
          metalMaterial,
          0,
          4.9,
          -2.9
        );

        addAntenna(
          group,
          0,
          5.8,
          -2.9
        );

        /* Front windows */

        addWindow(
          group,
          -1.45,
          1.8,
          2.38
        );

        addWindow(
          group,
          0,
          1.8,
          2.38
        );

        addWindow(
          group,
          1.45,
          1.8,
          2.38
        );

        /* Door */

        addBox(
          group,
          0.9,
          1.9,
          0.12,
          metalMaterial,
          0,
          0.95,
          2.42
        );

        group.position.set(
          0,
          0,
          0
        );

        cityRoot.add(group);

        buildingObjects.push({
          group,
          id: "command",
        });
      };

    /* =====================================================
       HOSPITAL
    ===================================================== */

    const createHospital =
      () => {
        const group =
          new THREE.Group();

        group.userData.buildingId =
          "hospital";

        addBox(
          group,
          4.7,
          0.3,
          3.8,
          concreteDark,
          0,
          0.15,
          0
        );

        addBox(
          group,
          4.3,
          2.6,
          3.4,
          concreteMaterial,
          0,
          1.45,
          0
        );

        addBox(
          group,
          4.5,
          0.3,
          3.6,
          metalMaterial,
          0,
          2.9,
          0
        );

        /* Medical sign */

        addBox(
          group,
          1.4,
          0.35,
          0.12,
          rustMaterial,
          0,
          2,
          1.76
        );

        addBox(
          group,
          0.35,
          1.1,
          0.13,
          rustMaterial,
          0,
          2,
          1.82
        );

        addWindow(
          group,
          -1.35,
          1.45,
          1.73
        );

        addWindow(
          group,
          1.35,
          1.45,
          1.73
        );

        addBox(
          group,
          0.9,
          1.7,
          0.12,
          metalMaterial,
          0,
          0.9,
          1.76
        );

        group.position.set(
          -6.5,
          0,
          -5.5
        );

        cityRoot.add(group);

        buildingObjects.push({
          group,
          id: "hospital",
        });
      };

    /* =====================================================
       BARRACKS
    ===================================================== */

    const createBarracks =
      () => {
        const group =
          new THREE.Group();

        group.userData.buildingId =
          "barracks";

        addBox(
          group,
          4.8,
          0.3,
          3.7,
          concreteDark,
          0,
          0.15,
          0
        );

        addBox(
          group,
          4.4,
          2.5,
          3.3,
          concreteDark,
          0,
          1.4,
          0
        );

        addBox(
          group,
          4.6,
          0.25,
          3.5,
          metalMaterial,
          0,
          2.75,
          0
        );

        addWindow(
          group,
          -1.3,
          1.5,
          1.67
        );

        addWindow(
          group,
          0,
          1.5,
          1.67
        );

        addWindow(
          group,
          1.3,
          1.5,
          1.67
        );

        addBox(
          group,
          0.85,
          1.7,
          0.12,
          metalMaterial,
          0,
          0.9,
          1.68
        );

        group.position.set(
          6.5,
          0,
          -5.5
        );

        cityRoot.add(group);

        buildingObjects.push({
          group,
          id: "barracks",
        });
      };

    /* =====================================================
       RESEARCH
    ===================================================== */

    const createResearch =
      () => {
        const group =
          new THREE.Group();

        group.userData.buildingId =
          "research";

        addBox(
          group,
          4.8,
          0.3,
          3.7,
          concreteDark,
          0,
          0.15,
          0
        );

        addBox(
          group,
          4.3,
          2.8,
          3.3,
          concreteMaterial,
          0,
          1.55,
          0
        );

        /* Laboratory roof */

        addBox(
          group,
          4.5,
          0.25,
          3.5,
          metalMaterial,
          0,
          3.05,
          0
        );

        /* Glass front */

        addWindow(
          group,
          -1.25,
          1.65,
          1.68,
          0.75,
          0.9
        );

        addWindow(
          group,
          0,
          1.65,
          1.68,
          0.75,
          0.9
        );

        addWindow(
          group,
          1.25,
          1.65,
          1.68,
          0.75,
          0.9
        );

        addAntenna(
          group,
          1.4,
          3.3,
          0
        );

        group.position.set(
          -6.5,
          0,
          5.5
        );

        cityRoot.add(group);

        buildingObjects.push({
          group,
          id: "research",
        });
      };

    /* =====================================================
       WAREHOUSE
    ===================================================== */

    const createWarehouse =
      () => {
        const group =
          new THREE.Group();

        group.userData.buildingId =
          "warehouse";

        addBox(
          group,
          5,
          0.3,
          3.8,
          concreteDark,
          0,
          0.15,
          0
        );

        addBox(
          group,
          4.6,
          2.2,
          3.4,
          concreteDark,
          0,
          1.25,
          0
        );

        /* Roof beams */

        addBox(
          group,
          5,
          0.25,
          0.3,
          metalMaterial,
          0,
          2.5,
          -1.4
        );

        addBox(
          group,
          5,
          0.25,
          0.3,
          metalMaterial,
          0,
          2.5,
          1.4
        );

        /* Loading doors */

        addBox(
          group,
          1.1,
          1.6,
          0.12,
          metalMaterial,
          -1.3,
          0.85,
          1.73
        );

        addBox(
          group,
          1.1,
          1.6,
          0.12,
          metalMaterial,
          1.3,
          0.85,
          1.73
        );

        group.position.set(
          6.5,
          0,
          5.5
        );

        cityRoot.add(group);

        buildingObjects.push({
          group,
          id: "warehouse",
        });
      };

    createCommandCenter();
    createHospital();
    createBarracks();
    createResearch();
    createWarehouse();

    /* =====================================================
       RUINS
    ===================================================== */

    const createRuin = (
      x: number,
      z: number,
      scale: number
    ) => {
      const group =
        new THREE.Group();

      addBox(
        group,
        2.4 * scale,
        1.2 * scale,
        2.3 * scale,
        concreteDark,
        0,
        0.6 * scale,
        0
      );

      addBox(
        group,
        1.1 * scale,
        2 * scale,
        0.4 * scale,
        concreteMaterial,
        0.5 * scale,
        1 * scale,
        0
      );

      group.position.set(
        x,
        0,
        z
      );

      group.rotation.y =
        Math.random() * 0.6;

      cityRoot.add(group);
    };

    createRuin(
      -11,
      -9,
      1
    );

    createRuin(
      11,
      -9,
      0.8
    );

    createRuin(
      -11,
      9,
      0.9
    );

    createRuin(
      11,
      9,
      1.1
    );

    /* =====================================================
       WALLS
    ===================================================== */

    const wallHeight = 2.6;

    const createWall =
      (
        width: number,
        depth: number,
        x: number,
        z: number
      ) => {
        const wall =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              width,
              wallHeight,
              depth
            ),
            concreteDark
          );

        wall.position.set(
          x,
          wallHeight / 2,
          z
        );

        wall.castShadow = true;
        wall.receiveShadow = true;

        cityRoot.add(wall);

        /* Metal supports */

        const count =
          Math.max(
            2,
            Math.floor(
              Math.max(
                width,
                depth
              ) / 3
            )
          );

        for (
          let i = 0;
          i < count;
          i++
        ) {
          const ratio =
            count === 1
              ? 0
              : i / (count - 1);

          const px =
            width > depth
              ? x -
                width / 2 +
                ratio * width
              : x;

          const pz =
            width > depth
              ? z
              : z -
                depth / 2 +
                ratio * depth;

          addBox(
            cityRoot,
            0.18,
            wallHeight + 0.4,
            0.18,
            metalMaterial,
            px,
            (wallHeight +
              0.4) /
              2,
            pz
          );
        }
      };

    createWall(
      30,
      0.8,
      0,
      -15
    );

    createWall(
      30,
      0.8,
      0,
      15
    );

    createWall(
      0.8,
      30,
      -15,
      0
    );

    createWall(
      0.8,
      30,
      15,
      0
    );

    /* =====================================================
       GATE
    ===================================================== */

    addBox(
      cityRoot,
      3,
      4.5,
      1,
      concreteDark,
      -2.4,
      2.25,
      15
    );

    addBox(
      cityRoot,
      3,
      4.5,
      1,
      concreteDark,
      2.4,
      2.25,
      15
    );

    addBox(
      cityRoot,
      8,
      1,
      1.2,
      concreteDark,
      0,
      4.75,
      15
    );

    /* =====================================================
       TREES
    ===================================================== */

    const createTree = (
      x: number,
      z: number,
      scale: number
    ) => {
      const group =
        new THREE.Group();

      const trunk =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.18 * scale,
            0.26 * scale,
            1.8 * scale,
            7
          ),
          woodMaterial
        );

      trunk.position.y =
        0.9 * scale;

      trunk.castShadow = true;

      group.add(trunk);

      const crown =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            1.15 * scale,
            2.7 * scale,
            7
          ),
          vegetationMaterial
        );

      crown.position.y =
        2.5 * scale;

      crown.castShadow = true;

      group.add(crown);

      group.position.set(
        x,
        0,
        z
      );

      cityRoot.add(group);
    };

    createTree(
      -11,
      -3,
      1
    );

    createTree(
      11,
      -3,
      0.8
    );

    createTree(
      -11,
      3,
      0.9
    );

    createTree(
      11,
      3,
      1.1
    );

    createTree(
      -8,
      -12,
      0.8
    );

    createTree(
      8,
      -12,
      1
    );

    /* =====================================================
       RUBBLE
    ===================================================== */

    for (
      let i = 0;
      i < 55;
      i++
    ) {
      const rubble =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.2 +
              Math.random() * 0.55,
            0.15 +
              Math.random() * 0.35,
            0.2 +
              Math.random() * 0.55
          ),
          concreteDark
        );

      const x =
        (Math.random() - 0.5) *
        28;

      const z =
        (Math.random() - 0.5) *
        28;

      rubble.position.set(
        x,
        0.15,
        z
      );

      rubble.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
      );

      rubble.castShadow = true;

      cityRoot.add(rubble);
    }

    /* =====================================================
       BUILDING STATE VISUALS
    ===================================================== */

    const updateBuildingVisual =
      (
        id: BuildingId
      ) => {
        const data =
          buildingObjects.find(
            item =>
              item.id === id
          );

        if (!data) return;

        const group =
          data.group;

        const restored =
          buildingRestoredRef
            .current[id];

        const level =
          buildingLevelsRef
            .current[id];

        group.visible = true;

        /*
          Destroy old level additions.
          They are marked with "upgradePart".
        */

        const oldParts =
          group.children.filter(
            child =>
              child.userData
                .upgradePart
          );

        oldParts.forEach(
          child =>
            group.remove(child)
        );

        if (!restored) {
          group.traverse(
            child => {
              const mesh =
                child as THREE.Mesh;

              if (
                mesh.isMesh &&
                mesh.userData
                  .basePart !== true
              ) {
                return;
              }
            }
          );

          group.scale.set(
            0.88,
            0.88,
            0.88
          );

          return;
        }

        group.scale.set(
          1,
          1,
          1
        );

        /* =================================================
           LEVEL UP VISUALS
        ================================================= */

        if (
          id === "command"
        ) {
          if (level >= 2) {
            addBox(
              group,
              3.7,
              1.1,
              3.7,
              concreteMaterial,
              0,
              4.0,
              0
            ).userData.upgradePart =
              true;

            addAntenna(
              group,
              -1.2,
              5,
              0
            );
          }

          if (level >= 3) {
            addBox(
              group,
              2.6,
              1.8,
              2.6,
              concreteDark,
              0,
              5.4,
              0
            ).userData.upgradePart =
              true;

            addAntenna(
              group,
              1,
              6.4,
              0
            );
          }

          if (level >= 4) {
            addBox(
              group,
              5.5,
              0.3,
              5.5,
              metalMaterial,
              0,
              7,
              0
            ).userData.upgradePart =
              true;
          }
        }

        if (
          id === "hospital"
        ) {
          if (level >= 2) {
            addBox(
              group,
              3.7,
              1.2,
              3,
              concreteMaterial,
              0,
              3.7,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 3) {
            addAntenna(
              group,
              1.4,
              5,
              0
            );
          }
        }

        if (
          id === "barracks"
        ) {
          if (level >= 2) {
            addBox(
              group,
              3.8,
              1.1,
              2.8,
              concreteDark,
              0,
              3.3,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 3) {
            addBox(
              group,
              0.5,
              2,
              0.5,
              metalMaterial,
              1.5,
              4.7,
              0
            ).userData.upgradePart =
              true;
          }
        }

        if (
          id === "research"
        ) {
          if (level >= 2) {
            addBox(
              group,
              3.6,
              1.2,
              2.8,
              concreteMaterial,
              0,
              4,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 3) {
            addAntenna(
              group,
              -1.2,
              5.2,
              0
            );
          }
        }

        if (
          id === "warehouse"
        ) {
          if (level >= 2) {
            addBox(
              group,
              4.9,
              1,
              3.7,
              concreteDark,
              0,
              3.1,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 3) {
            addBox(
              group,
              5.3,
              0.25,
              4,
              metalMaterial,
              0,
              4,
              0
            ).userData.upgradePart =
              true;
          }
        }
      };

    /* =====================================================
       INITIAL VISUAL STATE
    ===================================================== */

    buildingObjects.forEach(
      item =>
        updateBuildingVisual(
          item.id
        )
    );

    /* =====================================================
       RESTORE ALL BUILDINGS
    ===================================================== */

    const restoreAllBuildings =
      () => {
        cityRestoredRef.current =
          true;

        setCityRestored(true);

        const restoredState: Record<
          BuildingId,
          boolean
        > = {
          command: true,
          hospital: true,
          barracks: true,
          research: true,
          warehouse: true,
        };

        const levels: Record<
          BuildingId,
          number
        > = {
          command: 1,
          hospital: 1,
          barracks: 1,
          research: 1,
          warehouse: 1,
        };

        buildingRestoredRef.current =
          restoredState;

        buildingLevelsRef.current =
          levels;

        setBuildingRestored(
          restoredState
        );

        setBuildingLevels(
          levels
        );

        buildingObjects.forEach(
          item => {
            updateBuildingVisual(
              item.id
            );
          }
        );
      };

    /* =====================================================
       CLICK
    ===================================================== */

    const raycaster =
      new THREE.Raycaster();

    const pointer =
      new THREE.Vector2();

    const getBuildingId =
      (
        object: THREE.Object3D
      ): BuildingId | null => {
        let current:
          | THREE.Object3D
          | null = object;

        while (current) {
          const id =
            current.userData
              .buildingId;

          if (
            id === "command" ||
            id === "hospital" ||
            id === "barracks" ||
            id === "research" ||
            id === "warehouse"
          ) {
            return id;
          }

          current =
            current.parent;
        }

        return null;
      };

    const clickBuilding =
      (
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

        for (
          const hit of hits
        ) {
          const id =
            getBuildingId(
              hit.object
            );

          if (!id) continue;

          const names: Record<
            BuildingId,
            {
              name: string;
              icon: string;
              description: string;
            }
          > = {
            command: {
              name:
                "COMMAND CENTER",
              icon: "🏢",
              description:
                "Сърцето на New Hope. Управлява развитието на града.",
            },

            hospital: {
              name: "HOSPITAL",
              icon: "🏥",
              description:
                "Лекува ранени войници и увеличава възстановяването на армията.",
            },

            barracks: {
              name: "BARRACKS",
              icon: "🪖",
              description:
                "Мястото, където се обучават войниците.",
            },

            research: {
              name:
                "RESEARCH CENTER",
              icon: "🔬",
              description:
                "Развива технологии, които правят града и армията по-силни.",
            },

            warehouse: {
              name: "WAREHOUSE",
              icon: "📦",
              description:
                "Съхранява ресурсите на града.",
            },
          };

          setSelectedBuilding({
            id,
            name:
              names[id].name,
            icon:
              names[id].icon,
            description:
              names[id].description,
            level:
              buildingLevelsRef
                .current[id],
            restored:
              buildingRestoredRef
                .current[id],
          });

          return;
        }
      };

    renderer.domElement.addEventListener(
      "pointerup",
      clickBuilding
    );

    /* =====================================================
       CAMERA DRAG
    ===================================================== */

    let dragging = false;
    let previousX = 0;
    let previousY = 0;

    const pointerDown =
      (
        event: PointerEvent
      ) => {
        dragging = true;
        previousX =
          event.clientX;
        previousY =
          event.clientY;

        renderer.domElement.setPointerCapture?.(
          event.pointerId
        );
      };

    const pointerMove =
      (
        event: PointerEvent
      ) => {
        if (!dragging) return;

        const dx =
          event.clientX -
          previousX;

        const dy =
          event.clientY -
          previousY;

        cityRoot.rotation.y +=
          dx * 0.006;

        camera.position.y =
          THREE.MathUtils.clamp(
            camera.position.y -
              dy * 0.035,
            9,
            30
          );

        previousX =
          event.clientX;

        previousY =
          event.clientY;
      };

    const pointerUp =
      () => {
        dragging = false;
      };

    renderer.domElement.addEventListener(
      "pointerdown",
      pointerDown
    );

    renderer.domElement.addEventListener(
      "pointermove",
      pointerMove
    );

    renderer.domElement.addEventListener(
      "pointerup",
      pointerUp
    );

    renderer.domElement.addEventListener(
      "pointercancel",
      pointerUp
    );

    /* =====================================================
       TOUCH ZOOM
    ===================================================== */

    let lastTouchDistance = 0;

    const touchMove =
      (
        event: TouchEvent
      ) => {
        if (
          event.touches.length !==
          2
        ) {
          return;
        }

        event.preventDefault();

        const a =
          event.touches[0];

        const b =
          event.touches[1];

        const dx =
          a.clientX -
          b.clientX;

        const dy =
          a.clientY -
          b.clientY;

        const distance =
          Math.sqrt(
            dx * dx +
              dy * dy
          );

        if (
          lastTouchDistance > 0
        ) {
          const difference =
            distance -
            lastTouchDistance;

          camera.position.multiplyScalar(
            difference > 0
              ? 0.985
              : 1.015
          );

          camera.position.y =
            THREE.MathUtils.clamp(
              camera.position.y,
              8,
              32
            );
        }

        lastTouchDistance =
          distance;
      };

    const touchEnd =
      () => {
        lastTouchDistance = 0;
      };

    renderer.domElement.addEventListener(
      "touchmove",
      touchMove,
      {
        passive: false,
      }
    );

    renderer.domElement.addEventListener(
      "touchend",
      touchEnd
    );

    /* =====================================================
       ANIMATION
    ===================================================== */

    let frame = 0;

    const animate =
      () => {
        frame =
          requestAnimationFrame(
            animate
          );

        camera.lookAt(
          0,
          0,
          0
        );

        renderer.render(
          scene,
          camera
        );
      };

    animate();

    /* =====================================================
       RESIZE
    ===================================================== */

    const resize =
      () => {
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

    resize();

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      cancelAnimationFrame(
        frame
      );

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
        "pointermove",
        pointerMove
      );

      renderer.domElement.removeEventListener(
        "pointerup",
        pointerUp
      );

      renderer.domElement.removeEventListener(
        "pointercancel",
        pointerUp
      );

      renderer.domElement.removeEventListener(
        "touchmove",
        touchMove
      );

      renderer.domElement.removeEventListener(
        "touchend",
        touchEnd
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

  /* =====================================================
     RESTORE CITY
  ===================================================== */

  const restoreCity =
    () => {
      if (
        food < 100 ||
        metal < 100
      ) {
        return;
      }

      setFood(
        value =>
          value - 100
      );

      setMetal(
        value =>
          value - 100
      );

      setCityLevel(1);

      setCityRestored(true);

      setBuildingRestored({
        command: true,
        hospital: true,
        barracks: true,
        research: true,
        warehouse: true,
      });

      setBuildingLevels({
        command: 1,
        hospital: 1,
        barracks: 1,
        research: 1,
        warehouse: 1,
      });
    };

  /* =====================================================
     BUILDING UPGRADE
  ===================================================== */

  const upgradeBuilding =
    () => {
      if (!selectedBuilding)
        return;

      if (
        !selectedBuilding.restored
      ) {
        return;
      }

      const currentLevel =
        buildingLevels[
          selectedBuilding.id
        ];

      if (
        currentLevel >= 30
      ) {
        return;
      }

      const foodCost =
        200 *
        currentLevel;

      const metalCost =
        150 *
        currentLevel;

      if (
        food < foodCost ||
        metal < metalCost
      ) {
        return;
      }

      setFood(
        value =>
          value - foodCost
      );

      setMetal(
        value =>
          value - metalCost
      );

      const newLevel =
        currentLevel + 1;

      setBuildingLevels(
        levels => ({
          ...levels,
          [selectedBuilding.id]:
            newLevel,
      }));

      setSelectedBuilding(
        current => {
          if (!current)
            return null;

          return {
            ...current,
            level: newLevel,
          };
        }
      );

      /*
       * City level follows Command Center.
       */

      if (
        selectedBuilding.id ===
        "command"
      ) {
        setCityLevel(
          Math.min(
            30,
            newLevel
          )
        );
      }
    };

  /* =====================================================
     BUILDING RESTORE
  ===================================================== */

  const restoreBuilding =
    () => {
      if (!selectedBuilding)
        return;

      if (
        buildingRestored[
          selectedBuilding.id
        ]
      ) {
        return;
      }

      if (
        food < 100 ||
        metal < 100
      ) {
        return;
      }

      setFood(
        value =>
          value - 100
      );

      setMetal(
        value =>
          value - 100
      );

      setBuildingRestored(
        restored => ({
          ...restored,
          [selectedBuilding.id]:
            true,
        })
      );

      setBuildingLevels(
        levels => ({
          ...levels,
          [selectedBuilding.id]:
            1,
        })
      );

      setSelectedBuilding(
        current =>
          current
            ? {
                ...current,
                restored:
                  true,
                level: 1,
              }
            : null
      );
    };

  const getSelectedCosts =
    () => {
      if (!selectedBuilding)
        return null;

      const level =
        buildingLevels[
          selectedBuilding.id
        ];

      return {
        food:
          200 * level,
        metal:
          150 * level,
      };
    };

  const costs =
    getSelectedCosts();

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
            CITY LEVEL{" "}
            {cityLevel}
          </div>

          <div className="city-name">
            NEW HOPE
          </div>

          <div
            style={{
              marginTop:
                "5px",
              fontSize:
                "11px",
              color:
                cityRestored
                  ? "#8fd18f"
                  : "#d8a36a",
            }}
          >
            {cityRestored
              ? "CITY RESTORED"
              : "CITY IN RUINS"}
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
              {
                selectedBuilding.icon
              }
            </div>

            <h2>
              {
                selectedBuilding.name
              }
            </h2>

            <div className="building-level">
              {selectedBuilding.restored
                ? `LEVEL ${selectedBuilding.level}`
                : "RUINED"}
            </div>

            <p>
              {
                selectedBuilding.description
              }
            </p>

            {!selectedBuilding.restored ? (
              <>
                <div className="upgrade-cost">
                  <span>
                    🍖 100
                  </span>

                  <span>
                    🔩 100
                  </span>
                </div>

                <button
                  className="upgrade-button"
                  onClick={
                    restoreBuilding
                  }
                >
                  RESTORE
                </button>
              </>
            ) : (
              <>
                {costs && (
                  <div className="upgrade-cost">

                    <span>
                      🍖{" "}
                      {costs.food}
                    </span>

                    <span>
                      🔩{" "}
                      {costs.metal}
                    </span>

                  </div>
                )}

                <button
                  className="upgrade-button"
                  onClick={
                    upgradeBuilding
                  }
                  disabled={
                    selectedBuilding.level >=
                    30
                  }
                >
                  {selectedBuilding.level >=
                  30
                    ? "MAX LEVEL"
                    : "UPGRADE"}
                </button>
              </>
            )}

          </div>
        )}

        {!selectedBuilding &&
          !cityRestored && (
            <div className="quest-panel">

              <h2>
                📜 FIRST QUEST
              </h2>

              <p>
                Възстанови разрушения
                град и започни
                изграждането на New
                Hope.
              </p>

              <button
                onClick={
                  restoreCity
                }
                disabled={
                  food < 100 ||
                  metal < 100
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

        {!selectedBuilding &&
          cityRestored && (
            <div className="quest-panel">

              <h2>
                🏙️ NEW HOPE
              </h2>

              <p>
                Градът е възстановен.
                Избери сграда, за да я
                развиваш.
              </p>

              <small>
                👆 Натисни върху сграда
                <br />
                ↔️ Плъзни за завъртане
                <br />
                🤏 Използвай два пръста
                за zoom
              </small>

            </div>
          )}

      </section>

    </main>
  );
}