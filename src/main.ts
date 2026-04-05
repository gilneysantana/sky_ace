import { engine, scene, updateCamera } from "./scene.ts";
import { airplane, updateAirplane, updateTrails } from "./airplane.ts";
import { birds, updateBirds } from "./bird.ts";
import { fireBullet, updateBullets } from "./bullet.ts";
import { buildGround, clouds, updateClouds } from "./world.ts";
import { updateHUD, updateAltBar, drawRadar } from "./hud.ts";
import { state, startGame } from "./game.ts";

// ─── World ────────────────────────────────────────────────────────────────────
buildGround();

// suppress unused-import warning: clouds is exported for world module init
void clouds;

// ─── Input ────────────────────────────────────────────────────────────────────
const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space" && state.gameRunning) {
    e.preventDefault();
    fireBullet();
  }
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

document.getElementById("startBtn")!.addEventListener("click", startGame);

// ─── Game Loop ────────────────────────────────────────────────────────────────
scene.onBeforeRenderObservable.add(() => {
  const dt = engine.getDeltaTime() / 1000;
  if (!state.gameRunning) return;

  const { fwd, yaw, bankAngle } = updateAirplane(dt, keys);
  updateCamera(dt, airplane.position, fwd, yaw, bankAngle);

  const newCollisions = updateBirds(dt, airplane.position);
  const newKills      = updateBullets(dt, () => state.gameRunning);

  if (newCollisions > 0 || newKills > 0) {
    state.collisions += newCollisions;
    state.score      += newKills;
    updateHUD(state.score, state.timeLeft, state.collisions);
  }

  updateTrails(dt, airplane.position, fwd, yaw);
  updateClouds(dt);
  updateAltBar(airplane.position.y);
  drawRadar(birds, airplane.position, yaw);
});

window.addEventListener("resize", () => engine.resize());
engine.runRenderLoop(() => scene.render());
