import {
  Vector3,
  MeshBuilder,
  Mesh,
  TransformNode,
  VertexData,
} from "@babylonjs/core";
import { scene, mat } from "./scene.ts";
import { BOUNDS, BIRD_COUNT } from "./constants.ts";
import { airplane } from "./airplane.ts";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Bird {
  root: TransformNode;
  wings: [Mesh, Mesh];
  hit: boolean;
  vel: Vector3;
  wingPhase: number;
}

// ─── Builders ─────────────────────────────────────────────────────────────────
function buildWingMesh(name: string): Mesh {
  const positions = [0, 0, 0, -1.2, 0.1, -0.1, -0.8, 0, 0.5];
  const indices   = [0, 1, 2, 0, 2, 1];
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const vd = new VertexData();
  vd.positions = positions;
  vd.indices   = indices;
  vd.normals   = normals;
  const m = new Mesh(name, scene);
  vd.applyToMesh(m);
  return m;
}

export function buildBird(pos: Vector3): Bird {
  const id   = Math.random().toString(36).slice(2);
  const root = new TransformNode("bird_" + id, scene);
  root.position.copyFrom(pos);
  const bm = mat("birdMat_" + id, "#1a1a2e");

  const body = MeshBuilder.CreateSphere("birdBody_" + id, { diameter: 0.38, segments: 4 }, scene);
  body.scaling.set(1, 0.7, 1.5);
  body.material = bm;
  body.parent   = root;

  const wingL = buildWingMesh("wL_" + id);
  wingL.material   = bm;
  wingL.position.set(-0.3, 0, 0);
  wingL.parent = root;

  const wingR = buildWingMesh("wR_" + id);
  wingR.material   = bm;
  wingR.position.set(0.3, 0, 0);
  wingR.scaling.x  = -1;
  wingR.parent = root;

  const speed = 3 + Math.random() * 4;
  const vel   = new Vector3(
    (Math.random() - 0.5),
    (Math.random() - 0.5) * 0.3,
    (Math.random() - 0.5),
  ).normalize().scale(speed);

  return { root, wings: [wingL, wingR], hit: false, vel, wingPhase: Math.random() * Math.PI * 2 };
}

export function spawnBird(): Bird {
  const angle = Math.random() * Math.PI * 2;
  const dist2 = 25 + Math.random() * 45;
  const pos   = new Vector3(
    airplane.position.x + Math.cos(angle) * dist2,
    airplane.position.y + (Math.random() - 0.3) * 15,
    airplane.position.z + Math.sin(angle) * dist2,
  );
  return buildBird(pos);
}

// ─── Birds array (initialized once) ──────────────────────────────────────────
export const birds: Bird[] = [];

for (let i = 0; i < BIRD_COUNT; i++) birds.push(spawnBird());

// ─── Per-frame update. Returns number of collisions this frame. ───────────────
export function updateBirds(dt: number, planePos: Vector3): number {
  let collisionsThisFrame = 0;

  for (let i = birds.length - 1; i >= 0; i--) {
    const bird = birds[i];
    if (bird.hit) continue;

    bird.root.position.addInPlace(bird.vel.scale(dt));

    const bp = bird.root.position;
    if (bp.x > BOUNDS || bp.x < -BOUNDS) bird.vel.x *= -1;
    if (bp.z > BOUNDS || bp.z < -BOUNDS) bird.vel.z *= -1;
    if (bp.y > 25 || bp.y < -8) bird.vel.y *= -1;

    bird.root.rotation.y = Math.atan2(bird.vel.x, bird.vel.z);

    bird.wingPhase += dt * 7;
    const flap = Math.sin(bird.wingPhase) * 0.65;
    bird.wings[0].rotation.z =  flap;
    bird.wings[1].rotation.z = -flap;

    const birdPos = bird.root.getAbsolutePosition();
    if (Vector3.Distance(birdPos, planePos) < 1.8) {
      collisionsThisFrame++;
      const away = birdPos.subtract(planePos).normalize().scale(6);
      bird.vel.addInPlace(away);
      bird.root.position.addInPlace(away.scale(0.3));
    }
  }

  return collisionsThisFrame;
}

// ─── Reset (called on game restart) ──────────────────────────────────────────
export function resetBirds(): void {
  birds.forEach(b => b.root.dispose());
  birds.length = 0;
  for (let i = 0; i < BIRD_COUNT; i++) birds.push(spawnBird());
}
