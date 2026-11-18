import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log("SCENE 2: HUMANOID KNIGHT LOADED");

let scene = null;
let camera = null;
let renderer = null;
let clock = new THREE.Clock(false);

let animRunning = false;
let animId = null;

let knight = null;
let starField = null;

let leftArm = null;
let rightArm = null;
let leftLeg = null;
let rightLeg = null;
let cape = null;
let sword = null;
let shield = null;
let head = null;
let aura = null;

const mat = {
  steel: new THREE.MeshStandardMaterial({
    color: 0xc5d1dc,
    metalness: 0.92,
    roughness: 0.24,
  }),

  dark: new THREE.MeshStandardMaterial({
    color: 0x273343,
    metalness: 0.8,
    roughness: 0.35,
  }),

  gold: new THREE.MeshStandardMaterial({
    color: 0xd5a53c,
    metalness: 0.9,
    roughness: 0.22,
  }),

  red: new THREE.MeshStandardMaterial({
    color: 0x781d36,
    roughness: 0.8,
    side: THREE.DoubleSide,
  }),

  black: new THREE.MeshStandardMaterial({
    color: 0x101722,
    metalness: 0.5,
    roughness: 0.4,
  }),

  leather: new THREE.MeshStandardMaterial({
    color: 0x493026,
    roughness: 0.8,
  }),

  glow: new THREE.MeshBasicMaterial({
    color: 0xffd77a,
    transparent: true,
    opacity: 0.5,
  }),
};

// ----------------------------------------------------------
// HELPER
// ----------------------------------------------------------

function addMesh(parent, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addSphere(parent, material, x, y, z, sx, sy, sz) {
  const mesh = addMesh(
    parent,
    new THREE.SphereGeometry(1, 24, 16),
    material,
    x,
    y,
    z,
  );

  mesh.scale.set(sx, sy, sz);
  return mesh;
}

function addBox(parent, material, x, y, z, sx, sy, sz) {
  return addMesh(parent, new THREE.BoxGeometry(sx, sy, sz), material, x, y, z);
}

function addCylinder(parent, material, x, y, z, r1, r2, height) {
  return addMesh(
    parent,
    new THREE.CylinderGeometry(r1, r2, height, 20),
    material,
    x,
    y,
    z,
  );
}

// ----------------------------------------------------------
// ARMOR LIMB
// ----------------------------------------------------------

function createArm(side) {
  const pivot = new THREE.Group();
  pivot.position.set(side * 0.83, 3.55, 0);
  knight.add(pivot);

  // Upper arm
  addSphere(pivot, mat.steel, 0, -0.38, 0, 0.25, 0.48, 0.27);

  // Shoulder plate
  addSphere(pivot, mat.steel, 0, -0.05, 0, 0.36, 0.31, 0.35);

  // Golden shoulder decoration
  addSphere(pivot, mat.gold, 0, -0.05, 0.28, 0.17, 0.17, 0.06);

  // Elbow
  addSphere(pivot, mat.dark, 0, -0.78, 0, 0.21, 0.19, 0.22);

  // Forearm armor
  addMesh(
    pivot,
    new THREE.CylinderGeometry(0.16, 0.22, 0.7, 20),
    mat.steel,
    0,
    -1.15,
    0,
  );

  // Wrist
  addCylinder(pivot, mat.gold, 0, -1.55, 0, 0.16, 0.16, 0.12);

  // Hand
  addSphere(pivot, mat.leather, 0, -1.75, 0.02, 0.16, 0.2, 0.15);

  // Fingers
  for (let i = 0; i < 4; i++) {
    addBox(pivot, mat.dark, -0.09 + i * 0.06, -1.92, 0.09, 0.045, 0.15, 0.07);
  }

  return pivot;
}

function createLeg(x) {
  const pivot = new THREE.Group();
  pivot.position.set(x, 2.0, 0);
  knight.add(pivot);

  // Thigh
  addSphere(pivot, mat.dark, 0, -0.38, 0, 0.27, 0.52, 0.3);

  // Thigh plate
  addMesh(
    pivot,
    new THREE.BoxGeometry(0.46, 0.58, 0.15),
    mat.steel,
    0,
    -0.38,
    0.24,
  );

  // Knee
  addSphere(pivot, mat.gold, 0, -0.82, 0.12, 0.23, 0.22, 0.24);

  // Shin
  addMesh(
    pivot,
    new THREE.CylinderGeometry(0.17, 0.22, 0.78, 20),
    mat.steel,
    0,
    -1.28,
    0,
  );

  // Shin decoration
  addBox(pivot, mat.gold, 0, -1.27, 0.19, 0.12, 0.5, 0.045);

  // Ankle
  addCylinder(pivot, mat.dark, 0, -1.72, 0, 0.17, 0.18, 0.16);

  // Boot
  addBox(pivot, mat.dark, 0, -1.88, 0.15, 0.4, 0.23, 0.62);

  return pivot;
}

// ----------------------------------------------------------
// SWORD
// ----------------------------------------------------------

function createSword(parent) {
  const group = new THREE.Group();

  // Blade
  addBox(group, mat.steel, 0, 0.92, 0, 0.12, 1.65, 0.055);

  // Blade tip
  const tip = addMesh(
    group,
    new THREE.ConeGeometry(0.085, 0.32, 4),
    mat.steel,
    0,
    1.9,
    0,
  );

  tip.rotation.z = Math.PI;

  // Gold crossguard
  addBox(group, mat.gold, 0, 0.05, 0, 0.62, 0.11, 0.13);

  // Grip
  addCylinder(group, mat.leather, 0, -0.28, 0, 0.065, 0.065, 0.42);

  // Pommel
  addSphere(group, mat.gold, 0, -0.52, 0, 0.11, 0.11, 0.11);

  parent.add(group);
  group.position.set(0, -1.78, 0.1);

  return group;
}

// ----------------------------------------------------------
// SHIELD
// ----------------------------------------------------------

function createShield(parent) {
  const group = new THREE.Group();

  // Main shield
  addMesh(
    group,
    new THREE.CylinderGeometry(0.58, 0.43, 0.15, 6),
    mat.gold,
    0,
    0,
    0,
  );

  // Inner surface
  addMesh(
    group,
    new THREE.CylinderGeometry(0.49, 0.36, 0.17, 6),
    mat.dark,
    0,
    0,
    0.035,
  );

  // Central emblem
  addMesh(group, new THREE.OctahedronGeometry(0.2), mat.gold, 0, 0, 0.15);

  // Cross decoration
  addBox(group, mat.gold, 0, 0, 0.17, 0.09, 0.68, 0.04);

  addBox(group, mat.gold, 0, 0, 0.17, 0.48, 0.09, 0.04);

  parent.add(group);
  group.position.set(0, -1.35, 0.28);
  group.rotation.x = -0.15;

  return group;
}

// ----------------------------------------------------------
// HUMAN KNIGHT
// ----------------------------------------------------------

function createKnight() {
  knight = new THREE.Group();

  // Pelvis
  addSphere(knight, mat.dark, 0, 2.0, 0, 0.52, 0.34, 0.34);

  // Waist
  addCylinder(knight, mat.gold, 0, 2.2, 0, 0.46, 0.46, 0.15);

  // Torso: human chest
  addSphere(knight, mat.dark, 0, 2.95, 0, 0.68, 0.84, 0.39);

  // Chest plate
  addSphere(knight, mat.steel, 0, 3.08, 0.19, 0.65, 0.76, 0.28);

  // Chest central plate
  addBox(knight, mat.steel, 0, 3.05, 0.42, 0.55, 0.82, 0.12);

  // Chest emblem
  addMesh(knight, new THREE.OctahedronGeometry(0.2), mat.gold, 0, 3.15, 0.52);

  // Neck
  addCylinder(knight, mat.dark, 0, 3.82, 0, 0.19, 0.19, 0.35);

  // Neck guard
  addCylinder(knight, mat.gold, 0, 3.83, 0, 0.24, 0.24, 0.12);

  // Helmet group
  head = new THREE.Group();
  head.position.set(0, 4.35, 0);
  knight.add(head);

  // Head shape
  addSphere(head, mat.dark, 0, 0, 0, 0.37, 0.45, 0.34);

  // Helmet dome
  addSphere(head, mat.steel, 0, 0.13, 0, 0.43, 0.4, 0.39);

  // Face guard
  addBox(head, mat.steel, 0, -0.16, 0.3, 0.65, 0.42, 0.18);

  // Visor
  addBox(head, mat.black, 0, -0.07, 0.405, 0.42, 0.045, 0.025);

  // Helmet lower edge
  addBox(head, mat.gold, 0, -0.4, 0.1, 0.75, 0.1, 0.58);

  // Helmet crest
  addMesh(head, new THREE.ConeGeometry(0.14, 0.55, 8), mat.gold, 0, 0.58, 0);

  // Helmet side plates
  for (const side of [-1, 1]) {
    addBox(head, mat.steel, side * 0.4, -0.18, 0, 0.13, 0.45, 0.35);
  }

  // Shoulder and arms
  leftArm = createArm(-1);
  rightArm = createArm(1);

  // Sword in right hand
  sword = createSword(rightArm);

  // Shield in left hand
  shield = createShield(leftArm);

  // Legs
  leftLeg = createLeg(-0.29);
  rightLeg = createLeg(0.29);

  // Armor waist plates
  for (let i = -1; i <= 1; i++) {
    const plate = addBox(
      knight,
      mat.steel,
      i * 0.31,
      1.82,
      0.25,
      0.27,
      0.48,
      0.12,
    );

    plate.rotation.z = -i * 0.13;
  }

  // Cape attachment
  addBox(knight, mat.gold, 0, 3.7, -0.27, 0.95, 0.16, 0.16);

  // Cape with subdivided geometry
  const capeGeometry = new THREE.PlaneGeometry(1.45, 2.7, 12, 18);
  capeGeometry.translate(0, -1.25, 0);

  cape = new THREE.Mesh(capeGeometry, mat.red);
  cape.position.set(0, 3.65, -0.32);
  cape.rotation.x = 0.12;
  cape.castShadow = true;
  knight.add(cape);

  // Shield shoulder decorations
  for (const side of [-1, 1]) {
    addSphere(knight, mat.gold, side * 0.82, 3.63, 0.1, 0.17, 0.17, 0.17);
  }

  // Glowing aura
  aura = new THREE.Mesh(
    new THREE.TorusGeometry(1.65, 0.025, 12, 100),
    mat.glow,
  );

  aura.position.set(0, 2.5, -0.6);
  aura.rotation.x = Math.PI / 2;
  knight.add(aura);

  return knight;
}

// ----------------------------------------------------------
// STARS
// ----------------------------------------------------------

function createStarField() {
  const count = 4000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (Math.random() - 0.5) * 180;
    positions[i + 1] = (Math.random() - 0.5) * 120;
    positions[i + 2] = -Math.random() * 100;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.13,
      transparent: true,
      opacity: 0.8,
    }),
  );
}

// ----------------------------------------------------------
// INIT
// ----------------------------------------------------------

function initScene2() {
  const canvas = document.getElementById("knight3DCanvas");

  if (!canvas) {
    console.error("Canvas knight3DCanvas tidak ditemukan.");
    return false;
  }

  try {
    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      500,
    );

    camera.position.set(0, 2.5, 11);
    camera.lookAt(0, 2.25, 0);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    renderer.setSize(window.innerWidth, window.innerHeight, false);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x000000, 0);

    // Ambient
    scene.add(new THREE.AmbientLight(0x8793aa, 1.4));

    // Main light
    const mainLight = new THREE.DirectionalLight(0xffe2b5, 3.5);
    mainLight.position.set(5, 9, 8);
    scene.add(mainLight);

    // Blue rim light
    const blueLight = new THREE.PointLight(0x367dff, 45, 35);
    blueLight.position.set(-5, 3, -4);
    scene.add(blueLight);

    // Golden rim light
    const goldLight = new THREE.PointLight(0xffb75e, 30, 25);
    goldLight.position.set(5, 5, -3);
    scene.add(goldLight);

    starField = createStarField();
    scene.add(starField);

    knight = createKnight();
    knight.position.set(0, -0.25, 0);
    scene.add(knight);

    return true;
  } catch (error) {
    console.error("Scene 2 initialization error:", error);

    if (renderer) {
      renderer.dispose();
      renderer = null;
    }

    return false;
  }
}

// ----------------------------------------------------------
// RESIZE
// ----------------------------------------------------------

function resizeScene2() {
  if (!camera || !renderer) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

// ----------------------------------------------------------
// CAPE ANIMATION
// ----------------------------------------------------------

function animateCape(elapsed) {
  if (!cape) return;

  const positions = cape.geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    const wave =
      Math.sin(elapsed * 2.0 + Math.abs(y) * 1.4 + x * 2.0) *
      Math.pow(Math.abs(y) / 2.7, 1.4) *
      0.22;

    positions.setZ(i, wave);
  }

  positions.needsUpdate = true;
  cape.geometry.computeVertexNormals();
}

// ----------------------------------------------------------
// ANIMATION
// ----------------------------------------------------------

function animate() {
  if (!animRunning) {
    animId = null;
    return;
  }

  animId = requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  if (starField) {
    starField.rotation.y += delta * 0.012;
  }

  if (knight) {
    // Breathing
    knight.position.y = -0.25 + Math.sin(elapsed * 1.7) * 0.035;

    // Natural body movement
    knight.rotation.y = Math.sin(elapsed * 0.35) * 0.1;

    // Head movement
    if (head) {
      head.rotation.y = Math.sin(elapsed * 0.55) * 0.09;
    }

    // Sword arm: slow heroic movement
    if (rightArm) {
      rightArm.rotation.z = -0.1 - (0.25 + 0.25 * Math.sin(elapsed * 0.8));
    }

    // Shield movement
    if (leftArm) {
      leftArm.rotation.z = 0.08 + Math.sin(elapsed * 1.2) * 0.035;
    }

    // Legs idle
    if (leftLeg) {
      leftLeg.rotation.x = Math.sin(elapsed * 1.4) * 0.025;
    }

    if (rightLeg) {
      rightLeg.rotation.x = -Math.sin(elapsed * 1.4) * 0.025;
    }

    // Cape
    animateCape(elapsed);

    // Aura
    if (aura) {
      aura.rotation.z += delta * 0.2;
      aura.material.opacity = 0.32 + Math.sin(elapsed * 2) * 0.12;
    }
  }

  // Camera
  if (camera) {
    camera.position.x = Math.sin(elapsed * 0.2) * 0.18;
    camera.position.y = 2.5 + Math.sin(elapsed * 0.3) * 0.06;
    camera.lookAt(0, 2.25, 0);
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ----------------------------------------------------------
// PUBLIC FUNCTIONS
// ----------------------------------------------------------

export function startKnight3DScene() {
  console.log("Starting Scene 2...");

  if (animRunning) return;

  if (!renderer) {
    if (!initScene2()) return;
  }

  const canvas = document.getElementById("knight3DCanvas");

  if (canvas) {
    canvas.style.display = "block";
    canvas.classList.add("active");
  }

  clock.start();
  animRunning = true;

  if (animId === null) {
    animId = requestAnimationFrame(animate);
  }
}

export function stopKnight3DScene() {
  console.log("Stopping Scene 2...");

  animRunning = false;

  if (animId !== null) {
    cancelAnimationFrame(animId);
    animId = null;
  }

  clock.stop();

  const canvas = document.getElementById("knight3DCanvas");

  if (canvas) {
    canvas.classList.remove("active");
  }
}

// ----------------------------------------------------------
// GLOBAL
// ----------------------------------------------------------

window.addEventListener("resize", resizeScene2);

window.startKnight3DScene = startKnight3DScene;
window.stopKnight3DScene = stopKnight3DScene;

console.log("Scene 2 ready.");
