console.log("✨ [DEBUG] Scene 1 (Background Universe) dimuat.");

const canvas = document.getElementById("universe");

if (!canvas) {
  throw new Error("Canvas universe tidak ditemukan.");
}

const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;

let stars = [];
let shootingStars = [];

const STAR_COUNT = 250;
const SHOOTING_INTERVAL = 2500;

let animationId = null;
let lastShootingStar = 0;
let scene1Active = false;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createStars();
}

function createStars() {
  stars = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1
    });
  }
}

function drawStars() {
  stars.forEach((star) => {
    star.alpha += star.speed * star.direction;

    if (star.alpha >= 1 || star.alpha <= 0.1) {
      star.direction *= -1;
    }

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.fill();
  });
}

function createShootingStar() {
  shootingStars.push({
    x: Math.random() * width,
    y: Math.random() * height * 0.5,
    length: Math.random() * 100 + 50,
    speed: Math.random() * 8 + 5,
    alpha: 1
  });
}

function drawShootingStars() {
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];

    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(
      star.x - star.length,
      star.y + star.length * 0.4
    );

    ctx.strokeStyle = `rgba(255,230,180,${star.alpha})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffe6ad";
    ctx.stroke();
    ctx.shadowBlur = 0;

    star.x += star.speed;
    star.y -= star.speed * 0.4;
    star.alpha -= 0.008;

    if (star.alpha <= 0) {
      shootingStars.splice(i, 1);
    }
  }
}

function animate(timestamp) {
  if (!scene1Active) {
    animationId = null;
    return;
  }

  ctx.clearRect(0, 0, width, height);

  drawStars();
  drawShootingStars();

  if (timestamp - lastShootingStar > SHOOTING_INTERVAL) {
    createShootingStar();
    lastShootingStar = timestamp;
  }

  animationId = requestAnimationFrame(animate);
}

export function startScene1() {
  if (scene1Active) return;

  scene1Active = true;

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  lastShootingStar = 0;
  animationId = requestAnimationFrame(animate);

  console.log("✨ [DEBUG] Scene 1 dimulai.");
}

export function stopScene1() {
  scene1Active = false;

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  window.removeEventListener("resize", resizeCanvas);

  console.log("⏹️ [DEBUG] Scene 1 dihentikan.");
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  } else if (scene1Active && animationId === null) {
    animationId = requestAnimationFrame(animate);
  }
});
