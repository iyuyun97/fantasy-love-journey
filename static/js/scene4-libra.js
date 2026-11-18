import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log("♎ [DEBUG] Scene 4 (Libra Constellation - Stable HD) dimuat sebagai ES Module.");

let scene4, camera4, renderer4;
let animRunning4 = false;
let animId4 = null;
let clock4 = new THREE.Clock();

let starField4, cosmicDust4;
let volumetricNebulae = [];
let distantGalaxies4 = [];
let libraGroup;
let libraStarMeshes = [];
let libraConnectionLines = [];
let libraSymbolMesh;

function createSharpNebulaParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 0.95)");
  grad.addColorStop(0.2, "rgba(220, 190, 255, 0.5)");
  grad.addColorStop(0.5, "rgba(59, 130, 246, 0.12)");
  grad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function createAstronomicalStarMaterial(colorHex) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uTime: { value: 0 },
      uOpacity: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;

      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float dist = length(p);
        if (dist > 1.0) discard;

        float core = exp(-dist * 14.0);
        float halo = exp(-dist * 4.5) * 0.6;
        float spikeX = exp(-abs(p.y) * 36.0) * exp(-abs(p.x) * 4.0) * 0.65;
        float spikeY = exp(-abs(p.x) * 36.0) * exp(-abs(p.y) * 4.0) * 0.65;

        float pulse = 0.94 + 0.06 * sin(uTime * 2.5);
        float intensity = (core + halo + spikeX + spikeY) * pulse;

        vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), clamp(core * 1.6, 0.0, 1.0));
        gl_FragColor = vec4(finalColor * intensity * 1.6, clamp(intensity * uOpacity, 0.0, 1.0));
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

function createLibraSymbolTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 512, 512);
  ctx.save();
  ctx.translate(256, 265);

  ctx.strokeStyle = "rgba(186, 230, 253, 0.98)";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(56, 189, 248, 1.0)";
  ctx.shadowBlur = 30;

  ctx.beginPath();
  ctx.moveTo(-135, 58); ctx.lineTo(135, 58); ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-135, 16); ctx.lineTo(-68, 16);
  ctx.arc(0, 16, 68, Math.PI, 0, false);
  ctx.lineTo(135, 16); ctx.stroke();

  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildDistantSpiralGalaxy(count, radius, spin, colorIn, colorOut, pos, rot) {
  const group = new THREE.Group();
  group.position.copy(pos);
  group.rotation.set(rot.x, rot.y, rot.z);

  const geo = new THREE.BufferGeometry();
  const posArr = new Float32Array(count * 3);
  const colArr = new Float32Array(count * 3);
  const c1 = new THREE.Color(colorIn);
  const c2 = new THREE.Color(colorOut);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.pow(Math.random(), 1.5) * radius;
    const angle = r * spin + ((i % 3) / 3) * Math.PI * 2;
    const spread = (Math.random() - 0.5) * 0.35 * (radius - r);

    posArr[i3] = Math.cos(angle) * r + spread;
    posArr[i3 + 1] = (Math.random() - 0.5) * 0.35 * (1 - r / radius);
    posArr[i3 + 2] = Math.sin(angle) * r + spread;

    const mixed = c1.clone().lerp(c2, r / radius);
    colArr[i3] = mixed.r; colArr[i3 + 1] = mixed.g; colArr[i3 + 2] = mixed.b;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  group.add(new THREE.Points(geo, mat));
  return group;
}

function initScene4() {
  const canvas = document.getElementById("libraCanvas");
  if (!canvas) {
    console.error("❌ Canvas #libraCanvas tidak ditemukan!");
    return false;
  }

  scene4 = new THREE.Scene();
  scene4.background = new THREE.Color("#000000");
  scene4.fog = new THREE.FogExp2("#000000", 0.0012);

  camera4 = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1200);
  camera4.position.set(0, 3.5, 34);

  renderer4 = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer4.setSize(window.innerWidth, window.innerHeight);
  renderer4.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer4.outputColorSpace = THREE.SRGBColorSpace;
  renderer4.toneMapping = THREE.ACESFilmicToneMapping;
  renderer4.toneMappingExposure = 1.4;

  const starCount = 15000;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  const palette = [new THREE.Color("#ffffff"), new THREE.Color("#7dd3fc"), new THREE.Color("#fef08a"), new THREE.Color("#f472b6")];

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const r = 70 + Math.random() * 330;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    starPos[i3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i3 + 1] = r * Math.cos(phi);
    starPos[i3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 40;

    const c = palette[Math.floor(Math.random() * palette.length)];
    const lum = 0.6 + Math.random() * 0.4;
    starCol[i3] = c.r * lum; starCol[i3 + 1] = c.g * lum; starCol[i3 + 2] = c.b * lum;
  }

  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));

  starField4 = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.22, vertexColors: true, transparent: true, opacity: 0.98, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene4.add(starField4);

  volumetricNebulae = [];
  const nebTex = createSharpNebulaParticleTexture();
  const nebulaClusters = [
    { count: 1200, c1: new THREE.Color("#2563eb"), c2: new THREE.Color("#7c3aed"), pos: new THREE.Vector3(-22, 10, -48), spread: 28, size: 2.4, opacity: 0.32 },
    { count: 1200, c1: new THREE.Color("#db2777"), c2: new THREE.Color("#d97706"), pos: new THREE.Vector3(24, -8, -55), spread: 30, size: 2.6, opacity: 0.30 }
  ];

  nebulaClusters.forEach((cluster, idx) => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(cluster.count * 3);
    const cols = new Float32Array(cluster.count * 3);

    for (let i = 0; i < cluster.count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.6) * cluster.spread;

      pos[i3] = cluster.pos.x + r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = cluster.pos.y + r * Math.sin(phi) * Math.sin(theta) * 0.55;
      pos[i3 + 2] = cluster.pos.z + r * Math.cos(phi) * 0.75;

      const mixCol = cluster.c1.clone().lerp(cluster.c2, Math.random());
      cols[i3] = mixCol.r; cols[i3 + 1] = mixCol.g; cols[i3 + 2] = mixCol.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));

    const mat = new THREE.PointsMaterial({
      size: cluster.size, map: nebTex, vertexColors: true, transparent: true, opacity: cluster.opacity, depthWrite: false, blending: THREE.AdditiveBlending
    });

    const cloudMesh = new THREE.Points(geo, mat);
    scene4.add(cloudMesh);
    volumetricNebulae.push({ mesh: cloudMesh, rotSpeed: (idx % 2 === 0 ? 1 : -1) * 0.001 });
  });

  const dustCount = 1800;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount * 3; i += 3) {
    dustPos[i] = (Math.random() - 0.5) * 80;
    dustPos[i + 1] = (Math.random() - 0.5) * 45;
    dustPos[i + 2] = (Math.random() - 0.5) * 95;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  cosmicDust4 = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0x7dd3fc, size: 0.075, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene4.add(cosmicDust4);

  distantGalaxies4 = [];
  const gal1 = buildDistantSpiralGalaxy(8000, 15, 1.4, "#fef08a", "#38bdf8", new THREE.Vector3(-28, 14, -75), new THREE.Euler(0.7, -0.3, 0.3));
  scene4.add(gal1);
  distantGalaxies4.push(gal1);

  libraGroup = new THREE.Group();
  libraGroup.position.set(0, 0.6, -2);
  scene4.add(libraGroup);

  const starsData = [
    { id: "beta", pos: new THREE.Vector3(0.0, 3.6, 0.4), size: 2.3, color: "#7dd3fc", revealTime: 1.0 },
    { id: "alpha", pos: new THREE.Vector3(-3.3, 1.1, -0.3), size: 2.0, color: "#fef08a", revealTime: 1.8 },
    { id: "gamma", pos: new THREE.Vector3(3.1, 1.3, 0.2), size: 1.8, color: "#fed7aa", revealTime: 2.5 },
    { id: "sigma", pos: new THREE.Vector3(-2.4, -2.5, -0.6), size: 1.7, color: "#fecaca", revealTime: 3.2 },
    { id: "upsilon", pos: new THREE.Vector3(2.3, -1.6, -0.2), size: 1.4, color: "#fde047", revealTime: 3.8 },
    { id: "tau", pos: new THREE.Vector3(2.7, -2.7, -0.5), size: 1.3, color: "#bae6fd", revealTime: 4.4 }
  ];

  const starLookup = {};
  libraStarMeshes = [];

  starsData.forEach((st) => {
    starLookup[st.id] = st.pos;
    const planeGeo = new THREE.PlaneGeometry(st.size, st.size);
    const mat = createAstronomicalStarMaterial(st.color);
    const mesh = new THREE.Mesh(planeGeo, mat);
    mesh.position.copy(st.pos);
    libraGroup.add(mesh);

    libraStarMeshes.push({ mesh, material: mat, revealTime: st.revealTime, phase: Math.random() * Math.PI * 2 });
  });

  const connections = [
    { from: "beta", to: "alpha", startTime: 4.8, duration: 1.2 },
    { from: "beta", to: "gamma", startTime: 5.2, duration: 1.2 },
    { from: "alpha", to: "gamma", startTime: 5.7, duration: 1.4 },
    { from: "alpha", to: "sigma", startTime: 6.2, duration: 1.2 },
    { from: "gamma", to: "upsilon", startTime: 6.6, duration: 1.0 },
    { from: "upsilon", to: "tau", startTime: 7.0, duration: 1.0 }
  ];

  libraConnectionLines = [];
  connections.forEach((conn) => {
    const pStart = starLookup[conn.from];
    const pEnd = starLookup[conn.to];
    const lineGeo = new THREE.BufferGeometry().setFromPoints([pStart.clone(), pStart.clone()]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
    const line = new THREE.Line(lineGeo, lineMat);
    libraGroup.add(line);

    libraConnectionLines.push({ line, material: lineMat, pStart, pEnd, startTime: conn.startTime, duration: conn.duration });
  });

  const symbolGeo = new THREE.PlaneGeometry(4.2, 4.2);
  const symbolMat = new THREE.MeshBasicMaterial({ map: createLibraSymbolTexture(), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false });
  libraSymbolMesh = new THREE.Mesh(symbolGeo, symbolMat);
  libraSymbolMesh.position.set(0, -0.3, -1.4);
  libraGroup.add(libraSymbolMesh);

  console.log("✅ [DEBUG] Scene 4 Stable HD siap.");
  return true;
}

function animateScene4() {
  if (!animRunning4) return;
  animId4 = requestAnimationFrame(animateScene4);

  const delta = clock4.getDelta();
  const elapsed = clock4.getElapsedTime();

  if (starField4) starField4.rotation.y += delta * 0.001;
  if (cosmicDust4) cosmicDust4.rotation.y -= delta * 0.0035;

  volumetricNebulae.forEach((n) => { n.mesh.rotation.y += delta * n.rotSpeed; });
  distantGalaxies4.forEach((g) => { g.rotation.y += delta * 0.035; });

  libraStarMeshes.forEach((st) => {
    const fadeProgress = THREE.MathUtils.clamp((elapsed - st.revealTime) / 1.2, 0, 1);
    st.material.uniforms.uOpacity.value = fadeProgress;
    st.material.uniforms.uTime.value = elapsed + st.phase;
    st.mesh.quaternion.copy(camera4.quaternion);
  });

  libraConnectionLines.forEach((conn) => {
    const progress = THREE.MathUtils.clamp((elapsed - conn.startTime) / conn.duration, 0, 1);
    const ease = 1.0 - Math.pow(1.0 - progress, 3.0);
    const currentEnd = new THREE.Vector3().lerpVectors(conn.pStart, conn.pEnd, ease);
    const posAttr = conn.line.geometry.attributes.position;
    posAttr.setXYZ(1, currentEnd.x, currentEnd.y, currentEnd.z);
    posAttr.needsUpdate = true;
    conn.material.opacity = ease * 0.75;
  });

  if (libraSymbolMesh) {
    const symProgress = THREE.MathUtils.clamp((elapsed - 8.2) / 2.5, 0, 1);
    libraSymbolMesh.material.opacity = symProgress * (0.35 + Math.sin(elapsed * 1.5) * 0.05);
    libraSymbolMesh.quaternion.copy(camera4.quaternion);
  }

  if (camera4) {
    const approach = THREE.MathUtils.clamp(elapsed / 12.0, 0, 1);
    const smoothApproach = 1.0 - Math.pow(1.0 - approach, 2.5);
    const targetZ = THREE.MathUtils.lerp(34.0, 12.8, smoothApproach);
    const orbitAngle = Math.max(0, elapsed - 5.0) * 0.07;

    camera4.position.x = Math.sin(orbitAngle) * 3.4;
    camera4.position.y = THREE.MathUtils.lerp(3.5, 0.5, smoothApproach) + Math.cos(elapsed * 0.22) * 0.45;
    camera4.position.z = targetZ + (Math.cos(orbitAngle) - 1.0) * 1.2;
    camera4.lookAt(0, 0.4, -2.0);
  }

  if (renderer4 && scene4 && camera4) {
    renderer4.render(scene4, camera4);
  }
}

export function startLibraScene() {
  console.log("♎ [DEBUG] startLibraScene ES module dipanggil.");
  if (animRunning4) return;
  if (!scene4 && !initScene4()) return;
  clock4.start();
  animRunning4 = true;
  animateScene4();
}

export function stopLibraScene() {
  console.log("⏹️ [DEBUG] stopLibraScene ES module dipanggil.");
  animRunning4 = false;
  if (animId4 !== null) {
    cancelAnimationFrame(animId4);
    animId4 = null;
  }
}

window.addEventListener("resize", () => {
  if (camera4 && renderer4) {
    camera4.aspect = window.innerWidth / window.innerHeight;
    camera4.updateProjectionMatrix();
    renderer4.setSize(window.innerWidth, window.innerHeight);
    renderer4.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
});
