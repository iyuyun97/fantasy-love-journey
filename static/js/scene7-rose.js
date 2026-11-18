import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log("🌹 [DEBUG] Scene 7 (Glowing Love Rose) dimuat.");

let scene7, camera7, renderer7;
let animRunning7 = false;
let animId7 = null;
let clock7 = new THREE.Clock();

let roseGroup;

function createGlowingRose() {
  const group = new THREE.Group();

  // Tangkai Bunga Mawar
  const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 3.5, 16);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.4 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = -1.5;
  group.add(stem);

  // Kelopak Mawar Berlapis (Warna Merah Menyala & Romantis)
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.25,
    emissive: 0x881337,
    emissiveIntensity: 0.5,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const petalGeo = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI, 0, Math.PI / 2);
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.rotation.y = angle;
    petal.rotation.x = 0.5;
    petal.position.set(Math.cos(angle) * 0.3, 0.5, Math.sin(angle) * 0.3);
    group.add(petal);
  }

  // Inti Mawar
  const coreGeo = new THREE.SphereGeometry(0.5, 32, 32);
  const coreMesh = new THREE.Mesh(coreGeo, petalMat);
  coreMesh.position.y = 0.5;
  group.add(coreMesh);

  group.scale.set(1.2, 1.2, 1.2);
  return group;
}

function initScene7() {
  const canvas = document.getElementById("roseCanvas");
  if (!canvas) {
    console.error('Canvas #roseCanvas tidak ditemukan!');
    return false;
  }

  scene7 = new THREE.Scene();
  scene7.background = new THREE.Color("#000000");
  scene7.fog = new THREE.FogExp2("#000000", 0.0015);

  camera7 = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera7.position.set(0, 0, 10.0);

  renderer7 = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
  renderer7.setSize(window.innerWidth, window.innerHeight);
  renderer7.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer7.outputColorSpace = THREE.SRGBColorSpace;
  renderer7.toneMapping = THREE.ACESFilmicToneMapping;
  renderer7.toneMappingExposure = 1.5;

  scene7.add(new THREE.AmbientLight(0xffb7c5, 1.2));
  const light = new THREE.PointLight(0xf43f5e, 5.0, 25);
  light.position.set(0, 3, 5);
  scene7.add(light);

  roseGroup = createGlowingRose();
  roseGroup.position.set(0, -0.2, 0);
  scene7.add(roseGroup);

  return true;
}

function animateScene7() {
  if (!animRunning7) return;
  animId7 = requestAnimationFrame(animateScene7);

  const delta = clock7.getDelta();
  const elapsed = clock7.getElapsedTime();

  if (roseGroup) {
    roseGroup.rotation.y = elapsed * 0.6;
    roseGroup.position.y = -0.2 + Math.sin(elapsed * 2.0) * 0.1;
  }

  if (renderer7 && scene7 && camera7) {
    renderer7.render(scene7, camera7);
  }
}

export function startRoseScene() {
  console.log("🌹 [DEBUG] startRoseScene dipanggil.");
  if (animRunning7) return;
  if (!scene7 && !initScene7()) return;
  clock7.start();
  animRunning7 = true;
  animateScene7();
}

export function stopRoseScene() {
  animRunning7 = false;
  if (animId7 !== null) {
    cancelAnimationFrame(animId7);
    animId7 = null;
  }
}


