import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log(
  "⚖️ [DEBUG] Scene 5 (The Mythological Scales of Libra) dimuat sebagai ES Module.",
);

let scene5, camera5, renderer5;
let animRunning5 = false;
let animId5 = null;
let clock5 = new THREE.Clock();

let starField5, goldDustParticles5;
let scalesGroup5, leftPan5, rightPan5;
let scalesMaterial;
function createGoldPBRMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.92,
    roughness: 0.18,
    emissive: 0x332200,
    emissiveIntensity: 0.25,
  });
}

function createMythologicalScales() {
  const group = new THREE.Group();
  scalesMaterial = createGoldPBRMaterial();

  const baseGeo = new THREE.CylinderGeometry(1.6, 2.0, 0.3, 32);
  const baseMesh = new THREE.Mesh(baseGeo, scalesMaterial);
  baseMesh.position.y = -3.2;
  group.add(baseMesh);

  const stepGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.2, 32);
  const stepMesh = new THREE.Mesh(stepGeo, scalesMaterial);
  stepMesh.position.y = -3.4;
  group.add(stepMesh);

  const poleGeo = new THREE.CylinderGeometry(0.22, 0.32, 6.2, 32);
  const poleMesh = new THREE.Mesh(poleGeo, scalesMaterial);
  poleMesh.position.y = -0.1;
  group.add(poleMesh);

  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(0.38, 0.06, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, scalesMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.5 + i * 1.5;
    group.add(ringMesh);
  }

  const crownGeo = new THREE.SphereGeometry(0.45, 32, 32);
  const crownMesh = new THREE.Mesh(crownGeo, scalesMaterial);
  crownMesh.position.y = 3.1;
  group.add(crownMesh);

  const beamGeo = new THREE.CylinderGeometry(0.15, 0.15, 5.8, 32);
  const beamMesh = new THREE.Mesh(beamGeo, scalesMaterial);
  beamMesh.rotation.z = Math.PI / 2;
  beamMesh.position.y = 2.8;
  group.add(beamMesh);

  const tipGeo = new THREE.SphereGeometry(0.25, 16, 16);
  const leftTip = new THREE.Mesh(tipGeo, scalesMaterial);
  leftTip.position.set(-2.9, 2.8, 0);
  const rightTip = new THREE.Mesh(tipGeo, scalesMaterial);
  rightTip.position.set(2.9, 2.8, 0);
  group.add(leftTip, rightTip);

  const chainCount = 4;
  const panRadius = 1.4;

  function createPanAssembly(xPos) {
    const panGroup = new THREE.Group();
    panGroup.position.set(xPos, 2.8, 0);

    for (let c = 0; c < chainCount; c++) {
      const angle = (c / chainCount) * Math.PI * 2;
      const cx = Math.cos(angle) * 1.1;
      const cz = Math.sin(angle) * 1.1;

      const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.2, 8);
      const chainMesh = new THREE.Mesh(chainGeo, scalesMaterial);
      chainMesh.position.set(cx / 2, -1.6, cz / 2);
      chainMesh.rotation.z = -cx * 0.12;
      panGroup.add(chainMesh);
    }

    const panGeo = new THREE.SphereGeometry(
      panRadius,
      32,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    const panMesh = new THREE.Mesh(panGeo, scalesMaterial);
    panMesh.scale.set(1, 0.28, 1);
    panMesh.position.y = -3.2;
    panGroup.add(panMesh);

    const ringGeo = new THREE.TorusGeometry(1.1, 0.04, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, scalesMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -3.2;
    panGroup.add(ringMesh);

    return panGroup;
  }

  leftPan5 = createPanAssembly(-2.8);
  rightPan5 = createPanAssembly(2.8);
  group.add(leftPan5, rightPan5);

  group.scale.set(0.9, 0.9, 0.9);
  return group;
}

function initScene5() {
  console.log("⚙️ [DEBUG] Menginisialisasi Scene 5 (Mythological Scales)...");
  const canvas = document.getElementById("scalesCanvas");
  if (!canvas) {
    console.error("❌ Canvas #universe tidak ditemukan!");
    return false;
  }

  scene5 = new THREE.Scene();
  scene5.background = new THREE.Color("#000000");
  scene5.fog = new THREE.FogExp2("#000000", 0.0015);

  camera5 = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera5.position.set(0, 2.0, 18.0);

  renderer5 = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer5.setSize(window.innerWidth, window.innerHeight);
  renderer5.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer5.outputColorSpace = THREE.SRGBColorSpace;
  renderer5.toneMapping = THREE.ACESFilmicToneMapping;
  renderer5.toneMappingExposure = 1.35;

  scene5.add(new THREE.AmbientLight(0x221805, 0.8));

  const goldLight1 = new THREE.DirectionalLight(0xfff5d1, 4.5);
  goldLight1.position.set(20, 15, 20);
  scene5.add(goldLight1);

  const goldLight2 = new THREE.PointLight(0xffaa00, 3.0, 30);
  goldLight2.position.set(-10, -5, 10);
  scene5.add(goldLight2);

  const starCount = 12000;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    starPos[i] = (Math.random() - 0.5) * 300;
    starPos[i + 1] = (Math.random() - 0.5) * 300;
    starPos[i + 2] = (Math.random() - 0.5) * 300 - 40;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starField5 = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.85,
    }),
  );
  scene5.add(starField5);

  const dustCount = 1500;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.0 + Math.random() * 8.0;
    dustPos[i] = Math.cos(angle) * radius;
    dustPos[i + 1] = (Math.random() - 0.5) * 8.0;
    dustPos[i + 2] = Math.sin(angle) * radius;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  goldDustParticles5 = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.09,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene5.add(goldDustParticles5);

  scalesGroup5 = createMythologicalScales();
  scalesGroup5.position.set(0, -0.5, 0);
  scalesGroup5.scale.set(0, 0, 0);
  scene5.add(scalesGroup5);

  console.log("✅ [DEBUG] Scene 5 Mythological Scales siap.");
  return true;
}

function animateScene5() {
  if (!animRunning5) return;
  animId5 = requestAnimationFrame(animateScene5);

  const delta = clock5.getDelta();
  const elapsed = clock5.getElapsedTime();

  if (starField5) starField5.rotation.y += delta * 0.001;
  if (goldDustParticles5) goldDustParticles5.rotation.y += delta * 0.008;

  if (scalesGroup5) {
    const appearProgress = Math.min(1.0, elapsed / 3.0);
    const easeScale = 1.0 - Math.pow(1.0 - appearProgress, 3.0);
    scalesGroup5.scale.set(easeScale * 0.9, easeScale * 0.9, easeScale * 0.9);

    scalesGroup5.rotation.y = elapsed * 0.25;

    if (leftPan5 && rightPan5) {
      leftPan5.position.y = 2.8 + Math.sin(elapsed * 1.8) * 0.18;
      rightPan5.position.y = 2.8 - Math.sin(elapsed * 1.8) * 0.18;
    }
  }

  if (camera5) {
    const camAngle = elapsed * 0.35;
    const camRadius = THREE.MathUtils.lerp(
      22.0,
      14.5,
      Math.min(1.0, elapsed / 4.0),
    );

    camera5.position.x = Math.sin(camAngle) * camRadius;
    camera5.position.y = 1.5 + Math.cos(elapsed * 0.2) * 0.4;
    camera5.position.z = Math.cos(camAngle) * camRadius;
    camera5.lookAt(0, 0, 0);
  }

  if (renderer5 && scene5 && camera5) {
    renderer5.render(scene5, camera5);
  }
}

export function startScalesScene() {
  console.log("⚖️ [DEBUG] startScalesScene ES module dipanggil.");
  if (animRunning5) return;
  if (!scene5 && !initScene5()) return;
  clock5.start();
  animRunning5 = true;
  animateScene5();
}

export function stopScalesScene() {
  console.log("⏹️ [DEBUG] stopScalesScene ES module dipanggil.");
  animRunning5 = false;
  if (animId5 !== null) {
    cancelAnimationFrame(animId5);
    animId5 = null;
  }
}

window.addEventListener("resize", () => {
  if (camera5 && renderer5) {
    camera5.aspect = window.innerWidth / window.innerHeight;
    camera5.updateProjectionMatrix();
    renderer5.setSize(window.innerWidth, window.innerHeight);
  }
});
