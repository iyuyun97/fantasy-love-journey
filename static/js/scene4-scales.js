import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log(
  "⚖️ [DEBUG] Scene 5 (The Mythological Scales of Libra) dimuat sebagai ES Module.",
);

// ============================================
// VARIABLES
// ============================================

let scene4Scales, camera4Scales, renderer4Scales;
let animRunning4Scales = false;
let animId4Scales = null;
let clock4Scales = new THREE.Clock();

let starFieldScales, goldDustParticles;
let scalesGroup, leftPan, rightPan;

// ============================================
// GOLD MATERIAL
// ============================================

function createGoldMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.95,
    roughness: 0.15,
    emissive: 0x332200,
    emissiveIntensity: 0.3,
  });
}

// ============================================
// CREATE MYTHOLOGICAL SCALES
// ============================================

function createGoldenScales() {
  const group = new THREE.Group();
  const goldMat = createGoldMaterial();

  // Base
  const baseGeo = new THREE.CylinderGeometry(1.6, 2.0, 0.3, 32);
  const baseMesh = new THREE.Mesh(baseGeo, goldMat);
  baseMesh.position.y = -3.2;
  group.add(baseMesh);

  // Main pole
  const poleGeo = new THREE.CylinderGeometry(0.2, 0.3, 6.0, 32);
  const poleMesh = new THREE.Mesh(poleGeo, goldMat);
  poleMesh.position.y = 0;
  group.add(poleMesh);

  // Horizontal beam
  const beamGeo = new THREE.CylinderGeometry(0.14, 0.14, 5.6, 32);
  const beamMesh = new THREE.Mesh(beamGeo, goldMat);
  beamMesh.rotation.z = Math.PI / 2;
  beamMesh.position.y = 2.8;
  group.add(beamMesh);

  // Create scale pans
  function createPan(xPos) {
    const panGroup = new THREE.Group();
    panGroup.position.set(xPos, 2.8, 0);

    // Chains
    for (let c = 0; c < 4; c++) {
      const angle = (c / 4) * Math.PI * 2;
      const cx = Math.cos(angle) * 1.0;
      const cz = Math.sin(angle) * 1.0;

      const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.0, 8);

      const chainMesh = new THREE.Mesh(chainGeo, goldMat);
      chainMesh.position.set(cx / 2, -1.5, cz / 2);

      panGroup.add(chainMesh);
    }

    // Bowl
    const bowlGeo = new THREE.SphereGeometry(
      1.3,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );

    const bowlMesh = new THREE.Mesh(bowlGeo, goldMat);
    bowlMesh.scale.set(1, 0.25, 1);
    bowlMesh.position.y = -3.0;

    panGroup.add(bowlMesh);

    return panGroup;
  }

  leftPan = createPan(-2.8);
  rightPan = createPan(2.8);

  group.add(leftPan, rightPan);

  group.scale.set(0.85, 0.85, 0.85);

  return group;
}

// ============================================
// INITIALIZE SCENE 5
// VISUAL ONLY - NO NARRATIVE
// ============================================

function initScene4Scales() {
  console.log("⚙️ [DEBUG] Menginisialisasi Scene 5 (Mythological Scales)...");

  // Sesuai dengan ID canvas di ui-controller.js
  const canvas = document.getElementById("scalesCanvas");

  if (!canvas) {
    console.error("❌ Canvas #scalesCanvas tidak ditemukan!");
    return;
  }

  scene4Scales = new THREE.Scene();
  scene4Scales.background = new THREE.Color("#000000");
  scene4Scales.fog = new THREE.FogExp2("#000000", 0.0015);

  camera4Scales = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  camera4Scales.position.set(0, 2.0, 18.0);

  renderer4Scales = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer4Scales.setSize(window.innerWidth, window.innerHeight);
  renderer4Scales.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer4Scales.outputColorSpace = THREE.SRGBColorSpace;
  renderer4Scales.toneMapping = THREE.ACESFilmicToneMapping;
  renderer4Scales.toneMappingExposure = 1.35;

  // Lighting
  scene4Scales.add(new THREE.AmbientLight(0x221805, 0.8));

  const light1 = new THREE.DirectionalLight(0xfff5d1, 4.5);
  light1.position.set(20, 15, 20);
  scene4Scales.add(light1);

  // ============================================
  // STAR FIELD
  // ============================================

  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(10000 * 3);

  for (let i = 0; i < 10000 * 3; i += 3) {
    starPos[i] = (Math.random() - 0.5) * 300;
    starPos[i + 1] = (Math.random() - 0.5) * 300;
    starPos[i + 2] = (Math.random() - 0.5) * 300 - 40;
  }

  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));

  starFieldScales = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    }),
  );

  scene4Scales.add(starFieldScales);

  // ============================================
  // GOLD DUST PARTICLES
  // ============================================

  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(1200 * 3);

  for (let i = 0; i < 1200 * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.0 + Math.random() * 7.0;

    dustPos[i] = Math.cos(angle) * radius;
    dustPos[i + 1] = (Math.random() - 0.5) * 6.0;
    dustPos[i + 2] = Math.sin(angle) * radius;
  }

  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));

  goldDustParticles = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  scene4Scales.add(goldDustParticles);

  // ============================================
  // GOLDEN SCALES
  // ============================================

  scalesGroup = createGoldenScales();

  scalesGroup.position.set(0, -0.4, 0);
  scalesGroup.scale.set(0, 0, 0);

  scene4Scales.add(scalesGroup);

  console.log("✅ [DEBUG] Scene 5 Mythological Scales siap.");
}

// ============================================
// ANIMATION
// ============================================

function animateScene4Scales() {
  if (!animRunning4Scales) return;

  animId4Scales = requestAnimationFrame(animateScene4Scales);

  const delta = clock4Scales.getDelta();
  const elapsed = clock4Scales.getElapsedTime();

  // Star rotation
  if (starFieldScales) {
    starFieldScales.rotation.y += delta * 0.001;
  }

  // Gold dust rotation
  if (goldDustParticles) {
    goldDustParticles.rotation.y += delta * 0.007;
  }

  // Golden scales animation
  if (scalesGroup) {
    const progress = Math.min(1.0, elapsed / 2.8);
    const ease = 1.0 - Math.pow(1.0 - progress, 3.0);

    scalesGroup.scale.set(ease * 0.85, ease * 0.85, ease * 0.85);

    scalesGroup.rotation.y = elapsed * 0.2;

    // Balance movement
    if (leftPan && rightPan) {
      leftPan.position.y = 2.8 + Math.sin(elapsed * 1.6) * 0.15;

      rightPan.position.y = 2.8 - Math.sin(elapsed * 1.6) * 0.15;
    }
  }

  // Camera movement
  if (camera4Scales) {
    const angle = elapsed * 0.3;

    const radius = THREE.MathUtils.lerp(
      20.0,
      14.0,
      Math.min(1.0, elapsed / 3.5),
    );

    camera4Scales.position.x = Math.sin(angle) * radius;

    camera4Scales.position.y = 1.4 + Math.cos(elapsed * 0.2) * 0.3;

    camera4Scales.position.z = Math.cos(angle) * radius;

    camera4Scales.lookAt(0, 0, 0);
  }

  // Render
  if (renderer4Scales && scene4Scales && camera4Scales) {
    renderer4Scales.render(scene4Scales, camera4Scales);
  }
}

// ============================================
// START SCENE 5
// ============================================

export function startScalesScene() {
  console.log("⚖️ [DEBUG] startScalesScene dipanggil.");

  if (animRunning4Scales) return;

  if (!scene4Scales) {
    initScene4Scales();
  }

  if (!renderer4Scales) {
    console.error("❌ Scene 5 gagal diinisialisasi.");
    return;
  }

  clock4Scales.start();

  animRunning4Scales = true;
  animateScene4Scales();
}

// ============================================
// STOP SCENE 5
// ============================================

export function stopScalesScene() {
  console.log("⏹️ [DEBUG] stopScalesScene dipanggil.");

  animRunning4Scales = false;

  if (animId4Scales !== null) {
    cancelAnimationFrame(animId4Scales);
    animId4Scales = null;
  }
}

// ============================================
// RESIZE
// ============================================

window.addEventListener("resize", () => {
  if (camera4Scales && renderer4Scales) {
    camera4Scales.aspect = window.innerWidth / window.innerHeight;

    camera4Scales.updateProjectionMatrix();

    renderer4Scales.setSize(window.innerWidth, window.innerHeight);

    renderer4Scales.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
});
