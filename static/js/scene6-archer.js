import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log("🏹 Scene 6 - Cosmic Guardian Horseman dimuat.");

let scene6, camera6, renderer6;
let animRunning6 = false;
let animId6 = null;
let clock6 = new THREE.Clock();

let starField6;
let horseGroup, riderGroup, goddessGroup;
let horseLegs = [];
let horseTail, horseHead, riderCape;
let shieldGroup, protectionAura;
let goddessHalo;
let energyParticles;

const materials = {};

function createMaterials() {
  materials.armor = new THREE.MeshStandardMaterial({
    color: 0x263b63,
    metalness: 0.85,
    roughness: 0.23,
    emissive: 0x102c58,
    emissiveIntensity: 0.5
  });

  materials.gold = new THREE.MeshStandardMaterial({
    color: 0xe7b84b,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x9b6417,
    emissiveIntensity: 0.25
  });

  materials.horse = new THREE.MeshStandardMaterial({
    color: 0x30221e,
    roughness: 0.65
  });

  materials.horseLight = new THREE.MeshStandardMaterial({
    color: 0x76513b,
    roughness: 0.65
  });

  materials.white = new THREE.MeshStandardMaterial({
    color: 0xffe8c7,
    roughness: 0.65
  });

  materials.goddess = new THREE.MeshStandardMaterial({
    color: 0xffe6f1,
    metalness: 0.2,
    roughness: 0.35,
    emissive: 0x7c315e,
    emissiveIntensity: 0.18
  });

  materials.glow = new THREE.MeshBasicMaterial({
    color: 0xffd77a,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

function addMesh(parent, geometry, material, position, scale) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);

  if (scale) mesh.scale.set(...scale);

  parent.add(mesh);
  return mesh;
}

function createLimb(parent, x, y, z, length, material) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);

  const upper = addMesh(
    pivot,
    new THREE.CylinderGeometry(0.13, 0.1, length, 12),
    material,
    [0, -length / 2, 0]
  );

  const hoof = addMesh(
    pivot,
    new THREE.BoxGeometry(0.25, 0.22, 0.32),
    materials.gold,
    [0, -length, 0.04]
  );

  parent.add(pivot);
  return pivot;
}

// ======================================
// KUDA KOSMIK
// ======================================

function createHorse() {
  const group = new THREE.Group();

  // Tubuh utama
  addMesh(
    group,
    new THREE.SphereGeometry(1, 32, 24),
    materials.horse,
    [0, 1.8, 0],
    [0.72, 0.78, 1.65]
  );

  // Dada
  addMesh(
    group,
    new THREE.SphereGeometry(0.7, 24, 24),
    materials.horseLight,
    [0, 1.85, 1.05],
    [0.72, 0.9, 0.72]
  );

  // Leher
  const neck = addMesh(
    group,
    new THREE.CylinderGeometry(0.34, 0.58, 1.65, 24),
    materials.horse,
    [0, 2.65, 1.25]
  );
  neck.rotation.x = -0.42;
  neck.rotation.z = -0.12;

  // Kepala
  horseHead = new THREE.Group();
  horseHead.position.set(0, 3.35, 1.85);
  group.add(horseHead);

  addMesh(
    horseHead,
    new THREE.SphereGeometry(0.48, 24, 24),
    materials.horseLight,
    [0, 0, 0.12],
    [0.55, 0.8, 0.85]
  );

  // Moncong
  addMesh(
    horseHead,
    new THREE.SphereGeometry(0.3, 20, 20),
    materials.horse,
    [0, -0.38, 0.53],
    [0.5, 0.38, 0.55]
  );

  // Mata
  for (const side of [-1, 1]) {
    addMesh(
      horseHead,
      new THREE.SphereGeometry(0.07, 12, 12),
      materials.gold,
      [side * 0.39, 0.08, 0.3]
    );

    const ear = addMesh(
      horseHead,
      new THREE.ConeGeometry(0.12, 0.48, 12),
      materials.horse,
      [side * 0.22, 0.65, -0.05]
    );
    ear.rotation.z = side * -0.2;
  }

  // Surai
  for (let i = 0; i < 9; i++) {
    const hair = addMesh(
      group,
      new THREE.ConeGeometry(0.12, 0.8, 8),
      materials.horse,
      [
        (Math.random() - 0.5) * 0.4,
        3.1 + Math.random() * 0.4,
        0.8 + i * 0.14
      ]
    );
    hair.rotation.x = -0.6;
  }

  // Kaki kuda
  const legPositions = [
    [-0.43, 1.45, 0.95],
    [0.43, 1.45, 0.95],
    [-0.43, 1.45, -1.05],
    [0.43, 1.45, -1.05]
  ];

  legPositions.forEach((p, i) => {
    const leg = createLimb(
      group,
      p[0],
      p[1],
      p[2],
      1.25,
      materials.horseLight
    );

    horseLegs.push({ mesh: leg, phase: i % 2 === 0 ? 0 : Math.PI });
  });

  // Ekor
  horseTail = new THREE.Group();
  horseTail.position.set(0, 2.1, -1.5);
  group.add(horseTail);

  for (let i = 0; i < 7; i++) {
    const strand = addMesh(
      horseTail,
      new THREE.CylinderGeometry(0.035, 0.07, 1.35, 8),
      materials.horse,
      [
        (Math.random() - 0.5) * 0.2,
        -0.55,
        -0.25 - i * 0.04
      ]
    );
    strand.rotation.x = -0.35;
  }

  return group;
}

// ======================================
// KESATRIA BERKUDA
// ======================================

function createRider() {
  const group = new THREE.Group();

  // Kaki kesatria
  for (const side of [-1, 1]) {
    const leg = addMesh(
      group,
      new THREE.CylinderGeometry(0.19, 0.14, 1.2, 16),
      materials.armor,
      [side * 0.52, -0.15, 0]
    );
    leg.rotation.z = side * -0.3;
  }

  // Sepatu
  for (const side of [-1, 1]) {
    addMesh(
      group,
      new THREE.BoxGeometry(0.3, 0.22, 0.55),
      materials.gold,
      [side * 0.7, -0.75, 0.1]
    );
  }

  // Badan
  const body = addMesh(
    group,
    new THREE.CylinderGeometry(0.38, 0.58, 1.25, 16),
    materials.armor,
    [0, 0.7, 0]
  );
  body.rotation.x = -0.1;

  // Pelindung dada
  addMesh(
    group,
    new THREE.SphereGeometry(0.43, 24, 24),
    materials.gold,
    [0, 0.75, 0.28],
    [0.9, 0.9, 0.3]
  );

  // Kepala
  addMesh(
    group,
    new THREE.SphereGeometry(0.34, 24, 24),
    materials.armor,
    [0, 1.65, 0]
  );

  // Helm
  addMesh(
    group,
    new THREE.ConeGeometry(0.37, 0.7, 8),
    materials.gold,
    [0, 2.0, 0]
  );

  // Visor
  addMesh(
    group,
    new THREE.BoxGeometry(0.5, 0.12, 0.08),
    materials.glow,
    [0, 1.65, 0.32]
  );

  // Jubah
  riderCape = addMesh(
    group,
    new THREE.ConeGeometry(0.72, 1.8, 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x8b1e3f,
      side: THREE.DoubleSide,
      roughness: 0.65
    }),
    [0, 0.1, -0.65]
  );
  riderCape.rotation.x = -0.15;

  return group;
}

// ======================================
// PERISAI PELINDUNG
// ======================================

function createShield() {
  const group = new THREE.Group();

  const shield = addMesh(
    group,
    new THREE.SphereGeometry(0.75, 32, 24),
    materials.armor,
    [0, 0, 0],
    [0.75, 1, 0.22]
  );

  const border = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.075, 12, 48),
    materials.gold
  );
  group.add(border);

  addMesh(
    group,
    new THREE.OctahedronGeometry(0.25),
    materials.glow,
    [0, 0, 0.2]
  );

  group.position.set(-1.05, 3.0, 1.0);
  group.rotation.y = -0.25;

  return group;
}

// ======================================
// DEWI PENJAGA TAKDIR
// ======================================

function createGoddess() {
  const group = new THREE.Group();

  // Gaun panjang
  const gown = addMesh(
    group,
    new THREE.ConeGeometry(0.85, 2.5, 40),
    materials.goddess,
    [0, 1.25, 0]
  );

  // Pinggang
  addMesh(
    group,
    new THREE.TorusGeometry(0.35, 0.055, 12, 32),
    materials.gold,
    [0, 1.8, 0]
  );

  // Badan
  addMesh(
    group,
    new THREE.SphereGeometry(0.38, 24, 24),
    materials.white,
    [0, 2.25, 0],
    [0.75, 1.3, 0.55]
  );

  // Kepala
  addMesh(
    group,
    new THREE.SphereGeometry(0.29, 24, 24),
    materials.white,
    [0, 3.0, 0]
  );

  // Rambut
  const hair = addMesh(
    group,
    new THREE.SphereGeometry(0.33, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x5a304a, roughness: 0.8 }),
    [0, 3.05, -0.08],
    [1.15, 1.1, 0.85]
  );

  // Rambut panjang
  for (const side of [-1, 1]) {
    const lock = addMesh(
      group,
      new THREE.CylinderGeometry(0.07, 0.11, 1.5, 12),
      hair.material,
      [side * 0.28, 2.45, -0.12]
    );
    lock.rotation.z = side * -0.12;
  }

  // Tangan
  for (const side of [-1, 1]) {
    const arm = addMesh(
      group,
      new THREE.CylinderGeometry(0.09, 0.07, 0.95, 12),
      materials.white,
      [side * 0.48, 2.0, 0]
    );
    arm.rotation.z = side * 0.7;
  }

  // Lingkaran cahaya di belakang kepala
  goddessHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.055, 16, 64),
    materials.glow
  );
  goddessHalo.position.set(0, 3.0, -0.35);
  group.add(goddessHalo);

  group.position.set(3.2, 0.1, -0.8);

  return group;
}

// ======================================
// AURA PERLINDUNGAN
// ======================================

function createProtectionAura() {
  const group = new THREE.Group();

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.045, 12, 80),
    materials.glow
  );

  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.15;
  group.add(ring);

  const secondRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.035, 12, 80),
    new THREE.MeshBasicMaterial({
      color: 0xffe6a3,
      transparent: true,
      opacity: 0.5
    })
  );

  secondRing.rotation.x = Math.PI / 2;
  secondRing.position.y = 0.5;
  group.add(secondRing);

  group.position.set(3.2, 0.2, -0.8);

  return group;
}

// ======================================
// PARTIKEL KOSMIK
// ======================================

function createEnergyParticles() {
  const count = 1200;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 35;
    positions[i * 3 + 1] = Math.random() * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  energyParticles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xffd77a,
      size: 0.11,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  scene6.add(energyParticles);
}

// ======================================
// INISIALISASI SCENE
// ======================================

function initScene6() {
  const canvas = document.getElementById("archerCanvas");

  if (!canvas) {
    console.error("Canvas #archerCanvas tidak ditemukan.");
    return false;
  }

  createMaterials();

  scene6 = new THREE.Scene();
  scene6.background = new THREE.Color("#070b1c");
  scene6.fog = new THREE.FogExp2("#070b1c", 0.012);

  camera6 = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );

  camera6.position.set(0, 5.5, 18);
  camera6.lookAt(0, 2.0, 0);

  renderer6 = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });

  renderer6.setSize(window.innerWidth, window.innerHeight);
  renderer6.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer6.outputColorSpace = THREE.SRGBColorSpace;
  renderer6.toneMapping = THREE.ACESFilmicToneMapping;
  renderer6.toneMappingExposure = 1.35;

  scene6.add(new THREE.AmbientLight(0x8996c5, 1.5));

  const moonLight = new THREE.DirectionalLight(0xb6d7ff, 3.5);
  moonLight.position.set(-8, 12, 8);
  scene6.add(moonLight);

  const goldenLight = new THREE.PointLight(0xffc66d, 100, 25);
  goldenLight.position.set(3, 4, 2);
  scene6.add(goldenLight);

  // Latar bintang
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(5000 * 3);

  for (let i = 0; i < 5000; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 200;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    starPositions[i * 3 + 2] = -30 - Math.random() * 100;
  }

  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
  );

  starField6 = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: 0xb9d9ff,
      size: 0.16,
      transparent: true,
      opacity: 0.85
    })
  );

  scene6.add(starField6);

  // Karakter
  horseLegs = [];

  horseGroup = createHorse();
  horseGroup.position.set(-1.1, 0, 0);
  scene6.add(horseGroup);

  riderGroup = createRider();
  riderGroup.position.set(-1.1, 2.9, -0.05);
  scene6.add(riderGroup);

  shieldGroup = createShield();
  riderGroup.add(shieldGroup);

  goddessGroup = createGoddess();
  scene6.add(goddessGroup);

  protectionAura = createProtectionAura();
  scene6.add(protectionAura);

  createEnergyParticles();

  console.log("✅ Scene 6: Horseman, Goddess, Shield, Aura siap.");

  return true;
}

// ======================================
// ANIMASI
// ======================================

function animateScene6() {
  if (!animRunning6) return;

  animId6 = requestAnimationFrame(animateScene6);

  const elapsed = clock6.getElapsedTime();

  // Kuda berjalan di tempat secara natural.
  const gait = elapsed * 5;

  horseLegs.forEach((leg, i) => {
    const phase = gait + leg.phase;
    leg.mesh.rotation.x = Math.sin(phase) * 0.48;
  });

  if (horseGroup) {
    horseGroup.position.y = Math.sin(elapsed * 10) * 0.07;
    horseGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.06;
  }

  if (horseHead) {
    horseHead.rotation.x = Math.sin(elapsed * 1.8) * 0.08;
    horseHead.rotation.z = Math.sin(elapsed * 1.2) * 0.04;
  }

  if (horseTail) {
    horseTail.rotation.x = Math.sin(elapsed * 2.5) * 0.3;
    horseTail.rotation.z = Math.sin(elapsed * 1.7) * 0.2;
  }

  // Kesatria mengikuti gerakan kuda.
  if (riderGroup) {
    riderGroup.position.y = 2.9 + Math.sin(elapsed * 10) * 0.045;
    riderGroup.rotation.z = Math.sin(elapsed * 5) * 0.025;
  }

  // Jubah berkibar.
  if (riderCape) {
    riderCape.rotation.x = -0.15 + Math.sin(elapsed * 3) * 0.16;
    riderCape.rotation.z = Math.sin(elapsed * 2.2) * 0.08;
  }

  // Perisai bergerak mengikuti kesatria.
  if (shieldGroup) {
    shieldGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.08;
  }

  // Dewi bergerak lembut.
  if (goddessGroup) {
    goddessGroup.position.y = 0.1 + Math.sin(elapsed * 1.5) * 0.08;
    goddessGroup.rotation.z = Math.sin(elapsed * 0.7) * 0.025;
  }

  // Cahaya pelindung berdenyut.
  const pulse = 0.75 + Math.sin(elapsed * 2.5) * 0.2;

  if (protectionAura) {
    protectionAura.scale.setScalar(pulse);
    protectionAura.rotation.y = elapsed * 0.25;
  }

  if (goddessHalo) {
    goddessHalo.rotation.z = elapsed * 0.3;
    goddessHalo.material.opacity = 0.55 + Math.sin(elapsed * 3) * 0.2;
  }

  if (starField6) {
    starField6.rotation.y = elapsed * 0.015;
  }

  if (energyParticles) {
    energyParticles.rotation.y = elapsed * 0.025;
    energyParticles.position.y = Math.sin(elapsed * 0.5) * 0.15;
  }

  // Kamera sinematik.
  if (camera6) {
    camera6.position.x = Math.sin(elapsed * 0.18) * 1.5;
    camera6.position.y = 5.4 + Math.sin(elapsed * 0.3) * 0.25;
    camera6.lookAt(0.2, 2.1, 0);
  }

  if (renderer6 && scene6 && camera6) {
    renderer6.render(scene6, camera6);
  }
}

// ======================================
// START / STOP
// ======================================

export function startArcherScene() {
  console.log("🏹 startArcherScene dipanggil.");

  if (!scene6) {
    if (!initScene6()) return;
  }

  if (animRunning6) return;

  clock6.start();
  animRunning6 = true;
  animateScene6();
}

export function stopArcherScene() {
  animRunning6 = false;

  if (animId6 !== null) {
    cancelAnimationFrame(animId6);
    animId6 = null;
  }

  console.log("⏹️ Scene 6 dihentikan.");
}

// ======================================
// RESIZE
// ======================================

window.addEventListener("resize", () => {
  if (!camera6 || !renderer6) return;

  camera6.aspect = window.innerWidth / window.innerHeight;
  camera6.updateProjectionMatrix();

  renderer6.setSize(window.innerWidth, window.innerHeight);
});
