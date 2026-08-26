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

const BUILDINGS: Record<
  BuildingId,
  {
    name: string;
    icon: string;
    description: string;
    position: [number, number];
  }
> = {
  command: {
    name: "COMMAND CENTER",
    icon: "🏢",
    description:
      "Сърцето на New Hope. Управлява развитието на целия град.",
    position: [0, 0],
  },
  hospital: {
    name: "HOSPITAL",
    icon: "🏥",
    description:
      "Лекува ранени войници и подпомага възстановяването на армията.",
    position: [-6.5, -5.5],
  },
  barracks: {
    name: "BARRACKS",
    icon: "🪖",
    description:
      "Тук се обучават и поддържат войниците на New Hope.",
    position: [6.5, -5.5],
  },
  research: {
    name: "RESEARCH CENTER",
    icon: "🔬",
    description:
      "Развива технологии за града и армията.",
    position: [-6.5, 5.5],
  },
  warehouse: {
    name: "WAREHOUSE",
    icon: "📦",
    description:
      "Съхранява храната, металите и останалите ресурси.",
    position: [6.5, 5.5],
  },
};

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [food, setFood] = useState(5000);
  const [metal, setMetal] = useState(3500);
  const [fuel] = useState(1000);

  const [cityLevel, setCityLevel] = useState(1);
  const [cityRestored, setCityRestored] = useState(false);

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

  /*
   * =========================================================
   * THREE.JS CITY
   * =========================================================
   */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x101713);

    scene.fog = new THREE.Fog(
      0x101713,
      28,
      75
    );

    const camera =
      new THREE.PerspectiveCamera(
        48,
        container.clientWidth /
          Math.max(container.clientHeight, 1),
        0.1,
        250
      );

    camera.position.set(
      19,
      18,
      21
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

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;

    container.appendChild(
      renderer.domElement
    );

    /*
     * =======================================================
     * LIGHT
     * =======================================================
     */

    const hemi =
      new THREE.HemisphereLight(
        0xcbd5c7,
        0x172019,
        2.2
      );

    scene.add(hemi);

    const sun =
      new THREE.DirectionalLight(
        0xffd7a6,
        3.4
      );

    sun.position.set(
      18,
      30,
      15
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
     * =======================================================
     * MATERIALS
     * =======================================================
     */

    const groundMat =
      new THREE.MeshStandardMaterial({
        color: 0x30362f,
        roughness: 1,
      });

    const asphaltMat =
      new THREE.MeshStandardMaterial({
        color: 0x1e2220,
        roughness: 0.95,
      });

    const concreteMat =
      new THREE.MeshStandardMaterial({
        color: 0x707068,
        roughness: 0.88,
      });

    const concreteDark =
      new THREE.MeshStandardMaterial({
        color: 0x3b3e39,
        roughness: 0.95,
      });

    const metalMat =
      new THREE.MeshStandardMaterial({
        color: 0x252a29,
        metalness: 0.65,
        roughness: 0.62,
      });

    const steelLight =
      new THREE.MeshStandardMaterial({
        color: 0x58605c,
        metalness: 0.7,
        roughness: 0.45,
      });

    const glassMat =
      new THREE.MeshStandardMaterial({
        color: 0x45676b,
        metalness: 0.25,
        roughness: 0.18,
        emissive: 0x0c1718,
      });

    const darkGlass =
      new THREE.MeshStandardMaterial({
        color: 0x1c3437,
        metalness: 0.35,
        roughness: 0.2,
      });

    const woodMat =
      new THREE.MeshStandardMaterial({
        color: 0x4a3627,
        roughness: 1,
      });

    const greenMat =
      new THREE.MeshStandardMaterial({
        color: 0x263a2a,
        roughness: 1,
      });

    const rustMat =
      new THREE.MeshStandardMaterial({
        color: 0x714b39,
        roughness: 0.95,
      });

    const lightMat =
      new THREE.MeshStandardMaterial({
        color: 0xc8a965,
        emissive: 0x5b4217,
        emissiveIntensity: 0.7,
      });

    /*
     * =======================================================
     * CITY ROOT
     * =======================================================
     */

    const city =
      new THREE.Group();

    scene.add(city);

    /*
     * =======================================================
     * HELPERS
     * =======================================================
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
      const m =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            w,
            h,
            d
          ),
          material
        );

      m.position.set(
        x,
        y,
        z
      );

      m.castShadow = true;
      m.receiveShadow = true;

      parent.add(m);

      return m;
    };

    const cylinder = (
      parent: THREE.Object3D,
      radius: number,
      height: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      segments = 12
    ) => {
      const m =
        new THREE.Mesh(
          new THREE.CylinderGeometry(
            radius,
            radius,
            height,
            segments
          ),
          material
        );

      m.position.set(
        x,
        y,
        z
      );

      m.castShadow = true;
      m.receiveShadow = true;

      parent.add(m);

      return m;
    };

    const window = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      w = 0.55,
      h = 0.72
    ) => {
      return box(
        parent,
        w,
        h,
        0.08,
        glassMat,
        x,
        y,
        z
      );
    };

    const light = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number
    ) => {
      return box(
        parent,
        0.16,
        0.16,
        0.06,
        lightMat,
        x,
        y,
        z
      );
    };

    const antenna = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      height = 2
    ) => {
      cylinder(
        parent,
        0.055,
        height,
        steelLight,
        x,
        y + height / 2,
        z,
        8
      );

      cylinder(
        parent,
        0.16,
        0.16,
        rustMat,
        x,
        y + height,
        z,
        10
      );
    };

    /*
     * =======================================================
     * GROUND
     * =======================================================
     */

    box(
      city,
      36,
      0.5,
      36,
      groundMat,
      0,
      -0.25,
      0
    );

    /*
     * =======================================================
     * ROAD SYSTEM
     * =======================================================
     */

    box(
      city,
      4.2,
      0.08,
      36,
      asphaltMat,
      0,
      0.03,
      0
    );

    box(
      city,
      36,
      0.08,
      4.2,
      asphaltMat,
      0,
      0.04,
      0
    );

    const roadMark =
      new THREE.MeshStandardMaterial({
        color: 0xb4ae92,
        roughness: 1,
      });

    for (
      let i = -16;
      i <= 16;
      i += 3
    ) {
      box(
        city,
        0.18,
        0.025,
        1.15,
        roadMark,
        0,
        0.095,
        i
      );

      box(
        city,
        1.15,
        0.025,
        0.18,
        roadMark,
        i,
        0.1,
        0
      );
    }

    /*
     * =======================================================
     * BUILDING GROUPS
     * =======================================================
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
          0.18,
          0
        );

        box(
          g,
          5.05,
          3.25,
          5.05,
          concreteMat,
          0,
          1.95,
          0
        );

        box(
          g,
          5.35,
          0.3,
          5.35,
          metalMat,
          0,
          3.62,
          0
        );

        const roof =
          new THREE.Mesh(
            new THREE.ConeGeometry(
              3.75,
              1.45,
              4
            ),
            concreteDark
          );

        roof.position.y = 4.48;
        roof.rotation.y =
          Math.PI / 4;

        roof.castShadow = true;

        g.add(roof);

        /*
         * Front windows
         */

        for (
          const x of [-1.55, 0, 1.55]
        ) {
          window(
            g,
            x,
            1.9,
            2.57,
            0.62,
            0.78
          );

          light(
            g,
            x,
            1.9,
            2.61
          );
        }

        /*
         * Door
         */

        box(
          g,
          0.95,
          1.9,
          0.13,
          metalMat,
          0,
          0.98,
          2.59
        );

        /*
         * Control tower
         */

        box(
          g,
          1.35,
          5.2,
          1.35,
          metalMat,
          0,
          2.8,
          -3
        );

        box(
          g,
          1.9,
          0.18,
          1.9,
          steelLight,
          0,
          5.45,
          -3
        );

        antenna(
          g,
          0,
          5.55,
          -3,
          2.4
        );

        g.position.set(
          0,
          0,
          0
        );

        city.add(g);

        buildings.push({
          group: g,
          id: "command",
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
          4.1,
          concreteDark,
          0,
          0.15,
          0
        );

        box(
          g,
          4.55,
          2.65,
          3.65,
          concreteMat,
          0,
          1.48,
          0
        );

        box(
          g,
          4.8,
          0.28,
          3.9,
          steelLight,
          0,
          2.95,
          0
        );

        for (
          const x of [-1.45, 0, 1.45]
        ) {
          window(
            g,
            x,
            1.55,
            1.86,
            0.62,
            0.75
          );
        }

        box(
          g,
          0.95,
          1.7,
          0.13,
          metalMat,
          0,
          0.9,
          1.88
        );

        /*
         * Red cross built from geometry
         */

        box(
          g,
          1.55,
          0.32,
          0.1,
          rustMat,
          0,
          2.05,
          1.93
        );

        box(
          g,
          0.32,
          1.25,
          0.1,
          rustMat,
          0,
          2.05,
          1.96
        );

        g.position.set(
          -6.5,
          0,
          -5.5
        );

        city.add(g);

        buildings.push({
          group: g,
          id: "hospital",
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
          4.55,
          2.55,
          3.55,
          concreteDark,
          0,
          1.43,
          0
        );

        box(
          g,
          4.85,
          0.28,
          3.85,
          metalMat,
          0,
          2.85,
          0
        );

        for (
          const x of [-1.45, 0, 1.45]
        ) {
          window(
            g,
            x,
            1.55,
            1.82
          );
        }

        box(
          g,
          0.9,
          1.7,
          0.13,
          metalMat,
          0,
          0.9,
          1.84
        );

        /*
         * Watch towers
         */

        for (
          const x of [-2.05, 2.05]
        ) {
          box(
            g,
            0.42,
            3.9,
            0.42,
            steelLight,
            x,
            1.95,
            -1.45
          );

          box(
            g,
            0.9,
            0.22,
            0.9,
            metalMat,
            x,
            3.95,
            -1.45
          );
        }

        g.position.set(
          6.5,
          0,
          -5.5
        );

        city.add(g);

        buildings.push({
          group: g,
          id: "barracks",
        });
      };

    /*
     * RESEARCH CENTER
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
          4.55,
          2.85,
          3.55,
          concreteMat,
          0,
          1.58,
          0
        );

        box(
          g,
          4.8,
          0.3,
          3.8,
          metalMat,
          0,
          3.08,
          0
        );

        for (
          const x of [-1.45, 0, 1.45]
        ) {
          window(
            g,
            x,
            1.7,
            1.82,
            0.72,
            0.9
          );
        }

        box(
          g,
          0.8,
          1.65,
          0.12,
          darkGlass,
          0,
          0.87,
          1.85
        );

        antenna(
          g,
          1.45,
          3.25,
          0,
          2
        );

        g.position.set(
          -6.5,
          0,
          5.5
        );

        city.add(g);

        buildings.push({
          group: g,
          id: "research",
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
          5.3,
          0.3,
          4.1,
          concreteDark,
          0,
          0.15,
          0
        );

        box(
          g,
          4.9,
          2.3,
          3.65,
          concreteDark,
          0,
          1.3,
          0
        );

        /*
         * Roof beams
         */

        for (
          const z of [-1.45, 1.45]
        ) {
          box(
            g,
            5.2,
            0.3,
            0.35,
            metalMat,
            0,
            2.55,
            z
          );
        }

        /*
         * Loading doors
         */

        for (
          const x of [-1.3, 1.3]
        ) {
          box(
            g,
            1.1,
            1.65,
            0.13,
            metalMat,
            x,
            0.88,
            1.86
          );

          box(
            g,
            0.08,
            1.65,
            0.16,
            steelLight,
            x,
            0.88,
            1.91
          );
        }

        g.position.set(
          6.5,
          0,
          5.5
        );

        city.add(g);

        buildings.push({
          group: g,
          id: "warehouse",
        });
      };

    createCommand();
    createHospital();
    createBarracks();
    createResearch();
    createWarehouse();

    /*
     * =======================================================
     * UPGRADE PART CREATION
     * =======================================================
     */

    const clearUpgradeParts =
      (g: THREE.Group) => {
        const remove: THREE.Object3D[] =
          [];

        g.traverse(
          child => {
            if (
              child !== g &&
              child.userData.upgradePart
            ) {
              remove.push(child);
            }
          }
        );

        for (
          const child of remove
        ) {
          if (child.parent) {
            child.parent.remove(child);
          }
        }
      };

    const addLevelParts =
      (
        id: BuildingId,
        level: number
      ) => {
        const item =
          buildings.find(
            b => b.id === id
          );

        if (!item) return;

        const g = item.group;

        clearUpgradeParts(g);

        if (level <= 1) return;

        /*
         * ===================================================
         * COMMAND CENTER
         * ===================================================
         */

        if (id === "command") {
          if (level >= 2) {
            const part =
              box(
                g,
                3.9,
                1.15,
                3.9,
                concreteMat,
                0,
                4.25,
                0
              );

            part.userData.upgradePart =
              true;

            antenna(
              g,
              -1.25,
              5,
              0,
              1.8
            );
          }

          if (level >= 3) {
            const part =
              box(
                g,
                2.8,
                1.8,
                2.8,
                concreteDark,
                0,
                5.65,
                0
              );

            part.userData.upgradePart =
              true;

            antenna(
              g,
              1,
              6.5,
              0,
              2.2
            );
          }

          if (level >= 4) {
            const part =
              box(
                g,
                5.7,
                0.28,
                5.7,
                steelLight,
                0,
                7,
                0
              );

            part.userData.upgradePart =
              true;
          }

          if (level >= 5) {
            for (
              const x of [-2.1, 2.1]
            ) {
              const part =
                box(
                  g,
                  0.65,
                  2.5,
                  0.65,
                  metalMat,
                  x,
                  8.2,
                  0
                );

              part.userData.upgradePart =
                true;
            }
          }
        }

        /*
         * ===================================================
         * HOSPITAL
         * ===================================================
         */

        if (id === "hospital") {
          if (level >= 2) {
            const part =
              box(
                g,
                3.9,
                1.25,
                3,
                concreteMat,
                0,
                3.65,
                0
              );

            part.userData.upgradePart =
              true;

            box(
              g,
              4.1,
              0.25,
              3.2,
              steelLight,
              0,
              4.3,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 3) {
            antenna(
              g,
              1.5,
              4.4,
              0,
              2.1
            );
          }

          if (level >= 4) {
            const part =
              box(
                g,
                3.2,
                1.7,
                2.7,
                concreteDark,
                0,
                5,
                0
              );

            part.userData.upgradePart =
              true;
          }

          if (level >= 5) {
            box(
              g,
              1.4,
              0.3,
              0.15,
              rustMat,
              0,
              5.6,
              1.4
            ).userData.upgradePart =
              true;
          }
        }

        /*
         * ===================================================
         * BARRACKS
         * ===================================================
         */

        if (id === "barracks") {
          if (level >= 2) {
            box(
              g,
              3.9,
              1.15,
              2.9,
              concreteDark,
              0,
              3.35,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 3) {
            for (
              const x of [-1.7, 1.7]
            ) {
              box(
                g,
                0.5,
                2.4,
                0.5,
                steelLight,
                x,
                4.7,
                -1.2
              ).userData.upgradePart =
                true;
            }
          }

          if (level >= 4) {
            box(
              g,
              4.4,
              0.25,
              3.4,
              metalMat,
              0,
              4.7,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 5) {
            antenna(
              g,
              0,
              4.8,
              -1,
              2
            );
          }
        }

        /*
         * ===================================================
         * RESEARCH
         * ===================================================
         */

        if (id === "research") {
          if (level >= 2) {
            box(
              g,
              3.8,
              1.2,
              2.9,
              concreteMat,
              0,
              4,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 3) {
            antenna(
              g,
              -1.2,
              5,
              0,
              2.3
            );
          }

          if (level >= 4) {
            const dome =
              new THREE.Mesh(
                new THREE.SphereGeometry(
                  1.45,
                  16,
                  8,
                  0,
                  Math.PI * 2,
                  0,
                  Math.PI / 2
                ),
                darkGlass
              );

            dome.position.set(
              0,
              5.1,
              0
            );

            dome.userData.upgradePart =
              true;

            dome.castShadow = true;

            g.add(dome);
          }

          if (level >= 5) {
            box(
              g,
              5,
              0.25,
              4,
              steelLight,
              0,
              6,
              0
            ).userData.upgradePart =
              true;
          }
        }

        /*
         * ===================================================
         * WAREHOUSE
         * ===================================================
         */

        if (id === "warehouse") {
          if (level >= 2) {
            box(
              g,
              5,
              1,
              3.7,
              concreteDark,
              0,
              3.15,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 3) {
            box(
              g,
              5.4,
              0.25,
              4.1,
              steelLight,
              0,
              4.05,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 4) {
            box(
              g,
              4.3,
              1.3,
              3,
              concreteDark,
              0,
              4.8,
              0
            ).userData.upgradePart =
              true;
          }

          if (level >= 5) {
            for (
              const x of [-1.8, 1.8]
            ) {
              box(
                g,
                0.25,
                3.2,
                0.25,
                steelLight,
                x,
                6,
                0
              ).userData.upgradePart =
                true;
            }
          }
        }

        /*
         * ===================================================
         * HIGHER LEVELS
         *
         * Every few levels the entire building gets larger.
         * This makes levels 6-30 visibly different.
         * ===================================================
         */

        if (level >= 6) {
          const floors =
            Math.min(
              5,
              Math.floor(
                (level - 4) / 4
              )
            );

          for (
            let i = 0;
            i < floors;
            i++
          ) {
            const height =
              0.8 +
              i * 0.9;

            const size =
              3.2 -
              i * 0.18;

            box(
              g,
              size,
              0.75,
              size,
              i % 2 === 0
                ? concreteMat
                : concreteDark,
              0,
              6.3 + i * 0.85,
              0
            ).userData.upgradePart =
              true;

            for (
              const x of [-1, 1]
            ) {
              box(
                g,
                0.35,
                0.5,
                0.06,
                glassMat,
                x,
                6.3 +
                  i * 0.85,
                size / 2 +
                  0.04
              ).userData.upgradePart =
                true;
            }
          }
        }

        if (level >= 10) {
          for (
            const x of [-2.3, 2.3]
          ) {
            box(
              g,
              0.35,
              4,
              0.35,
              metalMat,
              x,
              7.5,
              -1.7
            ).userData.upgradePart =
              true;
          }
        }

        if (level >= 15) {
          const antennaHeight =
            2 +
            (level - 15) *
              0.25;

          antenna(
            g,
            0,
            8,
            0,
            antennaHeight
          );
        }

        if (level >= 20) {
          box(
            g,
            5.5,
            0.22,
            5.5,
            steelLight,
            0,
            10,
            0
          ).userData.upgradePart =
            true;
        }

        if (level >= 25) {
          box(
            g,
            3.8,
            1,
            3.8,
            concreteMat,
            0,
            11,
            0
          ).userData.upgradePart =
            true;

          antenna(
            g,
            0,
            11.5,
            0,
            3.5
          );
        }

        /*
         * scale based on level
         */

        const scale =
          1 +
          Math.min(
            0.28,
            Math.max(
              0,
              level - 1
            ) *
              0.009
          );

        g.scale.set(
          scale,
          scale,
          scale
        );
      };

    /*
     * =======================================================
     * RUINS
     * =======================================================
     */

    const addRuins =
      () => {
        const ruinMat =
          new THREE.MeshStandardMaterial({
            color: 0x353732,
            roughness: 1,
          });

        const positions: [
          number,
          number,
          number
        ][] = [
          [-11, -9, 1],
          [11, -9, 0.8],
          [-11, 9, 0.9],
          [11, 9, 1.1],
        ];

        for (
          const [
            x,
            z,
            s,
          ] of positions
        ) {
          const g =
            new THREE.Group();

          box(
            g,
            2.5 * s,
            1.2 * s,
            2.4 * s,
            ruinMat,
            0,
            0.6 * s,
            0
          );

          box(
            g,
            0.8 * s,
            2.3 * s,
            0.45 * s,
            concreteMat,
            0.65 * s,
            1.1 * s,
            0
          );

          box(
            g,
            0.55 * s,
            1.6 * s,
            0.4 * s,
            concreteDark,
            -0.65 * s,
            0.8 * s,
            0
          );

          g.position.set(
            x,
            0,
            z
          );

          g.rotation.y =
            Math.random() * 0.5;

          city.add(g);
        }
      };

    addRuins();

    /*
     * =======================================================
     * WALL
     * =======================================================
     */

    const wallHeight = 2.8;

    const wall =
      (
        width: number,
        depth: number,
        x: number,
        z: number
      ) => {
        box(
          city,
          width,
          wallHeight,
          depth,
          concreteDark,
          x,
          wallHeight / 2,
          z
        );

        const count =
          Math.max(
            3,
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
            i /
            Math.max(
              count - 1,
              1
            );

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

          box(
            city,
            0.18,
            wallHeight + 0.45,
            0.18,
            metalMat,
            px,
            (wallHeight +
              0.45) /
              2,
            pz
          );
        }
      };

    wall(
      31,
      0.85,
      0,
      -15
    );

    wall(
      31,
      0.85,
      0,
      15
    );

    wall(
      0.85,
      31,
      -15,
      0
    );

    wall(
      0.85,
      31,
      15,
      0
    );

    /*
     * =======================================================
     * MAIN GATE
     * =======================================================
     */

    box(
      city,
      3,
      4.8,
      1.1,
      concreteDark,
      -2.7,
      2.4,
      15
    );

    box(
      city,
      3,
      4.8,
      1.1,
      concreteDark,
      2.7,
      2.4,
      15
    );

    box(
      city,
      8.4,
      1,
      1.3,
      concreteDark,
      0,
      4.9,
      15
    );

    box(
      city,
      4.7,
      2.5,
      0.22,
      metalMat,
      0,
      1.3,
      14.45
    );

    /*
     * =======================================================
     * TREES
     * =======================================================
     */

    const tree = (
      x: number,
      z: number,
      scale: number
    ) => {
      const g =
        new THREE.Group();

      cylinder(
        g,
        0.2 * scale,
        1.8 * scale,
        woodMat,
        0,
        0.9 * scale,
        0,
        8
      );

      const crown =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            1.2 * scale,
            2.8 * scale,
            8
          ),
          greenMat
        );

      crown.position.y =
        2.55 * scale;

      crown.castShadow = true;

      g.add(crown);

      g.position.set(
        x,
        0,
        z
      );

      city.add(g);
    };

    tree(-11, -3, 1);
    tree(11, -3, 0.8);
    tree(-11, 3, 0.9);
    tree(11, 3, 1.1);
    tree(-8, -12, 0.8);
    tree(8, -12, 1);

    /*
     * =======================================================
     * RUBBLE
     * =======================================================
     */

    for (
      let i = 0;
      i < 60;
      i++
    ) {
      const x =
        (Math.random() - 0.5) *
        29;

      const z =
        (Math.random() - 0.5) *
        29;

      /*
       * Avoid central roads.
       */

      if (
        Math.abs(x) < 2.8 ||
        Math.abs(z) < 2.8
      ) {
        continue;
      }

      const r =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.2 +
              Math.random() * 0.5,
            0.15 +
              Math.random() * 0.4,
            0.2 +
              Math.random() * 0.5
          ),
          concreteDark
        );

      r.position.set(
        x,
        0.18,
        z
      );

      r.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
      );

      r.castShadow = true;

      city.add(r);
    }

    /*
     * =======================================================
     * INITIAL BUILDING STATE
     * =======================================================
     */

    buildings.forEach(
      item => {
        const restored =
          restoredRef.current[
            item.id
          ];

        const level =
          levelsRef.current[
            item.id
          ];

        item.group.visible = true;

        if (!restored) {
          item.group.scale.set(
            0.82,
            0.82,
            0.82
          );

          item.group.position.y =
            -0.08;
        } else {
          item.group.scale.set(
            1,
            1,
            1
          );

          addLevelParts(
            item.id,
            level
          );
        }
      }
    );

    /*
     * =======================================================
     * RAYCAST CLICK
     * =======================================================
     */

    const raycaster =
      new THREE.Raycaster();

    const pointer =
      new THREE.Vector2();

    const findBuilding =
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

    let pointerDownX = 0;
    let pointerDownY = 0;
    let moved = false;

    const pointerDown =
      (
        e: PointerEvent
      ) => {
        pointerDownX =
          e.clientX;

        pointerDownY =
          e.clientY;

        moved = false;
      };

    const pointerMove =
      (
        e: PointerEvent
      ) => {
        if (
          Math.abs(
            e.clientX -
              pointerDownX
          ) > 8 ||
          Math.abs(
            e.clientY -
              pointerDownY
          ) > 8
        ) {
          moved = true;
        }
      };

    const click =
      (
        e: PointerEvent
      ) => {
        if (moved) return;

        const rect =
          renderer.domElement.getBoundingClientRect();

        pointer.x =
          ((e.clientX -
            rect.left) /
            rect.width) *
            2 -
          1;

        pointer.y =
          -(
            (e.clientY -
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
            findBuilding(
              hit.object
            );

          if (!id) continue;

          setSelectedBuilding({
            id,
            name:
              BUILDINGS[id].name,
            icon:
              BUILDINGS[id].icon,
            description:
              BUILDINGS[id]
                .description,
            level:
              levelsRef.current[
                id
              ],
            restored:
              restoredRef.current[
                id
              ],
          });

          return;
        }
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
      click
    );

    /*
     * =======================================================
     * CAMERA ROTATION / TOUCH
     * =======================================================
     */

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const down =
      (
        e: PointerEvent
      ) => {
        dragging = true;
        lastX =
          e.clientX;
        lastY =
          e.clientY;
      };

    const move =
      (
        e: PointerEvent
      ) => {
        if (!dragging) return;

        const dx =
          e.clientX - lastX;

        const dy =
          e.clientY - lastY;

        if (
          Math.abs(dx) > 1 ||
          Math.abs(dy) > 1
        ) {
          moved = true;
        }

        city.rotation.y +=
          dx * 0.006;

        camera.position.y =
          THREE.MathUtils.clamp(
            camera.position.y -
              dy * 0.035,
            9,
            32
          );

        lastX =
          e.clientX;

        lastY =
          e.clientY;
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

    renderer.domElement.addEventListener(
      "pointercancel",
      up
    );

    /*
     * =======================================================
     * PINCH ZOOM
     * =======================================================
     */

    let pinchDistance = 0;

    const touchMove =
      (
        e: TouchEvent
      ) => {
        if (
          e.touches.length !== 2
        ) {
          return;
        }

        e.preventDefault();

        const a =
          e.touches[0];

        const b =
          e.touches[1];

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
          pinchDistance > 0
        ) {
          const delta =
            distance -
            pinchDistance;

          const factor =
            delta > 0
              ? 0.975
              : 1.025;

          camera.position.multiplyScalar(
            factor
          );

          camera.position.y =
            THREE.MathUtils.clamp(
              camera.position.y,
              8,
              35
            );
        }

        pinchDistance =
          distance;
      };

    const touchEnd =
      () => {
        pinchDistance = 0;
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
     * =======================================================
     * ANIMATION
     * =======================================================
     */

    let animation = 0;

    const animate = () => {
      animation =
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
     * =======================================================
     * RESIZE
     * =======================================================
     */

    const resize = () => {
      const width =
        container.clientWidth;

      const height =
        Math.max(
          container.clientHeight,
          1
        );

      camera.aspect =
        width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );
    };

    window.addEventListener(
      "resize",
      resize
    );

    resize();

    /*
     * =======================================================
     * EXPOSE UPDATE FUNCTION
     * =======================================================
     */

    (
      container as any
    ).__updateCity = (
      nextLevels: Record<
        BuildingId,
        number
      >,
      nextRestored: Record<
        BuildingId,
        boolean
      >
    ) => {
      for (
        const item of buildings
      ) {
        const restored =
          nextRestored[
            item.id
          ];

        const level =
          nextLevels[
            item.id
          ];

        item.group.visible = true;

        clearUpgradeParts(
          item.group
        );

        if (!restored) {
          item.group.scale.set(
            0.82,
            0.82,
            0.82
          );

          item.group.position.y =
            -0.08;
        } else {
          item.group.position.y =
            0;

          addLevelParts(
            item.id,
            level
          );
        }
      }
    };

    /*
     * =======================================================
     * CLEANUP
     * =======================================================
     */

    return () => {
      cancelAnimationFrame(
        animation
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
        "pointermove",
        pointerMove
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
        "pointercancel",
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
   * =========================================================
   * UPDATE THREE.JS WHEN STATE CHANGES
   * =========================================================
   */

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) return;

    const update =
      (container as any)
        .__updateCity;

    if (update) {
      update(
        buildingLevels,
        buildingRestored
      );
    }
  }, [
    buildingLevels,
    buildingRestored,
  ]);

  /*
   * =========================================================
   * RESTORE CITY
   * =========================================================
   */

  const restoreCity = () => {
    if (
      food < 100 ||
      metal < 100
    ) {
      return;
    }

    const restored = {
      command: true,
      hospital: true,
      barracks: true,
      research: true,
      warehouse: true,
    };

    const levels = {
      command: 1,
      hospital: 1,
      barracks: 1,
      research: 1,
      warehouse: 1,
    };

    setFood(
      value => value - 100
    );

    setMetal(
      value => value - 100
    );

    setCityRestored(true);

    setBuildingRestored(
      restored
    );

    setBuildingLevels(
      levels
    );
  };

  /*
   * =========================================================
   * RESTORE SINGLE BUILDING
   * =========================================================
   */

  const restoreBuilding = () => {
    if (!selectedBuilding)
      return;

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
      current => ({
        ...current,
        [id]: true,
      })
    );

    setBuildingLevels(
      current => ({
        ...current,
        [id]: 1,
      })
    );

    setSelectedBuilding(
      current =>
        current
          ? {
              ...current,
              restored: true,
              level: 1,
            }
          : null
    );

    if (id === "command") {
      setCityLevel(1);
    }
  };

  /*
   * =========================================================
   * UPGRADE
   * =========================================================
   */

  const upgradeBuilding = () => {
    if (!selectedBuilding)
      return;

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
      Math.round(
        200 *
          Math.pow(
            1.18,
            level - 1
          )
      );

    const metalCost =
      Math.round(
        150 *
          Math.pow(
            1.18,
            level - 1
          )
      );

    if (
      food < foodCost ||
      metal < metalCost
    ) {
      return;
    }

    const newLevel =
      level + 1;

    setFood(
      value =>
        value - foodCost
    );

    setMetal(
      value =>
        value - metalCost
    );

    setBuildingLevels(
      current => ({
        ...current,
        [id]: newLevel,
      })
    );

    setSelectedBuilding(
      current =>
        current
          ? {
              ...current,
              level: newLevel,
            }
          : null
    );

    if (id === "command") {
      setCityLevel(
        Math.min(
          30,
          newLevel
        )
      );
    }
  };

  /*
   * =========================================================
   * SELECTED COST
   * =========================================================
   */

  let foodCost = 0;
  let metalCost = 0;

  if (selectedBuilding) {
    const level =
      buildingLevels[
        selectedBuilding.id
      ];

    foodCost =
      Math.round(
        200 *
          Math.pow(
            1.18,
            Math.max(
              0,
              level - 1
            )
          )
      );

    metalCost =
      Math.round(
        150 *
          Math.pow(
            1.18,
            Math.max(
              0,
              level - 1
            )
          )
      );
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

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

          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              color: cityRestored
                ? "#8fd18f"
                : "#d8a36a",
              letterSpacing:
                "1px",
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
                ? `LEVEL ${selectedBuilding.level} / 30`
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
                  🔨 RESTORE
                </button>
              </>
            ) : (
              <>
                <div className="upgrade-cost">

                  <span>
                    🍖 {foodCost}
                  </span>

                  <span>
                    🔩 {metalCost}
                  </span>

                </div>

                <button
                  className="upgrade-button"
                  onClick={
                    upgradeBuilding
                  }
                  disabled={
                    selectedBuilding.level >=
                      30 ||
                    food < foodCost ||
                    metal < metalCost
                  }
                >
                  {selectedBuilding.level >=
                  30
                    ? "MAX LEVEL"
                    : "⬆ UPGRADE"}
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
                New Hope е разрушен.
                Възстанови града и
                започни новата ера.
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
                🔨 ВЪЗСТАНОВИ ГРАДА
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
                Сега започва
                развитието му.
              </p>

              <small>
                👆 Натисни сграда
                <br />
                ↔️ Плъзни за завъртане
                <br />
                🤏 Два пръста за zoom
                <br />
                ⬆️ Upgrade променя
                сградата визуално
              </small>

            </div>
          )}

      </section>

    </main>
  );
}