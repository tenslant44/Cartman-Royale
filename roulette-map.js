import * as THREE from 'https://esm.sh/three@0.158.0';
import { GLTFLoader } from 'https://esm.sh/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

const dom = {
  map: document.getElementById('rouletteMap'),
  canvas: document.getElementById('rouletteMapCanvas'),
  menu: document.getElementById('menu'),
  turn: document.getElementById('rouletteMapTurn'),
  feed: document.getElementById('rouletteMapFeed'),
  result: document.getElementById('rouletteMapResult'),
  resultTitle: document.getElementById('rouletteMapResultTitle'),
  resultText: document.getElementById('rouletteMapResultText'),
  actions: [...document.querySelectorAll('[data-roulette-action]')]
};

const game = {
  selfOdds: 0.16,
  opponentOdds: 0.16,
  turn: 'you',
  round: 1,
  busy: false,
  over: false,
  winner: null,
  lastAction: 0,
  idlePunished: false
};

const world = {
  renderer: null,
  scene: null,
  camera: null,
  clock: new THREE.Clock(),
  loader: new GLTFLoader(),
  characters: {},
  gun: null,
  muzzle: null,
  panels: {},
  blood: [],
  poop: [],
  particles: [],
  moms: [],
  partyLights: [],
  cutscene: null,
  idleAttack: null,
  birthdayAudio: null,
  initialized: false,
  animationFrame: null
};

const soundPaths = {
  distantGun: '/uploads/freesound_community-gun-shots-from-a-distance-7-96391.mp3',
  chamber: '/uploads/freesound_community-revolver-chamber-spin-ratchet-sound-90521.mp3',
  pistol: '/uploads/freesound_community-single-pistol-gunshot-33-37187.mp3',
  revolver: '/uploads/freesound_community-revolver-spin-96947.mp3',
  flesh: '/uploads/u_xjrmmgxfru-hit-flesh-01-266311.mp3',
  bloodScream: '/uploads/tithuh-blood-the-screaming-545569.mp3',
  bloodSplash: '/uploads/universfield-blood-splatter-122253.mp3',
  bloodBurst: '/uploads/ragecore29-htf-blood-splatter-explode-478992.mp3',
  birthday: '/uploads/sub_clair-happy-birthday-579516.mp3'
};
const soundCache = new Map();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const percent = (value) => `${Math.round(value * 100)}%`;
const actorName = (actor) => actor === 'you' ? 'You' : 'Opponent Cartman';
const other = (actor) => actor === 'you' ? 'opponent' : 'you';
const rgba = (hex, alpha) => `#${hex.toString(16).padStart(6, '0')}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

function playRouletteSound(name, volume = .35, loop = false) {
  const source = soundPaths[name];
  if (!source) return null;
  let audio = soundCache.get(name);
  if (!audio) {
    audio = new Audio(source);
    soundCache.set(name, audio);
  }
  audio.pause();
  audio.currentTime = 0;
  audio.volume = volume;
  audio.loop = loop;
  audio.play().catch(() => {});
  return audio;
}

function stopRouletteSound(name) {
  const audio = soundCache.get(name);
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function mat(color, roughness = 0.82, metalness = 0, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    flatShading: true,
    ...options
  });
}

function addBox(parent, size, color, position, options = {}) {
  const object = new THREE.Mesh(new THREE.BoxGeometry(...size), mat(color, options.roughness, options.metalness));
  object.position.set(...position);
  object.castShadow = options.castShadow !== false;
  object.receiveShadow = options.receiveShadow !== false;
  parent.add(object);
  return object;
}

function addSphere(parent, radius, color, position, options = {}) {
  const object = new THREE.Mesh(new THREE.SphereGeometry(radius, options.segments || 12, options.segments || 8), mat(color, options.roughness, options.metalness));
  object.position.set(...position);
  object.castShadow = options.castShadow !== false;
  object.receiveShadow = options.receiveShadow !== false;
  parent.add(object);
  return object;
}

function addTextPanel(textLines, position, size, accent = '#ffdf34') {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 720;
  textureCanvas.height = 420;
  const ctx = textureCanvas.getContext('2d');
  const draw = () => {
    ctx.fillStyle = '#100d25';
    ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 12;
    ctx.strokeRect(8, 8, textureCanvas.width - 16, textureCanvas.height - 16);
    ctx.fillStyle = '#ffdf34';
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.fillText('CARTMAN ROULETTE', 35, 53);
    textLines.forEach((line, index) => {
      ctx.fillStyle = line.color || '#ffffff';
      ctx.font = `${line.bold ? 'bold ' : ''}${line.size || 26}px "Courier New", monospace`;
      ctx.fillText(line.text, 36, 105 + index * 45);
    });
  };
  draw();
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(size[0], size[1]),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  panel.position.set(...position);
  panel.userData.updateTexture = (lines) => {
    textLines.splice(0, textLines.length, ...lines);
    draw();
    texture.needsUpdate = true;
  };
  world.scene.add(panel);
  return panel;
}

function buildPartyRoom() {
  const room = new THREE.Group();
  world.scene.add(room);

  const floor = addBox(room, [22, .3, 18], 0x47337b, [0, -.2, 0], { receiveShadow: true });
  floor.material.map = null;
  addBox(room, [22, 9, .3], 0x241955, [0, 4.3, -3.8], { receiveShadow: false });
  addBox(room, [22, .35, .4], 0xff4b35, [0, 1.1, -3.55], { receiveShadow: false });
  addBox(room, [22, .18, .2], 0xffdf34, [0, 1.38, -3.38], { receiveShadow: false });

  const desk = new THREE.Group();
  room.add(desk);
  addBox(desk, [8.6, .28, 2.35], 0x7c3e28, [0, 1.48, .35], { roughness: .68 });
  addBox(desk, [8.25, 1.35, .22], 0xa9492c, [0, .8, 1.34]);
  addBox(desk, [.34, 1.4, 1.9], 0x552b24, [-3.8, .75, .25]);
  addBox(desk, [.34, 1.4, 1.9], 0x552b24, [3.8, .75, .25]);
  addBox(desk, [1.4, .08, .65], 0xffdf34, [0, 1.67, -.25], { castShadow: false });

  const cake = new THREE.Group();
  cake.position.set(0, 1.69, -.1);
  room.add(cake);
  addSphere(cake, .46, 0xff5c9a, [0, .2, 0], { segments: 16 });
  addBox(cake, [.82, .27, .82], 0xffd3eb, [0, .03, 0]);
  for (let i = -1; i <= 1; i += 1) {
    addBox(cake, [.08, .34, .08], 0xffdf34, [i * .22, .5, 0]);
    addSphere(cake, .055, 0xff4b35, [i * .22, .72, 0], { segments: 8, castShadow: false });
  }

  const gifts = [
    [-4.6, .38, .1, 0x29b8ff],
    [4.55, .32, .25, 0xffdf34],
    [3.9, .23, 1.5, 0x7b52d4]
  ];
  gifts.forEach(([x, y, z, color]) => {
    addBox(room, [1.0, y * 2, .9], color, [x, y, z]);
    addBox(room, [.08, y * 2 + .04, .94], 0xffdf34, [x, y, z]);
    addBox(room, [1.04, .08, .08], 0xffdf34, [x, y, z]);
  });

  const balloons = [
    [-6.7, 5.4, -1.6, 0xff4b35], [-5.8, 6.2, -1.2, 0xffdf34],
    [-4.9, 5.4, -.8, 0x29b8ff], [4.9, 5.5, -1, 0xff4b35],
    [5.9, 6.2, -1.5, 0x7b52d4], [6.8, 5.25, -.7, 0xffdf34]
  ];
  balloons.forEach(([x, y, z, color]) => {
    addSphere(room, .45, color, [x, y, z], { segments: 12 });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y - .4, z),
        new THREE.Vector3(x + .1, 1.65, z + .2)
      ]),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    room.add(line);
  });

  for (let index = -5; index <= 5; index += 1) {
    const flag = new THREE.Mesh(new THREE.ConeGeometry(.28, .58, 3), mat(index % 2 ? 0xff4b35 : 0xffdf34));
    flag.position.set(index * 1.1, 7.1 - Math.abs(index) * .08, -3.48);
    flag.rotation.z = Math.PI;
    room.add(flag);
  }

  const birthdayPanel = addTextPanel([
    { text: 'HAPPY BIRTHDAY', size: 32, bold: true, color: '#ff4b35' },
    { text: 'CARTMAN', size: 40, bold: true, color: '#29b8ff' },
    { text: 'NO CRYING AT THE TABLE', size: 21, color: '#ffffff' }
  ], [0, 6.15, -3.25], [5.4, 2.55], '#29b8ff');
  world.panels.birthday = birthdayPanel;

  world.panels.stats = addTextPanel([], [-6.0, 3.8, -3.2], [3.35, 2.0], '#ffdf34');
  world.panels.controls = addTextPanel([
    { text: 'SHOOT IT  /  BASIC RISK', size: 19, color: '#ffffff' },
    { text: 'REROLL   /  SHIFT ODDS', size: 19, color: '#ffffff' },
    { text: 'SHOOT OPPONENT / RECOIL', size: 17, color: '#ffdf34' },
    { text: 'EAT IT  /  CHAOS', size: 19, color: '#ff4b35' },
    { text: 'SPAM IT / MOVE DANGER', size: 18, color: '#29b8ff' },
    { text: 'MOMS RECORDING / RED LIGHT', size: 16, color: '#ff4b35' }
  ], [6.0, 3.8, -3.2], [3.35, 2.0], '#ff4b35');
}

function createGun() {
  const gun = new THREE.Group();
  const steel = mat(0x777d82, .38, .72);
  const darkSteel = mat(0x20252a, .38, .8);
  const wood = mat(0x69301f, .68, .05);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, 1.75, 12), steel);
  barrel.rotation.z = Math.PI / 2;
  barrel.position.set(.98, .12, 0);
  gun.add(barrel);
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .34, 12), darkSteel);
  cylinder.rotation.x = Math.PI / 2;
  cylinder.position.set(-.18, .12, 0);
  gun.add(cylinder);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, .26, .38), steel);
  frame.position.set(.37, .14, 0);
  gun.add(frame);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(.27, .92, .38), wood);
  grip.position.set(.03, -.34, 0);
  grip.rotation.z = -.25;
  gun.add(grip);
  world.muzzle = new THREE.PointLight(0xff3217, 0, 3.5);
  world.muzzle.position.set(1.86, .12, 0);
  gun.add(world.muzzle);
  gun.position.set(0, 1.84, .25);
  gun.rotation.y = -.15;
  gun.userData.cylinder = cylinder;
  world.scene.add(gun);
  world.gun = gun;
}

function prepareCartman(source) {
  const model = source.clone(true);
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (child.material?.clone) child.material = child.material.clone();
  });
  model.updateMatrixWorld(true);
  const originalBounds = new THREE.Box3().setFromObject(model);
  const height = originalBounds.getSize(new THREE.Vector3()).y || 1;
  model.scale.setScalar(2.75 / height);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= bounds.min.y;
  model.position.z -= center.z;
  return model;
}

function addDistress(group, actor, index) {
  const distress = new THREE.Group();
  distress.name = `${actor}-visible-distress`;

  const sweatMaterial = new THREE.MeshBasicMaterial({
    color: 0x29b8ff,
    transparent: true,
    opacity: .9
  });
  const drops = [];
  [
    [-.58, 2.36, .18, .7],
    [.55, 2.6, .08, .52],
    [.72, 2.15, .2, .42]
  ].forEach(([x, y, z, scale]) => {
    const drop = new THREE.Mesh(new THREE.SphereGeometry(.105, 8, 6), sweatMaterial.clone());
    drop.position.set(x, y, z);
    drop.scale.set(.72, 1.35, .5);
    drop.userData.home = { x, y, z, scale };
    distress.add(drop);
    drops.push(drop);
  });
  const tears = [];
  [-.18, .18].forEach((x, tearIndex) => {
    const tear = new THREE.Mesh(
      new THREE.CylinderGeometry(.035, .075, .38, 8),
      new THREE.MeshBasicMaterial({ color: 0x4ac8ff, transparent: true, opacity: .8 })
    );
    tear.position.set(x, 1.98, .5);
    tear.rotation.z = tearIndex ? -.08 : .08;
    distress.add(tear);
    tears.push(tear);
  });

  const signCanvas = document.createElement('canvas');
  signCanvas.width = 420;
  signCanvas.height = 120;
  const signContext = signCanvas.getContext('2d');
  signContext.font = 'bold 64px "Courier New", monospace';
  signContext.textAlign = 'center';
  signContext.lineWidth = 9;
  signContext.strokeStyle = '#1b0f3d';
  signContext.strokeText(index ? 'MOM HELP!' : 'MOM!!!', 210, 78);
  signContext.fillStyle = '#ffdf34';
  signContext.fillText(index ? 'MOM HELP!' : 'MOM!!!', 210, 78);
  const signTexture = new THREE.CanvasTexture(signCanvas);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Sprite(new THREE.SpriteMaterial({
    map: signTexture,
    transparent: true,
    opacity: .88
  }));
  sign.position.set(index ? .08 : -.08, 3.08, .2);
  sign.scale.set(1.65, .47, 1);
  distress.add(sign);
  group.add(distress);
  return { group: distress, drops, tears, sign, seed: index * 2.6 };
}

function addCartmans() {
  ['you', 'opponent'].forEach((actor, index) => {
    const group = new THREE.Group();
    group.position.set(index ? 2.8 : -2.8, .18, -1.2);
    group.rotation.y = index ? -.2 : .2;
    group.userData.baseX = group.position.x;
    group.userData.baseY = group.position.y;
    group.userData.baseZ = group.position.z;
    group.userData.baseRotation = group.rotation.y;
    world.scene.add(group);
    const character = {
      group,
      dead: false,
      imported: false,
      distress: addDistress(group, actor, index)
    };
    const cryPool = new THREE.Mesh(
      new THREE.CircleGeometry(.24, 14),
      new THREE.MeshBasicMaterial({ color: 0x238fc7, transparent: true, opacity: .18 })
    );
    cryPool.rotation.x = -Math.PI / 2;
    cryPool.position.set(group.position.x, 1.665, .05);
    world.scene.add(cryPool);
    character.cryPool = cryPool;
    world.characters[actor] = character;
  });

  world.loader.load('/playstation_1_-_south_park_-_eric_cartman.glb', (gltf) => {
    const source = prepareCartman(gltf.scene);
    Object.values(world.characters).forEach((character) => {
      const model = source.clone(true);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          if (child.material?.clone) child.material = child.material.clone();
        }
      });
      character.group.add(model);
      character.imported = true;
    });
  }, undefined, (error) => {
    console.error('Cartman Roulette could not load Cartman GLB:', error);
  });
}

function addMoms() {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('/uploads/Liane_Cartman0.webp');
  const cameraTexture = textureLoader.load('/uploads/download__9_.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  cameraTexture.colorSpace = THREE.SRGBColorSpace;
  [-1, 1].forEach((side, index) => {
    const group = new THREE.Group();
    group.position.set(side * 5.15, 1.9, -2.8);
    group.rotation.y = side * .62;
    group.userData.homePosition = group.position.clone();
    group.userData.baseRotation = group.rotation.y;
    group.userData.focusRotation = side * .04;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const mom = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 3.25), material);
    if (side === 1) mom.scale.x = -1;
    mom.position.y = 1.25;
    group.add(mom);
    const recordingCamera = new THREE.Mesh(
      new THREE.PlaneGeometry(.9, .64),
      new THREE.MeshBasicMaterial({
        map: cameraTexture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    recordingCamera.position.set(side * .03, 1.1, .42);
    recordingCamera.rotation.y = side * -.08;
    group.add(recordingCamera);
    const recordLight = new THREE.Mesh(
      new THREE.SphereGeometry(.065, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xff1e38 })
    );
    recordLight.position.set(side * .22, 1.34, .48);
    group.add(recordLight);
    world.scene.add(group);
    world.moms.push({ group, side, mom, recordingCamera, recordLight, focused: false, happy: false, happySign: null });
  });
}

function makeYourMomHappy() {
  const mom = world.moms[0];
  if (!mom) return;
  if (!mom.happySign) {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 120;
    const context = canvas.getContext('2d');
    context.font = 'bold 58px "Courier New", monospace';
    context.textAlign = 'center';
    context.lineWidth = 8;
    context.strokeStyle = '#2b123c';
    context.strokeText('HAHA!', 180, 78);
    context.fillStyle = '#ffdf34';
    context.fillText('HAHA!', 180, 78);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    mom.happySign = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    mom.happySign.position.set(-.05, 3.2, .3);
    mom.happySign.scale.set(1.2, .4, 1);
    mom.group.add(mom.happySign);
  }
  mom.happy = true;
  mom.group.userData.happyAt = performance.now();
  updateMomsFocus(1);
}

function createWorld() {
  world.scene = new THREE.Scene();
  world.scene.background = new THREE.Color(0x49328a);
  world.scene.fog = new THREE.Fog(0x49328a, 15, 32);
  world.camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
  world.camera.position.set(0, 4.4, 13.2);
  world.camera.lookAt(0, 3.15, -.3);

  world.scene.add(new THREE.AmbientLight(0xffffff, .65));
  const key = new THREE.DirectionalLight(0xfff4cf, 1.6);
  key.position.set(-5, 10, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -3;
  world.scene.add(key);
  const partyLight = new THREE.PointLight(0xff4b35, 7, 16);
  partyLight.position.set(-4, 4, 5);
  partyLight.userData.baseIntensity = partyLight.intensity;
  world.scene.add(partyLight);
  const blueLight = new THREE.PointLight(0x29b8ff, 6, 14);
  blueLight.position.set(5, 4, 4);
  blueLight.userData.baseIntensity = blueLight.intensity;
  world.scene.add(blueLight);
  world.partyLights = [partyLight, blueLight];

  buildPartyRoom();
  createGun();
  addCartmans();
  addMoms();
  updateWorldStats();
}

function resizeWorld() {
  if (!world.renderer) return;
  const width = Math.max(1, dom.canvas.clientWidth);
  const height = Math.max(1, dom.canvas.clientHeight);
  world.renderer.setSize(width, height, false);
  world.camera.aspect = width / height;
  world.camera.updateProjectionMatrix();
}

function makeBlood(target, intensity = 1) {
  const character = world.characters[target];
  if (!character) return;
  const base = character.group.position.clone();
  const dropCount = Math.round(58 * intensity);
  for (let index = 0; index < dropCount; index += 1) {
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(.055 + Math.random() * .08, 7, 5),
      new THREE.MeshBasicMaterial({ color: index % 3 ? 0xb50024 : 0xff263c })
    );
    drop.position.copy(base).add(new THREE.Vector3((Math.random() - .5) * 1.2, 1.1 + Math.random() * 1.6, (Math.random() - .5) * .5));
    world.scene.add(drop);
    world.blood.push({
      mesh: drop,
      velocity: new THREE.Vector3((Math.random() - .5) * 4.8, 1 + Math.random() * 4.8, (Math.random() - .5) * 3.4),
      life: 2.4 + Math.random() * 2.5
    });
  }
  for (let index = 0; index < Math.round(17 * intensity); index += 1) {
    const stain = new THREE.Mesh(
      new THREE.CircleGeometry(.12 + Math.random() * .25, 10),
      new THREE.MeshBasicMaterial({ color: 0x850018, transparent: true, opacity: .85 })
    );
    stain.rotation.x = -Math.PI / 2;
    stain.position.set(base.x + (Math.random() - .5) * 1.7, 1.66, base.z + .2 + (Math.random() - .5) * 1.2);
    world.scene.add(stain);
    world.blood.push({ mesh: stain, velocity: new THREE.Vector3(), life: 99 });
  }
  for (let index = 0; index < Math.round(12 * intensity); index += 1) {
    const wallStain = new THREE.Mesh(
      new THREE.CircleGeometry(.1 + Math.random() * .24, 10),
      new THREE.MeshBasicMaterial({ color: index % 2 ? 0x7f001c : 0xb50024, transparent: true, opacity: .82 })
    );
    wallStain.position.set(
      base.x + (Math.random() - .5) * 2.1,
      2.05 + Math.random() * 1.7,
      -3.22
    );
    world.scene.add(wallStain);
    world.blood.push({ mesh: wallStain, velocity: new THREE.Vector3(), life: 99 });
  }
}

function makePoop(actor) {
  const character = world.characters[actor];
  if (!character) return;
  const pile = new THREE.Group();
  const x = character.group.position.x;
  pile.position.set(x, .12, -.2);
  [0, -.23, .23].forEach((offset, index) => {
    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(.22 - index * .025, 10, 7),
      mat(0x70421f, .9)
    );
    blob.position.set(offset, index * .12, 0);
    pile.add(blob);
  });
  world.scene.add(pile);
  world.poop.push(pile);
}

function resetWorldActors() {
  Object.values(world.characters).forEach((character) => {
    character.dead = false;
    character.group.visible = true;
    character.group.position.set(
      character.group.userData.baseX,
      character.group.userData.baseY,
      character.group.userData.baseZ
    );
    character.group.rotation.set(0, character.group.userData.baseRotation, 0);
    if (character.cryPool) {
      character.cryPool.visible = true;
      character.cryPool.scale.setScalar(.7);
      character.cryPool.material.opacity = .14;
    }
  });
  world.blood.forEach(({ mesh }) => world.scene.remove(mesh));
  world.blood = [];
  world.poop.forEach((pile) => world.scene.remove(pile));
  world.poop = [];
  if (world.gun) {
    world.gun.position.set(0, 1.84, .25);
    world.gun.rotation.set(0, -.15, 0);
    world.gun.userData.kick = 0;
    world.gun.userData.holdZ = .25;
  }
}

function updateWorldStats() {
  const fear = Math.round(clamp((game.round - 1) * 7, 0, 99));
  world.panels.stats?.userData.updateTexture([
    { text: `YOU DANGER       ${percent(game.selfOdds)}`, size: 23, bold: true, color: '#ff4b35' },
    { text: `OPPONENT DANGER  ${percent(game.opponentOdds)}`, size: 21, bold: true, color: '#29b8ff' },
    { text: `ROUND ${game.round}`, size: 25, bold: true, color: '#ffffff' },
    { text: `FEAR / SHAKING   ${fear}%`, size: 20, color: '#ffdf34' },
    { text: fear > 35 ? 'MOMS ARE WATCHING' : 'MOMS WAITING', size: 18, bold: true, color: fear > 35 ? '#ff4b35' : '#ffffff' },
    { text: `TEARS PILING     ${Math.round(clamp((game.round - 1) * 11, 0, 99))}%`, size: 17, color: '#29b8ff' }
  ]);
}

function updateMomsFocus(amount = null) {
  const focus = amount === null
    ? clamp((game.round - 1) * .13, 0, 1)
    : clamp(amount, 0, 1);
  world.moms.forEach((mom) => {
    mom.group.rotation.y = THREE.MathUtils.lerp(
      mom.group.userData.baseRotation,
      mom.group.userData.focusRotation,
      focus
    );
    mom.focused = focus > .78;
    if (mom.recordLight) {
      const recording = Math.sin(performance.now() * .012) > -.35;
      mom.recordLight.material.color.set(recording ? 0xff1e38 : 0x42030c);
    }
    if (mom.happySign) {
      mom.happySign.visible = mom.happy;
      if (mom.happy) {
        const bounce = Math.abs(Math.sin(performance.now() * .009)) * .18;
        mom.happySign.scale.set(1.2 + bounce, .4 + bounce * .25, 1);
      }
    }
  });
}

function setFeed(text) {
  dom.feed.textContent = text;
  updateWorldStats();
}

function setTurn(actor) {
  game.turn = actor;
  dom.turn.textContent = actor === 'you' ? 'YOUR TURN' : 'OPPONENT THINKING';
  dom.turn.style.background = actor === 'you' ? '#2b1c65' : '#6c1e3c';
  dom.actions.forEach((button) => {
    button.disabled = actor !== 'you' || game.busy || game.over;
  });
}

function triggerGun(hit = false) {
  if (!world.gun) return;
  world.gun.userData.kick = performance.now() + 460;
  world.gun.userData.hit = hit;
  world.gun.userData.cylinder.rotation.z += Math.PI / 3;
  playRouletteSound(hit ? 'pistol' : 'distantGun', hit ? .58 : .18);
}

function startWinningCutscene(reason) {
  world.cutscene = {
    startedAt: performance.now(),
    duration: 7800,
    reason
  };
  setFeed('You won. The birthday song keeps playing.');
  updateMomsFocus(0);
  playRouletteSound('bloodScream', .3);
  world.panels.birthday?.userData.updateTexture([
    { text: 'HAPPY BIRTHDAY', size: 31, bold: true, color: '#ff4b35' },
    { text: 'YOU WIN!', size: 40, bold: true, color: '#ffdf34' },
    { text: 'MOMS ARE RECORDING', size: 19, color: '#ffffff' }
  ]);
}

function startIdleAttack(target) {
  if (game.over || game.idlePunished) return;
  game.over = true;
  game.busy = true;
  game.idlePunished = true;
  game.winner = other(target);
  const mom = world.moms[0];
  if (!mom) {
    game.busy = false;
    dom.resultTitle.textContent = 'TIMEOUT';
    dom.resultText.textContent = `${actorName(target)} waited too long.`;
    dom.result.hidden = false;
    setTurn('you');
    return;
  }
  world.idleAttack = {
    startedAt: performance.now(),
    duration: 8200,
    target,
    mom,
    bashCount: 0,
    shotCount: 0,
    lastShotAt: 0,
    gunTaken: false,
    bashPulseUntil: 0,
    homePosition: mom.group.position.clone(),
    homeRotation: mom.group.rotation.y
  };
  setFeed(`${actorName(target)} stopped moving. Mom is coming over.`);
  setTurn(target);
  playRouletteSound('bloodScream', .22);
}

function updateIdleAttack(now, elapsed) {
  if (!world.idleAttack) return;
  const attack = world.idleAttack;
  const progress = clamp((now - attack.startedAt) / attack.duration, 0, 1);
  const target = world.characters[attack.target];
  const targetX = target?.group.userData.baseX || 0;
  const targetZ = (target?.group.userData.baseZ || -1.2) - .15;
  const approach = clamp(progress / .23, 0, 1);
  attack.mom.group.position.x = THREE.MathUtils.lerp(attack.homePosition.x, targetX, approach);
  attack.mom.group.position.y = THREE.MathUtils.lerp(attack.homePosition.y, 1.72, approach);
  attack.mom.group.position.z = THREE.MathUtils.lerp(attack.homePosition.z, targetZ, approach);
  attack.mom.group.rotation.y = THREE.MathUtils.lerp(attack.homeRotation, attack.mom.side * -.08, approach);

  if (target) {
    const bashMarks = [.3, .41, .52];
    bashMarks.forEach((mark, index) => {
      if (progress > mark && attack.bashCount === index) {
        attack.bashCount += 1;
        attack.bashPulseUntil = now + 300;
        makeBlood(attack.target, .62);
        playRouletteSound('flesh', .58);
        playRouletteSound('bloodSplash', .48);
        setFeed(`${actorName(attack.target)} got desk-bashed ${attack.bashCount}/3.`);
      }
    });
    const bashPulse = Math.max(0, attack.bashPulseUntil - now);
    const slam = bashPulse ? Math.sin((bashPulse / 300) * Math.PI) * .5 : 0;
    target.group.position.y = target.group.userData.baseY - slam;
    target.group.position.z = target.group.userData.baseZ + slam * .24;
    target.group.rotation.x = slam * 2.1;
  }
  world.camera.position.x = Math.sin(elapsed * 22) * .06;
  world.camera.position.y = 4.4 + Math.sin(elapsed * 19) * .05;
  world.camera.lookAt(0, 2.8, 0);

  if (progress > .64) {
    if (!attack.gunTaken) {
      attack.gunTaken = true;
      setFeed(`${actorName(attack.target)} still moved. Mom took the gun.`);
    }
    if (world.gun) {
      world.gun.position.x = THREE.MathUtils.lerp(world.gun.position.x, targetX + .42, .12);
      world.gun.position.y = THREE.MathUtils.lerp(world.gun.position.y, 2.05, .12);
      world.gun.position.z = THREE.MathUtils.lerp(world.gun.position.z, targetZ + .52, .12);
      world.gun.userData.holdZ = targetZ + .52;
      world.gun.rotation.z = -.55;
    }
    if (now - attack.lastShotAt > 360 && attack.shotCount < 6) {
      attack.lastShotAt = now;
      attack.shotCount += 1;
      triggerGun(true);
      makeBlood(attack.target, .52);
      playRouletteSound('bloodBurst', .45);
      setFeed(`Mom fired again. SHOT ${attack.shotCount}/6.`);
    }
  }
  if (progress >= .94 && !target?.dead) {
    if (target) target.dead = true;
    makeBlood(attack.target, 1.4);
    if (attack.target === 'you') makeYourMomHappy();
    playRouletteSound('bloodScream', .35);
  }
  if (progress >= 1) {
    world.idleAttack = null;
    game.busy = false;
    dom.resultTitle.textContent = 'MOM HAD ENOUGH';
    dom.resultText.textContent = `${actorName(attack.target)} waited too long. Mom came over and ended the game.`;
    dom.result.hidden = false;
    setTurn('you');
  }
}

function updateWinningCutscene(now, elapsed) {
  if (!world.cutscene) return;
  const cutscene = world.cutscene;
  const progress = clamp((now - cutscene.startedAt) / cutscene.duration, 0, 1);
  const ease = progress * progress * (3 - 2 * progress);
  updateMomsFocus(ease);

  const targetCamera = new THREE.Vector3(
    Math.sin(elapsed * .7) * .16 * (1 - progress),
    3.75 - progress * .24,
    13.2 - progress * 2.3
  );
  world.camera.position.lerp(targetCamera, .045);
  world.camera.lookAt(0, 3.0, -.7);

  const flicker = progress < .62
    ? (Math.sin(now * .021) > .62 ? .18 : .92)
    : 1.25;
  world.partyLights.forEach((light, index) => {
    light.intensity = (light.userData.baseIntensity || 6) * flicker;
    if (index === 1) light.color.set(progress > .54 ? 0xffdf34 : 0x29b8ff);
  });

  if (progress > .48 && progress < .53) {
    setFeed('The mothers turn toward the desk.');
  }
  if (progress > .74 && progress < .78) {
    setFeed('You won. You are ecstatic.');
  }
  if (progress > .68 && world.characters.you) {
    const winner = world.characters.you.group;
    winner.position.y = winner.userData.baseY + Math.abs(Math.sin(elapsed * 7)) * .3;
    winner.rotation.z = Math.sin(elapsed * 7) * .1;
  }
  if (progress >= 1) {
    world.cutscene = null;
    game.busy = false;
    dom.resultTitle.textContent = 'YOU WIN!!!';
    dom.resultText.textContent = `${cutscene.reason} YOU ARE SO HAPPY YOU CAN BARELY STAND IT.`;
    dom.result.hidden = false;
    setFeed('YOU WIN!!! YOU ARE ABSOLUTELY ECSTATIC.');
    setTurn('you');
  }
}

function finishGame(loser, reason) {
  game.over = true;
  game.busy = true;
  game.winner = other(loser);
  const winner = game.winner;
  world.characters[loser].dead = true;
  makeBlood(loser, 1.8);
  playRouletteSound('flesh', .42);
  playRouletteSound('bloodSplash', .45);
  if (loser === 'you') makeYourMomHappy();
  if (winner === 'you') {
    startWinningCutscene(reason);
  } else {
    game.busy = false;
    dom.resultTitle.textContent = 'YOU LOSE';
    dom.resultText.textContent = 'The game is over.';
    setFeed(loser === 'you' ? 'You lose. Your mom is thrilled.' : 'You lose. The game is over.');
    dom.result.hidden = false;
    setTurn('you');
  }
}

function resolveShot(actor, target, chance, description) {
  const hit = Math.random() < chance;
  triggerGun(hit);
  if (hit) {
    playRouletteSound('bloodBurst', .52);
    finishGame(target, `${description} BANG.`);
    return true;
  }
  setFeed(`${description} CLICK. Empty chamber.`);
  return false;
}

function passTurn() {
  if (game.over) return;
  game.round += 1;
  game.turn = other(game.turn);
  game.busy = false;
  setTurn(game.turn);
  setFeed(game.turn === 'you' ? 'The gun slides over. Your move.' : 'Opponent Cartman is shaking and thinking.');
  if (game.turn === 'opponent') window.setTimeout(cpuTurn, 780);
}

function setOdds(actor, value) {
  if (actor === 'you') game.selfOdds = clamp(value, .02, 1);
  else game.opponentOdds = clamp(value, .02, 1);
}

async function actionShoot(actor) {
  if (resolveShot(actor, actor, actor === 'you' ? game.selfOdds : game.opponentOdds, `${actorName(actor)} aimed at themself.`)) return;
  setOdds(actor, (actor === 'you' ? game.selfOdds : game.opponentOdds) + .07);
  updateWorldStats();
  await delay(250);
  passTurn();
}

async function actionReroll(actor) {
  playRouletteSound('chamber', .38);
  playRouletteSound('revolver', .28);
  const selfShift = Math.random() * .28 - .1;
  const opponentShift = Math.random() * .28 - .1;
  game.selfOdds = clamp(game.selfOdds + selfShift, .04, .84);
  game.opponentOdds = clamp(game.opponentOdds + opponentShift, .04, .84);
  setFeed(`${actorName(actor)} rerolled. The odds shifted.`);
  await delay(360);
  passTurn();
}

async function actionOpponent(actor) {
  const target = other(actor);
  if (resolveShot(actor, target, target === 'you' ? game.selfOdds : game.opponentOdds, `${actorName(actor)} aimed at ${actorName(target)}.`)) return;
  setOdds(actor, (actor === 'you' ? game.selfOdds : game.opponentOdds) + .18);
  setFeed(`${actorName(target)} lived. Recoil shot incoming at ${actorName(actor)}.`);
  await delay(550);
  if (resolveShot(actor, actor, actor === 'you' ? game.selfOdds : game.opponentOdds, `${actorName(actor)} took the recoil shot.`)) return;
  await delay(250);
  passTurn();
}

async function actionEat(actor) {
  const target = other(actor);
  const roll = Math.random();
  if (roll < .16) {
    setOdds(actor, 1);
    setFeed(`${actorName(actor)} ate the gun. 100% chance of self-destruction.`);
    await delay(500);
    resolveShot(actor, actor, 1, `${actorName(actor)} digested the loaded chamber.`);
    return;
  }
  if (roll < .32) {
    setOdds(target, 1);
    setFeed(`${actorName(actor)} ate it. The curse picked ${actorName(target)} at 100%.`);
    await delay(500);
    resolveShot(actor, target, 1, `${actorName(target)} got the cursed chamber.`);
    return;
  }
  if (roll < .57) {
    game.selfOdds = .3 + Math.random() * .55;
    game.opponentOdds = .3 + Math.random() * .55;
    setFeed(`${actorName(actor)} ate the gun. Every odd changed.`);
    await delay(420);
    passTurn();
    return;
  }
  if (roll < .78) {
    setOdds(actor, (actor === 'you' ? game.selfOdds : game.opponentOdds) + .26);
    setOdds(target, (target === 'you' ? game.selfOdds : game.opponentOdds) + .18);
    setFeed(`${actorName(actor)} ate it. It did nothing useful, except make everyone sweat.`);
    await delay(420);
    passTurn();
    return;
  }
  setFeed(`${actorName(actor)} ate it. Complete waste of a move.`);
  await delay(420);
  passTurn();
}

async function actionSpam(actor) {
  const target = other(actor);
  const shift = .12;
  playRouletteSound('revolver', .42);
  setOdds(target, (target === 'you' ? game.selfOdds : game.opponentOdds) - shift);
  setOdds(actor, (actor === 'you' ? game.selfOdds : game.opponentOdds) + shift);
  setFeed(`${actorName(actor)} spammed it. ${Math.round(shift * 100)}% danger moved onto themself.`);
  await delay(400);
  if (resolveShot(actor, target, target === 'you' ? game.selfOdds : game.opponentOdds, `${actorName(actor)} spam-fired at ${actorName(target)}.`)) return;
  await delay(500);
  if (resolveShot(actor, actor, actor === 'you' ? game.selfOdds : game.opponentOdds, `${actorName(actor)} caught the spam recoil.`)) return;
  await delay(220);
  passTurn();
}

async function takeAction(actor, action) {
  if (game.over || game.busy || game.turn !== actor) return;
  game.busy = true;
  game.lastAction = performance.now();
  setTurn(actor);
  const handlers = { shoot: actionShoot, reroll: actionReroll, opponent: actionOpponent, eat: actionEat, spam: actionSpam };
  try {
    await handlers[action](actor);
  } catch (error) {
    console.error('Roulette action failed:', error);
    game.busy = false;
    setFeed('The birthday gun jammed. Try another move.');
    setTurn(game.turn);
  }
}

function cpuTurn() {
  if (game.over || game.turn !== 'opponent') return;
  const roll = Math.random();
  const action = game.opponentOdds > .62 && roll < .4
    ? 'reroll'
    : game.selfOdds > .6 && roll < .58
      ? 'opponent'
      : roll < .15 ? 'eat' : roll < .3 ? 'spam' : roll < .48 ? 'reroll' : roll < .75 ? 'opponent' : 'shoot';
  takeAction('opponent', action);
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function resetGame() {
  Object.assign(game, {
    selfOdds: .16,
    opponentOdds: .16,
    turn: 'you',
    round: 1,
    busy: false,
    over: false,
    winner: null
  });
  dom.result.hidden = true;
  world.cutscene = null;
  world.idleAttack = null;
  game.lastAction = performance.now();
  game.idlePunished = false;
  if (world.camera) {
    world.camera.position.set(0, 4.4, 13.2);
    world.camera.lookAt(0, 3.15, -.3);
  }
  world.partyLights.forEach((light) => {
    light.intensity = light.userData.baseIntensity || light.intensity;
  });
  if (world.partyLights[1]) world.partyLights[1].color.set(0x29b8ff);
  world.moms.forEach((mom) => {
    mom.group.position.copy(mom.group.userData.homePosition);
    mom.group.rotation.y = mom.group.userData.baseRotation;
    mom.happy = false;
    if (mom.happySign) mom.happySign.visible = false;
  });
  updateMomsFocus(0);
  resetWorldActors();
  setFeed('The gun is waiting on the birthday desk.');
  setTurn('you');
}

function openMap() {
  dom.menu.style.display = 'none';
  dom.map.hidden = false;
  world.birthdayAudio = playRouletteSound('birthday', .18, true);
  resetGame();
  resizeWorld();
}

function closeMap() {
  game.over = true;
  stopRouletteSound('birthday');
  world.cutscene = null;
  world.idleAttack = null;
  dom.map.hidden = true;
  dom.menu.style.display = 'flex';
}

function renderWorld(time) {
  const elapsed = time * .001;
  const fear = clamp((game.round - 1) * .012, 0, .2);
  Object.entries(world.characters).forEach(([actor, character], index) => {
    const group = character.group;
    const shake = character.dead ? 0 : fear + .012;
    const pulse = Math.sin(elapsed * (4.5 + game.round * .12) + index * 1.9);
    const danger = actor === 'you' ? game.selfOdds : game.opponentOdds;
    const escape = character.dead ? 0 : clamp((danger - .52) / .38, 0, 1);
    group.position.x = group.userData.baseX + pulse * shake;
    group.position.y = group.userData.baseY + Math.abs(Math.cos(elapsed * 3.7 + index)) * shake * .15 + escape * .32 + (character.dead ? -.6 : 0);
    group.position.z = group.userData.baseZ + Math.cos(elapsed * 4.1 + index) * shake * .45 + escape * .48;
    group.rotation.y = group.userData.baseRotation + pulse * shake * .65;
    group.rotation.x = escape * (index ? -.16 : .16);
    group.rotation.z = character.dead ? (index ? .9 : -.9) : Math.sin(elapsed * 5 + index) * shake + escape * (index ? .1 : -.1);
    if (character.distress) {
      const distress = character.distress;
      distress.group.visible = !character.dead;
      const panic = clamp(.65 + (game.round - 1) * .06, .65, 1.35);
      distress.sign.material.opacity = .7 + Math.abs(Math.sin(elapsed * 5.5 + distress.seed)) * .3;
      distress.sign.scale.set(1.65 * panic, .47 * panic, 1);
      distress.drops.forEach((drop, dropIndex) => {
        const home = drop.userData.home;
        const bob = Math.sin(elapsed * (6 + dropIndex) + distress.seed) * (.04 + fear * .5);
        drop.position.set(home.x + bob, home.y + Math.abs(bob) * .8, home.z);
        drop.material.opacity = .62 + Math.abs(Math.sin(elapsed * 6 + dropIndex)) * .32;
      });
      const tears = clamp(.8 + (game.round - 1) * .16, .8, 3.2);
      distress.tears.forEach((tear, tearIndex) => {
        tear.visible = !character.dead;
        tear.scale.set(1, tears + Math.sin(elapsed * 4 + tearIndex) * .08, 1);
        tear.material.opacity = clamp(.62 + tears * .1, .62, .95);
      });
      if (character.cryPool) {
        character.cryPool.visible = !character.dead;
        character.cryPool.scale.setScalar(.7 + tears * .32);
        character.cryPool.material.opacity = clamp(.14 + tears * .08, .14, .42);
      }
    }
  });
  if (world.cutscene) {
    updateWinningCutscene(performance.now(), elapsed);
  } else if (world.idleAttack) {
    updateIdleAttack(performance.now(), elapsed);
  } else {
    updateMomsFocus();
    if (
      !game.over &&
      !game.busy &&
      !game.idlePunished &&
      game.lastAction &&
      performance.now() - game.lastAction > 14000
    ) {
      startIdleAttack(game.turn);
    }
  }
  if (world.gun) {
    const remaining = Math.max(0, (world.gun.userData.kick || 0) - performance.now());
    const kick = remaining ? Math.sin((remaining / 460) * Math.PI) : 0;
    world.gun.position.z = world.idleAttack?.gunTaken
      ? (world.gun.userData.holdZ || -.7) + kick * .3
      : .25 + kick * .3;
    world.gun.rotation.x = kick * .2;
    world.muzzle.intensity = world.gun.userData.hit && kick ? 12 * kick : 0;
    world.gun.userData.cylinder.rotation.z += .008;
  }
  world.blood.forEach((drop) => {
    if (drop.life < 10) {
      drop.life -= .016;
      drop.velocity.y -= .075;
      drop.mesh.position.addScaledVector(drop.velocity, .016);
      if (drop.mesh.position.y < 1.65 && drop.velocity.length() > 0) drop.velocity.set(0, 0, 0);
    }
  });
  world.renderer.render(world.scene, world.camera);
  world.animationFrame = requestAnimationFrame(renderWorld);
}

function initialize() {
  try {
    world.renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true });
    world.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    world.renderer.shadowMap.enabled = true;
    world.renderer.shadowMap.type = THREE.BasicShadowMap;
    world.renderer.outputColorSpace = THREE.SRGBColorSpace;
    createWorld();
    window.addEventListener('resize', resizeWorld);
    window.requestAnimationFrame(renderWorld);
    world.initialized = true;
  } catch (error) {
    console.error('Cartman Roulette map failed to initialize:', error);
  }
}

dom.actions.forEach((button) => {
  button.addEventListener('click', () => takeAction('you', button.dataset.rouletteAction));
});
document.getElementById('rouletteMapBtn')?.addEventListener('click', openMap);
document.getElementById('rouletteMapExit')?.addEventListener('click', closeMap);
document.getElementById('rouletteMapResultExit')?.addEventListener('click', closeMap);
document.getElementById('rouletteMapAgain')?.addEventListener('click', resetGame);

initialize();
