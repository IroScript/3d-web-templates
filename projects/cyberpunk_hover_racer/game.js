/**
 * CYBERPUNK HOVER RACER 3D - FULL GAME LOOP & ENGINE
 * Procedural sci-fi hovercraft, infinite neon highway, physics, collision detection & mobile HUD
 */

import * as THREE from 'three';
import { sound } from './audio.js';

// ─── DOM References ──────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const container = document.getElementById('game-container');
const hudLayer = document.getElementById('game-hud');
const mobileControls = document.getElementById('mobile-controls');
const hudScore = document.getElementById('hud-score-val');
const hudSpeed = document.getElementById('hud-speed-val');
const hudSpeedBar = document.getElementById('hud-speed-bar');
const hudShieldBar = document.getElementById('hud-shield-bar');
const hudShieldText = document.getElementById('hud-shield-text');
const hudAlert = document.getElementById('hud-alert');

const screenStart = document.getElementById('screen-start');
const screenGameOver = document.getElementById('screen-gameover');
const screenPause = document.getElementById('screen-pause');
const startHighScore = document.getElementById('start-high-score');
const goFinalScore = document.getElementById('go-final-score');
const goDistance = document.getElementById('go-distance');
const goOrbs = document.getElementById('go-orbs');

const btnStart = document.getElementById('btn-start-game');
const btnRestart = document.getElementById('btn-restart-game');
const btnResume = document.getElementById('btn-resume-game');
const btnAudio = document.getElementById('btn-audio');
const btnPause = document.getElementById('btn-pause');

// Mobile Touch Buttons
const btnTouchLeft = document.getElementById('btn-touch-left');
const btnTouchRight = document.getElementById('btn-touch-right');
const btnTouchBoost = document.getElementById('btn-touch-boost');
const btnTouchBrake = document.getElementById('btn-touch-brake');

// ─── Game State ──────────────────────────────────────────────────
const GameState = {
  MENU: 0,
  PLAYING: 1,
  PAUSED: 2,
  GAMEOVER: 3
};

let currentState = GameState.MENU;
let score = 0;
let distance = 0;
let orbsCollected = 0;
let shield = 100;
let highScore = parseInt(localStorage.getItem('cyber_racer_high') || '0', 10);
startHighScore.textContent = highScore.toString();

// Input State
const input = {
  left: false,
  right: false,
  boost: false,
  brake: false,
  pointerX: 0
};

// ─── Three.js Scene Setup ────────────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070913, 0.015);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 3.2, 7.5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

// Lighting
const ambientLight = new THREE.AmbientLight(0x382bf0, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x00f3ff, 2.5);
dirLight.position.set(5, 12, 10);
scene.add(dirLight);

const pinkLight = new THREE.PointLight(0xff007f, 3.0, 50);
pinkLight.position.set(0, 5, -20);
scene.add(pinkLight);

// ─── Environment: Horizon Synthwave Sun & Skybox ─────────────────
function createSkyEnvironment() {
  const envGroup = new THREE.Group();

  // 1. Giant Wireframe Horizon Sun
  const sunGeo = new THREE.SphereGeometry(35, 32, 16);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xff007f,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.position.set(0, 10, -220);
  envGroup.add(sun);

  // 2. Starfield
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1200;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const colCyan = new THREE.Color(0x00f3ff);
  const colPink = new THREE.Color(0xff007f);

  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 500;
    starPositions[i * 3 + 1] = Math.random() * 200 + 10;
    starPositions[i * 3 + 2] = -Math.random() * 300;

    const c = Math.random() > 0.5 ? colCyan : colPink;
    starColors[i * 3] = c.r;
    starColors[i * 3 + 1] = c.g;
    starColors[i * 3 + 2] = c.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });
  const stars = new THREE.Points(starGeo, starMat);
  envGroup.add(stars);

  scene.add(envGroup);
}
createSkyEnvironment();

// ─── Player Hovercraft Model ─────────────────────────────────────
const shipGroup = new THREE.Group();

function buildHovercraft() {
  // Main Hull Body
  const bodyGeo = new THREE.ConeGeometry(1.2, 3.8, 5);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(1.2, 0.45, 1);
  shipGroup.add(body);

  // Cockpit Glass Canopy
  const glassGeo = new THREE.SphereGeometry(0.7, 16, 12);
  glassGeo.scale(0.8, 0.45, 1.8);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.85,
    roughness: 0.1,
    transmission: 0.7,
    ior: 1.4
  });
  const cockpit = new THREE.Mesh(glassGeo, glassMat);
  cockpit.position.set(0, 0.28, 0.2);
  shipGroup.add(cockpit);

  // Swept Wings (Left & Right)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(2.2, -1.4);
  wingShape.lineTo(1.8, -2.1);
  wingShape.lineTo(0, -1.0);
  wingShape.closePath();

  const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
  wingGeo.rotateX(Math.PI / 2);

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.3
  });

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(0.6, 0.05, 0.6);
  shipGroup.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.scale.set(-1, 1, 1);
  rightWing.position.set(-0.6, 0.05, 0.6);
  shipGroup.add(rightWing);

  // Wingtip Neon Light Strips
  const tipMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
  const tipGeo = new THREE.BoxGeometry(0.1, 0.08, 1.2);
  const leftTip = new THREE.Mesh(tipGeo, tipMat);
  leftTip.position.set(2.4, 0.05, -0.4);
  shipGroup.add(leftTip);

  const rightTip = new THREE.Mesh(tipGeo, tipMat);
  rightTip.position.set(-2.4, 0.05, -0.4);
  shipGroup.add(rightTip);

  // Twin Thruster Engines
  const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
  const nozzleMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

  [-0.65, 0.65].forEach(x => {
    const engineGeo = new THREE.CylinderGeometry(0.32, 0.38, 1.2, 16);
    engineGeo.rotateX(Math.PI / 2);
    const engine = new THREE.Mesh(engineGeo, thrusterMat);
    engine.position.set(x, 0.08, 1.3);
    shipGroup.add(engine);

    // Plasma Core
    const flameGeo = new THREE.ConeGeometry(0.24, 0.9, 12);
    flameGeo.rotateX(-Math.PI / 2);
    const flame = new THREE.Mesh(flameGeo, nozzleMat);
    flame.position.set(x, 0.08, 2.0);
    flame.name = `flame_${x}`;
    shipGroup.add(flame);
  });

  shipGroup.position.set(0, 0.9, 0);
  scene.add(shipGroup);
}
buildHovercraft();

// ─── Procedural Highway Track & Recycling Chunks ─────────────────
const TRACK_WIDTH = 18;
const CHUNK_LENGTH = 60;
const CHUNK_COUNT = 8;
const chunks = [];

// Road Grid Texture
function createRoadGridTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0d1d';
  ctx.fillRect(0, 0, size, size);

  // Neon Grid Lines
  ctx.strokeStyle = '#00f3ff';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#00f3ff';
  ctx.shadowBlur = 8;

  // Center Dashed Lane
  ctx.setLineDash([32, 24]);
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.stroke();

  // Side Lanes
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ff007f';
  ctx.shadowColor = '#ff007f';
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(size * 0.15, 0);
  ctx.lineTo(size * 0.15, size);
  ctx.moveTo(size * 0.85, 0);
  ctx.lineTo(size * 0.85, size);
  ctx.stroke();

  // Horizontal Grid Ticks
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
  ctx.lineWidth = 2;
  for (let y = 0; y < size; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  return texture;
}

const roadTexture = createRoadGridTexture();
const roadMaterial = new THREE.MeshStandardMaterial({
  map: roadTexture,
  roughness: 0.4,
  metalness: 0.6
});

function createTrackChunk(zPos) {
  const chunkGroup = new THREE.Group();
  chunkGroup.position.z = zPos;

  // Road Surface
  const roadGeo = new THREE.PlaneGeometry(TRACK_WIDTH, CHUNK_LENGTH);
  roadGeo.rotateX(-Math.PI / 2);
  const road = new THREE.Mesh(roadGeo, roadMaterial);
  road.receiveShadow = true;
  chunkGroup.add(road);

  // Glowing Side Guardrails
  const railGeo = new THREE.BoxGeometry(0.5, 0.8, CHUNK_LENGTH);
  const railMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

  const leftRail = new THREE.Mesh(railGeo, railMat);
  leftRail.position.set(-TRACK_WIDTH / 2, 0.4, 0);
  chunkGroup.add(leftRail);

  const rightRail = new THREE.Mesh(railGeo, railMat);
  rightRail.position.set(TRACK_WIDTH / 2, 0.4, 0);
  chunkGroup.add(rightRail);

  // Futuristic Overhead Archway Gantry (Occasional)
  if (Math.abs(zPos) % 120 === 0) {
    const archGeo = new THREE.BoxGeometry(TRACK_WIDTH + 2, 1.2, 1.8);
    const archMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.position.set(0, 5.5, 0);
    chunkGroup.add(arch);

    // Archway Neon Sign
    const signGeo = new THREE.PlaneGeometry(8, 1.2);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 5.5, 1.0);
    chunkGroup.add(sign);
  }

  scene.add(chunkGroup);
  return chunkGroup;
}

function initTrack() {
  for (let i = 0; i < CHUNK_COUNT; i++) {
    const chunk = createTrackChunk(-i * CHUNK_LENGTH);
    chunks.push(chunk);
  }
}
initTrack();

// ─── Entities: Collectibles (Orbs & Rings) & Obstacles ───────────
const entities = [];

// Cyan Quantum Orb
function createQuantumOrb(x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.userData = { type: 'orb', radius: 0.85 };

  const gemGeo = new THREE.OctahedronGeometry(0.7, 0);
  const gemMat = new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    emissive: 0x00f3ff,
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.1
  });
  const gem = new THREE.Mesh(gemGeo, gemMat);
  group.add(gem);

  // Outer Ring
  const ringGeo = new THREE.TorusGeometry(1.1, 0.04, 8, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  scene.add(group);
  entities.push(group);
}

// Golden Boost Ring
function createBoostRing(x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.userData = { type: 'boost', radius: 2.2 };

  const ringGeo = new THREE.TorusGeometry(2.1, 0.22, 16, 48);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xffe600,
    emissive: 0xffe600,
    emissiveIntensity: 0.9,
    metalness: 0.8,
    roughness: 0.2
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  group.add(ring);

  scene.add(group);
  entities.push(group);
}

// Red Laser Barrier Obstacle
function createLaserBarrier(x, y, z) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.userData = { type: 'obstacle', radius: 1.4 };

  // Left & Right Energy Pylons
  const pylonGeo = new THREE.CylinderGeometry(0.3, 0.4, 3.2, 12);
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });

  const pylon1 = new THREE.Mesh(pylonGeo, pylonMat);
  pylon1.position.set(-1.8, 1.6, 0);
  group.add(pylon1);

  const pylon2 = new THREE.Mesh(pylonGeo, pylonMat);
  pylon2.position.set(1.8, 1.6, 0);
  group.add(pylon2);

  // Center Red Laser Beam
  const beamGeo = new THREE.BoxGeometry(3.6, 0.25, 0.25);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(0, 1.6, 0);
  group.add(beam);

  scene.add(group);
  entities.push(group);
}

// Spawn wave ahead
let nextSpawnZ = -80;

function spawnEntitiesAhead() {
  while (nextSpawnZ > shipGroup.position.z - (CHUNK_COUNT * CHUNK_LENGTH)) {
    const lanes = [-5.5, -2.8, 0, 2.8, 5.5];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const rand = Math.random();

    if (rand < 0.45) {
      // Quantum Orb
      createQuantumOrb(lane, 1.2, nextSpawnZ);
    } else if (rand < 0.70) {
      // Laser Barrier
      createLaserBarrier(lane, 0, nextSpawnZ);
    } else {
      // Boost Ring
      createBoostRing(lane, 1.8, nextSpawnZ);
    }

    nextSpawnZ -= 35 + Math.random() * 25;
  }
}

// ─── Input Handlers ──────────────────────────────────────────────
// Keyboard
window.addEventListener('keydown', (e) => {
  if (currentState !== GameState.PLAYING) return;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = true;
  if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') input.boost = true;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') input.brake = true;
  if (e.code === 'KeyP') togglePause();
  if (e.code === 'KeyM') toggleSound();
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') input.left = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') input.right = false;
  if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') input.boost = false;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') input.brake = false;
});

// Mobile Touch Buttons
function bindTouchBtn(btn, action) {
  if (!btn) return;
  const start = (e) => {
    e.preventDefault();
    input[action] = true;
    btn.classList.add('active');
  };
  const end = (e) => {
    e.preventDefault();
    input[action] = false;
    btn.classList.remove('active');
  };
  btn.addEventListener('touchstart', start, { passive: false });
  btn.addEventListener('touchend', end, { passive: false });
  btn.addEventListener('mousedown', start);
  btn.addEventListener('mouseup', end);
  btn.addEventListener('mouseleave', end);
}

bindTouchBtn(btnTouchLeft, 'left');
bindTouchBtn(btnTouchRight, 'right');
bindTouchBtn(btnTouchBoost, 'boost');
bindTouchBtn(btnTouchBrake, 'brake');

// Viewport Touch Drag to Steer
let touchStartX = null;
container.addEventListener('touchstart', (e) => {
  if (e.target.closest('#mobile-controls') || e.target.closest('#game-hud')) return;
  touchStartX = e.touches[0].clientX;
}, { passive: true });

container.addEventListener('touchmove', (e) => {
  if (touchStartX === null || currentState !== GameState.PLAYING) return;
  const currentX = e.touches[0].clientX;
  const deltaX = currentX - touchStartX;

  if (deltaX < -20) {
    input.left = true;
    input.right = false;
  } else if (deltaX > 20) {
    input.right = true;
    input.left = false;
  } else {
    input.left = false;
    input.right = false;
  }
}, { passive: true });

container.addEventListener('touchend', () => {
  touchStartX = null;
  input.left = false;
  input.right = false;
});

// ─── Game Physics & Control Logic ────────────────────────────────
let currentSpeed = 120; // km/h
const MIN_SPEED = 70;
const BASE_SPEED = 140;
const BOOST_SPEED = 320;
let hyperBoostTimer = 0;
let lateralVelocity = 0;

function resetGame() {
  score = 0;
  distance = 0;
  orbsCollected = 0;
  shield = 100;
  currentSpeed = BASE_SPEED;
  hyperBoostTimer = 0;
  lateralVelocity = 0;

  shipGroup.position.set(0, 0.9, 0);
  shipGroup.rotation.set(0, 0, 0);

  // Clear existing entities
  entities.forEach(ent => scene.remove(ent));
  entities.length = 0;
  nextSpawnZ = -80;

  // Reposition chunks
  chunks.forEach((chunk, idx) => {
    chunk.position.z = -idx * CHUNK_LENGTH;
  });

  updateHud();
}

function startGame() {
  sound.init();
  sound.startEngine();
  resetGame();
  currentState = GameState.PLAYING;
  screenStart.classList.add('hidden');
  screenGameOver.classList.add('hidden');
  screenPause.classList.add('hidden');
  hudLayer.classList.remove('hidden');
  mobileControls.classList.remove('hidden');
}

function gameOver() {
  currentState = GameState.GAMEOVER;
  sound.stopEngine();
  sound.playCrash();

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('cyber_racer_high', highScore.toString());
  }

  goFinalScore.textContent = score.toString();
  goDistance.textContent = `${Math.floor(distance)} M`;
  goOrbs.textContent = orbsCollected.toString();

  hudLayer.classList.add('hidden');
  mobileControls.classList.add('hidden');
  screenGameOver.classList.remove('hidden');
}

function togglePause() {
  if (currentState === GameState.PLAYING) {
    currentState = GameState.PAUSED;
    sound.stopEngine();
    screenPause.classList.remove('hidden');
  } else if (currentState === GameState.PAUSED) {
    currentState = GameState.PLAYING;
    sound.startEngine();
    screenPause.classList.add('hidden');
  }
}

function toggleSound() {
  const isMuted = sound.toggleMute();
  btnAudio.textContent = isMuted ? '🔇' : '🔊';
}

btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', startGame);
btnResume.addEventListener('click', togglePause);
btnPause.addEventListener('click', togglePause);
btnAudio.addEventListener('click', toggleSound);

// ─── HUD Update ──────────────────────────────────────────────────
function updateHud() {
  hudScore.textContent = score.toString();
  hudSpeed.textContent = Math.floor(currentSpeed).toString();

  const speedPct = Math.min(100, (currentSpeed / BOOST_SPEED) * 100);
  hudSpeedBar.style.width = `${speedPct}%`;

  hudShieldBar.style.width = `${Math.max(0, shield)}%`;
  hudShieldText.textContent = `${Math.max(0, Math.floor(shield))}%`;

  if (shield <= 30) {
    hudShieldBar.style.background = '#ef4444';
  } else {
    hudShieldBar.style.background = 'linear-gradient(90deg, #10b981, #00ff88)';
  }
}

function showAlert(text) {
  hudAlert.textContent = text;
  hudAlert.classList.remove('hidden');
  clearTimeout(showAlert.timer);
  showAlert.timer = setTimeout(() => hudAlert.classList.add('hidden'), 1500);
}

// ─── Main Animation & Game Loop ──────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const time = clock.getElapsedTime();

  if (currentState === GameState.PLAYING) {
    // 1. Calculate Speed & Boost
    if (hyperBoostTimer > 0) {
      hyperBoostTimer -= delta;
      currentSpeed = THREE.MathUtils.lerp(currentSpeed, BOOST_SPEED, 0.1);
    } else if (input.boost) {
      currentSpeed = THREE.MathUtils.lerp(currentSpeed, BOOST_SPEED * 0.85, 0.08);
    } else if (input.brake) {
      currentSpeed = THREE.MathUtils.lerp(currentSpeed, MIN_SPEED, 0.1);
    } else {
      currentSpeed = THREE.MathUtils.lerp(currentSpeed, BASE_SPEED, 0.05);
    }

    const worldSpeed = (currentSpeed * 0.28) * delta;
    shipGroup.position.z -= worldSpeed;
    distance += worldSpeed * 2.5;
    score += Math.floor(worldSpeed * 2);

    // Update sound engine pitch
    sound.updateEngine(currentSpeed / BOOST_SPEED);

    // 2. Lateral Steering Physics
    const steerSpeed = 24.0;
    if (input.left) {
      lateralVelocity = THREE.MathUtils.lerp(lateralVelocity, -steerSpeed, 0.14);
    } else if (input.right) {
      lateralVelocity = THREE.MathUtils.lerp(lateralVelocity, steerSpeed, 0.14);
    } else {
      lateralVelocity = THREE.MathUtils.lerp(lateralVelocity, 0, 0.18);
    }

    shipGroup.position.x += lateralVelocity * delta;

    // Clamp inside track boundary
    const maxBound = (TRACK_WIDTH / 2) - 1.6;
    if (shipGroup.position.x < -maxBound) {
      shipGroup.position.x = -maxBound;
      lateralVelocity = 0;
    } else if (shipGroup.position.x > maxBound) {
      shipGroup.position.x = maxBound;
      lateralVelocity = 0;
    }

    // 3. Dynamic Ship Banking & Hover Animation
    const targetRoll = -lateralVelocity * 0.035; // Bank into turn
    const hoverOsc = Math.sin(time * 6.0) * 0.08;
    shipGroup.position.y = 0.9 + hoverOsc;
    shipGroup.rotation.z = THREE.MathUtils.lerp(shipGroup.rotation.z, targetRoll, 0.15);
    shipGroup.rotation.y = THREE.MathUtils.lerp(shipGroup.rotation.y, -lateralVelocity * 0.015, 0.15);

    // Engine Exhaust Flamer Pulse
    const flameL = shipGroup.getObjectByName('flame_-0.65');
    const flameR = shipGroup.getObjectByName('flame_0.65');
    if (flameL && flameR) {
      const flScale = 1.0 + (currentSpeed / BOOST_SPEED) * 1.2 + Math.random() * 0.3;
      flameL.scale.set(1, flScale, 1);
      flameR.scale.set(1, flScale, 1);
    }

    // 4. Recycle Road Chunks Ahead
    chunks.forEach(chunk => {
      if (chunk.position.z > shipGroup.position.z + CHUNK_LENGTH) {
        // Move to front of line
        let furthestZ = shipGroup.position.z;
        chunks.forEach(c => { if (c.position.z < furthestZ) furthestZ = c.position.z; });
        chunk.position.z = furthestZ - CHUNK_LENGTH;
      }
    });

    // 5. Spawn & Check Collision with Entities
    spawnEntitiesAhead();

    for (let i = entities.length - 1; i >= 0; i--) {
      const ent = entities[i];

      // Rotate gems / rings
      ent.rotation.y += delta * 2.0;

      // Distance check to player
      const distZ = Math.abs(ent.position.z - shipGroup.position.z);
      const distX = Math.abs(ent.position.x - shipGroup.position.x);

      if (distZ < 1.4 && distX < ent.userData.radius) {
        // Collision Trigger!
        if (ent.userData.type === 'orb') {
          sound.playCollect();
          score += 50;
          orbsCollected += 1;
          showAlert('+50 QUANTUM ORB');
        } else if (ent.userData.type === 'boost') {
          sound.playBoost();
          hyperBoostTimer = 2.4;
          score += 100;
          showAlert('⚡ HYPER BOOST ACTIVATED!');
        } else if (ent.userData.type === 'obstacle') {
          sound.playCrash();
          shield -= 35;
          currentSpeed *= 0.5;
          showAlert('⚠️ SHIELD DAMAGE!');

          if (shield <= 0) {
            gameOver();
            return;
          }
        }

        // Remove entity
        scene.remove(ent);
        entities.splice(i, 1);
        continue;
      }

      // Cleanup entities far behind
      if (ent.position.z > shipGroup.position.z + 15) {
        scene.remove(ent);
        entities.splice(i, 1);
      }
    }

    // 6. Camera Follow & Dynamic FOV on Speed
    const targetCamX = shipGroup.position.x * 0.45;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);
    camera.position.z = shipGroup.position.z + 7.2;

    const targetFOV = 65 + (currentSpeed / BOOST_SPEED) * 15;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.05);
    camera.updateProjectionMatrix();

    camera.lookAt(shipGroup.position.x * 0.6, 1.4, shipGroup.position.z - 12);

    updateHud();
  }

  renderer.render(scene, camera);
}
animate();

// ─── Resize Handler ──────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
