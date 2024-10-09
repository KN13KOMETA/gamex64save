import { color } from "./color.js"
import * as t3d from "./t3d/t3d.module.js"
import { OrbitControls } from "./t3d/addons/controls/OrbitControls.js"
import { ForwardRenderer } from "./t3d/addons/render/ForwardRenderer.js"
import { Raycaster } from "./t3d/addons/Raycaster.js"
import { playAudio } from "./playAudio.js"

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ clear: number, active: number, idle: number, player: number, hover: number}} palette
 * @param {number} mapSize
 * @param {(x: number, y: number, z: number) => 0 | 1} getXYZ
 * @param {({ x: number, y: number, z: number }) => boolean} tryNewPlayerPos
 */
export const createRender = (
  canvas,
  palette,
  mapSize,
  playerInitPos = { x: 0, y: 0, z: 0 },
  getXYZ = () => 0,
  canMovePlayer = () => true,
  tryNewPlayerPos = () => true
) => {
  const upscale = 20;
  const size = { w: 0, h: 0 }
  const center = (mapSize - 1) * upscale;
  const centerVector = new t3d.Vector3(center, center, center);
  /** @type {t3d.Mesh[][][]} */
  const map = [];
  const player = playerInitPos;
  // Geometry and materials
  const geometry = new t3d.SphereGeometry(upscale * 0.75, 32, 16)
  const materials = {
    active: new t3d.PBRMaterial(),
    idle: new t3d.PBRMaterial(),
    playerActive: new t3d.PBRMaterial(),
    playerIdle: new t3d.PBRMaterial(),
    hover: new t3d.PBRMaterial()
  }
  materials.active.shaderName = "active";
  materials.idle.shaderName = "idle";
  materials.playerActive.shaderName = "playerActive";
  materials.playerIdle.shaderName = "playerIdle";
  materials.hover.shaderName = "hover";

  materials.active.diffuse.setHex(palette.active >> 8);
  materials.idle.diffuse.setHex(palette.idle >> 8);
  materials.playerActive.diffuse.setHex(palette.active >> 8);
  materials.playerIdle.diffuse.setHex(palette.idle >> 8);
  materials.hover.diffuse.setHex(palette.hover >> 8);

  materials.active.metalness = 0.6;
  materials.active.roughness = 0;
  materials.idle.metalness = 0.6;
  materials.idle.roughness = 0;
  materials.playerActive.metalness = 0.6;
  materials.playerActive.roughness = 0;
  materials.playerIdle.metalness = 0.6;
  materials.playerIdle.roughness = 0;

  materials.playerActive.emissive.setHex(palette.active >> 8);
  materials.playerIdle.emissive.setHex(palette.idle >> 8);
  materials.hover.emissive.setHex(palette.hover >> 8);

  const forwardRenderer = new ForwardRenderer(canvas);
  // Color of background
  {
    const c = color.toNormalizedRGBA(palette.clear);
    forwardRenderer.setClearColor(c.r, c.g, c.b, c.a);
  }

  const scene = new t3d.Scene();

  // Generate cubes
  const cubes = new t3d.Object3D();
  for (let x = 0; x < mapSize; x++) {
    map[x] = [];
    for (let y = 0; y < mapSize; y++) {
      map[x][y] = [];
      for (let z = 0; z < mapSize; z++) {
        const cube = new t3d.Mesh(
          geometry,
          getXYZ(x, y, z) == 0 ? materials.idle : materials.active
        );
        // Scaling position and make spaces beetwen cubes
        const m = (n) => n * 2 * upscale;
        cube.position.set(m(x), m(y), m(z));
        cube.rpos = { x, y, z }
        map[x][y][z] = cube;
        cubes.add(cube);
      }
    }
  }
  scene.add(cubes);
  map[player.x][player.y][player.z].material = getXYZ(player.x, player.y, player.z) == 0 ? materials.playerIdle : materials.playerActive;

  const ambientLight = new t3d.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new t3d.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(20, 30, 40);
  directionalLight.lookAt(new t3d.Vector3(), new t3d.Vector3(0, 1, 0));
  // scene.add(directionalLight);

  const spotLight = new t3d.SpotLight(0xffffff, 1, 500, Math.PI / 6, 0.2);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.set(1024, 1024);
  spotLight.shadow.bias = -0.001;
  spotLight.shadow.normalBias = 0.1;
  spotLight.shadow.cameraNear = 10;

  const camera = new t3d.Camera();
  camera.position.set(center * 5, center * 5, center * 5);
  camera.lookAt(centerVector.clone(), new t3d.Vector3(0, 1, 0));
  camera.add(spotLight);
  scene.add(camera);

  const controller = new OrbitControls(camera, canvas);
  controller.target = centerVector.clone();
  controller.enablePan = false;

  const raycaster = new Raycaster();
  {
    const mouse = new t3d.Vector2();

    document.addEventListener("mousemove", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      for (let i = 0; i < cubes.children.length; i++) {
        const child = cubes.children[i];
        const isActive = getXYZ(child.rpos.x, child.rpos.y, child.rpos.z);
        child.selected = false;
        if (
          player.x == child.rpos.x &&
          player.y == child.rpos.y &&
          player.z == child.rpos.z
        ) {
          child.material = isActive == 0 ? materials.playerIdle : materials.playerActive;
        } else {
          child.material = isActive == 0 ? materials.idle : materials.active;
        }
      }

      const array = raycaster.intersectObject(scene, true);
      if (array.length == 0) return;
      const object = array[0].object;
      if (!canMovePlayer(object.rpos)) return;
      object.selected = true;
      object.material = materials.hover;
    });

    document.addEventListener("mousedown", (event) => {
      const index = cubes.children.findIndex(v => v.selected == true);
      if (index == -1) return;
      const cube = cubes.children[index];
      if (!tryNewPlayerPos(cube.rpos)) return;
      playAudio("../sound/475188__sheyvan__button-clicking-1.wav", 0.25)
      for (let i = 0; i < cubes.children.length; i++) {
        const child = cubes.children[i];
        child.material = getXYZ(child.rpos.x, child.rpos.y, child.rpos.z) == 0 ? materials.idle : materials.active;
      }
      map[player.x][player.y][player.z].material = getXYZ(player.x, player.y, player.z) == 0 ? materials.idle : materials.active;
      player.x = cube.rpos.x;
      player.y = cube.rpos.y;
      player.z = cube.rpos.z;
      cube.material = getXYZ(player.x, player.y, player.z) == 0 ? materials.playerIdle : materials.playerActive;
    });
  }

  const gradient = {
    active: [color.toNormalizedRGBA(palette.active), color.toNormalizedRGBA(palette.player)],
    idle: [color.toNormalizedRGBA(palette.idle), color.toNormalizedRGBA(palette.player)],
  }
  // Animation frame/Camera movement
  {
    const update = (count) => {
      requestAnimationFrame(update);

      const lerpFactor = (Math.sin(Date.now() * 0.0025) + 1) / 2;
      const activeColor = color.lerpNormalizedRGBA(gradient.active[0], gradient.active[1], lerpFactor);
      const idleColor = color.lerpNormalizedRGBA(gradient.idle[0], gradient.idle[1], lerpFactor);
      materials.playerActive.diffuse.setRGB(activeColor.r, activeColor.g, activeColor.b);
      materials.playerActive.emissive.setRGB(activeColor.r, activeColor.g, activeColor.b);
      materials.playerIdle.diffuse.setRGB(idleColor.r, idleColor.g, idleColor.b);
      materials.playerIdle.emissive.setRGB(idleColor.r, idleColor.g, idleColor.b);

      controller.update();
      forwardRenderer.render(scene, camera);
    }
    requestAnimationFrame(update);
  }
  // Resize event
  {
    const resize = () => {
      size.w = window.innerWidth || 2;
      size.h = window.innerHeight || 2;
      camera.setPerspective(45 / 180 * Math.PI, size.w / size.h, 1, 1000);
      forwardRenderer.backRenderTarget.resize(size.w, size.h);
    }
    resize();
    window.addEventListener("resize", resize, false);
  }

  return (px, py, pz) => {
    player.x = px;
    player.y = py;
    player.z = pz;
    for (let i = 0; i < cubes.children.length; i++) {
      const child = cubes.children[i];
      child.material = getXYZ(child.rpos.x, child.rpos.y, child.rpos.z) == 0 ? materials.idle : materials.active;
    }
    map[player.x][player.y][player.z].material = getXYZ(player.x, player.y, player.z) == 0 ? materials.playerIdle : materials.playerActive;
  }
}
