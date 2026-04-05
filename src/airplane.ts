import {
  Vector3,
  Color3,
  MeshBuilder,
  StandardMaterial,
  Mesh,
  TransformNode,
} from "@babylonjs/core";
import { scene, mat } from "./scene.ts";
import {
  FORWARD_SPEED,
  YAW_SPEED,
  PITCH_SPEED,
  PLANE_Y_MIN,
  PLANE_Y_MAX,
  BOUNDS,
} from "./constants.ts";

// ─── Build ────────────────────────────────────────────────────────────────────
function buildAirplane(): TransformNode {
  const root = new TransformNode("airplane", scene);

  const fuselage = MeshBuilder.CreateCylinder("fuse", {
    height: 4.5, diameterTop: 0.35, diameterBottom: 0.7, tessellation: 8,
  }, scene);
  fuselage.rotation.x = Math.PI / 2;
  fuselage.material   = mat("fuseMat", "#e8e8e8");
  fuselage.parent     = root;

  const nose = MeshBuilder.CreateCylinder("nose", {
    height: 1.2, diameterTop: 0, diameterBottom: 0.35, tessellation: 8,
  }, scene);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 2.85;
  nose.material   = mat("noseMat", "#cc2222");
  nose.parent     = root;

  const wing = MeshBuilder.CreateBox("wing", { width: 7.5, height: 0.12, depth: 1.8 }, scene);
  wing.position.y = 0.05;
  wing.position.z = -0.3;
  wing.material   = mat("wingMat", "#ccccdd");
  wing.parent     = root;

  const wletL = MeshBuilder.CreateBox("wletL", { width: 0.1, height: 0.7, depth: 0.4 }, scene);
  wletL.position.set(-3.75, 0.35, -0.3);
  wletL.material = mat("wletMat", "#aaaabb");
  wletL.parent   = root;
  const wletR = wletL.clone("wletR");
  wletR.position.x = 3.75;
  wletR.parent     = root;

  const hStab = MeshBuilder.CreateBox("hstab", { width: 3.2, height: 0.1, depth: 0.9 }, scene);
  hStab.position.z = -2.0;
  hStab.material   = mat("stabMat", "#ccccdd");
  hStab.parent     = root;

  const vStab = MeshBuilder.CreateBox("vstab", { width: 0.1, height: 1.1, depth: 1.1 }, scene);
  vStab.position.y = 0.55;
  vStab.position.z = -1.9;
  vStab.material   = mat("vstabMat", "#ccccdd");
  vStab.parent     = root;

  function pod(side: number) {
    const p = MeshBuilder.CreateCylinder("pod" + side, {
      height: 1.5, diameterTop: 0.4, diameterBottom: 0.5, tessellation: 8,
    }, scene);
    p.rotation.x = Math.PI / 2;
    p.position.set(side * 2.2, -0.18, 0.1);
    p.material = mat("podMat", "#aaaaaa");
    p.parent   = root;
    const inlet = MeshBuilder.CreateCylinder("inlet" + side, {
      height: 0.18, diameter: 0.5, tessellation: 8,
    }, scene);
    inlet.rotation.x = Math.PI / 2;
    inlet.position.set(side * 2.2, -0.18, 0.85);
    inlet.material = mat("inletMat", "#333");
    inlet.parent   = root;
  }
  pod(-1); pod(1);

  const cockpit = MeshBuilder.CreateSphere("cockpit", { diameter: 0.55, segments: 6 }, scene);
  cockpit.position.set(0, 0.35, 1.4);
  cockpit.scaling.set(1, 0.65, 1.2);
  const cockpitMat = mat("cockpitGlass", "#5599ff", 0.5);
  cockpitMat.specularColor = new Color3(1, 1, 1);
  cockpit.material = cockpitMat;
  cockpit.parent   = root;

  return root;
}

export const airplane = buildAirplane();
airplane.position.set(0, 0, 0);

// ─── Trails ───────────────────────────────────────────────────────────────────
export interface Trail { mesh: Mesh; mat: StandardMaterial; life: number; }
export const trails: Trail[] = [];

function spawnTrail(pos: Vector3): void {
  const id  = Math.random().toString(36).slice(2);
  const m   = MeshBuilder.CreateSphere("tr_" + id, { diameter: 0.35, segments: 3 }, scene);
  m.position.copyFrom(pos);
  const tm = new StandardMaterial("trMat_" + id, scene);
  tm.diffuseColor   = new Color3(1, 1, 1);
  tm.alpha          = 0.55;
  tm.backFaceCulling = false;
  m.material = tm;
  trails.push({ mesh: m, mat: tm, life: 1.2 });
}

// ─── Per-frame state ──────────────────────────────────────────────────────────
let elapsed    = 0;
let bankAngle  = 0;
let trailTimer = 0;

// ─── Update airplane movement (returns values needed by camera/HUD) ───────────
export function updateAirplane(
  dt: number,
  keys: Record<string, boolean>,
): { fwd: Vector3; yaw: number; bankAngle: number } {
  elapsed += dt;

  const yawDir   = (keys["ArrowRight"] ? 1 : 0) - (keys["ArrowLeft"]  ? 1 : 0);
  const pitchDir = (keys["ArrowUp"]    ? 1 : 0) - (keys["ArrowDown"]  ? 1 : 0);

  airplane.rotation.y += yawDir * YAW_SPEED * dt;
  airplane.rotation.x  = Math.max(-0.55, Math.min(0.55,
    airplane.rotation.x + pitchDir * PITCH_SPEED * dt,
  ));

  const targetBank = yawDir * -0.55;
  bankAngle += (targetBank - bankAngle) * Math.min(1, dt * 5);
  airplane.rotation.z = bankAngle;

  const yaw   = airplane.rotation.y;
  const pitch = airplane.rotation.x;
  const fwd   = new Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    -Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  );

  airplane.position.addInPlace(fwd.scale(FORWARD_SPEED * dt));
  airplane.position.y += Math.sin(elapsed * 1.3) * 0.003;

  if (airplane.position.x >  BOUNDS) airplane.position.x = -BOUNDS;
  if (airplane.position.x < -BOUNDS) airplane.position.x =  BOUNDS;
  if (airplane.position.z >  BOUNDS) airplane.position.z = -BOUNDS;
  if (airplane.position.z < -BOUNDS) airplane.position.z =  BOUNDS;
  airplane.position.y = Math.max(PLANE_Y_MIN, Math.min(PLANE_Y_MAX, airplane.position.y));

  return { fwd, yaw, bankAngle };
}

// ─── Update contrails ─────────────────────────────────────────────────────────
export function updateTrails(
  dt: number,
  planePos: Vector3,
  fwd: Vector3,
  yaw: number,
): void {
  trailTimer += dt;
  if (trailTimer >= 0.04) {
    trailTimer = 0;
    const cosY  = Math.cos(yaw), sinY = Math.sin(yaw);
    const right = new Vector3(cosY, 0, -sinY);
    const back  = fwd.scale(-0.8);
    spawnTrail(planePos.add(right.scale( 2.2)).add(back).add(new Vector3(0, -0.18, 0)));
    spawnTrail(planePos.add(right.scale(-2.2)).add(back).add(new Vector3(0, -0.18, 0)));
  }

  for (let i = trails.length - 1; i >= 0; i--) {
    const tr = trails[i];
    tr.life -= dt;
    tr.mat.alpha = Math.max(0, (tr.life / 1.2) * 0.55);
    tr.mesh.scaling.addInPlace(new Vector3(dt * 0.4, dt * 0.4, dt * 0.4));
    if (tr.life <= 0) {
      tr.mesh.dispose();
      trails.splice(i, 1);
    }
  }
}

// ─── Reset (called on game restart) ──────────────────────────────────────────
export function resetAirplane(): void {
  airplane.position.set(0, 0, 0);
  airplane.rotation.set(0, 0, 0);
  trails.forEach(t => t.mesh.dispose());
  trails.length = 0;
  trailTimer    = 0;
  elapsed       = 0;
  bankAngle     = 0;
}
