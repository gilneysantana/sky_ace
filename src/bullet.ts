import { Vector3, Color3, MeshBuilder, StandardMaterial, Mesh } from "@babylonjs/core";
import { scene } from "./scene.ts";
import { BULLET_SPEED } from "./constants.ts";
import { airplane } from "./airplane.ts";
import { birds, spawnBird } from "./bird.ts";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Bullet { mesh: Mesh; vel: Vector3; life: number; }

export const bullets: Bullet[] = [];

// ─── Fire ─────────────────────────────────────────────────────────────────────
export function fireBullet(): void {
  const id  = Date.now().toString();
  const b   = MeshBuilder.CreateSphere("bullet_" + id, { diameter: 0.22, segments: 4 }, scene);
  const bm  = new StandardMaterial("bMat_" + id, scene);
  bm.diffuseColor  = new Color3(1, 0.9, 0);
  bm.emissiveColor = new Color3(1, 0.8, 0);
  b.material = bm;
  b.position.copyFrom(airplane.position);

  const yaw   = airplane.rotation.y;
  const pitch = airplane.rotation.x;
  const fwd   = new Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    -Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  ).normalize().scale(BULLET_SPEED);

  bullets.push({ mesh: b, vel: fwd, life: 2.5 });
}

// ─── Per-frame update. Returns number of kills this frame. ───────────────────
export function updateBullets(dt: number, isGameRunning: () => boolean): number {
  let kills = 0;

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bul = bullets[i];
    bul.mesh.position.addInPlace(bul.vel.scale(dt));
    bul.life -= dt;

    if (bul.life <= 0) {
      bul.mesh.dispose();
      bullets.splice(i, 1);
      continue;
    }

    let killed = false;
    for (let j = birds.length - 1; j >= 0; j--) {
      const bird = birds[j];
      if (bird.hit) continue;
      if (Vector3.Distance(bul.mesh.position, bird.root.getAbsolutePosition()) < 1.3) {
        bird.hit = true;
        bird.root.dispose();
        birds.splice(j, 1);
        kills++;
        killed = true;
        if (isGameRunning()) {
          setTimeout(() => { if (isGameRunning()) birds.push(spawnBird()); }, 2000);
        }
        break;
      }
    }

    if (killed) {
      bul.mesh.dispose();
      bullets.splice(i, 1);
    }
  }

  return kills;
}

// ─── Reset (called on game restart) ──────────────────────────────────────────
export function resetBullets(): void {
  bullets.forEach(b => b.mesh.dispose());
  bullets.length = 0;
}
