// ============================================
// FANTASY LOVE JOURNEY - UI & SCENE CONTROLLER (SYNCED)
// ============================================

import { startScene1, stopScene1 } from "./scene-1.js";
import { startKnight3DScene, stopKnight3DScene } from "./scene2-3d.js";
import { startUniverseScene, stopUniverseScene } from "./scene3.js";
import { startLibraScene, stopLibraScene } from "./scene4-libra.js";
import { startScalesScene, stopScalesScene } from "./scene5-scales.js";
import { startArcherScene, stopArcherScene } from "./scene6-archer.js";
import { startRoseScene, stopRoseScene } from "./scene7-rose.js";

document.addEventListener("DOMContentLoaded", () => {
  // Jalankan animasi bintang 2D di Scene 1
  startScene1();

  const startButton = document.getElementById("startButton");
  const continueButton = document.getElementById("continueButton");
  const dialogueBox = document.getElementById("dialogueBox");
  const dialogueText = document.getElementById("dialogueText");
  const mainContent = document.querySelector(".content");
  const universeCanvas = document.getElementById("universe");
  const knight3DCanvas = document.getElementById("knight3DCanvas");
  const universe3DCanvas = document.getElementById("universe3DCanvas");
  const libraCanvas = document.getElementById("libraCanvas");
  const scalesCanvas = document.getElementById("scalesCanvas");
  const archerCanvas = document.getElementById("archerCanvas");
  const roseCanvas = document.getElementById("roseCanvas");

  let currentScene = 0;

  // Mengirim jawaban Scene 7 ke Flask.
  async function saveResponse(answer) {
    try {
      const response = await fetch("/api/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answer })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan jawaban.");
      }

      console.log("Jawaban berhasil disimpan:", result);
      return true;

    } catch (error) {
      console.error("Kesalahan penyimpanan jawaban:", error);

      if (dialogueText) {
        dialogueText.innerText =
          "Maaf, jawaban belum berhasil dikirim. Silakan coba lagi.";
      }

      return false;
    }
  }

  // Pemetaan narasi yang disesuaikan dengan urutan scene (1 sampai 6)
  const sceneNarratives = {
    1: "Seorang kesatria tidak selalu memenangkan setiap pertempuran.", // Scene 2: Knight 3D
    2: "Ketika melihat luasnya alam semesta, kita menyadari betapa kecilnya diri kita. Kadang kita baru menyadari betapa berharganya sesuatu setelah kita melakukan kesalahan yang membuatnya terluka.", // Scene 3: Universe
    3: "Aku tahu kamu juga orangnya penuh pertimbangan, seperti rasi bintangmu Lybra atau Timbangan. \nMungkin selama ini ada saat-saat ketika aku terlalu memikirkan sudut pandangku sendiri, tanpa benar-benar mencoba memahami apa yang kamu rasakan.", // Scene 4: Libra
    4: "Ada hal-hal yang tidak bisa diulang, ada kesalahan yang tidak bisa ditarik kembali, dan ada perasaan yang mungkin membutuhkan waktu untuk pulih.", // Scene 5: Scales
    5: "Jika masih ada kesempatan untuk memperbaiki apa yang telah terjadi, aku ingin menjalaninya dengan lebih dewasa. Maaf ya adik kecil!", // Scene 6: Archer
    6: "Aku tidak ingin sekadar mengatakan bahwa aku menyesal. Aku ingin belajar menjadi seseorang yang lebih baik melalui apa yang telah terjadi.\n Apakah Kamu mau menerima permintaan Maaf saya?", // Scene 7: Rose
  };

  if (startButton) {
    startButton.addEventListener("click", () => {
      if (mainContent) {
        mainContent.style.opacity = "0";
        mainContent.style.pointerEvents = "none";
        setTimeout(() => {
          mainContent.style.display = "none";
        }, 800);
      }

      // Matikan Scene 1 (2D Canvas)
      stopScene1();
      if (universeCanvas) universeCanvas.style.display = "none";

      // Aktifkan Canvas 3D utama
      if (knight3DCanvas) {
        knight3DCanvas.style.display = "block";
        knight3DCanvas.classList.add("active");
      }

      currentScene = 1; // Menandakan awal masuk Scene 2 (Knight 3D)
      if (typeof startKnight3DScene === "function") startKnight3DScene();

      if (dialogueBox && dialogueText) {
        dialogueText.innerText = sceneNarratives[1];
        dialogueBox.classList.add("active");
      }
    });
  }

  if (continueButton) {
    continueButton.addEventListener("click", () => {
      currentScene++;
      console.log(`Melanjutkan ke scene berikutnya (Index): ${currentScene}`);

      if (sceneNarratives[currentScene]) {
        if (dialogueText) {
          dialogueText.innerText = sceneNarratives[currentScene];
        }

        // Transisi antar scene 3D yang terstruktur dengan aman
        if (currentScene === 2) {
          // Pindah ke Scene 3 (JWST Universe)
          if (typeof stopKnight3DScene === "function") {
            stopKnight3DScene();
          }

          if (knight3DCanvas) {
            knight3DCanvas.style.display = "none";
          }

          if (universe3DCanvas) {
            universe3DCanvas.style.display = "block";
          }

          if (typeof startUniverseScene === "function") {
            startUniverseScene();
          }
        } else if (currentScene === 3) {
          // Pindah ke Scene 4 (Libra)
          if (typeof stopUniverseScene === "function") {
            stopUniverseScene();
          }

          if (universe3DCanvas) {
            universe3DCanvas.style.display = "none";
          }

          if (libraCanvas) {
            libraCanvas.style.display = "block";
          }

          if (typeof startLibraScene === "function") {
            startLibraScene();
          }
        } else if (currentScene === 4) {
          // Pindah ke Scene 5 (Scales)
          if (typeof stopLibraScene === "function") {
            stopLibraScene();
          }

          if (libraCanvas) libraCanvas.style.display = "none";
          if (scalesCanvas) scalesCanvas.style.display = "block";

          if (typeof startScalesScene === "function") {
            startScalesScene();
          }
        } else if (currentScene === 5) {
          // Pindah ke Scene 6 (Archer)
          if (typeof stopScalesScene === "function") {
            stopScalesScene();
          }

          if (scalesCanvas) scalesCanvas.style.display = "none";
          if (archerCanvas) archerCanvas.style.display = "block";

          if (typeof startArcherScene === "function") {
            startArcherScene();
          }
        } else if (currentScene === 6) {
          // Pindah ke Scene 7 (Rose + Tombol Interaktif Ya/Tidak)
          if (typeof stopArcherScene === "function") {
            stopArcherScene();
          }

          if (archerCanvas) archerCanvas.style.display = "none";
          if (roseCanvas) roseCanvas.style.display = "block";

          if (typeof startRoseScene === "function") {
            startRoseScene();
          }

          if (dialogueBox) {
            dialogueBox.classList.add("scene7-dialogue");
          }

          const knightContent = document.querySelector(".knight-content");



          const buttonArea = document.createElement("div");
          buttonArea.className = "scene7-button-area";

          const btnYes = document.createElement("button");
          btnYes.innerText = "YA";
          btnYes.className = "action-btn action-btn--yes";
          btnYes.onclick = async () => {
            btnYes.disabled = true;
            btnNo.disabled = true;

            const saved = await saveResponse("YA");

            if (saved) {
              dialogueText.innerText =
                "Yeay! Terima kasih telah memaafkan saya :)";

              btnNo.remove();
              buttonArea.hidden = true;
            } else {
              btnYes.disabled = false;
              btnNo.disabled = false;
            }
          };

          const btnNo = document.createElement("button");
          btnNo.innerText = "TIDAK 🤪";
          btnNo.className = "action-btn action-btn--no scene7-no-button";

          const initialRect = btnYes.getBoundingClientRect();
          btnNo.style.left = `${initialRect.right + 20}px`;
          btnNo.style.top = `${initialRect.top}px`;

          const jumpFarAway = () => {
            const padding = 100;
            const randomX =
              Math.random() * (window.innerWidth - padding * 2) + padding;
            const randomY =
              Math.random() * (window.innerHeight - padding * 2) + padding;

            btnNo.style.left = `${randomX}px`;
            btnNo.style.top = `${randomY}px`;
          };

          // Tombol tetap menghindar, tetapi memberi kesempatan
          // singkat kepada pengunjung untuk menekannya.
          let noMoveTimer = null;

          btnNo.addEventListener("mouseenter", () => {
            noMoveTimer = window.setTimeout(jumpFarAway, 250);
          });

          btnNo.addEventListener("mouseleave", () => {
            window.clearTimeout(noMoveTimer);
          });

          btnNo.addEventListener("pointerdown", () => {
            window.clearTimeout(noMoveTimer);
          });

          btnNo.addEventListener("click", async (event) => {
            event.preventDefault();
            window.clearTimeout(noMoveTimer);

            btnNo.disabled = true;

            const saved = await saveResponse("TIDAK");

            if (saved) {
              dialogueText.innerText =
                "Terima kasih sudah memberikan jawaban. :)";

              btnNo.remove();
              buttonArea.hidden = true;
            } else {
              btnNo.disabled = false;
              jumpFarAway();
            }
          });

          buttonArea.appendChild(btnYes);

          if (knightContent) {
            knightContent.appendChild(buttonArea);
            document.body.appendChild(btnNo);
          }
        }
      }
    });
  }
});
