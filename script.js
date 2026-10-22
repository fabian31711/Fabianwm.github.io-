/* =====================================================
   ZUNO VOLT — OPTIMIZED MODERN CITY EDITION
   Three.js | Dynamic Time | Dynamic Weather
   Blue Supercar | Energy Canisters | Obstacles
   Performance Optimized
===================================================== */

(async function ZunoVolt() {
  "use strict";

  // 1. LOAD THREE.JS
  function loadThree() {
    return new Promise((resolve, reject) => {
      if (window.THREE) return resolve(window.THREE);

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = () => resolve(window.THREE);
      script.onerror = () => reject(new Error("Three.js gagal dimuat."));
      document.head.appendChild(script);
    });
  }

  let THREE;

  try {
    THREE = await loadThree();
  } catch (error) {
    document.body.innerHTML = `
      <div style="padding:30px;font:16px Arial;color:white;background:#091b31">
        <h2>ZUNO VOLT tidak dapat dimuat</h2>
        <p>Periksa koneksi internet, lalu muat ulang halaman.</p>
        <a href="../index.html" style="color:#66eaff">Kembali ke profil</a>
      </div>`;
    return;
  }

  // 2. CONFIGURATION
  const CONFIG = {
    roadWidth: 18,
    roadLength: 260,
    carSpeed: 27,
    playerLimit: 6.5,
    canisterSpacing: 29,
    obstacleSpacing: 43,
    timeCycleSeconds: 180,
    weatherChangeMin: 35,
    weatherChangeMax: 65,
    maxRainDrops: 140,
    pixelRatio: 1,
    maxDelta: 0.04
  };

      // MODE PERMAINAN
  let selectedDifficulty = "normal";

  function getCanisterSpacing() {
    return selectedDifficulty === "easy"
      ? CONFIG.canisterSpacing * 1.25
      : CONFIG.canisterSpacing;
  }

  function getObstacleSpacing() {
    if (selectedDifficulty === "easy") return 13.5;
    if (selectedDifficulty === "hard") return 58;
    return CONFIG.obstacleSpacing;
  }

  function getObstacleLimit() {
    if (selectedDifficulty === "easy") return 8;
    if (selectedDifficulty === "hard") return 4;
    return 5;
  }
    
  // 3. INTERFACE
  const oldStyle = document.getElementById("zuno-volt-style");
  if (oldStyle) oldStyle.remove();

  const oldRoot = document.getElementById("zuno-game");
  if (oldRoot) oldRoot.remove();

  const style = document.createElement("style");
  style.id = "zuno-volt-style";
  style.textContent = `
    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #071321;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
    }

    #zuno-game {
      position: fixed;
      inset: 0;
      overflow: hidden;
      background: #071321;
      color: white;
      isolation: isolate;
    }

    #zuno-game canvas {
      display: block;
      width: 100%;
      height: 100%;
      outline: none;
    }

    .zuno-hud {
      position: absolute;
      inset: 0;
      z-index: 5;
      pointer-events: none;
    }

    .zuno-topbar {
      position: absolute;
      top: 18px;
      left: 18px;
      right: 18px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .zuno-brand, .zuno-stats, .zuno-weather-card {
      background: rgba(6, 19, 37, .88);
      border: 1px solid rgba(102, 226, 255, .22);
      border-radius: 14px;
      padding: 12px 16px;
    }

    .zuno-brand strong {
      display: block;
      letter-spacing: 3px;
      font-size: 17px;
      color: #75eaff;
    }

    .zuno-brand span {
      display: block;
      margin-top: 4px;
      font-size: 10px;
      letter-spacing: 2px;
      color: #b8cce0;
    }

    .zuno-stats {
      display: flex;
      gap: 22px;
      text-align: right;
    }

    .zuno-stat-label {
      display: block;
      color: #9fb6ce;
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .zuno-stat-value {
      display: block;
      margin-top: 4px;
      color: white;
      font-size: 21px;
      font-weight: 800;
    }

    .zuno-weather-card {
      position: absolute;
      top: 104px;
      right: 18px;
      min-width: 150px;
      text-align: right;
    }

    .zuno-weather-card small {
      color: #9fb6ce;
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .zuno-weather-card strong {
      display: block;
      margin-top: 5px;
      font-size: 13px;
    }

    .zuno-controls {
      position: absolute;
      top: 104px;
      left: 18px;
      width: min(240px, calc(100vw - 36px));
      pointer-events: auto;
      background: rgba(6, 19, 37, .90);
      border: 1px solid rgba(102, 226, 255, .22);
      border-radius: 14px;
      padding: 13px;
    }

    .zuno-controls label {
      display: block;
      margin-bottom: 6px;
      color: #a9bfd6;
      font-size: 11px;
    }

    .zuno-controls select, .zuno-btn {
      width: 100%;
      border: 1px solid rgba(102, 226, 255, .35);
      border-radius: 8px;
      padding: 10px;
      color: #ecf9ff;
      background: #102b4c;
      font: inherit;
      font-size: 12px;
      cursor: pointer;
      outline: none;
    }

    .zuno-controls select { margin-bottom: 10px; }
    .zuno-btn:hover { background: #19436c; }
    .zuno-controls .zuno-btn { margin-top: 2px; }

    .zuno-help {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 15px;
      border: 1px solid rgba(102, 226, 255, .2);
      border-radius: 10px;
      background: rgba(6, 19, 37, .88);
      color: #d4e8f7;
      font-size: 11px;
      text-align: center;
      white-space: nowrap;
    }

    .zuno-overlay {
      position: absolute;
      z-index: 10;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(3, 11, 23, .82);
    }

    .zuno-modal {
      width: min(420px, 100%);
      padding: 30px;
      text-align: center;
      background: linear-gradient(145deg, #102b4c, #071321);
      border: 1px solid rgba(102, 226, 255, .38);
      border-radius: 20px;
    }

    .zuno-modal h1 {
      margin: 0 0 8px;
      font-size: clamp(26px, 5vw, 38px);
      letter-spacing: 3px;
      color: #75eaff;
    }

    .zuno-modal p {
      color: #b9ccdf;
      font-size: 13px;
      line-height: 1.7;
    }

    .zuno-modal .zuno-btn {
      margin-top: 10px;
      padding: 12px;
      font-weight: 700;
    }

    .zuno-modal .zuno-primary {
      background: #0b91bd;
      border-color: #56e4ff;
    }

    .zuno-modal .zuno-primary:hover { background: #12afd9; }

    .zuno-bottom-buttons {
      position: absolute;
      bottom: 72px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      pointer-events: auto;
    }

    .zuno-bottom-buttons button {
      width: 58px;
      height: 48px;
      border-radius: 12px;
      border: 1px solid rgba(102, 226, 255, .4);
      background: rgba(6, 19, 37, .88);
      color: #dffaff;
      font-size: 20px;
      touch-action: none;
    }

    .zuno-bottom-buttons button:active { background: #087da4; }

    @media (max-width: 600px) {
      .zuno-topbar { top: 10px; left: 10px; right: 10px; }
      .zuno-brand, .zuno-stats { padding: 10px; }
      .zuno-brand strong { font-size: 13px; }
      .zuno-brand span { font-size: 8px; letter-spacing: 1px; }
      .zuno-stats { gap: 12px; }
      .zuno-stat-value { font-size: 17px; }
      .zuno-weather-card { top: 86px; right: 10px; padding: 10px; }
      .zuno-controls { top: 86px; left: 10px; width: 158px; padding: 9px; }
      .zuno-controls select, .zuno-btn { padding: 8px; font-size: 11px; }
      .zuno-help { bottom: 12px; font-size: 9px; max-width: 94vw; white-space: normal; }
      .zuno-bottom-buttons { bottom: 58px; }
      .zuno-bottom-buttons button { width: 48px; height: 42px; }
      .zuno-modal { padding: 24px; }
    }
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "zuno-game";
  root.innerHTML = `
    <div class="zuno-hud">
      <div class="zuno-topbar">
        <div class="zuno-brand">
          <span>MODERN CITY DRIVE</span>
        </div>
        <div class="zuno-stats">
          <div>
            <span class="zuno-stat-label">Energy</span>
            <span class="zuno-stat-value" id="zuno-score">0</span>
          </div>
          <div>
            <span class="zuno-stat-label">Distance</span>
            <span class="zuno-stat-value" id="zuno-distance">0 m</span>
          </div>
        </div>
      </div>

      <div class="zuno-controls">
        <label for="zuno-time-mode">TIME SYSTEM</label>
        <select id="zuno-time-mode">
          <option value="auto">Automatic cycle</option>
          <option value="dawn">Morning</option>
          <option value="noon">Daytime</option>
          <option value="sunset">Sunset</option>
          <option value="night">Night</option>
        </select>

        <label for="zuno-weather-mode">WEATHER SYSTEM</label>
        <select id="zuno-weather-mode">
          <option value="dynamic">Dynamic weather</option>
          <option value="clear">Clear</option>
          <option value="rain">Rain</option>
          <option value="fog">Fog</option>
        </select>

        <button class="zuno-btn" id="zuno-return">← Back to Profile</button>
      </div>

      <div class="zuno-weather-card">
        <small>City conditions</small>
        <strong id="zuno-condition">☀ Clear · Morning</strong>
      </div>

      <div class="zuno-bottom-buttons">
        <button id="zuno-left" aria-label="Move left">←</button>
        <button id="zuno-right" aria-label="Move right">→</button>
      </div>

      <div class="zuno-help">
        A / D atau ← / → untuk bergerak · Hindari penghalang · Kumpulkan energi
      </div>
    </div>

    <div class="zuno-overlay" id="zuno-overlay">
      <div class="zuno-modal">
        <h1 id="zuno-overlay-title">ZUNO VOLT</h1>
        <p id="zuno-overlay-text">
          Jelajahi kota modern, kumpulkan Energy Canister, dan hindari penghalang.
          Waktu dan cuaca akan berubah selama permainan.
        </p>
        <button class="zuno-btn zuno-primary" id="zuno-start">START DRIVING</button>
        <button class="zuno-btn" id="zuno-back-menu">BACK TO PROFILE</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const $ = (id) => document.getElementById(id);
  const scoreElement = $("zuno-score");
  const distanceElement = $("zuno-distance");
  const conditionElement = $("zuno-condition");
  const overlay = $("zuno-overlay");
  const overlayTitle = $("zuno-overlay-title");
  const overlayText = $("zuno-overlay-text");
  const startButton = $("zuno-start");

  // 4. THREE.JS SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8cb8df);
  scene.fog = new THREE.FogExp2(0x8cb8df, 0.004);

  const camera = new THREE.PerspectiveCamera(
    65, window.innerWidth / window.innerHeight, 0.1, 500
  );
  camera.position.set(0, 6.5, 12.5);
  camera.lookAt(0, 1, -8);

  // PERFORMANCE: no antialiasing, shadows, or expensive tone mapping.
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: false,
    stencil: false,
    depth: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;

  root.insertBefore(renderer.domElement, root.firstChild);

  // 5. LIGHTING AND SKY
  const hemiLight = new THREE.HemisphereLight(0xcceaff, 0x1b2639, 1.35);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffe2b3, 1.6);
  sunLight.position.set(-25, 35, 15);
  scene.add(sunLight);

  const fillLight = new THREE.PointLight(0x168dff, 0.8, 60);
  fillLight.position.set(0, 8, 5);
  scene.add(fillLight);

  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(300, 12, 8),
    new THREE.MeshBasicMaterial({
      color: 0x8cb8df,
      side: THREE.BackSide,
      fog: false
    })
  );
  scene.add(skyDome);

  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(3, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffedbd, fog: false })
  );
  sunDisc.position.set(-48, 34, -120);
  scene.add(sunDisc);

  // 6. MATERIALS
  const mat = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, ...extra });

  const roadMaterial = mat(0x202b3a, {
    roughness: 0.7,
    metalness: 0.15
  });

  const sidewalkMaterial = mat(0x68798a, { roughness: 0.9 });
  const laneMaterial = new THREE.MeshBasicMaterial({ color: 0x91bad7 });

  const buildingMaterials = [
    mat(0x22364c, { roughness: 0.75 }),
    mat(0x344b62, { roughness: 0.75 }),
    mat(0x192b40, { roughness: 0.7 }),
    mat(0x45596b, { roughness: 0.75 })
  ];

  const windowMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x48cfff }),
    new THREE.MeshBasicMaterial({ color: 0xffd58b }),
    new THREE.MeshBasicMaterial({ color: 0x8db7ff })
  ];

  const neonBlue = new THREE.MeshBasicMaterial({ color: 0x20cfff });
  const neonPurple = new THREE.MeshBasicMaterial({ color: 0x9a6bff });

  // 7. ROAD AND MARKINGS
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(CONFIG.roadWidth, CONFIG.roadLength),
    roadMaterial
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, -0.12, -105);
  scene.add(road);

  const leftSidewalk = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.25, CONFIG.roadLength),
    sidewalkMaterial
  );
  leftSidewalk.position.set(-10.6, -0.12, -105);
  scene.add(leftSidewalk);

  const rightSidewalk = leftSidewalk.clone();
  rightSidewalk.position.x = 10.6;
  scene.add(rightSidewalk);

  const laneMarks = [];

  for (let z = 10; z > -235; z -= 10) {
    for (const x of [-3, 3]) {
      const mark = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.025, 4.2),
        laneMaterial
      );
      mark.position.set(x, 0.015, z);
      scene.add(mark);
      laneMarks.push(mark);
    }
  }

  // 8. LIGHTWEIGHT PROCEDURAL CITY
  const cityObjects = [];

  function createBuilding(x, z, width, height, depth) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)]
    );
    body.position.y = height / 2;
    group.add(body);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.82, 0.2, depth * 0.82),
      buildingMaterials[2]
    );
    roof.position.y = height + 0.1;
    group.add(roof);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, height * 0.7, 0.06),
      Math.random() > 0.5 ? neonBlue : neonPurple
    );
    stripe.position.set(width * 0.32, height * 0.52, depth / 2 + 0.04);
    group.add(stripe);

    // Fewer windows = fewer draw calls and lighter rendering.
    const floors = Math.min(10, Math.max(2, Math.floor(height / 3.5)));
    const columns = Math.min(3, Math.max(2, Math.floor(width / 2.2)));
    const windowGeometry = new THREE.BoxGeometry(0.42, 0.55, 0.04);

    for (let floor = 0; floor < floors; floor++) {
      for (let col = 0; col < columns; col++) {
        if (Math.random() > 0.58) continue;

        const windowMesh = new THREE.Mesh(
          windowGeometry,
          windowMaterials[Math.floor(Math.random() * windowMaterials.length)]
        );

        windowMesh.position.set(
          -width / 2 + width / (columns + 1) * (col + 1),
          height / (floors + 1) * (floor + 1),
          depth / 2 + 0.03
        );
        group.add(windowMesh);
      }
    }

    group.position.set(x, 0, z);
    scene.add(group);
    cityObjects.push(group);
  }

  // 24 buildings instead of 36.
  for (let i = 0; i < 12; i++) {
    const z = 20 - i * 21;

    createBuilding(
      -14 - Math.random() * 3,
      z,
      5 + Math.random() * 3,
      10 + Math.random() * 20,
      5 + Math.random() * 3
    );

    createBuilding(
      14 + Math.random() * 3,
      z - 5,
      5 + Math.random() * 3,
      12 + Math.random() * 21,
      5 + Math.random() * 3
    );
  }

  // 9. STREETLIGHTS
  const streetlights = [];

  function createStreetlight(x, z) {
    const group = new THREE.Group();

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.11, 5, 6),
      mat(0x536a80, { metalness: 0.5 })
    );
    pole.position.y = 2.5;
    group.add(pole);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.08, 0.08),
      mat(0x536a80)
    );
    arm.position.set(x < 0 ? 0.48 : -0.48, 4.8, 0);
    group.add(arm);

    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.12, 0.3),
      new THREE.MeshBasicMaterial({ color: 0xffedbd })
    );
    lamp.position.set(x < 0 ? 0.85 : -0.85, 4.75, 0);
    group.add(lamp);

    group.position.set(x, 0, z);
    scene.add(group);
    streetlights.push(group);
  }

  for (let i = 0; i < 9; i++) {
    const z = 15 - i * 27;
    createStreetlight(-9.3, z);
    createStreetlight(9.3, z - 7);
  }

  // 10. BLUE SUPERCAR
  const carModel = new THREE.Group();
  const car = new THREE.Group();
  carModel.add(car);

  const carBlue = mat(0x087fff, {
    metalness: 0.55,
    roughness: 0.3,
    emissive: 0x002b65,
    emissiveIntensity: 0.3
  });

  const carDark = mat(0x101a29, { metalness: 0.4, roughness: 0.4 });
  const glass = mat(0x8adfff, {
    metalness: 0.2,
    roughness: 0.2,
    transparent: true,
    opacity: 0.82
  });

  const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xa5f3ff });
  const rearLightMaterial = new THREE.MeshBasicMaterial({ color: 0xff345d });

  function addCarBox(parent, geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  addCarBox(car, new THREE.BoxGeometry(2.05, 0.48, 3.6), carBlue, 0, 0.68, 0);
  addCarBox(car, new THREE.BoxGeometry(1.58, 0.65, 1.75), glass, 0, 1.18, -0.25);
  addCarBox(car, new THREE.BoxGeometry(1.95, 0.13, 0.7), carBlue, 0, 0.56, -1.48);
  addCarBox(car, new THREE.BoxGeometry(1.95, 0.13, 0.7), carBlue, 0, 0.56, 1.48);
  addCarBox(car, new THREE.BoxGeometry(0.78, 0.18, 0.08), carDark, 0, 0.56, -1.83);
  addCarBox(car, new THREE.BoxGeometry(0.47, 0.09, 0.08), headlightMaterial, -0.65, 0.77, -1.83);
  addCarBox(car, new THREE.BoxGeometry(0.47, 0.09, 0.08), headlightMaterial, 0.65, 0.77, -1.83);
  addCarBox(car, new THREE.BoxGeometry(0.5, 0.09, 0.08), rearLightMaterial, -0.62, 0.79, 1.82);
  addCarBox(car, new THREE.BoxGeometry(0.5, 0.09, 0.08), rearLightMaterial, 0.62, 0.79, 1.82);

  const wheels = [];
  const wheelGeometry = new THREE.CylinderGeometry(0.39, 0.39, 0.28, 10);
  const rimGeometry = new THREE.CylinderGeometry(0.19, 0.19, 0.295, 8);

  for (const x of [-1.03, 1.03]) {
    for (const z of [-1.12, 1.12]) {
      const wheel = new THREE.Group();

      const tire = new THREE.Mesh(wheelGeometry, carDark);
      tire.rotation.z = Math.PI / 2;
      wheel.add(tire);

      const rim = new THREE.Mesh(rimGeometry, neonBlue);
      rim.rotation.z = Math.PI / 2;
      wheel.add(rim);

      wheel.position.set(x, 0.43, z);
      car.add(wheel);
      wheels.push(wheel);
    }
  }

  carModel.position.set(0, 0, 4);
  scene.add(carModel);

  // 11. ENERGY CANISTERS
  const canisters = [];

  const fuelBlue = mat(0x087fff, {
    metalness: 0.5,
    roughness: 0.3,
    emissive: 0x004d99,
    emissiveIntensity: 0.45
  });

  const fuelDark = mat(0x09203b, { metalness: 0.5, roughness: 0.35 });
  const fuelCyan = new THREE.MeshBasicMaterial({ color: 0x00f5ff });

  function createCanister(x, z) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.43, 0.43, 1.12, 8),
      fuelBlue
    );
    group.add(body);

    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.31, 0.16, 8),
      fuelDark
    );
    top.position.y = 0.63;
    group.add(top);

    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.2, 6),
      fuelCyan
    );
    nozzle.position.y = 0.79;
    group.add(nozzle);

    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(0.39, 0.65, 0.075),
      fuelDark
    );
    panel.position.z = 0.41;
    group.add(panel);

    const boltShape = new THREE.Shape();
    boltShape.moveTo(0.05, 0.28);
    boltShape.lineTo(-0.13, -0.02);
    boltShape.lineTo(0, -0.02);
    boltShape.lineTo(-0.06, -0.27);
    boltShape.lineTo(0.16, 0.05);
    boltShape.lineTo(0.025, 0.05);
    boltShape.closePath();

    const bolt = new THREE.Mesh(new THREE.ShapeGeometry(boltShape), fuelCyan);
    bolt.position.set(0, 0, 0.46);
    group.add(bolt);

    const ringGeometry = new THREE.TorusGeometry(0.52, 0.025, 5, 12);
    const ring1 = new THREE.Mesh(ringGeometry, fuelCyan);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = -0.18;
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, fuelCyan);
    ring2.rotation.y = Math.PI / 2;
    ring2.position.y = 0.18;
    group.add(ring2);

    group.position.set(x, 1.15, z);
    group.userData.rings = [ring1, ring2];
    scene.add(group);
    canisters.push(group);
  }

  // 12. OBSTACLES
  const obstacles = [];
  const obstacleMaterial = mat(0xffbf3f, {
    metalness: 0.25,
    roughness: 0.4,
    emissive: 0x5b2600,
    emissiveIntensity: 0.3
  });

  const warningMaterial = new THREE.MeshBasicMaterial({ color: 0xffec9e });

  function createObstacle(x, z) {
    const group = new THREE.Group();

    const block = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 1.45, 1.45),
      obstacleMaterial
    );
    block.position.y = 0.73;
    group.add(block);

    const warning = new THREE.Mesh(
      new THREE.BoxGeometry(1.73, 0.16, 1.48),
      warningMaterial
    );
    warning.position.y = 0.75;
    group.add(warning);

    group.position.set(x, 0, z);
    scene.add(group);
    obstacles.push(group);
  }

  // 13. LIGHTWEIGHT RAIN
  const rainGeometry = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(CONFIG.maxRainDrops * 3);

  for (let i = 0; i < CONFIG.maxRainDrops; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 36;
    rainPositions[i * 3 + 1] = Math.random() * 20;
    rainPositions[i * 3 + 2] = -Math.random() * 75;
  }

  rainGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(rainPositions, 3)
  );

  const rainMaterial = new THREE.PointsMaterial({
    color: 0xa9ddff,
    size: 0.055,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });

  const rain = new THREE.Points(rainGeometry, rainMaterial);
  scene.add(rain);

  // Lightweight fake puddles.
  const puddles = [];
  const puddleMaterial = new THREE.MeshBasicMaterial({
    color: 0x214765,
    transparent: true,
    opacity: 0
  });

  for (let i = 0; i < 12; i++) {
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 7),
      puddleMaterial
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.scale.set(1.4, 0.55, 1);
    puddle.position.set(
      (Math.random() - 0.5) * (CONFIG.roadWidth - 2),
      -0.085,
      12 - i * 21
    );
    scene.add(puddle);
    puddles.push(puddle);
  }

  // 14. TIME SYSTEM
  const timePresets = {
    dawn: {
      label: "Morning",
      sky: 0xc18b91,
      fog: 0xc18b91,
      hemi: 1.15,
      sun: 1.5,
      sunColor: 0xffc38b,
      exposure: 1.0,
      ambient: 0x26415e
    },
    noon: {
      label: "Daytime",
      sky: 0x8cb8df,
      fog: 0x8cb8df,
      hemi: 1.5,
      sun: 1.8,
      sunColor: 0xfff1d6,
      exposure: 1.0,
      ambient: 0x3b82b8
    },
    sunset: {
      label: "Sunset",
      sky: 0x654b79,
      fog: 0x654b79,
      hemi: 0.8,
      sun: 0.9,
      sunColor: 0xff8a63,
      exposure: 1.0,
      ambient: 0x17375c
    },
    night: {
      label: "Night",
      sky: 0x071321,
      fog: 0x071321,
      hemi: 0.4,
      sun: 0.15,
      sunColor: 0x7ca9ff,
      exposure: 1.0,
      ambient: 0x102c5c
    }
  };

  const skyColor = new THREE.Color();
  const fogColor = new THREE.Color();
  const ambientColor = new THREE.Color();
  const tempColor = new THREE.Color();

  let timeMode = "auto";
  let timeProgress = 0.08;
  let currentPreset = "dawn";

  function getTimeBlend(progress) {
    const segments = [
      { key: "dawn", start: 0, end: 0.25 },
      { key: "noon", start: 0.25, end: 0.5 },
      { key: "sunset", start: 0.5, end: 0.75 },
      { key: "night", start: 0.75, end: 1 }
    ];

    const p = ((progress % 1) + 1) % 1;
    let index = segments.findIndex(s => p >= s.start && p < s.end);
    if (index < 0) index = 0;

    const current = segments[index];
    const next = segments[(index + 1) % segments.length];
    const local = (p - current.start) / (current.end - current.start);
    const blend = local * local * (3 - 2 * local);

    return [
      timePresets[current.key],
      timePresets[next.key],
      blend,
      current.key
    ];
  }

  function updateTime(delta) {
    if (timeMode === "auto") {
      timeProgress = (timeProgress + delta / CONFIG.timeCycleSeconds) % 1;
    }

    let a, b, t;

    if (timeMode === "auto") {
      [a, b, t, currentPreset] = getTimeBlend(timeProgress);
    } else {
      a = timePresets[timeMode];
      b = a;
      t = 0;
      currentPreset = timeMode;
    }

    skyColor.setHex(a.sky).lerp(tempColor.setHex(b.sky), t);
    fogColor.setHex(a.fog).lerp(tempColor.setHex(b.fog), t);
    ambientColor.setHex(a.ambient).lerp(tempColor.setHex(b.ambient), t);

    scene.background.copy(skyColor);
    skyDome.material.color.copy(skyColor);
    scene.fog.color.copy(fogColor);

    hemiLight.intensity = THREE.MathUtils.lerp(a.hemi, b.hemi, t);
    sunLight.intensity = THREE.MathUtils.lerp(a.sun, b.sun, t);
    sunLight.color.setHex(a.sunColor).lerp(tempColor.setHex(b.sunColor), t);
    fillLight.color.copy(ambientColor);

    const sunAngle = timeProgress * Math.PI * 2;
    sunDisc.position.set(
      Math.cos(sunAngle) * 48,
      Math.max(-8, Math.sin(sunAngle) * 42),
      -120
    );

    sunDisc.visible = timeMode === "auto"
      ? currentPreset !== "night"
      : timeMode !== "night";

    const isNight = timeMode === "night" ||
      (timeMode === "auto" && currentPreset === "night");

    // Avoid unnecessary material updates every frame.
    if (updateTime.lastNight !== isNight) {
      updateTime.lastNight = isNight;

      windowMaterials.forEach(material => {
        material.color.setHex(isNight ? 0x6ddcff : 0x7696b5);
      });
    }

    return isNight;
  }

  // 15. DYNAMIC WEATHER
  let weatherMode = "dynamic";
  let currentWeather = "clear";
  let weatherTimer = 0;
  let nextWeatherChange = 45;

  function chooseWeather() {
    const choices = ["clear", "rain", "fog"];
    currentWeather = choices[Math.floor(Math.random() * choices.length)];
    weatherTimer = 0;
    nextWeatherChange =
      CONFIG.weatherChangeMin +
      Math.random() * (CONFIG.weatherChangeMax - CONFIG.weatherChangeMin);
  }

  function applyWeatherSelection(value) {
    weatherMode = value;
    if (value === "dynamic") {
      chooseWeather();
    } else {
      currentWeather = value;
    }
  }

  let fogDensityTarget = 0.004;

  function updateWeather(delta) {
    if (weatherMode === "dynamic") {
      weatherTimer += delta;
      if (weatherTimer >= nextWeatherChange) chooseWeather();
    }

    const raining = currentWeather === "rain";
    const foggy = currentWeather === "fog";

    rainMaterial.opacity = THREE.MathUtils.lerp(
      rainMaterial.opacity,
      raining ? 0.75 : 0,
      Math.min(1, delta * 1.5)
    );

    puddleMaterial.opacity = THREE.MathUtils.lerp(
      puddleMaterial.opacity,
      raining ? 0.38 : 0,
      Math.min(1, delta)
    );

    roadMaterial.roughness = THREE.MathUtils.lerp(
      roadMaterial.roughness,
      raining ? 0.4 : 0.7,
      Math.min(1, delta)
    );

    roadMaterial.metalness = raining ? 0.35 : 0.15;

    const preset = timeMode === "auto"
      ? timePresets[getTimeBlend(timeProgress)[3]]
      : timePresets[timeMode];

    const baseFogDensity =
      timeMode === "night" ||
      (timeMode === "auto" && currentPreset === "night")
        ? 0.006
        : 0.003;

    fogDensityTarget = foggy ? 0.012 : (raining ? 0.006 : baseFogDensity);

    scene.fog.density = THREE.MathUtils.lerp(
      scene.fog.density,
      fogDensityTarget,
      Math.min(1, delta * 2)
    );

    const weatherLabel = {
      clear: "☀ Clear",
      rain: "🌧 Rain",
      fog: "🌫 Fog"
    };

    conditionElement.textContent =
      `${weatherLabel[currentWeather]} · ${preset.label}`;

    if (raining) {
      const positions = rainGeometry.attributes.position.array;

      for (let i = 0; i < CONFIG.maxRainDrops; i++) {
        const j = i * 3;
        positions[j + 1] -= delta * 25;
        positions[j + 2] += delta * 7;

        if (positions[j + 1] < 0 || positions[j + 2] > 14) {
          positions[j] = (Math.random() - 0.5) * 36;
          positions[j + 1] = 10 + Math.random() * 12;
          positions[j + 2] = -60 - Math.random() * 30;
        }
      }

      rainGeometry.attributes.position.needsUpdate = true;
    }

    return { raining, foggy };
  }

  $("zuno-time-mode").addEventListener("change", event => {
    timeMode = event.target.value;

    if (timeMode !== "auto") {
      timeProgress = ({
        dawn: 0.12,
        noon: 0.37,
        sunset: 0.62,
        night: 0.87
      })[timeMode];
    }
  });

  $("zuno-weather-mode").addEventListener("change", event => {
    applyWeatherSelection(event.target.value);
  });

  // 16. GAME STATE
  let score = 0;
  let distance = 0;
  let running = false;
  let gameOver = false;
  let elapsed = 0;
  let playerX = 0;
  let targetX = 0;

  const clock = new THREE.Clock();
  const keys = new Set();

  function randomLane() {
    const lanes = [-4.5, 0, 4.5];
    return lanes[Math.floor(Math.random() * lanes.length)];
  }

  function resetGame() {
    score = 0;
    distance = 0;
    elapsed = 0;
    playerX = 0;
    targetX = 0;
    gameOver = false;

    for (const item of canisters) scene.remove(item);
    for (const item of obstacles) scene.remove(item);

    canisters.length = 0;
    obstacles.length = 0;

    for (let i = 0; i < 7; i++) {
      createCanister(randomLane(), -25 - i * CONFIG.canisterSpacing);
    }

    for (let i = 0; i < 5; i++) {
      createObstacle(randomLane(), -45 - i * CONFIG.obstacleSpacing);
    }

    scoreElement.textContent = "0";
    distanceElement.textContent = "0 m";
    carModel.position.x = 0;
    car.rotation.z = 0;
  }

  function startGame() {
    resetGame();
    running = true;
    overlay.style.display = "none";
    clock.getDelta();
  }

  function endGame() {
    if (gameOver) return;

    running = false;
    gameOver = true;
    overlay.style.display = "flex";
    overlayTitle.textContent = "GAME OVER";

    overlayText.innerHTML =
      `Energy terkumpul: <strong>${score}</strong><br>` +
      `Jarak tempuh: <strong>${Math.floor(distance)} m</strong><br>` +
      `Kota masih menunggu. Coba lagi dan hindari penghalang!`;

    startButton.textContent = "PLAY AGAIN";
  }

  startButton.addEventListener("click", startGame);

  $("zuno-back-menu").addEventListener("click", () => {
    window.location.href = "../project.html";
  });

  // Kembali ke halaman project pada website profil.
  $("zuno-return").addEventListener("click", () => {
    window.location.href = "../project.html";
  });

  // 17. PLAYER CONTROLS
  function moveLeft() {
    targetX = Math.max(-CONFIG.playerLimit, targetX - 2.25);
  }

  function moveRight() {
    targetX = Math.min(CONFIG.playerLimit, targetX + 2.25);
  }

  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (["arrowleft", "arrowright", " "].includes(key)) {
      event.preventDefault();
    }

    keys.add(key);

    if (!running && !gameOver && key === "enter") {
      startGame();
    }
  });

  window.addEventListener("keyup", event => {
    keys.delete(event.key.toLowerCase());
  });

  window.addEventListener("blur", () => keys.clear());

  $("zuno-left").addEventListener("pointerdown", event => {
    event.preventDefault();
    moveLeft();
  });

  $("zuno-right").addEventListener("pointerdown", event => {
    event.preventDefault();
    moveRight();
  });

  // 18. UPDATE GAME
  function updatePlayer(delta) {
    if (keys.has("arrowleft") || keys.has("a")) {
      targetX = Math.max(-CONFIG.playerLimit, targetX - delta * 9);
    }

    if (keys.has("arrowright") || keys.has("d")) {
      targetX = Math.min(CONFIG.playerLimit, targetX + delta * 9);
    }

    playerX = THREE.MathUtils.damp(playerX, targetX, 8, delta);
    carModel.position.x = playerX;

    car.rotation.z = THREE.MathUtils.damp(
      car.rotation.z,
      (targetX - playerX) * -0.06,
      6,
      delta
    );

    for (const wheel of wheels) {
      wheel.rotation.x -= delta * 9;
    }
  }

  function updateCanisters(delta, speed) {
    for (let i = canisters.length - 1; i >= 0; i--) {
      const item = canisters[i];

      item.position.z += speed * delta;
      item.rotation.y += delta * 1.2;
      item.position.y = 1.15 + Math.sin(elapsed * 3 + i) * 0.12;

      item.userData.rings[0].rotation.z += delta * 1.8;
      item.userData.rings[1].rotation.x += delta * 1.4;

      const dx = Math.abs(item.position.x - carModel.position.x);
      const dz = Math.abs(item.position.z - carModel.position.z);

      if (dx < 1.35 && dz < 2.0) {
        score += 10;
        scoreElement.textContent = String(score);
        scene.remove(item);
        canisters.splice(i, 1);
        continue;
      }

      if (item.position.z > 15) {
        scene.remove(item);
        canisters.splice(i, 1);
      }
    }

    while (canisters.length < 7) {
      const farthest = canisters.length
        ? Math.min(...canisters.map(item => item.position.z))
        : -35;

      createCanister(
        randomLane(),
        Math.min(-30, farthest - CONFIG.canisterSpacing)
      );
    }
  }

  function updateObstacles(delta, speed) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const item = obstacles[i];

      item.position.z += speed * delta;

      const dx = Math.abs(item.position.x - carModel.position.x);
      const dz = Math.abs(item.position.z - carModel.position.z);

      if (dx < 1.55 && dz < 1.85) {
        endGame();
        return;
      }

      if (item.position.z > 15) {
        scene.remove(item);
        obstacles.splice(i, 1);
      }
    }

    while (obstacles.length < 5) {
      const farthest = obstacles.length
        ? Math.min(...obstacles.map(item => item.position.z))
        : -50;

      createObstacle(
        randomLane(),
        Math.min(-45, farthest - CONFIG.obstacleSpacing)
      );
    }
  }

  function updateCity(delta, speed) {
    for (const building of cityObjects) {
      building.position.z += speed * delta * 0.72;

      if (building.position.z > 30) {
        building.position.z -= 252;
      }
    }

    for (const group of streetlights) {
      group.position.z += speed * delta;

      if (group.position.z > 25) {
        group.position.z -= 252;
      }
    }

    for (const mark of laneMarks) {
      mark.position.z += speed * delta;

      if (mark.position.z > 15) {
        mark.position.z -= 240;
      }
    }

    for (const puddle of puddles) {
      puddle.position.z += speed * delta;

      if (puddle.position.z > 14) {
        puddle.position.z -= 252;
        puddle.position.x =
          (Math.random() - 0.5) * (CONFIG.roadWidth - 2);
      }
    }
  }

  // 19. MAIN LOOP
  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), CONFIG.maxDelta);
    elapsed += delta;

    const isNight = updateTime(delta);
    const weather = updateWeather(delta);

    if (running) {
      updatePlayer(delta);

      const speed = CONFIG.carSpeed;
      distance += speed * delta;
      distanceElement.textContent = `${Math.floor(distance)} m`;

      updateCity(delta, speed);
      updateCanisters(delta, speed);
      updateObstacles(delta, speed);

      fillLight.intensity = isNight
        ? (weather.raining ? 1.15 : 0.9)
        : 0.65;
    } else {
      // Keep the menu background alive without heavy effects.
      updateCity(delta, 2.5);

      for (let i = 0; i < canisters.length; i++) {
        const item = canisters[i];
        item.rotation.y += delta * 0.45;
        item.position.y = 1.15 + Math.sin(elapsed * 2 + i) * 0.12;
      }
    }

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      carModel.position.x * 0.22,
      2.5,
      delta
    );

    camera.lookAt(carModel.position.x * 0.18, 0.8, -8);

    renderer.render(scene, camera);
  }

  // 20. RESPONSIVE CANVAS
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, CONFIG.pixelRatio)
    );

    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 21. START
  applyWeatherSelection("dynamic");
  resetGame();
  requestAnimationFrame(animate);

})();