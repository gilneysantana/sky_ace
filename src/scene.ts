import {
  Engine,
  Scene,
  UniversalCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  Color4,
  StandardMaterial,
} from "@babylonjs/core";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

export const engine = new Engine(canvas, true, { preserveDrawingBuffer: true });
export const scene  = new Scene(engine);
scene.clearColor = new Color4(0.47, 0.75, 0.98, 1);

scene.fogMode  = Scene.FOGMODE_LINEAR;
scene.fogColor = new Color3(0.47, 0.75, 0.98);
scene.fogStart = 120;
scene.fogEnd   = 220;

const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
hemi.intensity   = 0.7;
hemi.groundColor = new Color3(0.4, 0.5, 0.3);

const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), scene);
sun.intensity = 0.9;
sun.diffuse   = new Color3(1, 0.97, 0.85);

export const camera = new UniversalCamera("cam", new Vector3(0, 3.5, -12), scene);
camera.fov  = 1.1;
camera.minZ = 0.1;

export function mat(name: string, hex: string, alpha = 1): StandardMaterial {
  const m = new StandardMaterial(name, scene);
  m.diffuseColor  = Color3.FromHexString(hex);
  m.alpha         = alpha;
  m.backFaceCulling = false;
  return m;
}

export function updateCamera(
  dt: number,
  planePos: Vector3,
  fwd: Vector3,
  yaw: number,
  bankAngle: number,
): void {
  const camRight     = new Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const camBack      = fwd.scale(-13);
  const camUp        = new Vector3(0, 3.8, 0).add(camRight.scale(bankAngle * -1.5));
  const targetCamPos = planePos.add(camBack).add(camUp);
  camera.position    = Vector3.Lerp(camera.position, targetCamPos, Math.min(1, dt * 7));
  camera.setTarget(planePos.add(fwd.scale(8)));
}
