/**
 * CARD DESIGN FLOATING - INFINITE 3D GRID & FLAT-TO-SCREEN ENGINE
 * Unlimited procedural floating cards + Smooth Click/Hold Flat-to-Screen transitions
 */

import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

// ─── DOM References ──────────────────────────────────────────────
const canvas = document.getElementById('webgl-canvas');
const btnToggleDrift = document.getElementById('btn-toggle-drift');
const driftLabel = document.getElementById('drift-label');
const btnResetView = document.getElementById('btn-reset-view');
const cardPills = document.querySelectorAll('.card-pill');
const btnCloseFlat = document.getElementById('btn-close-flat');
const instructionPill = document.getElementById('instruction-pill');

// ─── Three.js Scene Setup ────────────────────────────────────────
const scene = new THREE.Scene();

const isMobile = window.innerWidth < 768;
const defaultCamZ = isMobile ? 42.0 : 34.0;

const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 400);

const ISO_CAM_POS = new THREE.Vector3(2.0, 1.5, defaultCamZ);
const ISO_LOOK_AT = new THREE.Vector3(0, 0, 0);
camera.position.copy(ISO_CAM_POS);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ─── Orbit Controls (Configured for Infinite Panning) ────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.minDistance = 6;
controls.maxDistance = 90;
controls.target.copy(ISO_LOOK_AT);

controls.touches = {
  ONE: THREE.TOUCH.PAN,
  TWO: THREE.TOUCH.DOLLY_ROTATE
};

// ─── Studio Lighting ─────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xf8faff, 2.8);
keyLight.position.set(20, 35, 30);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.bias = -0.0004;
scene.add(keyLight);

const blueRim = new THREE.DirectionalLight(0x38bdf8, 2.0);
blueRim.position.set(-25, 15, -10);
scene.add(blueRim);

const pinkFill = new THREE.DirectionalLight(0xf472b6, 1.2);
pinkFill.position.set(0, -20, 15);
scene.add(pinkFill);

// ─── High-Fidelity Card Texture Generator ────────────────────────
function createCardCanvasTexture(config) {
  const w = 1500;
  const h = 1000;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.65, '#f8fafc');
  bg.addColorStop(1, '#eef2ff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Glow on right side
  const glow = ctx.createRadialGradient(w * 0.72, h * 0.5, 40, w * 0.72, h * 0.5, 420);
  glow.addColorStop(0, config.glowColor || 'rgba(224, 231, 255, 0.75)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Top Nav
  ctx.save();
  ctx.translate(65, 58);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, 0, 36, 36, 8);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('<', 18, 19);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 23px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EXITO', 48, 19);

  const links = ['Home', 'Service', 'About', 'Industries Served', 'Contact'];
  let lx = 180;
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';

  links.forEach((txt, idx) => {
    ctx.fillStyle = (idx === 0) ? '#0f172a' : '#64748b';
    ctx.fillText(txt, lx, 19);
    lx += ctx.measureText(txt).width + 30;
  });

  ctx.fillStyle = 'rgba(224, 231, 255, 0.65)';
  ctx.beginPath();
  ctx.roundRect(w - 250, -4, 115, 44, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(199, 210, 254, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sign in', w - 192, 19);

  ctx.restore();

  // Left Content
  ctx.save();
  ctx.translate(65, 270);

  if (config.badge) {
    ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.beginPath();
    ctx.roundRect(0, 0, ctx.measureText(config.badge).width + 36, 32, 16);
    ctx.fill();

    ctx.fillStyle = '#6366f1';
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(config.badge.toUpperCase(), 18, 20);
    ctx.translate(0, 52);
  }

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 62px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';

  const words = config.title.split(' ');
  let line = '';
  let y = 0;
  const maxWidth = 580;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 0, y);
      line = words[n] + ' ';
      y += 72;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 0, y);
  y += 88;

  ctx.fillStyle = '#64748b';
  ctx.font = '400 21px "Plus Jakarta Sans", sans-serif';
  const descWords = config.desc.split(' ');
  let dLine = '';
  const dMaxWidth = 540;

  for (let n = 0; n < descWords.length; n++) {
    const testLine = dLine + descWords[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > dMaxWidth && n > 0) {
      ctx.fillText(dLine, 0, y);
      dLine = descWords[n] + ' ';
      y += 34;
    } else {
      dLine = testLine;
    }
  }
  ctx.fillText(dLine, 0, y);
  y += 65;

  const btnLabel = config.btnText || 'Get started';
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, y, 180, 54, 27);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(btnLabel, 34, y + 34);
  ctx.fillText('→', 145, y + 34);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText('SCROLL DOWN ↓', 0, 590);

  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  return tex;
}

// ─── 3D Model Generators for Cards ───────────────────────────────
function createMiniCoin(radius = 0.95, thickness = 0.18) {
  const geom = new THREE.CylinderGeometry(radius, radius, thickness, 48);
  const matFace = new THREE.MeshPhysicalMaterial({ color: 0xf3e8ff, metalness: 0.96, roughness: 0.16, clearcoat: 0.8 });
  const matEdge = new THREE.MeshPhysicalMaterial({ color: 0xd8b4fe, metalness: 0.98, roughness: 0.2 });
  const mesh = new THREE.Mesh(geom, [matEdge, matFace, matFace]);
  mesh.castShadow = true;
  return mesh;
}

function createModelAiSphere() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.15, 24, 24), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 }));
  g.add(core);

  const count = 1800;
  const radius = 1.85;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c1 = new THREE.Color(0x00f3ff);
  const c2 = new THREE.Color(0xa855f7);

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = radius * Math.cos(phi);
    const c = c1.clone().lerp(c2, (pos[i * 3 + 1] + radius) / (radius * 2));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.9 }));
  g.add(points);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.025, 12, 64), new THREE.MeshBasicMaterial({ color: 0x9333ea, transparent: true, opacity: 0.45 }));
  ring.rotation.x = Math.PI / 3;
  g.add(ring);

  g.userData = { points, core, ring };
  return g;
}

function createModelThreeCoins() {
  const g = new THREE.Group();
  const coinItems = [];
  const c1 = createMiniCoin(0.95, 0.18); c1.position.set(-1.25, 0.35, 0.1); c1.rotation.set(0.6, -0.4, 0.2); g.add(c1); coinItems.push({ mesh: c1, speed: 1.1, phase: 0 });
  const c2 = createMiniCoin(1.05, 0.2); c2.position.set(0.15, 0.55, 0.45); c2.rotation.set(0.3, 0.2, -0.15); g.add(c2); coinItems.push({ mesh: c2, speed: 1.3, phase: 1.6 });
  const c3 = createMiniCoin(0.9, 0.16); c3.position.set(1.35, 0.45, -0.1); c3.rotation.set(0.8, 0.5, -0.3); g.add(c3); coinItems.push({ mesh: c3, speed: 1.0, phase: 3.1 });
  g.userData = { coins: coinItems };
  return g;
}

function createModelPedestal() {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.8), new THREE.MeshPhysicalMaterial({ color: 0xdb2777, metalness: 0.15, roughness: 0.2, clearcoat: 0.5 }));
  box.position.set(0, -0.4, 0); box.rotation.y = Math.PI / 4.5; g.add(box);

  const coin = createMiniCoin(0.88, 0.16); coin.position.set(0, 0.82, 0); coin.rotation.set(0.35, -0.2, 0.1); g.add(coin);

  const colors = [0x7c3aed, 0x2563eb, 0xf59e0b];
  const tori = [];
  colors.forEach((col, idx) => {
    const tMesh = new THREE.Mesh(new THREE.TorusGeometry(1.8 + idx * 0.22, 0.055, 12, 60), new THREE.MeshPhysicalMaterial({ color: col, metalness: 0.85, roughness: 0.2, clearcoat: 0.7 }));
    tMesh.position.set(0, -0.65 + idx * 0.28, 0);
    tMesh.rotation.set(Math.PI / 2.8 + idx * 0.15, idx * 0.4, 0);
    g.add(tMesh);
    tori.push(tMesh);
  });
  g.userData = { coin, box, tori };
  return g;
}

function createModelRibbon() {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, -1.0, -0.8), new THREE.Vector3(-1.5, 0.3, 0.7), new THREE.Vector3(0.0, 1.0, 0.25),
    new THREE.Vector3(1.7, 0.35, -0.5), new THREE.Vector3(3.2, -0.7, 0.7)
  ]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.28, 16, false), new THREE.MeshPhysicalMaterial({ color: 0xfce7f3, metalness: 0.3, roughness: 0.25, clearcoat: 0.8 }));
  g.add(tube);
  const coin = createMiniCoin(0.95, 0.18); coin.position.set(-0.15, 1.25, 0.35); coin.rotation.set(0.4, 0.3, -0.2); g.add(coin);
  g.userData = { coin, tube };
  return g;
}

function createModelOrbitTrack() {
  const g = new THREE.Group();
  const track = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.1, 16, 80), new THREE.MeshPhysicalMaterial({ color: 0x6366f1, metalness: 0.9, roughness: 0.2, clearcoat: 0.7 }));
  track.rotation.x = Math.PI / 2.6; track.rotation.y = Math.PI / 8; g.add(track);
  const coin = createMiniCoin(1.05, 0.2); coin.position.set(0, 0.25, 0); coin.rotation.set(0.3, 0.4, -0.1); g.add(coin);
  g.userData = { coin, track };
  return g;
}

function createModelFloatingDiscs() {
  const g = new THREE.Group();
  const discMat = new THREE.MeshPhysicalMaterial({ color: 0xfce7f3, transparent: true, opacity: 0.85, roughness: 0.2, transmission: 0.6 });
  [-1.0, 0.8].forEach((x, idx) => {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.12, 32), discMat);
    disc.position.set(x, -0.2 + idx * 0.5, idx * 0.3); disc.rotation.set(0.4, 0.3, -0.2); g.add(disc);
  });
  const coin = createMiniCoin(0.9, 0.16); coin.position.set(0, 0.6, 0.4); coin.rotation.set(0.5, 0.2, -0.1); g.add(coin);
  g.userData = { coin };
  return g;
}

function createModelSpatialWave() {
  const g = new THREE.Group();
  const wave = new THREE.Mesh(new THREE.TorusKnotGeometry(1.2, 0.3, 64, 16), new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, roughness: 0.2, metalness: 0.3, clearcoat: 0.8 }));
  g.add(wave);
  g.userData = { wave };
  return g;
}

// ─── 9 Core Design Archetypes (to populate the infinite field) ────
const CORE_DESIGNS = [
  { id: 'ai', title: 'AI Technology', badge: 'Neural Execution', desc: 'Artificial intelligence (AI) and FX trading with quantum computers represent cutting-edge technologies.', glowColor: 'rgba(224, 231, 255, 0.85)', modelFn: createModelAiSphere },
  { id: 'quantum', title: 'Quantum Computing in FX Trading', badge: 'Algorithmic Speed', desc: 'Combining AI and quantum computing in FX trading enhances predictions and speeds decision-making.', glowColor: 'rgba(243, 232, 255, 0.85)', modelFn: createModelThreeCoins },
  { id: 'about', title: 'About Us', badge: 'London Core', desc: 'Exito Technologies is a cutting-edge technology company based in the heart of London.', glowColor: 'rgba(252, 231, 243, 0.85)', modelFn: createModelPedestal },
  { id: 'revolution', title: 'Revolutionizing Financial Trading', badge: 'IP Valuation Boost', desc: 'Innovative IP Development Boosts Company Valuation with automated algorithmic execution.', glowColor: 'rgba(252, 231, 243, 0.8)', modelFn: createModelRibbon },
  { id: 'trading_top', title: 'Trading', badge: 'MetaQuotes Integration', desc: 'Licensed with MetaQuotes refers to trading in the exchange market using MT4 and MT5 platforms.', glowColor: 'rgba(238, 242, 255, 0.8)', modelFn: createModelRibbon },
  { id: 'experience', title: 'with experience', badge: 'Client Satisfaction', desc: 'Seamless multi-asset execution crafted for institutional hedge funds and high-frequency FX trading firms.', btnText: 'Learn more', glowColor: 'rgba(252, 231, 243, 0.8)', modelFn: createModelFloatingDiscs },
  { id: 'licensed', title: 'Licensed FX Trading', badge: 'Regulatory Compliance', desc: 'Licensed FX brokers offer MetaQuotes platforms under regulatory requirements ensuring secure trading environments.', glowColor: 'rgba(238, 242, 255, 0.85)', modelFn: createModelOrbitTrack },
  { id: 'industries', title: 'Industries Served', badge: 'Global Ecosystem', desc: 'Powering global liquidity providers, tier-1 investment banks, prime brokers, and proprietary trading desks.', glowColor: 'rgba(224, 242, 254, 0.8)', modelFn: createModelSpatialWave },
  { id: 'edge_ai', title: '-Edge AI Pending', badge: 'Proprietary IP', desc: 'Proprietary patent-pending quantum state forecasting architecture for high-velocity currency markets.', glowColor: 'rgba(240, 253, 250, 0.8)', modelFn: createModelOrbitTrack }
];

// Pre-generate textures for the 9 core designs to avoid memory bloat
const sharedTextures = CORE_DESIGNS.map(d => createCardCanvasTexture(d));

// ─── Infinite Procedural Grid Setup (5x5 Modular Matrix = 25 Cards) ──
const CARD_WIDTH = 11.8;
const CARD_HEIGHT = 8.0;
const CARD_DEPTH = 0.16;

const COLS = 5;
const ROWS = 5;
const SPACING_X = 14.5;
const SPACING_Y = 10.0;
const TOTAL_SPAN_X = COLS * SPACING_X; // 72.5
const TOTAL_SPAN_Y = ROWS * SPACING_Y; // 50.0

const tapestryMasterGroup = new THREE.Group();
const ISO_ROTATION = { x: -0.34, y: 0.36, z: 0.12 };
tapestryMasterGroup.rotation.set(ISO_ROTATION.x, ISO_ROTATION.y, ISO_ROTATION.z);
scene.add(tapestryMasterGroup);

const cardMeshes = [];

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const idx = r * COLS + c;
    const designIdx = idx % CORE_DESIGNS.length;
    const design = CORE_DESIGNS[designIdx];

    const posX = (c - (COLS - 1) / 2) * SPACING_X;
    const posY = ((ROWS - 1) / 2 - r) * SPACING_Y;

    const cardGroup = new THREE.Group();
    cardGroup.position.set(posX, posY, 0);

    // Card Mesh
    const cardGeo = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
    const cardMat = new THREE.MeshPhysicalMaterial({
      map: sharedTextures[designIdx],
      roughness: 0.18,
      metalness: 0.04,
      clearcoat: 0.65,
      clearcoatRoughness: 0.1
    });
    const cardMesh = new THREE.Mesh(cardGeo, cardMat);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    cardGroup.add(cardMesh);

    // Soft Shadow
    const shadowGeo = new THREE.PlaneGeometry(CARD_WIDTH + 2.2, CARD_HEIGHT + 2.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256; shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 70, 128, 128, 128);
    sGrad.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
    sGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(shadowCanvas),
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(-0.5, -0.7, -0.4);
    cardGroup.add(shadowMesh);

    // 3D Model
    if (design.modelFn) {
      const model = design.modelFn();
      model.position.set(2.6, 0.1, 0.95);
      cardGroup.add(model);
      cardGroup.userData.model = model;
    }

    cardGroup.userData.design = design;
    cardGroup.userData.designIdx = designIdx;
    cardGroup.userData.baseGridPos = new THREE.Vector3(posX, posY, 0);
    cardGroup.userData.currentGridPos = new THREE.Vector3(posX, posY, 0);
    cardGroup.userData.index = idx;

    // Animation state properties for flat transition
    cardGroup.userData.targetLocalPos = cardGroup.position.clone();
    cardGroup.userData.targetLocalQuat = new THREE.Quaternion().identity();
    cardGroup.userData.targetScale = new THREE.Vector3(1, 1, 1);
    cardGroup.userData.isFlat = false;

    tapestryMasterGroup.add(cardGroup);
    cardMeshes.push(cardGroup);
  }
}

// ─── Flat-to-Screen Animation Controller ─────────────────────────
let activeFlatCard = null;
let isDrifting = true;

function bringCardFlatToScreen(cardGroup) {
  if (activeFlatCard && activeFlatCard !== cardGroup) {
    returnCardToGrid(activeFlatCard);
  }

  activeFlatCard = cardGroup;
  cardGroup.userData.isFlat = true;

  // 1. Calculate Target Position in World Space (Centering squarely in front of camera)
  const forwardDir = new THREE.Vector3();
  camera.getWorldDirection(forwardDir);
  const targetDist = isMobile ? 12.5 : 10.0;
  const targetWorldPos = camera.position.clone().add(forwardDir.multiplyScalar(targetDist));

  // Convert to local position in tapestryMasterGroup
  const targetLocalPos = tapestryMasterGroup.worldToLocal(targetWorldPos);
  cardGroup.userData.targetLocalPos.copy(targetLocalPos);

  // 2. Calculate Target Quaternion so the card becomes 100% FLAT to the camera (0° tilt)
  const masterInverseQuat = tapestryMasterGroup.quaternion.clone().invert();
  const targetLocalQuat = masterInverseQuat.multiply(camera.quaternion);
  cardGroup.userData.targetLocalQuat.copy(targetLocalQuat);

  // 3. Target Scale: fill screen elegantly
  const scaleVal = isMobile ? 1.05 : 1.15;
  cardGroup.userData.targetScale.set(scaleVal, scaleVal, scaleVal);

  // Temporarily pause controls pan fighting while card is stationary in front
  controls.enabled = false;

  // Show Close Button
  btnCloseFlat.classList.remove('hidden');
  instructionPill.innerHTML = '<span class="pill-icon">✨</span><span class="pill-text">Card is flat in front of screen • Tap card or button to return to 3D grid</span>';

  // Highlight bottom pill
  updateActivePill(cardGroup.userData.designIdx);
}

function returnCardToGrid(cardGroup = activeFlatCard) {
  if (!cardGroup) return;

  cardGroup.userData.isFlat = false;

  // Return to current wrapped grid position
  cardGroup.userData.targetLocalPos.copy(cardGroup.userData.currentGridPos);
  cardGroup.userData.targetLocalQuat.identity(); // Conforms back to isometric master rotation
  cardGroup.userData.targetScale.set(1, 1, 1);

  activeFlatCard = null;
  controls.enabled = true;

  btnCloseFlat.classList.add('hidden');
  instructionPill.innerHTML = '<span class="pill-icon">👆</span><span class="pill-text">Pan infinitely in any direction • Click or hold any card to bring flat to screen</span>';
}

btnCloseFlat.addEventListener('click', (e) => {
  e.stopPropagation();
  returnCardToGrid();
});

// ─── Click / Press-and-Hold Detection ────────────────────────────
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let pointerDownTime = 0;
let pointerDownPos = { x: 0, y: 0 };
let heldCard = null;
let holdTimeout = null;

function onPointerDown(e) {
  if (e.target.closest('#studio-header') || e.target.closest('#bottom-card-bar') || e.target.closest('#btn-close-flat')) {
    return;
  }

  pointerDownTime = Date.now();
  pointerDownPos.x = e.clientX;
  pointerDownPos.y = e.clientY;

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(tapestryMasterGroup.children, true);

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj.parent && obj.parent !== tapestryMasterGroup) {
      obj = obj.parent;
    }

    if (obj.userData && obj.userData.design) {
      heldCard = obj;
      // Start Press-and-Hold timer (240ms threshold)
      clearTimeout(holdTimeout);
      holdTimeout = setTimeout(() => {
        if (heldCard) {
          bringCardFlatToScreen(heldCard);
        }
      }, 240);
    }
  } else {
    heldCard = null;
  }
}

function onPointerMove(e) {
  // If dragged more than 8px, cancel hold timer (user is panning the grid)
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  if (dist > 8) {
    clearTimeout(holdTimeout);
  }
}

function onPointerUp(e) {
  clearTimeout(holdTimeout);
  const pressDuration = Date.now() - pointerDownTime;
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);

  // If tap/click without drag (quick click or tap)
  if (dist < 8) {
    if (activeFlatCard) {
      // Tap while flat -> return card to grid!
      returnCardToGrid();
    } else if (heldCard) {
      // Tap on card -> bring flat to screen!
      bringCardFlatToScreen(heldCard);
    }
  }
  heldCard = null;
}

window.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// ─── Header & Bottom Controls ────────────────────────────────────
btnToggleDrift.addEventListener('click', () => {
  isDrifting = !isDrifting;
  driftLabel.textContent = isDrifting ? '✨ Drift: ON' : '⏸️ Drift: PAUSED';
  btnToggleDrift.style.borderColor = isDrifting ? '#6366f1' : '#cbd5e1';
});

btnResetView.addEventListener('click', () => {
  returnCardToGrid();
  camera.position.copy(ISO_CAM_POS);
  controls.target.copy(ISO_LOOK_AT);
  controls.update();
});

function updateActivePill(typeIdx) {
  cardPills.forEach(pill => {
    const isActive = parseInt(pill.dataset.type, 10) === typeIdx;
    pill.classList.toggle('active', isActive);
    if (isActive) {
      pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });
}

cardPills.forEach(pill => {
  pill.addEventListener('click', () => {
    const typeIdx = parseInt(pill.dataset.type, 10);
    updateActivePill(typeIdx);

    // Find the closest card matching this type
    const targetCard = cardMeshes.find(c => c.userData.designIdx === typeIdx);
    if (targetCard) {
      bringCardFlatToScreen(targetCard);
    }
  });
});

// ─── Main Animation & Render Loop ────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 1. Controls Update
  if (controls.enabled) {
    controls.update();
  }

  // 2. Infinite Wrapping & Floating Logic
  // Check camera target position in local space
  const localTarget = tapestryMasterGroup.worldToLocal(controls.target.clone());

  cardMeshes.forEach((card, idx) => {
    // If this card is currently flat in front of screen, do not wrap or drift!
    if (card.userData.isFlat) {
      card.position.lerp(card.userData.targetLocalPos, 0.08);
      card.quaternion.slerp(card.userData.targetLocalQuat, 0.08);
      card.scale.lerp(card.userData.targetScale, 0.08);
      return;
    }

    // Infinite Seamless Modular Wrapping (Cards wrap around camera target)
    let curX = card.userData.currentGridPos.x;
    let curY = card.userData.currentGridPos.y;

    const diffX = curX - localTarget.x;
    if (diffX > TOTAL_SPAN_X / 2) {
      curX -= TOTAL_SPAN_X;
    } else if (diffX < -TOTAL_SPAN_X / 2) {
      curX += TOTAL_SPAN_X;
    }

    const diffY = curY - localTarget.y;
    if (diffY > TOTAL_SPAN_Y / 2) {
      curY -= TOTAL_SPAN_Y;
    } else if (diffY < -TOTAL_SPAN_Y / 2) {
      curY += TOTAL_SPAN_Y;
    }

    card.userData.currentGridPos.x = curX;
    card.userData.currentGridPos.y = curY;

    // Gentle wave drift
    const floatZ = isDrifting ? Math.sin(elapsedTime * 1.4 + idx * 0.7) * 0.28 : 0;
    const floatY = isDrifting ? Math.sin(elapsedTime * 1.2 + idx * 0.5) * 0.15 : 0;

    // Smooth transition back to grid if returning
    card.userData.targetLocalPos.set(curX, curY + floatY, floatZ);

    card.position.lerp(card.userData.targetLocalPos, 0.06);
    card.quaternion.slerp(card.userData.targetLocalQuat, 0.06);
    card.scale.lerp(card.userData.targetScale, 0.06);

    // Animate embedded 3D models on cards
    const model = card.userData.model;
    if (model) {
      if (model.userData.points) {
        model.userData.points.rotation.y = elapsedTime * 0.3;
        model.userData.core.rotation.y = -elapsedTime * 0.4;
        model.userData.ring.rotation.z = elapsedTime * 0.5;
      }
      if (model.userData.coins) {
        model.userData.coins.forEach(c => {
          c.mesh.rotation.y += 0.015 * c.speed;
        });
      }
      if (model.userData.tori) {
        model.userData.coin.rotation.y += 0.015;
        model.userData.tori.forEach((t, tidx) => {
          t.rotation.z += 0.01 * (tidx + 1);
        });
      }
      if (model.userData.tube) {
        model.userData.coin.rotation.y += 0.018;
      }
      if (model.userData.track) {
        model.userData.coin.rotation.y += 0.02;
      }
      if (model.userData.wave) {
        model.userData.wave.rotation.x = elapsedTime * 0.2;
        model.userData.wave.rotation.y = elapsedTime * 0.3;
      }
    }
  });

  renderer.render(scene, camera);
}
animate();

// ─── Responsive Resize Handler ───────────────────────────────────
window.addEventListener('resize', () => {
  const isNowMobile = window.innerWidth < 768;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (!activeFlatCard) {
    camera.position.z = isNowMobile ? 42.0 : 34.0;
  }
});
