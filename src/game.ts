import { BIRD_COUNT } from "./constants.ts";
import { airplane, resetAirplane } from "./airplane.ts";
import { resetBirds, spawnBird, birds } from "./bird.ts";
import { resetBullets } from "./bullet.ts";
import { updateHUD } from "./hud.ts";

// ─── Game state ───────────────────────────────────────────────────────────────
export const state = {
  score:         0,
  collisions:    0,
  timeLeft:      60,
  gameRunning:   false,
  timerInterval: null as ReturnType<typeof setInterval> | null,
};

const overlay = document.getElementById("overlay") as HTMLDivElement;

// ─── End game ─────────────────────────────────────────────────────────────────
export function endGame(): void {
  state.gameRunning = false;
  if (state.timerInterval) clearInterval(state.timerInterval);

  overlay.innerHTML =
    '<h1>FIM DE JOGO</h1>' +
    '<p style="font-size:28px;margin:10px 0">Pássaros abatidos: <b style="color:#4af">' + state.score + '</b></p>' +
    '<p style="font-size:22px;opacity:0.8">Colisões sofridas: ' + state.collisions + '</p>' +
    '<p style="font-size:18px;margin-top:8px;opacity:0.7">Pontuação: ' + Math.max(0, state.score * 10 - state.collisions * 5) + '</p>' +
    '<button id="startBtn" style="margin-top:20px;padding:14px 44px;font-size:20px;border:none;border-radius:8px;background:#4af;color:#000;font-weight:bold;cursor:pointer;">JOGAR NOVAMENTE</button>';

  overlay.classList.remove("hidden");
  document.getElementById("startBtn")!.addEventListener("click", startGame);
}

// ─── Start game ───────────────────────────────────────────────────────────────
export function startGame(): void {
  state.score       = 0;
  state.collisions  = 0;
  state.timeLeft    = 60;
  state.gameRunning = true;
  overlay.classList.add("hidden");
  updateHUD(state.score, state.timeLeft, state.collisions);

  resetAirplane();
  resetBirds();
  resetBullets();

  // Ensure bird count after reset
  while (birds.length < BIRD_COUNT) birds.push(spawnBird());

  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateHUD(state.score, state.timeLeft, state.collisions);
    if (state.timeLeft <= 0) endGame();
  }, 1000);

  // Reset airplane reference (position already set by resetAirplane)
  airplane.rotation.set(0, 0, 0);
}
