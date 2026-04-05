import { Vector3 } from "@babylonjs/core";
import type { Bird } from "./bird.ts";
import { PLANE_Y_MIN, PLANE_Y_MAX, RADAR_W, RADAR_H, RADAR_RANGE } from "./constants.ts";

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const scoreHud   = document.getElementById("scoreHud")   as HTMLSpanElement;
const timerHud   = document.getElementById("timerHud")   as HTMLSpanElement;
const penaltyHud = document.getElementById("penaltyHud") as HTMLSpanElement;

const altFill   = document.getElementById("altFill")   as HTMLDivElement;
const altMarker = document.getElementById("altMarker") as HTMLDivElement;
const altValue  = document.getElementById("altValue")  as HTMLDivElement;

const radarCanvas = document.getElementById("radarCanvas") as HTMLCanvasElement;
const radarCtx    = radarCanvas.getContext("2d")!;

// ─── Score / timer / collision counter ────────────────────────────────────────
export function updateHUD(score: number, timeLeft: number, collisions: number): void {
  scoreHud.textContent   = "Pássaros: " + score;
  timerHud.textContent   = "Tempo: " + timeLeft + "s";
  penaltyHud.textContent = "Colisões: " + collisions;
}

// ─── Altitude bar ─────────────────────────────────────────────────────────────
export function updateAltBar(planeY: number): void {
  const altPct = Math.max(0, Math.min(1, (planeY - PLANE_Y_MIN) / (PLANE_Y_MAX - PLANE_Y_MIN)));
  altFill.style.height   = (altPct * 100).toFixed(1) + "%";
  altMarker.style.bottom = (altPct * 100).toFixed(1) + "%";
  altValue.textContent   = Math.round(planeY) + "m";
}

// ─── Radar lateral 2D ─────────────────────────────────────────────────────────
export function drawRadar(birds: Bird[], planePos: Vector3, yaw: number): void {
  radarCtx.clearRect(0, 0, RADAR_W, RADAR_H);

  // Grade horizontal de altitude
  radarCtx.strokeStyle = "rgba(100,200,255,0.12)";
  radarCtx.lineWidth   = 0.5;
  for (let a = PLANE_Y_MIN; a <= PLANE_Y_MAX; a += 10) {
    const gy = RADAR_H - ((a - PLANE_Y_MIN) / (PLANE_Y_MAX - PLANE_Y_MIN)) * RADAR_H;
    radarCtx.beginPath(); radarCtx.moveTo(0, gy); radarCtx.lineTo(RADAR_W, gy); radarCtx.stroke();
  }

  // Eixo vertical central (posição do avião)
  radarCtx.strokeStyle = "rgba(100,200,255,0.22)";
  radarCtx.lineWidth   = 1;
  radarCtx.beginPath();
  radarCtx.moveTo(RADAR_W / 2, 0);
  radarCtx.lineTo(RADAR_W / 2, RADAR_H);
  radarCtx.stroke();

  // Pássaros (X = distância projetada na direção de voo, Y = altitude)
  const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
  for (const bird of birds) {
    if (bird.hit) continue;
    const bp     = bird.root.getAbsolutePosition();
    const dx     = bp.x - planePos.x;
    const dz     = bp.z - planePos.z;
    const fwdD   = dx * sinYaw + dz * cosYaw;
    const bSX    = RADAR_W / 2 + (fwdD / RADAR_RANGE) * (RADAR_W / 2);
    const bSY    = RADAR_H - Math.max(0, Math.min(1, (bp.y - PLANE_Y_MIN) / (PLANE_Y_MAX - PLANE_Y_MIN))) * RADAR_H;
    if (bSX < 3 || bSX > RADAR_W - 3) continue;
    const dist3d = Math.sqrt(dx * dx + (bp.y - planePos.y) ** 2 + dz * dz);
    const alpha  = Math.max(0.3, 1 - dist3d / 90);
    radarCtx.fillStyle = `rgba(255,80,60,${alpha.toFixed(2)})`;
    radarCtx.beginPath();
    radarCtx.arc(bSX, bSY, 3, 0, Math.PI * 2);
    radarCtx.fill();
  }

  // Ponto do avião
  const altPct  = Math.max(0, Math.min(1, (planePos.y - PLANE_Y_MIN) / (PLANE_Y_MAX - PLANE_Y_MIN)));
  const planeSY = RADAR_H - altPct * RADAR_H;
  radarCtx.fillStyle = "#4adeff";
  radarCtx.beginPath();
  radarCtx.arc(RADAR_W / 2, planeSY, 4, 0, Math.PI * 2);
  radarCtx.fill();

  // Rótulos de eixo
  radarCtx.fillStyle = "rgba(150,210,255,0.5)";
  radarCtx.font      = "8px monospace";
  radarCtx.fillText("▲alt", 2, 10);
  radarCtx.fillText("→fwd", RADAR_W / 2 + 3, RADAR_H - 2);
}
