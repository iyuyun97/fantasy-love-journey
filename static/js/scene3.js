import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log(
  "🌌 [DEBUG] Scene 3 (Lightweight & Sharp JWST Universe) dimuat sebagai ES Module.",
);

let scene3, camera3, renderer3;
let animRunning3 = false;
let animId3 = null;
let clock3 = new THREE.Clock();

let starField, cosmicDustParticles;
let nebulaeClouds = [];
let planets = [];
let sunLight;

function createSharpParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.25, "rgba(220, 200, 255, 0.6)");
  grad.addColorStop(0.6, "rgba(59, 130, 246, 0.15)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createOptimizedPlanetMap(type) {
  const width = 1024,
    height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    const phi = (y / height) * Math.PI;
    const sinPhi = Math.sin(phi),
      cosPhi = Math.cos(phi);

    for (let x = 0; x < width; x++) {
      const theta = (x / width) * Math.PI * 2;
      const sx = sinPhi * Math.cos(theta);
      const sy = cosPhi;
      const sz = sinPhi * Math.sin(theta);
      const idx = (y * width + x) * 4;

      let r = 0,
        g = 0,
        b = 0;

      if (type === "earth") {
        const n = Math.sin(sx * 3.5) * Math.cos(sy * 3.5 + sz * 3.5);
        if (Math.abs(sy) > 0.8) {
          r = 245;
          g = 250;
          b = 255;
        } else if (n > 0.05) {
          r = 35;
          g = 110;
          b = 45;
        } else {
          r = 10;
          g = 45;
          b = 135;
        }
      } else if (type === "golden_gas") {
        const band = Math.sin(sy * 20.0 + Math.sin(sx * 4.0) * 2.0) * 0.5 + 0.5;
        r = Math.floor(210 + band * 45);
        g = Math.floor(140 + band * 75);
        b = Math.floor(50 + band * 60);
      } else if (type === "mars") {
        r = 170;
        g = 70;
        b = 45;
      }

      imgData.data[idx] = r;
      imgData.data[idx + 1] = g;
      imgData.data[idx + 2] = b;
      imgData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function createOptimizedCloudMap() {
  const width = 512,
    height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width,
      y = Math.random() * height,
      r = Math.random() * 50 + 10;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function initScene3() {
  console.log("⚙️ [DEBUG] Menginisialisasi Lightweight JWST Universe...");
  const canvas = document.getElementById("universe3DCanvas");
  if (!canvas) {
    console.error("❌ Canvas #universe3DCanvas tidak ditemukan!");
    return false;
  }

  scene3 = new THREE.Scene();
  scene3.background = new THREE.Color("#000000");
  scene3.fog = new THREE.FogExp2("#000000", 0.0015);

  camera3 = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera3.position.set(0, 2.5, 26);

  renderer3 = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer3.setSize(window.innerWidth, window.innerHeight);
  renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer3.outputColorSpace = THREE.SRGBColorSpace;
  renderer3.toneMapping = THREE.ACESFilmicToneMapping;
  renderer3.toneMappingExposure = 1.3;

  scene3.add(new THREE.AmbientLight(0x111827, 0.6));
  sunLight = new THREE.DirectionalLight(0xfffaf0, 5.0);
  sunLight.position.set(40, 25, 35);
  scene3.add(sunLight);

  const starCount = 6000;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  const colors = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#7dd3fc"),
    new THREE.Color("#fef08a"),
  ];

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const r = 80 + Math.random() * 280;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    starPos[i3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i3 + 1] = r * Math.cos(phi);
    starPos[i3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 40;

    const c = colors[Math.floor(Math.random() * colors.length)];
    starCol[i3] = c.r;
    starCol[i3 + 1] = c.g;
    starCol[i3 + 2] = c.b;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));

  starField = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene3.add(starField);

  nebulaeClouds = [];
  const particleTex = createSharpParticleTexture();
  const nebulaConfigs = [
    {
      count: 800,
      c1: new THREE.Color("#2563eb"),
      c2: new THREE.Color("#7c3aed"),
      pos: new THREE.Vector3(-22, 10, -50),
      spread: 26,
      size: 2.2,
      opacity: 0.28,
    },
    {
      count: 800,
      c1: new THREE.Color("#db2777"),
      c2: new THREE.Color("#d97706"),
      pos: new THREE.Vector3(24, -8, -56),
      spread: 28,
      size: 2.4,
      opacity: 0.26,
    },
  ];

  nebulaConfigs.forEach((cfg, idx) => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cfg.count * 3);
    const cols = new Float32Array(cfg.count * 3);

    for (let i = 0; i < cfg.count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.6) * cfg.spread;

      pos[i3] = cfg.pos.x + r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = cfg.pos.y + r * Math.sin(phi) * Math.sin(theta) * 0.55;
      pos[i3 + 2] = cfg.pos.z + r * Math.cos(phi) * 0.7;

      const mixCol = cfg.c1.clone().lerp(cfg.c2, Math.random());
      cols[i3] = mixCol.r;
      cols[i3 + 1] = mixCol.g;
      cols[i3 + 2] = mixCol.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));

    const mat = new THREE.PointsMaterial({
      size: cfg.size,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: cfg.opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const cloud = new THREE.Points(geo, mat);
    scene3.add(cloud);
    nebulaeClouds.push({
      mesh: cloud,
      rotSpeed: (idx % 2 === 0 ? 1 : -1) * 0.001,
    });
  });

  const dustCount = 1000;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount * 3; i += 3) {
    dustPos[i] = (Math.random() - 0.5) * 75;
    dustPos[i + 1] = (Math.random() - 0.5) * 40;
    dustPos[i + 2] = (Math.random() - 0.5) * 90;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  cosmicDustParticles = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.07,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene3.add(cosmicDustParticles);

  planets = [];

  const earthG = new THREE.Group();
  earthG.position.set(-5.0, -0.2, 4.2);
  earthG.rotation.z = 0.4;
  const earthM = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 48, 48),
    new THREE.MeshStandardMaterial({
      map: createOptimizedPlanetMap("earth"),
      roughness: 0.6,
      metalness: 0.1,
    }),
  );
  const earthC = new THREE.Mesh(
    new THREE.SphereGeometry(2.14, 48, 48),
    new THREE.MeshStandardMaterial({
      map: createOptimizedCloudMap(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  );
  earthG.add(earthM);
  earthG.add(earthC);
  scene3.add(earthG);
  planets.push({ group: earthG, rot: 0.08, cloudRot: 0.12 });

  const gasG = new THREE.Group();
  gasG.position.set(6.5, 1.6, -4.0);
  gasG.rotation.set(0.2, 0.1, -0.15);
  const gasM = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 48, 48),
    new THREE.MeshStandardMaterial({
      map: createOptimizedPlanetMap("golden_gas"),
      roughness: 0.55,
    }),
  );
  gasG.add(gasM);
  scene3.add(gasG);
  planets.push({ group: gasG, rot: 0.1 });

  const marsG = new THREE.Group();
  marsG.position.set(3.8, -2.4, 6.5);
  const marsM = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 32, 32),
    new THREE.MeshStandardMaterial({
      map: createOptimizedPlanetMap("mars"),
      roughness: 0.9,
    }),
  );
  marsG.add(marsM);
  scene3.add(marsG);
  planets.push({ group: marsG, rot: 0.06 });

  console.log("✅ [DEBUG] Lightweight & Sharp JWST Universe siap.");
  return true;
}

function animateScene3() {
  if (!animRunning3) return;
  animId3 = requestAnimationFrame(animateScene3);

  const delta = clock3.getDelta();
  const elapsed = clock3.getElapsedTime();

  if (starField) starField.rotation.y += delta * 0.001;
  if (cosmicDustParticles) cosmicDustParticles.rotation.y -= delta * 0.003;

  nebulaeClouds.forEach((n) => {
    n.mesh.rotation.y += delta * n.rotSpeed;
  });

  planets.forEach((p) => {
    if (p.group) p.group.rotation.y += delta * p.rot;
    if (p.cloudRot) p.group.children[1].rotation.y += delta * p.cloudRot;
  });

  if (camera3) {
    const t = elapsed * 0.035;
    camera3.position.x = Math.sin(t) * 2.5;
    camera3.position.y = 1.8 + Math.cos(t * 0.5) * 0.6;
    camera3.position.z =
      THREE.MathUtils.lerp(26, 16, Math.min(1.0, elapsed / 30.0)) +
      Math.cos(t) * 0.8;
    camera3.lookAt(0, 0, -18);
  }

  if (renderer3 && scene3 && camera3) {
    renderer3.render(scene3, camera3);
  }
}

export function startUniverseScene() {
  console.log("🚀 [DEBUG] startUniverseScene ES module dipanggil.");
  if (animRunning3) return;
  if (!scene3 && !initScene3()) return;
  clock3.start();
  animRunning3 = true;
  animateScene3();
}

export function stopUniverseScene() {
  animRunning3 = false;

  if (animId3 !== null) {
    cancelAnimationFrame(animId3);
    animId3 = null;
  }

  console.log("⏹️ [DEBUG] Scene 3 dihentikan sementara.");
  }

window.addEventListener("resize", () => {
  if (camera3 && renderer3) {
    camera3.aspect = window.innerWidth / window.innerHeight;
    camera3.updateProjectionMatrix();
    renderer3.setSize(window.innerWidth, window.innerHeight);
  }
});

// Integrasi Global Window untuk Kontrol UI
window.startUniverseScene = startUniverseScene;
window.stopUniverseScene = stopUniverseScene;

