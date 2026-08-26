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
  id: BuildingId;
  group: THREE.Group;
};

const BUILDINGS: Record<
  BuildingId,
  {
    name: string;
    icon: string;
    description: string;
    x: number;
    z: number;
  }
> = {
  command: {
    name: "COMMAND CENTER",
    icon: "🏢",
    description:
      "Сърцето на New Hope. Управлява развитието на града.",
    x: 0,
    z: 0,
  },

  hospital: {
    name: "HOSPITAL",
    icon: "🏥",
    description:
      "Лекува ранени войници и възстановява армията.",
    x: -7,
    z: -6,
  },

  barracks: {
    name: "BARRACKS",
    icon: "🪖",
    description:
      "Обучава войници и поддържа защитата на града.",
    x: 7,
    z: -6,
  },

  research: {
    name: "RESEARCH CENTER",
    icon: "🔬",
    description:
      "Развива технологии и подобрява града.",
    x: -7,
    z: 6,
  },

  warehouse: {
    name: "WAREHOUSE",
    icon: "📦",
    description:
      "Съхранява ресурсите на New Hope.",
    x: 7,
    z: 6,
  },
};

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [food, setFood] = useState(500);
  const [metal, setMetal] = useState(300);

  const [cityLevel, setCityLevel] = useState(1);
  const [cityRestored, setCityRestored] =
    useState(false);

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

  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingInfo | null>(null);

  const levelsRef = useRef(buildingLevels);
  const restoredRef = useRef(buildingRestored);

  useEffect(() => {
    levelsRef.current = buildingLevels;
  }, [buildingLevels]);

  useEffect(() => {
    restoredRef.current = buildingRestored;
  }, [buildingRestored]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    /*
     * =====================================================
     * SCENE
     * =====================================================
     */

    const scene = new THREE.Scene();

    scene.background =
      new THREE.Color(0x101612);

    scene.fog = new THREE.Fog(
      0x101612,
      25,
      65
    );

    const camera =
      new THREE.PerspectiveCamera(
        45,
        container.clientWidth /
          container.clientHeight,
        0.1,
        200
      );

    camera.position.set(
      20,
      21,
      22
    );

    /*
     * =====================================================
     * RENDERER
     * =====================================================
     */

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        powerPreference:
          "high-performance",
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1.8
      )
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    container.appendChild(
      renderer.domElement
    );

    /*
     * =====================================================
     * LIGHT
     * =====================================================
     */

    const hemi =
      new THREE.HemisphereLight(
        0xb9c5bb,
        0x161b17,
        2.2
      );

    scene.add(hemi);

    const sun =
      new THREE.DirectionalLight(
        0xffd3a0,
        3.5
      );

    sun.position.set(
      15,
      30,
      10
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;

    scene.add(sun);

    /*
     * =====================================================
     * MATERIALS
     * =====================================================
     */

    const groundMat =
      new THREE.MeshStandardMaterial({
        color: 0x30352f,
        roughness: 1,
      });

    const asphaltMat =
      new THREE.MeshStandardMaterial({
        color: 0x202321,
        roughness: 0.95,
      });

    const concreteMat =
      new THREE.MeshStandardMaterial({
        color: 0x73716a,
        roughness: 0.9,
      });

    const concreteDark =
      new THREE.MeshStandardMaterial({
        color: 0x454640,
        roughness: 1,
      });

    const metalMat =
      new THREE.MeshStandardMaterial({
        color: 0x292e2d,
        metalness: 0.7,
        roughness: 0.55,
      });

    const glassMat =
      new THREE.MeshStandardMaterial({
        color: 0x4e7476,
        metalness: 0.35,
        roughness: 0.2,
      });

    const rustMat =
      new THREE.MeshStandardMaterial({
        color: 0x744c36,
        roughness: 0.95,
      });

    const woodMat =
      new THREE.MeshStandardMaterial({
        color: 0x493526,
        roughness: 1,
      });

    const greenMat =
      new THREE.MeshStandardMaterial({
        color: 0x263c2a,
        roughness: 1,
      });

    const lightMat =
      new THREE.MeshStandardMaterial({
        color: 0xd7b879,
        emissive: 0x8d6528,
        emissiveIntensity: 1.4,
      });

    /*
     * =====================================================
     * CITY ROOT
     * =====================================================
     */

    const city = new THREE.Group();

    scene.add(city);

    /*
     * =====================================================
     * HELPERS
     * =====================================================
     */

    const box = (
      parent: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number
    ) => {
      const mesh =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            w,
            h,
            d
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

    const cylinder = (
      parent: THREE.Object3D,
      radius: number,
      height: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number
    ) => {
      const mesh =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            10
          ),
          material
        );

      mesh.position.set(
        x,
        y,
        z
      );

      mesh.castShadow = true;

      parent.add(mesh);

      return mesh;
    };

    const window = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      scale = 1
    ) => {
      return box(
        parent,
        0.65 * scale,
        0.75 * scale,
        0.08,
        glassMat,
        x,
        y,
        z
      );
    };

    const pipe = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      h: number
    ) => {
      return cylinder(
        parent,
        0.08,
        h,
        metalMat,
        x,
        y,
        z
      );
    };

    /*
     * =====================================================
     * GROUND
     * =====================================================
     */

    box(
      city,
      34,
      0.4,
      34,
      groundMat,
      0,
      -0.2,
      0
    );

    /*
     * =====================================================
     * ROADS
     * =====================================================
     */

    box(
      city,
      4,
      0.08,
      34,
      asphaltMat,
      0,
      0.04,
      0
    );

    box(
      city,
      34,
      0.08,
      4,
      asphaltMat,
      0,
      0.05,
      0
    );

    const roadLineMat =
      new THREE.MeshStandardMaterial({
        color: 0xa69f80,
      });

    for (
      let i = -15;
      i <= 15;
      i += 3
    ) {
      box(
        city,
        0.15,
        0.03,
        1.2,
        roadLineMat,
        0,
        0.1,
        i
      );

      box(
        city,
        1.2,
        0.03,
        0.15,
        roadLineMat,
        i,
        0.1,
        0
      );
    }

    /*
     * =====================================================
     * BUILDING FACTORIES
     * =====================================================
     */

    const buildings: BuildingObject[] = [];

    /*
     * COMMAND CENTER
     */

    const createCommand =
      () => {
        const g =
          new THREE.Group();

        g.userData.buildingId =
          "command";

        box(
          g,
          5.8,
          0.35,
          5.8,
          concreteDark,
          0,
          0.2,
          0
        );

        box(
          g,
          5,
          3.2,
          5,
          concreteMat,
          0,
          1.8,
          0
        );

        box(
          g,
          5.3,
          0.3,
          5.3,
          metalMat,
          0,
          3.45,
          0
        );

        /*
         * roof tower
         */

        box(
          g,
          2.6,
          1.5,
          2.6,
          concreteDark,
          0,
          4.35,
          0
        );

        cylinder(
          g,
          0.08,
          2.4,
          metalMat,
          0,
          6.2,
          0
        );

        cylinder(
          g,
          0.25,
          0.12,
          rustMat,
          0,
          7.4,
          0
        );

        /*
         * windows
         */

        window(
          g,
          -1.5,
          1.8,
          2.55
        );

        window(
          g,
          0,
          1.8,
          2.55
        );

        window(
          g,
          1.5,
          1.8,
          2.55
        );

        /*
         * door
         */

        box(
          g,
          1,
          1.9,
          0.12,
          metalMat,
          0,
          0.95,
          2.56
        );

        /*
         * side towers
         */

        box(
          g,
          0.55,
          4.2,
          0.55,
          metalMat,
          -2.45,
          2.1,
          -2.4
        );

        box(
          g,
          0.55,
          4.2,
          0.55,
          metalMat,
          2.45,
          2.1,
          -2.4
        );

        g.position.set(
          0,
          0,
          0
        );

        city.add(g);

        buildings.push({
          id: "command",
          group: g,
        });
      };

    /*
     * HOSPITAL
     */

    const createHospital =
      () => {
        const g =
          new THREE.Group();

        g.userData.buildingId =
          "hospital";

        box(
          g,
          5,
          0.3,
          4,
          concreteDark,
          0,
          0.15,
          0
        );

        box(
          g,
          4.6,
          2.7,
          3.6,
          concreteMat,
          0,
          1.5,
          0
        );

        box(
          g,
          4.9,
          0.3,
          3.9,
          metalMat,
          0,
          2.95,
          0
        );

        window(
          g,
          -1.4,
          1.55,
          1.84
        );

        window(
          g,
          0,
          1.55,
          1.84
        );

        window(
          g,
          1.4,
          1.55,
          1.84
        );

        box(
          g,
          0.9,
          1.7,
          0.12,
          metalMat,
          0,
          0.9,
          1.87
        );

        /*
         * medical cross
         */

        box(
          g,
          1.3,
          0.3,
          0.1,
          rustMat,
          0,
          2.1,
          1.88
        );

        box(
          g,
          0.3,
          1.3,
          0.1,
          rustMat,
          0,
          2.1,
          1.88
        );

        g.position.set(
          -7,
          0,
          -6
        );

        city.add(g);

        buildings.push({
          id: "hospital",
          group: g,
        });
      };

    /*
     * BARRACKS
     */

    const createBarracks =
      () => {
        const g =
          new THREE.Group();

        g.userData.buildingId =
          "barracks";

        box(
          g,
          5,
          0.3,
          4,
          concreteDark,
          0,
          0.15,
          0
        );

        box(
          g,
          4.6,
          2.5,
          3.6,
          concreteDark,
          0,
          1.4,
          0
        );

        box(
          g,
          4.9,
          0.3,
          3.9,
          metalMat,
          0,
          2.75,
          0
        );

        window(
          g,
          -1.4,
          1.5,
          1.84
        );

        window(
          g,
          0,
          1.5,
          1.84
        );

        window(
          g,
          1.4,
          1.5,
          1.84
        );

        box(
          g,
          0.9,
          1.7,
          0.12,
          metalMat,
          0,
          0.9,
          1.87
        );

        /*
         * watch tower
         */

        box(
          g,
          0.8,
          4,
          0.8,
          metalMat,
          1.7,
          2,
          -1.1
        );

        box(
          g,
          1.4,
          0.25,
          1.4,
          rustMat,
          1.7,
          4.05,
          -1.1
        );

        g.position.set(
          7,
          0,
          -6
        );

        city.add(g);

        buildings.push({
          id: "barracks",
          group: g,
        });
      };

    /*
     * RESEARCH
     */

    const createResearch =
      () => {
        const g =
          new THREE.Group();

        g.userData.buildingId =
          "research";

        box(
          g,
          5,
          0.3,
          4,
          concreteDark,
          0,
          0.15,
          0
        );

        box(
          g,
          4.6,
          2.8,
          3.6,
          concreteMat,
          0,
          1.55,
          0
        );

        box(
          g,
          4.9,
          0.3,
          3.9,
          metalMat,
          0,
          3.05,
          0
        );

        window(
          g,
          -1.4,
          1.65,
          1.84,
          1.15
        );

        window(
          g,
          0,
          1.65,
          1.84,
          1.15
        );

        window(
          g,
          1.4,
          1.65,
          1.84,
          1.15
        );

        pipe(
          g,
          -1.5,
          4.1,
          0,
          2.2
        );

        pipe(
          g,
          1.5,
          4.1,
          0,
          2.2
        );

        g.position.set(
          -7,
          0,
          6
        );

        city.add(g);

        buildings.push({
          id: "research",
          group: g,
        });
      };

    /*
     * WAREHOUSE
     */

    const createWarehouse =
      () => {
        const g =
          new THREE.Group();

        g.userData.buildingId =
          "warehouse";

        box(
          g,
          5.2,
          0.3,
          4,
          concreteDark,
          0,
          0.15,
          0
        );

        box(
          g,
          4.8,
          2.3,
          3.6,
          concreteDark,
          0,
          1.3,
          0
        );

        /*
         * roof beams
         */

        for (
          let x = -2;
          x <= 2;
          x += 1.3
        ) {
          box(
            g,
            0.22,
            0.5,
            4,
            metalMat,
            x,
            2.6,
            0
          );
        }

        /*
         * loading doors
         */

        box(
          g,
          1.15,
          1.65,
          0.12,
          metalMat,
          -1.25,
          0.9,
          1.85
        );

        box(
          g,
          1.15,
          1.65,
          0.12,
          metalMat,
          1.25,
          0.9,
          1.85
        );

        /*
         * tanks
         */

        cylinder(
          g,
          0.55,
          1.5,
          metalMat,
          -2.4,
          1,
          -1.1
        );

        cylinder(
          g,
          0.55,
          1.5,
          rustMat,
          2.4,
          1,
          -1.1
        );

        g.position.set(
          7,
          0,
          6
        );

        city.add(g);

        buildings.push({
          id: "warehouse",
          group: g,
        });
      };

    createCommand();
    createHospital();
    createBarracks();
    createResearch();
    createWarehouse();

    /*
     * =====================================================
     * RUINS
     * =====================================================
     */

    const createRuin = (
      x: number,
      z: number
    ) => {
      const g =
        new THREE.Group();

      box(
        g,
        3,
        1.2,
        2.6,
        concreteDark,
        0,
        0.6,
        0
      );

      box(
        g,
        1.2,
        2.2,
        0.5,
        concreteMat,
        0.7,
        1.1,
        0
      );

      box(
        g,
        0.7,
        1.5,
        0.6,
        rustMat,
        -0.7,
        0.75,
        0.4
      );

      g.position.set(
        x,
        0,
        z
      );

      g.rotation.y =
        Math.random() * 0.8;

      city.add(g);
    };

    createRuin(-11, -10);
    createRuin(11, -10);
    createRuin(-11, 10);
    createRuin(11, 10);

    /*
     * =====================================================
     * WALLS
     * =====================================================
     */

    const wallMat =
      new THREE.MeshStandardMaterial({
        color: 0x373a36,
        roughness: 1,
      });

    box(
      city,
      31,
      2.8,
      0.8,
      wallMat,
      0,
      1.4,
      -15
    );

    box(
      city,
      31,
      2.8,
      0.8,
      wallMat,
      0,
      1.4,
      15
    );

    box(
      city,
      0.8,
      2.8,
      31,
      wallMat,
      -15,
      1.4,
      0
    );

    box(
      city,
      0.8,
      2.8,
      31,
      wallMat,
      15,
      1.4,
      0
    );

    /*
     * =====================================================
     * GATE
     * =====================================================
     */

    box(
      city,
      3,
      4.5,
      1,
      concreteDark,
      -2.5,
      2.25,
      15
    );

    box(
      city,
      3,
      4.5,
      1,
      concreteDark,
      2.5,
      2.25,
      15
    );

    box(
      city,
      8,
      1,
      1.2,
      concreteDark,
      0,
      4.75,
      15
    );

    /*
     * =====================================================
     * TREES
     * =====================================================
     */

    const tree = (
      x: number,
      z: number,
      s: number
    ) => {
      cylinder(
        city,
        0.2 * s,
        1.7 * s,
        woodMat,
        x,
        0.85 * s,
        z
      );

      const crown =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            1.1 * s,
            2.7 * s,
            7
          ),
          greenMat
        );

      crown.position.set(
        x,
        2.45 * s,
        z
      );

      crown.castShadow = true;

      city.add(crown);
    };

    tree(-12, -3, 1);
    tree(12, -3, 0.8);
    tree(-12, 3, 0.9);
    tree(12, 3, 1.1);
    tree(-8, -12, 0.8);
    tree(8, -12, 1);

    /*
     * =====================================================
     * BUILDING VISUAL LEVELS
     * =====================================================
     */

    const clearUpgradeParts = (
      g: THREE.Group
    ) => {
      const remove: THREE.Object3D[] = [];

      g.traverse(child => {
        if (
          child !== g &&
          child.userData.upgradePart
        ) {
          remove.push(child);
        }
      });

      remove.forEach(
        child =>
          child.parent?.remove(child)
      );
    };

    const addUpgradePart = (
      g: THREE.Group,
      part: THREE.Object3D
    ) => {
      part.userData.upgradePart = true;
      return part;
    };

    const updateBuilding = (
      id: BuildingId
    ) => {
      const item =
        buildings.find(
          b => b.id === id
        );

      if (!item) return;

      const g = item.group;

      clearUpgradeParts(g);

      const restored =
        restoredRef.current[id];

      const level =
        levelsRef.current[id];

      if (!restored) {
        g.scale.set(
          0.75,
          0.75,
          0.75
        );

        return;
      }

      g.scale.set(
        1,
        1,
        1
      );

      /*
       * LEVEL 2
       */

      if (level >= 2) {
        if (
          id === "command"
        ) {
          addUpgradePart(
            g,
            box(
              g,
              3.8,
              1,
              3.8,
              concreteMat,
              0,
              5.2,
              0
            )
          );

          addUpgradePart(
            g,
            cylinder(
              g,
              0.12,
              2,
              metalMat,
              -1.3,
              6.5,
              0
            )
          );
        }

        if (
          id === "hospital"
        ) {
          addUpgradePart(
            g,
            box(
              g,
              3.8,
              1.1,
              3,
              concreteMat,
              0,
              3.8,
              0
            )
          );
        }

        if (
          id === "barracks"
        ) {
          addUpgradePart(
            g,
            box(
              g,
              3.8,
              1.1,
              3,
              concreteDark,
              0,
              3.55,
              0
            )
          );
        }

        if (
          id === "research"
        ) {
          addUpgradePart(
            g,
            box(
              g,
              3.8,
              1.1,
              3,
              concreteMat,
              0,
              3.8,
              0
            )
          );
        }

        if (
          id === "warehouse"
        ) {
          addUpgradePart(
            g,
            box(
              g,
              4.8,
              1,
              3.6,
              concreteDark,
              0,
              3.1,
              0
            )
          );
        }
      }

      /*
       * LEVEL 3
       */

      if (level >= 3) {
        addUpgradePart(
          g,
          box(
            g,
            2.5,
            1.4,
            2.5,
            metalMat,
            0,
            5.1,
            0
          )
        );

        addUpgradePart(
          g,
          pipe(
            g,
            1.3,
            5.8,
            0,
            2
          )
        );
      }

      /*
       * LEVEL 4
       */

      if (level >= 4) {
        addUpgradePart(
          g,
          cylinder(
            g,
            0.18,
            3,
            rustMat,
            1.7,
            6.4,
            0
          )
        );

        addUpgradePart(
          g,
          box(
            g,
            4,
            0.25,
            4,
            metalMat,
            0,
            7.8,
            0
          )
        );
      }

      /*
       * LEVEL 5+
       */

      if (level >= 5) {
        addUpgradePart(
          g,
          box(
            g,
            0.45,
            2.5,
            0.45,
            metalMat,
            -2,
            7.9,
            0
          )
        );

        addUpgradePart(
          g,
          box(
            g,
            0.45,
            2.5,
            0.45,
            metalMat,
            2,
            7.9,
            0
          )
        );

        addUpgradePart(
          g,
          cylinder(
            g,
            0.28,
            0.18,
            lightMat,
            0,
            9.2,
            0
          )
        );
      }
    };

    /*
     * =====================================================
     * INITIAL STATE
     * =====================================================
     */

    buildings.forEach(
      item =>
        updateBuilding(
          item.id
        )
    );

    /*
     * =====================================================
     * CLICK
     * =====================================================
     */

    const raycaster =
      new THREE.Raycaster();

    const pointer =
      new THREE.Vector2();

    const findId = (
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

    const click = (
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
          findId(hit.object);

        if (!id) continue;

        const info =
          BUILDINGS[id];

        setSelectedBuilding({
          id,
          name: info.name,
          icon: info.icon,
          description:
            info.description,
          level:
            levelsRef.current[id],
          restored:
            restoredRef.current[id],
        });

        break;
      }
    };

    renderer.domElement.addEventListener(
      "pointerup",
      click
    );

    /*
     * =====================================================
     * CAMERA
     * =====================================================
     */

    let dragging = false;
    let previousX = 0;
    let previousY = 0;

    const down = (
      event: PointerEvent
    ) => {
      dragging = true;
      previousX =
        event.clientX;
      previousY =
        event.clientY;
    };

    const move = (
      event: PointerEvent
    ) => {
      if (!dragging) return;

      const dx =
        event.clientX -
        previousX;

      const dy =
        event.clientY -
        previousY;

      city.rotation.y +=
        dx * 0.006;

      camera.position.y =
        THREE.MathUtils.clamp(
          camera.position.y -
            dy * 0.04,
          9,
          32
        );

      previousX =
        event.clientX;

      previousY =
        event.clientY;
    };

    const up = () => {
      dragging = false;
    };

    renderer.domElement.addEventListener(
      "pointerdown",
      down
    );

    renderer.domElement.addEventListener(
      "pointermove",
      move
    );

    renderer.domElement.addEventListener(
      "pointerup",
      up
    );

    /*
     * =====================================================
     * TOUCH ZOOM
     * =====================================================
     */

    let touchDistance = 0;

    const touchMove = (
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

      if (touchDistance) {
        const delta =
          distance -
          touchDistance;

        camera.position.multiplyScalar(
          delta > 0
            ? 0.98
            : 1.02
        );
      }

      camera.position.y =
        THREE.MathUtils.clamp(
          camera.position.y,
          8,
          32
        );

      touchDistance =
        distance;
    };

    const touchEnd = () => {
      touchDistance = 0;
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

    /*
     * =====================================================
     * ANIMATION
     * =====================================================
     */

    let frame = 0;

    const animate = () => {
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

    /*
     * =====================================================
     * RESIZE
     * =====================================================
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

    resize();

    /*
     * =====================================================
     * CLEANUP
     * =====================================================
     */

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
        click
      );

      renderer.domElement.removeEventListener(
        "pointerdown",
        down
      );

      renderer.domElement.removeEventListener(
        "pointermove",
        move
      );

      renderer.domElement.removeEventListener(
        "pointerup",
        up
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

  /*
   * =====================================================
   * RESTORE CITY
   * =====================================================
   */

  const restoreCity = () => {
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

  /*
   * =====================================================
   * RESTORE BUILDING
   * =====================================================
   */

  const restoreBuilding = () => {
    if (!selectedBuilding) return;

    const id =
      selectedBuilding.id;

    if (
      buildingRestored[id]
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
      value => value - 100
    );

    setMetal(
      value => value - 100
    );

    setBuildingRestored(
      value => ({
        ...value,
        [id]: true,
      })
    );

    setBuildingLevels(
      value => ({
        ...value,
        [id]: 1,
      })
    );

    setSelectedBuilding(
      value =>
        value
          ? {
              ...value,
              restored: true,
              level: 1,
            }
          : null
    );

    if (
      id === "command"
    ) {
      setCityLevel(1);
    }
  };

  /*
   * =====================================================
   * UPGRADE
   * =====================================================
   */

  const upgradeBuilding = () => {
    if (!selectedBuilding) return;

    const id =
      selectedBuilding.id;

    if (
      !buildingRestored[id]
    ) {
      return;
    }

    const level =
      buildingLevels[id];

    if (level >= 30) {
      return;
    }

    const foodCost =
      200 * level;

    const metalCost =
      150 * level;

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

    const next =
      level + 1;

    setBuildingLevels(
      value => ({
        ...value,
        [id]: next,
      })
    );

    setSelectedBuilding(
      value =>
        value
          ? {
              ...value,
              level: next,
            }
          : null
    );

    if (
      id === "command"
    ) {
      setCityLevel(
        Math.min(
          30,
          next
        )
      );
    }
  };

  const selectedCosts =
    selectedBuilding
      ? {
          food:
            200 *
            buildingLevels[
              selectedBuilding.id
            ],
          metal:
            150 *
            buildingLevels[
              selectedBuilding.id
            ],
        }
      : null;

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
            ⛽ 200
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
              marginTop: 5,
              fontSize: 11,
              color: cityRestored
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
                  disabled={
                    food < 100 ||
                    metal < 100
                  }
                >
                  RESTORE
                </button>

              </>
            ) : (
              <>

                {selectedCosts && (
                  <div className="upgrade-cost">

                    <span>
                      🍖{" "}
                      {
                        selectedCosts.food
                      }
                    </span>

                    <span>
                      🔩{" "}
                      {
                        selectedCosts.metal
                      }
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
                Възстанови New Hope и
                започни развитието на
                града.
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
                Избери сграда и започни
                нейното развитие.
              </p>

              <small>
                👆 Натисни върху сграда
                <br />
                ↔️ Плъзни за завъртане
                <br />
                🤏 Два пръста за zoom
              </small>

            </div>
          )}

      </section>

    </main>
  );
}