import {
  Vector3,
  Color3,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  DynamicTexture,
} from "@babylonjs/core";
import { scene, mat } from "./scene.ts";
import { CLOUD_COUNT } from "./constants.ts";

// ─── Ground ───────────────────────────────────────────────────────────────────
export function buildGround(): void {
  const size   = 300;
  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: size, height: size, subdivisions: 1 },
    scene,
  );
  ground.position.y = -12;

  const tex = new DynamicTexture("groundTex", { width: 512, height: 512 }, scene);
  const ctx = tex.getContext() as CanvasRenderingContext2D;

  ctx.fillStyle = "#5a8a3c";
  ctx.fillRect(0, 0, 512, 512);

  const fieldColors = ["#6ba84f", "#4e7a30", "#7bc05a", "#5a8a3c"];
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = fieldColors[Math.floor(Math.random() * fieldColors.length)];
    ctx.fillRect(
      Math.random() * 512, Math.random() * 512,
      30 + Math.random() * 80, 30 + Math.random() * 80,
    );
  }

  ctx.fillStyle = "#1e6fa8";
  ctx.fillRect(60, 300, 200, 180);

  ctx.fillStyle = "#2e8fc8";
  ctx.beginPath(); ctx.ellipse(380, 80, 40, 25, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(100, 150, 30, 18, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(420, 360, 35, 22, 0.5, 0, Math.PI * 2); ctx.fill();

  const cityColors = ["#888", "#aaa", "#999", "#bbb", "#777"];
  for (let i = 0; i < 25; i++) {
    ctx.fillStyle = cityColors[Math.floor(Math.random() * cityColors.length)];
    const bx = 290 + Math.random() * 120;
    const by = 30 + Math.random() * 120;
    ctx.fillRect(bx, by, 6 + Math.random() * 18, 6 + Math.random() * 18);
  }
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(290, 90); ctx.lineTo(420, 90); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(350, 30); ctx.lineTo(350, 160); ctx.stroke();

  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = cityColors[Math.floor(Math.random() * cityColors.length)];
    const bx = 20 + Math.random() * 100;
    const by = 350 + Math.random() * 100;
    ctx.fillRect(bx, by, 6 + Math.random() * 14, 6 + Math.random() * 14);
  }
  ctx.beginPath(); ctx.moveTo(20, 400); ctx.lineTo(130, 400); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(70, 350); ctx.lineTo(70, 460); ctx.stroke();

  ctx.fillStyle = "#d4b86a";
  ctx.fillRect(55, 295, 210, 14);
  ctx.fillRect(55, 295, 14, 195);
  ctx.fillRect(255, 295, 14, 195);

  tex.update();

  const gm = new StandardMaterial("groundMat", scene);
  gm.diffuseTexture = tex;
  gm.specularColor  = Color3.Black();
  ground.material   = gm;
}

// ─── Cloud ────────────────────────────────────────────────────────────────────
export function buildCloud(pos: Vector3): TransformNode {
  const root = new TransformNode("cloud", scene);
  root.position.copyFrom(pos);
  const cm = mat("cloudMat_" + Math.random(), "#ffffff", 0.88);
  cm.specularColor = Color3.Black();

  const puffs = [
    { x: 0,    y: 0,    z: 0,    r: 2   },
    { x: 2.2,  y: -0.3, z: 0.4,  r: 1.6 },
    { x: -2.0, y: -0.2, z: -0.3, r: 1.5 },
    { x: 0.8,  y: 0.7,  z: 0.2,  r: 1.3 },
    { x: -0.9, y: 0.5,  z: -0.4, r: 1.2 },
  ];

  puffs.forEach((p, i) => {
    const s = MeshBuilder.CreateSphere(
      "puff_" + i + "_" + Math.random(),
      { diameter: p.r * 2, segments: 5 },
      scene,
    );
    s.position.set(p.x, p.y, p.z);
    s.material = cm;
    s.parent   = root;
  });

  return root;
}

// ─── Clouds array (initialized once) ─────────────────────────────────────────
export const clouds: TransformNode[] = [];

for (let i = 0; i < CLOUD_COUNT; i++) {
  clouds.push(buildCloud(new Vector3(
    (Math.random() - 0.5) * 140,
    2 + Math.random() * 20,
    (Math.random() - 0.5) * 140,
  )));
}

export function updateClouds(dt: number): void {
  clouds.forEach((c, i) => {
    c.position.x += 0.25 * dt * (i % 2 === 0 ? 1 : -1);
    if (c.position.x >  100) c.position.x = -100;
    if (c.position.x < -100) c.position.x =  100;
  });
}
