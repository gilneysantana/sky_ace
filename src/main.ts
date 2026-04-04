import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  Mesh,
  TransformNode,
  VertexData,
  DynamicTexture,
} from "@babylonjs/core";

// ─── DOM ──────────────────────────────────────────────────────────────────────
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const overlay = document.getElementById("overlay") as HTMLDivElement;
const startBtn = document.getElementById("startBtn") as HTMLButtonElement;
const scoreHud = document.getElementById("scoreHud") as HTMLSpanElement;
const timerHud = document.getElementById("timerHud") as HTMLSpanElement;
const penaltyHud = document.getElementById("penaltyHud") as HTMLSpanElement;

// ─── Engine / Scene ───────────────────────────────────────────────────────────
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true });
const scene = new Scene(engine);
scene.clearColor = new Color4(0.47, 0.75, 0.98, 1);

// Fog
scene.fogMode = Scene.FOGMODE_LINEAR;
scene.fogColor = new Color3(0.47, 0.75, 0.98);
scene.fogStart = 120;
scene.fogEnd = 220;

// ─── Lighting ─────────────────────────────────────────────────────────────────
const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
hemi.intensity = 0.7;
hemi.groundColor = new Color3(0.4, 0.5, 0.3);

const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), scene);
sun.intensity = 0.9;
sun.diffuse = new Color3(1, 0.97, 0.85);

// ─── Camera (follows plane) ───────────────────────────────────────────────────
const camera = new ArcRotateCamera("cam", -Math.PI / 2, Math.PI / 3.5, 22, Vector3.Zero(), scene);
camera.lowerRadiusLimit = camera.upperRadiusLimit = 22;
camera.lowerBetaLimit = 0.3;
camera.upperBetaLimit = Math.PI / 2.2;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mat(name: string, hex: string, alpha = 1): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.alpha = alpha;
  m.backFaceCulling = false;
  return m;
}

// ─── Ground (2D top-down texture) ─────────────────────────────────────────────
function buildGround() {
  const size = 300;
  const ground = MeshBuilder.CreateGround("ground", { width: size, height: size, subdivisions: 1 }, scene);
  ground.position.y = -12;

  const tex = new DynamicTexture("groundTex", { width: 512, height: 512 }, scene);
  const ctx = tex.getContext() as CanvasRenderingContext2D;

  // Fields (green background)
  ctx.fillStyle = "#5a8a3c";
  ctx.fillRect(0, 0, 512, 512);

  // Fields variation patches
  const fieldColors = ["#6ba84f", "#4e7a30", "#7bc05a", "#5a8a3c"];
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = fieldColors[Math.floor(Math.random() * fieldColors.length)];
    ctx.fillRect(
      Math.random() * 512, Math.random() * 512,
      30 + Math.random() * 80, 30 + Math.random() * 80
    );
  }

  // Sea (large blue area)
  ctx.fillStyle = "#1e6fa8";
  ctx.fillRect(60, 300, 200, 180);

  // Lakes
  ctx.fillStyle = "#2e8fc8";
  ctx.beginPath(); ctx.ellipse(380, 80, 40, 25, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(100, 150, 30, 18, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(420, 360, 35, 22, 0.5, 0, Math.PI * 2); ctx.fill();

  // City blocks
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

  // Beaches
  ctx.fillStyle = "#d4b86a";
  ctx.fillRect(55, 295, 210, 14);
  ctx.fillRect(55, 295, 14, 195);
  ctx.fillRect(255, 295, 14, 195);

  tex.update();

  const gm = new StandardMaterial("groundMat", scene);
  gm.diffuseTexture = tex;
  gm.specularColor = Color3.Black();
  ground.material = gm;
}

buildGround();

// ─── Airplane (polygon mesh) ──────────────────────────────────────────────────
function buildAirplane(): TransformNode {
  const root = new TransformNode("airplane", scene);

  const fuselage = MeshBuilder.CreateCylinder("fuse", {
    height: 4.5, diameterTop: 0.35, diameterBottom: 0.7, tessellation: 8
  }, scene);
  fuselage.rotation.x = Math.PI / 2;
  fuselage.material = mat("fuseMat", "#e8e8e8");
  fuselage.parent = root;

  const nose = MeshBuilder.CreateCylinder("nose", {
    height: 1.2, diameterTop: 0, diameterBottom: 0.35, tessellation: 8
  }, scene);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 2.85;
  nose.material = mat("noseMat", "#cc2222");
  nose.parent = root;

  const wing = MeshBuilder.CreateBox("wing", { width: 7.5, height: 0.12, depth: 1.8 }, scene);
  wing.position.y = 0.05;
  wing.position.z = -0.3;
  wing.material = mat("wingMat", "#ccccdd");
  wing.parent = root;

  const wletL = MeshBuilder.CreateBox("wletL", { width: 0.1, height: 0.7, depth: 0.4 }, scene);
  wletL.position.set(-3.75, 0.35, -0.3);
  wletL.material = mat("wletMat", "#aaaabb");
  wletL.parent = root;
  const wletR = wletL.clone("wletR");
  wletR.position.x = 3.75;
  wletR.parent = root;

  const hStab = MeshBuilder.CreateBox("hstab", { width: 3.2, height: 0.1, depth: 0.9 }, scene);
  hStab.position.z = -2.0;
  hStab.material = mat("stabMat", "#ccccdd");
  hStab.parent = root;

  const vStab = MeshBuilder.CreateBox("vstab", { width: 0.1, height: 1.1, depth: 1.1 }, scene);
  vStab.position.y = 0.55;
  vStab.position.z = -1.9;
  vStab.material = mat("vstabMat", "#ccccdd");
  vStab.parent = root;

  function pod(side: number) {
    const p = MeshBuilder.CreateCylinder("pod" + side, {
      height: 1.5, diameterTop: 0.4, diameterBottom: 0.5, tessellation: 8
    }, scene);
    p.rotation.x = Math.PI / 2;
    p.position.set(side * 2.2, -0.18, 0.1);
    p.material = mat("podMat", "#aaaaaa");
    p.parent = root;
    const inlet = MeshBuilder.CreateCylinder("inlet" + side, {
      height: 0.18, diameter: 0.5, tessellation: 8
    }, scene);
    inlet.rotation.x = Math.PI / 2;
    inlet.position.set(side * 2.2, -0.18, 0.85);
    inlet.material = mat("inletMat", "#333");
    inlet.parent = root;
  }
  pod(-1); pod(1);

  const cockpit = MeshBuilder.CreateSphere("cockpit", { diameter: 0.55, segments: 6 }, scene);
  cockpit.position.set(0, 0.35, 1.4);
  cockpit.scaling.set(1, 0.65, 1.2);
  const cockpitMat = mat("cockpitGlass", "#5599ff", 0.5);
  cockpitMat.specularColor = new Color3(1, 1, 1);
  cockpit.material = cockpitMat;
  cockpit.parent = root;

  return root;
}

// ─── Cloud ────────────────────────────────────────────────────────────────────
function buildCloud(pos: Vector3): TransformNode {
  const root = new TransformNode("cloud", scene);
  root.position.copyFrom(pos);
  const cm = mat("cloudMat_" + Math.random(), "#ffffff", 0.88);
  cm.specularColor = Color3.Black();

  const puffs = [
    { x: 0, y: 0, z: 0, r: 2 },
    { x: 2.2, y: -0.3, z: 0.4, r: 1.6 },
    { x: -2.0, y: -0.2, z: -0.3, r: 1.5 },
    { x: 0.8, y: 0.7, z: 0.2, r: 1.3 },
    { x: -0.9, y: 0.5, z: -0.4, r: 1.2 },
  ];

  puffs.forEach((p, i) => {
    const s = MeshBuilder.CreateSphere("puff_" + i + "_" + Math.random(), { diameter: p.r * 2, segments: 5 }, scene);
    s.position.set(p.x, p.y, p.z);
    s.material = cm;
    s.parent = root;
  });

  return root;
}

// ─── Bird ─────────────────────────────────────────────────────────────────────
interface Bird {
  root: TransformNode;
  wings: [Mesh, Mesh];
  hit: boolean;
  vel: Vector3;
  wingPhase: number;
}

function buildWingMesh(name: string): Mesh {
  const positions = [0, 0, 0, -1.2, 0.1, -0.1, -0.8, 0, 0.5];
  const indices = [0, 1, 2, 0, 2, 1];
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const vd = new VertexData();
  vd.positions = positions;
  vd.indices = indices;
  vd.normals = normals;
  const m = new Mesh(name, scene);
  vd.applyToMesh(m);
  return m;
}

function buildBird(pos: Vector3): Bird {
  const id = Math.random().toString(36).slice(2);
  const root = new TransformNode("bird_" + id, scene);
  root.position.copyFrom(pos);
  const bm = mat("birdMat_" + id, "#1a1a2e");

  const body = MeshBuilder.CreateSphere("birdBody_" + id, { diameter: 0.38, segments: 4 }, scene);
  body.scaling.set(1, 0.7, 1.5);
  body.material = bm;
  body.parent = root;

  const wingL = buildWingMesh("wL_" + id);
  wingL.material = bm;
  wingL.position.set(-0.3, 0, 0);
  wingL.parent = root;

  const wingR = buildWingMesh("wR_" + id);
  wingR.material = bm;
  wingR.position.set(0.3, 0, 0);
  wingR.scaling.x = -1;
  wingR.parent = root;

  const speed = 3 + Math.random() * 4;
  const vel = new Vector3(
    (Math.random() - 0.5),
    (Math.random() - 0.5) * 0.3,
    (Math.random() - 0.5)
  ).normalize().scale(speed);

  return { root, wings: [wingL, wingR], hit: false, vel, wingPhase: Math.random() * Math.PI * 2 };
}

// ─── Bullet ───────────────────────────────────────────────────────────────────
interface Bullet {
  mesh: Mesh;
  vel: Vector3;
  life: number;
}

// ─── Game State ───────────────────────────────────────────────────────────────
let gameRunning = false;
let score = 0;
let collisions = 0;
let timeLeft = 60;
let timerInterval: ReturnType<typeof setInterval> | null = null;

const airplane = buildAirplane();
airplane.position.set(0, 0, 0);

const clouds: TransformNode[] = [];
const birds: Bird[] = [];
const bullets: Bullet[] = [];

const keys: Record<string, boolean> = {};

const PLANE_SPEED = 8;
const BULLET_SPEED = 28;
const BIRD_COUNT = 18;
const CLOUD_COUNT = 20;
const BOUNDS = 80;
const PLANE_Y_MIN = -8;
const PLANE_Y_MAX = 30;

// ─── Spawn clouds ─────────────────────────────────────────────────────────────
for (let i = 0; i < CLOUD_COUNT; i++) {
  clouds.push(buildCloud(new Vector3(
    (Math.random() - 0.5) * 140,
    2 + Math.random() * 20,
    (Math.random() - 0.5) * 140
  )));
}

// ─── Spawn birds ──────────────────────────────────────────────────────────────
function spawnBird(): Bird {
  const angle = Math.random() * Math.PI * 2;
  const dist2 = 30 + Math.random() * 50;
  const pos = new Vector3(
    Math.cos(angle) * dist2,
    (Math.random() - 0.3) * 20,
    Math.sin(angle) * dist2
  );
  return buildBird(pos);
}

for (let i = 0; i < BIRD_COUNT; i++) {
  birds.push(spawnBird());
}

// ─── Input ────────────────────────────────────────────────────────────────────
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space" && gameRunning) {
    e.preventDefault();
    fireBullet();
  }
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function fireBullet() {
  const b = MeshBuilder.CreateSphere("bullet_" + Date.now(), { diameter: 0.22, segments: 4 }, scene);
  const bmat = new StandardMaterial("bMat_" + Date.now(), scene);
  bmat.diffuseColor = new Color3(1, 0.9, 0);
  bmat.emissiveColor = new Color3(1, 0.8, 0);
  b.material = bmat;
  b.position.copyFrom(airplane.position);

  const fwd = new Vector3(
    Math.sin(airplane.rotation.y),
    Math.sin(-airplane.rotation.x),
    Math.cos(airplane.rotation.y)
  ).normalize().scale(BULLET_SPEED);

  bullets.push({ mesh: b, vel: fwd, life: 2.5 });
}

// ─── HUD update ───────────────────────────────────────────────────────────────
function updateHUD() {
  scoreHud.textContent = "Pássaros: " + score;
  timerHud.textContent = "Tempo: " + timeLeft + "s";
  penaltyHud.textContent = "Colisões: " + collisions;
}

// ─── End game ─────────────────────────────────────────────────────────────────
function endGame() {
  gameRunning = false;
  if (timerInterval) clearInterval(timerInterval);

  overlay.innerHTML =
    '<h1>FIM DE JOGO</h1>' +
    '<p style="font-size:28px;margin:10px 0">Pássaros abatidos: <b style="color:#4af">' + score + '</b></p>' +
    '<p style="font-size:22px;opacity:0.8">Colisões sofridas: ' + collisions + '</p>' +
    '<p style="font-size:18px;margin-top:8px;opacity:0.7">Pontuação: ' + Math.max(0, score * 10 - collisions * 5) + '</p>' +
    '<button id="startBtn" style="margin-top:20px;padding:14px 44px;font-size:20px;border:none;border-radius:8px;background:#4af;color:#000;font-weight:bold;cursor:pointer;">JOGAR NOVAMENTE</button>';

  overlay.classList.remove("hidden");
  document.getElementById("startBtn")!.addEventListener("click", startGame);
}

// ─── Start game ───────────────────────────────────────────────────────────────
function startGame() {
  score = 0;
  collisions = 0;
  timeLeft = 60;
  gameRunning = true;
  overlay.classList.add("hidden");
  updateHUD();

  airplane.position.set(0, 0, 0);
  airplane.rotation.set(0, 0, 0);

  birds.forEach(b => b.root.dispose());
  birds.length = 0;
  for (let i = 0; i < BIRD_COUNT; i++) birds.push(spawnBird());

  bullets.forEach(b => b.mesh.dispose());
  bullets.length = 0;

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateHUD();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

startBtn.addEventListener("click", startGame);

// ─── Game Loop ────────────────────────────────────────────────────────────────
let elapsed = 0;
let bankAngle = 0;

scene.onBeforeRenderObservable.add(() => {
  const dt = engine.getDeltaTime() / 1000;
  elapsed += dt;
  if (!gameRunning) return;

  // Plane movement
  const mx = (keys["ArrowLeft"] ? -1 : 0) + (keys["ArrowRight"] ? 1 : 0);
  const my = (keys["ArrowUp"] ? 1 : 0) + (keys["ArrowDown"] ? -1 : 0);

  const targetBank = mx * -0.45;
  bankAngle += (targetBank - bankAngle) * Math.min(1, dt * 5);
  airplane.rotation.z = bankAngle;

  const targetPitch = my * -0.28;
  airplane.rotation.x += (targetPitch - airplane.rotation.x) * Math.min(1, dt * 5);

  const moveVec = new Vector3(mx, my, 0).normalize();
  airplane.position.addInPlace(moveVec.scale(PLANE_SPEED * dt));
  airplane.position.x = Math.max(-BOUNDS, Math.min(BOUNDS, airplane.position.x));
  airplane.position.z = Math.max(-BOUNDS, Math.min(BOUNDS, airplane.position.z));
  airplane.position.y = Math.max(PLANE_Y_MIN, Math.min(PLANE_Y_MAX, airplane.position.y));

  // Gentle bob
  airplane.position.y += Math.sin(elapsed * 1.3) * 0.003;

  // Camera
  camera.target.copyFrom(airplane.position);

  // Birds
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
    bird.wings[0].rotation.z = flap;
    bird.wings[1].rotation.z = -flap;

    const planePos = airplane.position;
    const birdPos = bird.root.getAbsolutePosition();
    if (Vector3.Distance(birdPos, planePos) < 1.8) {
      collisions++;
      updateHUD();
      const away = birdPos.subtract(planePos).normalize().scale(6);
      bird.vel.addInPlace(away);
      bird.root.position.addInPlace(away.scale(0.3));
    }
  }

  // Bullets
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
        score++;
        updateHUD();
        killed = true;
        if (gameRunning) setTimeout(() => { if (gameRunning) birds.push(spawnBird()); }, 2000);
        break;
      }
    }

    if (killed) {
      bul.mesh.dispose();
      bullets.splice(i, 1);
    }
  }

  // Cloud drift
  clouds.forEach((c, i) => {
    c.position.x += 0.25 * dt * (i % 2 === 0 ? 1 : -1);
    if (c.position.x > 100) c.position.x = -100;
    if (c.position.x < -100) c.position.x = 100;
  });
});

window.addEventListener("resize", () => engine.resize());
engine.runRenderLoop(() => scene.render());
