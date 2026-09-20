/**
 * CARD DESIGN FLOATING - COMPLETE TAPESTRY 3D SHOWCASE ENGINE
 * Full multi-card isometric canvas covering the entire picture with real-time WebGL models
 */

import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

// ─── DOM References ──────────────────────────────────────────────
const canvas = document.getElementById('webgl-canvas');
const btnModeIso = document.getElementById('btn-mode-iso');
const btnModeFocus = document.getElementById('btn-mode-focus');
const btnToggleDrift = document.getElementById('btn-toggle-drift');
const driftLabel = document.getElementById('drift-label');
const btnResetView = document.getElementById('btn-reset-view');
const cardPills = document.querySelectorAll('.card-pill');

// ─── Three.js Scene Setup ────────────────────────────────────────
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 300);

// Default Isometric Camera Orientation (Viewing the entire diagonal tapestry)
const ISO_CAM_POS = new THREE.Vector3(2.5, 1.5, 36.0);
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

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 6;
controls.maxDistance = 75;
controls.target.copy(ISO_LOOK_AT);

// ─── Studio Lighting ─────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xf8faff, 2.8);
keyLight.position.set(18, 30, 25);
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

  // Background smooth gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.65, '#f8fafc');
  bg.addColorStop(1, '#eef2ff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Soft Ambient Glow behind 3D model
  const glow = ctx.createRadialGradient(w * 0.72, h * 0.5, 40, w * 0.72, h * 0.5, 420);
  glow.addColorStop(0, config.glowColor || 'rgba(224, 231, 255, 0.75)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // 1. Top Navigation Bar
  ctx.save();
  ctx.translate(65, 58);

  // Logo Chevron
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, 0, 36, 36, 8);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('<', 18, 19);

  // Logo Text
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 23px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EXITO', 48, 19);

  // Nav links
  const links = ['Home', 'Service', 'About', 'Industries Served', 'Contact'];
  let lx = 180;
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';

  links.forEach((txt, idx) => {
    ctx.fillStyle = (idx === 0) ? '#0f172a' : '#64748b';
    ctx.fillText(txt, lx, 19);
    lx += ctx.measureText(txt).width + 30;
  });

  // Sign in pill
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

  // 2. Left Content Section
  ctx.save();
  ctx.translate(65, 270);

  // Category Badge Pill
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

  // Heading Title
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

  // Description
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

  // Primary Action Button: "Get started" / "Learn more"
  const btnLabel = config.btnText || 'Get started';
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, y, 180, 54, 27);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(btnLabel, 34, y + 34);
  ctx.fillText('→', 145, y + 34);

  // Scroll Down Indicator
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
  const matFace = new THREE.MeshPhysicalMaterial({
    color: 0xf3e8ff,
    metalness: 0.96,
    roughness: 0.16,
    clearcoat: 0.8
  });
  const matEdge = new THREE.MeshPhysicalMaterial({
    color: 0xd8b4fe,
    metalness: 0.98,
    roughness: 0.2
  });

  const mesh = new THREE.Mesh(geom, [matEdge, matFace, matFace]);
  mesh.castShadow = true;
  return mesh;
}

// 1. Quantum Holographic Particle Sphere
function createModelAiSphere() {
  const g = new THREE.Group();

  const coreGeo = new THREE.SphereGeometry(1.15, 24, 24);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  g.add(core);

  const count = 2200;
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
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const pMat = new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.9 });
  const points = new THREE.Points(pGeo, pMat);
  g.add(points);

  const ringGeo = new THREE.TorusGeometry(2.3, 0.025, 12, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, transparent: true, opacity: 0.45 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  g.add(ring);

  g.userData = { points, core, ring };
  return g;
}

// 2. Three Metallic FX Coins
function createModelThreeCoins() {
  const g = new THREE.Group();
  const coinItems = [];

  const coin1 = createMiniCoin(0.95, 0.18);
  coin1.position.set(-1.25, 0.35, 0.1);
  coin1.rotation.set(0.6, -0.4, 0.2);
  g.add(coin1);
  coinItems.push({ mesh: coin1, speed: 1.1, phase: 0 });

  const coin2 = createMiniCoin(1.05, 0.2);
  coin2.position.set(0.15, 0.55, 0.45);
  coin2.rotation.set(0.3, 0.2, -0.15);
  g.add(coin2);
  coinItems.push({ mesh: coin2, speed: 1.3, phase: 1.6 });

  const coin3 = createMiniCoin(0.9, 0.16);
  coin3.position.set(1.35, 0.45, -0.1);
  coin3.rotation.set(0.8, 0.5, -0.3);
  g.add(coin3);
  coinItems.push({ mesh: coin3, speed: 1.0, phase: 3.1 });

  g.userData = { coins: coinItems };
  return g;
}

// 3. Magenta Pedestal + Coin + Spiral Coils
function createModelPedestal() {
  const g = new THREE.Group();

  const boxGeo = new THREE.BoxGeometry(1.8, 1.5, 1.8);
  const boxMat = new THREE.MeshPhysicalMaterial({ color: 0xdb2777, metalness: 0.15, roughness: 0.2, clearcoat: 0.5 });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.set(0, -0.4, 0);
  box.rotation.y = Math.PI / 4.5;
  g.add(box);

  const coin = createMiniCoin(0.88, 0.16);
  coin.position.set(0, 0.82, 0);
  coin.rotation.set(0.35, -0.2, 0.1);
  g.add(coin);

  const colors = [0x7c3aed, 0x2563eb, 0xf59e0b];
  const tori = [];
  colors.forEach((col, idx) => {
    const tGeo = new THREE.TorusGeometry(1.8 + idx * 0.22, 0.055, 12, 60);
    const tMat = new THREE.MeshPhysicalMaterial({ color: col, metalness: 0.85, roughness: 0.2, clearcoat: 0.7 });
    const tMesh = new THREE.Mesh(tGeo, tMat);
    tMesh.position.set(0, -0.65 + idx * 0.28, 0);
    tMesh.rotation.set(Math.PI / 2.8 + idx * 0.15, idx * 0.4, 0);
    g.add(tMesh);
    tori.push(tMesh);
  });

  g.userData = { coin, box, tori };
  return g;
}

// 4. Sweeping Iridescent Ribbon & Coin
function createModelRibbon() {
  const g = new THREE.Group();

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, -1.0, -0.8),
    new THREE.Vector3(-1.5, 0.3, 0.7),
    new THREE.Vector3(0.0, 1.0, 0.25),
    new THREE.Vector3(1.7, 0.35, -0.5),
    new THREE.Vector3(3.2, -0.7, 0.7)
  ]);
  curve.curveType = 'centripetal';

  const tubeGeo = new THREE.TubeGeometry(curve, 90, 0.28, 16, false);
  const tubeMat = new THREE.MeshPhysicalMaterial({ color: 0xfce7f3, metalness: 0.3, roughness: 0.25, clearcoat: 0.8 });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  g.add(tube);

  const coin = createMiniCoin(0.95, 0.18);
  coin.position.set(-0.15, 1.25, 0.35);
  coin.rotation.set(0.4, 0.3, -0.2);
  g.add(coin);

  g.userData = { coin, tube };
  return g;
}

// 5. Looping Track & Hero Coin
function createModelOrbitTrack() {
  const g = new THREE.Group();

  const trackGeo = new THREE.TorusGeometry(1.85, 0.1, 16, 80);
  const trackMat = new THREE.MeshPhysicalMaterial({ color: 0x6366f1, metalness: 0.9, roughness: 0.2, clearcoat: 0.7 });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.rotation.x = Math.PI / 2.6;
  track.rotation.y = Math.PI / 8;
  g.add(track);

  const coin = createMiniCoin(1.05, 0.2);
  coin.position.set(0, 0.25, 0);
  coin.rotation.set(0.3, 0.4, -0.1);
  g.add(coin);

  g.userData = { coin, track };
  return g;
}

// 6. Floating Discs & Coin (Experience Card)
function createModelFloatingDiscs() {
  const g = new THREE.Group();

  const discMat = new THREE.MeshPhysicalMaterial({ color: 0xfce7f3, transparent: true, opacity: 0.85, roughness: 0.2, transmission: 0.6 });
  [-1.0, 0.8].forEach((x, idx) => {
    const discGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.12, 32);
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.set(x, -0.2 + idx * 0.5, idx * 0.3);
    disc.rotation.set(0.4, 0.3, -0.2);
    g.add(disc);
  });

  const coin = createMiniCoin(0.9, 0.16);
  coin.position.set(0, 0.6, 0.4);
  coin.rotation.set(0.5, 0.2, -0.1);
  g.add(coin);

  g.userData = { coin };
  return g;
}

// 7. Spatial Wave Backdrop (Industries Card)
function createModelSpatialWave() {
  const g = new THREE.Group();

  const waveGeo = new THREE.TorusKnotGeometry(1.2, 0.3, 64, 16);
  const waveMat = new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, roughness: 0.2, metalness: 0.3, clearcoat: 0.8 });
  const wave = new THREE.Mesh(waveGeo, waveMat);
  g.add(wave);

  g.userData = { wave };
  return g;
}

// ─── Complete Tapestry Cards Layout ──────────────────────────────
const CARD_WIDTH = 11.8;
const CARD_HEIGHT = 8.0;
const CARD_DEPTH = 0.16;

// Reconstructing the ENTIRE Picture's Cards in their 3D positions
const ALL_CARDS = [
  // Column 1: Top-Left & Mid-Left
  {
    id: 'trading_top',
    title: 'Trading',
    badge: 'MetaQuotes Integration',
    desc: 'Licensed with MetaQuotes refers to trading in the exchange market using MT4 and MT5 platforms.',
    pos: new THREE.Vector3(-14.2, 9.6, 0),
    glowColor: 'rgba(238, 242, 255, 0.8)',
    modelFn: createModelRibbon
  },
  {
    id: 'ai',
    title: 'AI Technology',
    badge: 'Neural Execution',
    desc: 'Artificial intelligence (AI) and FX trading with quantum computers represent cutting-edge technologies revolutionising financial markets.',
    pos: new THREE.Vector3(-14.2, 0, 0),
    glowColor: 'rgba(224, 231, 255, 0.85)',
    modelFn: createModelAiSphere
  },
  {
    id: 'revolution',
    title: 'Revolutionizing Financial Trading',
    badge: 'IP Valuation Boost',
    desc: 'Innovative IP Development Boosts Company Valuation with automated algorithmic execution and quantum state discovery.',
    pos: new THREE.Vector3(-14.2, -9.6, 0),
    glowColor: 'rgba(252, 231, 243, 0.8)',
    modelFn: createModelRibbon
  },

  // Column 2: Center Primary Column
  {
    id: 'experience',
    title: 'with experience',
    badge: 'Client Satisfaction',
    desc: 'Seamless multi-asset execution crafted for institutional hedge funds and high-frequency FX trading firms.',
    pos: new THREE.Vector3(0, 9.6, 0),
    btnText: 'Learn more',
    glowColor: 'rgba(252, 231, 243, 0.8)',
    modelFn: createModelFloatingDiscs
  },
  {
    id: 'quantum',
    title: 'Quantum Computing in FX Trading',
    badge: 'Algorithmic Speed',
    desc: 'Combining AI and quantum computing in FX trading enhances predictions, speeds decision-making, and improves risk management.',
    pos: new THREE.Vector3(0, 0, 0),
    glowColor: 'rgba(243, 232, 255, 0.85)',
    modelFn: createModelThreeCoins
  },
  {
    id: 'about',
    title: 'About Us',
    badge: 'London Core',
    desc: 'Exito Technologies is a cutting-edge technology company based in the heart of London, developing enterprise-grade quantum trading engines.',
    pos: new THREE.Vector3(0, -9.6, 0),
    glowColor: 'rgba(252, 231, 243, 0.85)',
    modelFn: createModelPedestal
  },

  // Column 3: Right Column
  {
    id: 'industries',
    title: 'Industries Served',
    badge: 'Global Ecosystem',
    desc: 'Powering global liquidity providers, tier-1 investment banks, prime brokers, and proprietary trading desks.',
    pos: new THREE.Vector3(14.2, 9.6, 0),
    glowColor: 'rgba(224, 242, 254, 0.8)',
    modelFn: createModelSpatialWave
  },
  {
    id: 'licensed',
    title: 'Licensed FX Trading',
    badge: 'Regulatory Compliance',
    desc: 'Licensed FX brokers offer MetaQuotes platforms under an agreement with MetaQuotes Software Corp ensuring secure trading environments.',
    pos: new THREE.Vector3(14.2, 0, 0),
    glowColor: 'rgba(238, 242, 255, 0.85)',
    modelFn: createModelOrbitTrack
  },
  {
    id: 'edge_ai',
    title: '-Edge AI Pending',
    badge: 'Proprietary IP',
    desc: 'Proprietary patent-pending quantum state forecasting architecture for high-velocity currency markets.',
    pos: new THREE.Vector3(14.2, -9.6, 0),
    glowColor: 'rgba(240, 253, 250, 0.8)',
    modelFn: createModelOrbitTrack
  }
];

// Master Tapestry Container
const tapestryMasterGroup = new THREE.Group();

// Isometric Tapestry Rotation Angles (matching the exact perspective in screenshot)
const ISO_ROTATION = { x: -0.34, y: 0.36, z: 0.12 };
tapestryMasterGroup.rotation.set(ISO_ROTATION.x, ISO_ROTATION.y, ISO_ROTATION.z);
scene.add(tapestryMasterGroup);

const cardMeshes = [];

ALL_CARDS.forEach((data, index) => {
  const cardGroup = new THREE.Group();
  cardGroup.position.copy(data.pos);
  cardGroup.userData = { data, index, basePos: data.pos.clone() };

  // 1. Front Card Mesh with Canvas Texture
  const tex = createCardCanvasTexture(data);
  const cardMat = new THREE.MeshPhysicalMaterial({
    map: tex,
    roughness: 0.18,
    metalness: 0.04,
    clearcoat: 0.65,
    clearcoatRoughness: 0.1
  });

  const cardGeo = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.castShadow = true;
  cardMesh.receiveShadow = true;
  cardGroup.add(cardMesh);

  // 2. Soft Drop Shadow Mesh beneath card
  const shadowGeo = new THREE.PlaneGeometry(CARD_WIDTH + 2.2, CARD_HEIGHT + 2.2);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d');
  const sGrad = sCtx.createRadialGradient(128, 128, 70, 128, 128, 128);
  sGrad.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
  sGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 256, 256);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.set(-0.5, -0.7, -0.4);
  cardGroup.add(shadowMesh);

  // 3. Embedded 3D Model on Right Stage of Card
  if (data.modelFn) {
    const model = data.modelFn();
    model.position.set(2.6, 0.1, 0.95);
    cardGroup.add(model);
    cardGroup.userData.model = model;
  }

  tapestryMasterGroup.add(cardGroup);
  cardMeshes.push(cardGroup);
});

// ─── Camera Glide & Focus Controller (NO POPUP MODAL) ───────────
let targetCamPos = ISO_CAM_POS.clone();
let targetLookAt = ISO_LOOK_AT.clone();
let targetGroupRot = { ...ISO_ROTATION };
let isFocused = false;
let isDrifting = true;
let currentFocusIdx = 4; // default on center Quantum Computing card

function setViewMode(mode, targetCardIdx = 4) {
  if (mode === 'iso') {
    isFocused = false;
    btnModeIso.classList.add('active');
    btnModeFocus.classList.remove('active');

    targetCamPos.copy(ISO_CAM_POS);
    targetLookAt.copy(ISO_LOOK_AT);
    targetGroupRot = { ...ISO_ROTATION };
    controls.enabled = true;
  } else if (mode === 'focus') {
    isFocused = true;
    currentFocusIdx = targetCardIdx;
    btnModeFocus.classList.add('active');
    btnModeIso.classList.remove('active');

    const card = cardMeshes[targetCardIdx];
    const worldPos = new THREE.Vector3();
    card.getWorldPosition(worldPos);

    // Smoothly position camera directly in front of the card for close inspection
    targetCamPos.set(worldPos.x, worldPos.y, worldPos.z + 11.5);
    targetLookAt.copy(worldPos);
    targetGroupRot = { x: 0, y: 0, z: 0 }; // Straight orientation
  }
}

// ─── Raycaster: Tap/Click card to Glide Into Focus (NO POPUP) ─────
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerDown(e) {
  // Prevent raycast if clicking UI header or footer
  if (e.target.closest('#studio-header') || e.target.closest('#bottom-card-bar')) {
    return;
  }

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(tapestryMasterGroup.children, true);

  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj.parent && obj.parent !== tapestryMasterGroup) {
      obj = obj.parent;
    }

    if (obj.userData && obj.userData.data) {
      const idx = obj.userData.index;
      updateActiveCardPill(obj.userData.data.id);
      // Smoothly glide camera into focus — NO MODAL POPUP!
      setViewMode('focus', idx);
    }
  }
}
window.addEventListener('pointerdown', onPointerDown);

// ─── Header UI Buttons ───────────────────────────────────────────
btnModeIso.addEventListener('click', () => setViewMode('iso'));
btnModeFocus.addEventListener('click', () => setViewMode('focus', currentFocusIdx));

btnToggleDrift.addEventListener('click', () => {
  isDrifting = !isDrifting;
  driftLabel.textContent = isDrifting ? '✨ Floating Drift: ON' : '⏸️ Drift: PAUSED';
  btnToggleDrift.style.borderColor = isDrifting ? '#6366f1' : '#cbd5e1';
});

btnResetView.addEventListener('click', () => {
  setViewMode('iso');
  camera.position.copy(ISO_CAM_POS);
  controls.target.copy(ISO_LOOK_AT);
  controls.update();
});

// ─── Bottom Navigation Card Pills ────────────────────────────────
function updateActiveCardPill(cardId) {
  cardPills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.card === cardId);
  });
}

cardPills.forEach(pill => {
  pill.addEventListener('click', () => {
    const cardId = pill.dataset.card;
    const targetIdx = ALL_CARDS.findIndex(c => c.id === cardId);
    if (targetIdx >= 0) {
      updateActiveCardPill(cardId);
      setViewMode('focus', targetIdx);
    }
  });
});

// ─── Mouse Tilt Parallax ─────────────────────────────────────────
let mouseX = 0;
let mouseY = 0;
window.addEventListener('pointermove', (e) => {
  mouseX = (e.clientX / window.innerWidth) - 0.5;
  mouseY = (e.clientY / window.innerHeight) - 0.5;
});

// ─── Main Animation & Render Loop ────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 1. Smooth Camera Glide Lerp
  camera.position.lerp(targetCamPos, 0.055);
  controls.target.lerp(targetLookAt, 0.055);
  controls.update();

  // 2. Smooth Tapestry Rotation Lerp
  tapestryMasterGroup.rotation.x = THREE.MathUtils.lerp(
    tapestryMasterGroup.rotation.x,
    targetGroupRot.x + (isFocused ? 0 : mouseY * 0.12),
    0.05
  );
  tapestryMasterGroup.rotation.y = THREE.MathUtils.lerp(
    tapestryMasterGroup.rotation.y,
    targetGroupRot.y + (isFocused ? 0 : mouseX * 0.16),
    0.05
  );
  tapestryMasterGroup.rotation.z = THREE.MathUtils.lerp(
    tapestryMasterGroup.rotation.z,
    targetGroupRot.z,
    0.05
  );

  // 3. Floating Card Wave Drift Animation
  cardMeshes.forEach((card, idx) => {
    if (isDrifting) {
      const floatOffset = Math.sin(elapsedTime * 1.4 + idx * 0.9) * 0.28;
      card.position.z = card.userData.basePos.z + floatOffset;
      card.position.y = card.userData.basePos.y + floatOffset * 0.25;
    }

    // Animate embedded 3D models on cards
    const model = card.userData.model;
    if (model) {
      // Model 1: AI Sphere
      if (model.userData.points) {
        model.userData.points.rotation.y = elapsedTime * 0.3;
        model.userData.core.rotation.y = -elapsedTime * 0.4;
        model.userData.ring.rotation.z = elapsedTime * 0.5;
      }
      // Model 2: Three Coins
      if (model.userData.coins) {
        model.userData.coins.forEach(c => {
          c.mesh.rotation.y += 0.015 * c.speed;
          c.mesh.position.y += Math.sin(elapsedTime * 2.0 + c.phase) * 0.003;
        });
      }
      // Model 3: Pedestal
      if (model.userData.tori) {
        model.userData.coin.rotation.y += 0.015;
        model.userData.tori.forEach((t, tidx) => {
          t.rotation.z += 0.01 * (tidx + 1);
        });
      }
      // Model 4: Ribbon
      if (model.userData.tube) {
        model.userData.coin.rotation.y += 0.018;
        model.userData.tube.rotation.y = Math.sin(elapsedTime * 0.5) * 0.08;
      }
      // Model 5: Orbit Track
      if (model.userData.track) {
        model.userData.coin.rotation.y += 0.02;
        model.userData.track.rotation.z += 0.01;
      }
      // Model 6: Floating Discs
      if (model.userData.coin) {
        model.userData.coin.rotation.y += 0.015;
      }
      // Model 7: Spatial Wave
      if (model.userData.wave) {
        model.userData.wave.rotation.x = elapsedTime * 0.2;
        model.userData.wave.rotation.y = elapsedTime * 0.3;
      }
    }
  });

  renderer.render(scene, camera);
}
animate();

// ─── Responsive Window Resize ────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
