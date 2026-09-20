/**
 * EXITO 3D STUDIO - REAL-TIME WEBGL & INTERACTIVE ENGINE
 * High-performance Three.js procedural generation, PBR materials, & responsive controllers
 */

import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';

// ─── DOM Elements ────────────────────────────────────────────────
const canvas = document.getElementById('webgl-canvas');
const viewport = document.getElementById('canvas-viewport');
const cardTitle = document.getElementById('card-title');
const cardDesc = document.getElementById('card-desc');
const badgeText = document.getElementById('badge-text');
const activeSceneName = document.getElementById('active-scene-name');
const desktopNavBtns = document.querySelectorAll('.nav-link');
const mobileNavBtns = document.querySelectorAll('.mobile-nav-item');
const pillTabs = document.querySelectorAll('.pill-tab');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNavPanel = document.getElementById('mobile-nav-panel');
const btnSignin = document.getElementById('btn-signin');
const btnGetStarted = document.getElementById('btn-get-started');
const btnLearnMore = document.getElementById('btn-learn-more');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnModalOk = document.getElementById('btn-modal-ok');
const modalBackdrop = document.getElementById('modal-backdrop');
const btnAutoSpin = document.getElementById('btn-toggle-auto-spin');
const btnResetCam = document.getElementById('btn-reset-camera');

// ─── Scene Data Configuration ────────────────────────────────────
const SCENE_CONFIGS = {
  ai: {
    name: 'Quantum Hologram',
    badge: 'Neural Quantum Matrix',
    title: 'AI Technology',
    desc: 'Artificial intelligence (AI) and FX trading with quantum computers represent cutting-edge technologies that are revolutionising the financial markets.',
    camPos: { x: 0, y: 0.5, z: 6.8 },
    camTarget: { x: 0, y: 0, z: 0 }
  },
  quantum: {
    name: 'Quantum FX Tokens',
    badge: 'Algorithmic Execution',
    title: 'Quantum Computing in FX Trading',
    desc: 'Combining AI and quantum computing in FX trading enhances predictions, speeds decision-making, and improves risk management, empowering traders in dynamic financial markets.',
    camPos: { x: 0, y: 1.2, z: 7.2 },
    camTarget: { x: 0, y: 0.2, z: 0 }
  },
  about: {
    name: 'Pedestal Showcase',
    badge: 'London Financial Core',
    title: 'About Us',
    desc: 'Exito Technologies is a cutting-edge technology company based in the heart of London, architecting next-generation computational infrastructure for global financial ecosystems.',
    camPos: { x: 1.5, y: 1.8, z: 7.5 },
    camTarget: { x: 0, y: 0, z: 0 }
  },
  revolution: {
    name: 'Flowing Ribbon & Coin',
    badge: 'Enterprise IP Valuation',
    title: 'Revolutionizing Financial Trading with AI and Quantum Computing',
    desc: 'Innovative IP Development Boosts Company Valuation through hyper-liquid algorithmic execution and automated quantum state discovery.',
    camPos: { x: 0, y: 0.8, z: 7.0 },
    camTarget: { x: 0, y: 0, z: 0 }
  },
  trading: {
    name: 'Licensed FX Ecosystem',
    badge: 'Regulatory Compliance',
    title: 'Licensed FX Trading',
    desc: 'Licensed FX brokers offer MetaQuotes platforms under an agreement with MetaQuotes Software Corp. Ensuring secure, reliable, and latency-minimized financial execution environments.',
    camPos: { x: 0, y: 0.4, z: 6.5 },
    camTarget: { x: 0, y: 0, z: 0 }
  }
};

let currentSceneId = 'ai';
let isAutoSpinning = true;

// ─── Three.js Scene Setup ────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = null; // Transparent to inherit studio gradient background

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0.5, 6.8);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 14;
controls.minDistance = 3;
controls.enablePan = false;

// ─── Studio Lighting ─────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambientLight);

// Key Directional Light (Soft shadows, purple-blue tint)
const keyLight = new THREE.DirectionalLight(0xf5f3ff, 2.8);
keyLight.position.set(5, 8, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 25;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

// Rim Light (Electric cyan-blue)
const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
rimLight.position.set(-6, 4, -4);
scene.add(rimLight);

// Bottom Fill Light (Soft magenta-pink reflection)
const fillLight = new THREE.DirectionalLight(0xf472b6, 1.2);
fillLight.position.set(0, -5, 4);
scene.add(fillLight);

// Soft Ground Shadow Plane
const shadowPlaneGeo = new THREE.PlaneGeometry(16, 16);
const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.12 });
const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -2.2;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// ─── Procedural Texture Generators ───────────────────────────────
function createCoinFaceTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background smooth gradient
  const grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.7, '#f3e8ff');
  grad.addColorStop(1, '#d8b4fe');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Concentric Rings
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#c084fc';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#a855f7';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.41, 0, Math.PI * 2);
  ctx.stroke();

  // Fine outer tick marks (knurling aesthetic)
  const numTicks = 72;
  for (let i = 0; i < numTicks; i++) {
    const angle = (i / numTicks) * Math.PI * 2;
    const r1 = size * 0.44;
    const r2 = size * 0.47;
    ctx.beginPath();
    ctx.moveTo(size / 2 + Math.cos(angle) * r1, size / 2 + Math.sin(angle) * r1);
    ctx.lineTo(size / 2 + Math.cos(angle) * r2, size / 2 + Math.sin(angle) * r2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();
  }

  // Centered Stylized EXITO Emblem: "<"
  ctx.save();
  ctx.translate(size / 2, size / 2);

  // Soft glow
  ctx.shadowColor = 'rgba(147, 51, 234, 0.4)';
  ctx.shadowBlur = 15;

  ctx.beginPath();
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#9333ea';

  // Draw chevron <
  ctx.moveTo(35, -55);
  ctx.lineTo(-45, 0);
  ctx.lineTo(35, 55);
  ctx.stroke();

  // Inner highlight stroke
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

const coinFaceTex = createCoinFaceTexture();

// Metallic PBR Coin Material
function createCoinMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xf3e8ff,
    metalness: 0.95,
    roughness: 0.18,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    reflectivity: 1.0,
    map: coinFaceTex
  });
}

function createCoinEdgeMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xd8b4fe,
    metalness: 0.98,
    roughness: 0.22,
    clearcoat: 0.6
  });
}

// Reusable function to create an EXITO Coin Mesh
function createExitoCoin(radius = 1.3, thickness = 0.22) {
  const coinGroup = new THREE.Group();
  const segments = 64;

  const edgeMat = createCoinEdgeMaterial();
  const faceMat = createCoinMaterial();

  // Cylinder with face materials
  const geom = new THREE.CylinderGeometry(radius, radius, thickness, segments, 1, false);
  const materials = [
    edgeMat, // side rim
    faceMat, // top face
    faceMat  // bottom face
  ];

  const mesh = new THREE.Mesh(geom, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  coinGroup.add(mesh);

  return coinGroup;
}

// ─── 3D SCENE GROUPS ─────────────────────────────────────────────
const sceneContainers = {
  ai: new THREE.Group(),
  quantum: new THREE.Group(),
  about: new THREE.Group(),
  revolution: new THREE.Group(),
  trading: new THREE.Group()
};

Object.values(sceneContainers).forEach(g => scene.add(g));

// ─────────────────────────────────────────────────────────────────
// SCENE 1: AI TECHNOLOGY (Quantum Holographic Particle Sphere)
// ─────────────────────────────────────────────────────────────────
let quantumSpherePoints;
let quantumSpherePositionsOriginal;
let quantumCoreMesh;
let quantumOrbitalRing;

function initAiScene() {
  const group = sceneContainers.ai;

  // 1. Inner Glowing Core
  const coreGeo = new THREE.SphereGeometry(1.2, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.65,
    wireframe: false
  });
  quantumCoreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(quantumCoreMesh);

  // 2. Outer Dynamic Undulating Particle Sphere
  const pointCount = 3600;
  const radius = 2.05;
  const pointGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(pointCount * 3);
  const colors = new Float32Array(pointCount * 3);

  const colorCyan = new THREE.Color(0x38bdf8);
  const colorPurple = new THREE.Color(0xa855f7);
  const colorWhite = new THREE.Color(0xffffff);

  for (let i = 0; i < pointCount; i++) {
    // Golden ratio sphere distribution
    const phi = Math.acos(1 - 2 * (i + 0.5) / pointCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Iridescent color blend
    const lerpFactor = (y + radius) / (radius * 2);
    const c = colorCyan.clone().lerp(colorPurple, lerpFactor);
    if (Math.random() > 0.8) c.lerp(colorWhite, 0.7);

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  quantumSpherePositionsOriginal = new Float32Array(positions);

  const pointMat = new THREE.PointsMaterial({
    size: 0.052,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.NormalBlending
  });

  quantumSpherePoints = new THREE.Points(pointGeo, pointMat);
  group.add(quantumSpherePoints);

  // 3. Orbital Ring
  const ringGeo = new THREE.TorusGeometry(2.7, 0.02, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x9333ea,
    transparent: true,
    opacity: 0.4
  });
  quantumOrbitalRing = new THREE.Mesh(ringGeo, ringMat);
  quantumOrbitalRing.rotation.x = Math.PI / 3;
  quantumOrbitalRing.rotation.y = Math.PI / 6;
  group.add(quantumOrbitalRing);

  // 4. Subtle Outer Atmosphere Bubble
  const bubbleGeo = new THREE.SphereGeometry(2.2, 32, 32);
  const bubbleMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0e7ff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.1,
    transmission: 0.85,
    ior: 1.2
  });
  const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
  group.add(bubble);
}

// ─────────────────────────────────────────────────────────────────
// SCENE 2: QUANTUM COMPUTING IN FX (3 Floating Metallic Coins)
// ─────────────────────────────────────────────────────────────────
const quantumCoins = [];

function initQuantumScene() {
  const group = sceneContainers.quantum;

  // Coin 1: Left Coin (Angled view)
  const coin1 = createExitoCoin(1.2, 0.24);
  coin1.position.set(-1.8, 0.5, 0.2);
  coin1.rotation.set(0.6, -0.4, 0.2);
  group.add(coin1);
  quantumCoins.push({ mesh: coin1, basePos: { x: -1.8, y: 0.5, z: 0.2 }, speed: 1.2, phase: 0 });

  // Coin 2: Center Coin (Face prominent, slightly higher)
  const coin2 = createExitoCoin(1.35, 0.26);
  coin2.position.set(0.2, 0.7, 0.6);
  coin2.rotation.set(0.3, 0.2, -0.15);
  group.add(coin2);
  quantumCoins.push({ mesh: coin2, basePos: { x: 0.2, y: 0.7, z: 0.6 }, speed: 1.4, phase: 1.5 });

  // Coin 3: Right Coin (Rim & edge perspective tilt)
  const coin3 = createExitoCoin(1.15, 0.22);
  coin3.position.set(2.0, 0.6, -0.2);
  coin3.rotation.set(0.8, 0.5, -0.3);
  group.add(coin3);
  quantumCoins.push({ mesh: coin3, basePos: { x: 2.0, y: 0.6, z: -0.2 }, speed: 1.1, phase: 3.0 });
}

// ─────────────────────────────────────────────────────────────────
// SCENE 3: ABOUT US (Magenta Pedestal + Coin + Spiral Coils)
// ─────────────────────────────────────────────────────────────────
let pedestalCoin;
let pedestalBox;
const spiralTori = [];

function initAboutScene() {
  const group = sceneContainers.about;

  // 1. Vibrant Magenta / Hot Pink Cube Pedestal
  const boxGeo = new THREE.BoxGeometry(2.1, 1.9, 2.1);
  const boxMat = new THREE.MeshPhysicalMaterial({
    color: 0xdb2777, // Vibrant pink/magenta
    metalness: 0.15,
    roughness: 0.2,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1
  });
  pedestalBox = new THREE.Mesh(boxGeo, boxMat);
  pedestalBox.position.set(0, -0.6, 0);
  pedestalBox.rotation.y = Math.PI / 4.5;
  pedestalBox.castShadow = true;
  pedestalBox.receiveShadow = true;
  group.add(pedestalBox);

  // 2. Balanced Metallic Coin on Top Rim
  pedestalCoin = createExitoCoin(1.1, 0.2);
  pedestalCoin.position.set(0, 0.85, 0);
  pedestalCoin.rotation.set(0.35, -0.2, 0.1);
  group.add(pedestalCoin);

  // 3. Multi-color Spiraling Rings / Coils encircling the base
  const coilColors = [0x7c3aed, 0x2563eb, 0xf59e0b]; // Violet, Royal Blue, Gold
  const radii = [2.2, 2.45, 2.7];

  coilColors.forEach((col, idx) => {
    const torusGeo = new THREE.TorusGeometry(radii[idx], 0.08, 16, 80);
    const torusMat = new THREE.MeshPhysicalMaterial({
      color: col,
      metalness: 0.85,
      roughness: 0.2,
      clearcoat: 0.8
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(0, -0.8 + idx * 0.35, 0);
    torusMesh.rotation.set(Math.PI / 2.8 + idx * 0.15, idx * 0.4, 0);
    group.add(torusMesh);
    spiralTori.push({ mesh: torusMesh, speed: 0.4 + idx * 0.2 });
  });
}

// ─────────────────────────────────────────────────────────────────
// SCENE 4: REVOLUTIONIZING (Sweeping 3D Iridescent Ribbon & Coin)
// ─────────────────────────────────────────────────────────────────
let ribbonMesh;
let ribbonCoin;

function initRevolutionScene() {
  const group = sceneContainers.revolution;

  // CatmullRom Curve for sweeping ribbon
  const points = [
    new THREE.Vector3(-3.8, -1.2, -1.0),
    new THREE.Vector3(-1.8, 0.2, 0.8),
    new THREE.Vector3(0.0, 1.1, 0.2),
    new THREE.Vector3(2.0, 0.4, -0.6),
    new THREE.Vector3(3.8, -0.8, 0.8)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  curve.curveType = 'centripetal';

  // Ribbon Tube
  const tubeGeo = new THREE.TubeGeometry(curve, 100, 0.32, 16, false);
  const tubeMat = new THREE.MeshPhysicalMaterial({
    color: 0xfce7f3, // Soft pink-lilac
    metalness: 0.3,
    roughness: 0.25,
    clearcoat: 0.8,
    transmission: 0.2,
    ior: 1.3
  });

  ribbonMesh = new THREE.Mesh(tubeGeo, tubeMat);
  ribbonMesh.castShadow = true;
  ribbonMesh.receiveShadow = true;
  group.add(ribbonMesh);

  // Floating Coin resting above the peak
  ribbonCoin = createExitoCoin(1.25, 0.24);
  ribbonCoin.position.set(-0.2, 1.4, 0.3);
  ribbonCoin.rotation.set(0.4, 0.3, -0.2);
  group.add(ribbonCoin);
}

// ─────────────────────────────────────────────────────────────────
// SCENE 5: LICENSED FX TRADING (Looping Orbit Track & Hero Coin)
// ─────────────────────────────────────────────────────────────────
let tradingCoin;
let tradingTrack;

function initTradingScene() {
  const group = sceneContainers.trading;

  // Large Smooth Circular Track
  const trackGeo = new THREE.TorusGeometry(2.3, 0.12, 16, 100);
  const trackMat = new THREE.MeshPhysicalMaterial({
    color: 0x6366f1,
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 0.7
  });
  tradingTrack = new THREE.Mesh(trackGeo, trackMat);
  tradingTrack.rotation.x = Math.PI / 2.6;
  tradingTrack.rotation.y = Math.PI / 8;
  group.add(tradingTrack);

  // Hero Floating Coin in Center
  tradingCoin = createExitoCoin(1.4, 0.28);
  tradingCoin.position.set(0, 0.3, 0);
  tradingCoin.rotation.set(0.3, 0.4, -0.1);
  group.add(tradingCoin);
}

// Initialize all 3D components
initAiScene();
initQuantumScene();
initAboutScene();
initRevolutionScene();
initTradingScene();

// Set initial visibility
function updateSceneVisibility() {
  Object.keys(sceneContainers).forEach(key => {
    sceneContainers[key].visible = (key === currentSceneId);
  });
}
updateSceneVisibility();

// ─── CAMERA TRANSITION CONTROLLER ────────────────────────────────
let targetCamPos = new THREE.Vector3(0, 0.5, 6.8);
let targetLookAt = new THREE.Vector3(0, 0, 0);

function switchScene(sceneId) {
  if (!SCENE_CONFIGS[sceneId]) return;
  currentSceneId = sceneId;
  const config = SCENE_CONFIGS[sceneId];

  // Update UI Text & Badges
  cardTitle.textContent = config.title;
  cardDesc.textContent = config.desc;
  badgeText.textContent = config.badge;
  activeSceneName.textContent = config.name;

  // Trigger UI Animation
  const heroCard = document.getElementById('hero-card');
  heroCard.style.animation = 'none';
  void heroCard.offsetWidth; // trigger reflow
  heroCard.style.animation = 'fadeInText 0.45s cubic-bezier(0.16, 1, 0.3, 1)';

  // Update Nav Buttons
  desktopNavBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scene === sceneId);
  });
  mobileNavBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scene === sceneId);
  });
  pillTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.scene === sceneId);
  });

  // Update Camera Target
  targetCamPos.set(config.camPos.x, config.camPos.y, config.camPos.z);
  targetLookAt.set(config.camTarget.x, config.camTarget.y, config.camTarget.z);

  // Update 3D visibility
  updateSceneVisibility();

  // Close mobile nav if open
  mobileNavPanel.classList.remove('open');
}

// ─── EVENT LISTENERS ─────────────────────────────────────────────
desktopNavBtns.forEach(btn => {
  btn.addEventListener('click', () => switchScene(btn.dataset.scene));
});

mobileNavBtns.forEach(btn => {
  btn.addEventListener('click', () => switchScene(btn.dataset.scene));
});

pillTabs.forEach(tab => {
  tab.addEventListener('click', () => switchScene(tab.dataset.scene));
});

// Mobile Hamburger
mobileMenuBtn.addEventListener('click', () => {
  mobileNavPanel.classList.toggle('open');
});

// Auto-spin toggle
btnAutoSpin.addEventListener('click', () => {
  isAutoSpinning = !isAutoSpinning;
  btnAutoSpin.classList.toggle('active', isAutoSpinning);
  btnAutoSpin.innerHTML = isAutoSpinning ? '<span>🔄 Auto-Spin ON</span>' : '<span>⏸️ Paused</span>';
});

// Reset Camera
btnResetCam.addEventListener('click', () => {
  const config = SCENE_CONFIGS[currentSceneId];
  targetCamPos.set(config.camPos.x, config.camPos.y, config.camPos.z);
  targetLookAt.set(config.camTarget.x, config.camTarget.y, config.camTarget.z);
  camera.position.copy(targetCamPos);
  controls.target.copy(targetLookAt);
  controls.update();
});

// Scroll Indicator Click -> advance to next scene
document.getElementById('scroll-indicator').addEventListener('click', () => {
  const keys = Object.keys(SCENE_CONFIGS);
  const nextIdx = (keys.indexOf(currentSceneId) + 1) % keys.length;
  switchScene(keys[nextIdx]);
});

// Modal handlers
function openModal() {
  modalBackdrop.classList.add('open');
}
function closeModal() {
  modalBackdrop.classList.remove('open');
}

btnSignin.addEventListener('click', openModal);
btnGetStarted.addEventListener('click', openModal);
btnLearnMore.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnModalOk.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});

// ─── RESIZE & RESPONSIVE HANDLING ────────────────────────────────
function onResize() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}
window.addEventListener('resize', onResize);
onResize();

// ─── ANIMATION & RENDER LOOP ─────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Smooth Camera Lerp to Scene Target
  camera.position.lerp(targetCamPos, 0.04);
  controls.target.lerp(targetLookAt, 0.04);
  controls.update();

  // 1. Animate Scene: AI Quantum Sphere
  if (sceneContainers.ai.visible) {
    if (isAutoSpinning) {
      quantumSpherePoints.rotation.y = elapsedTime * 0.25;
      quantumSpherePoints.rotation.x = Math.sin(elapsedTime * 0.15) * 0.2;
      quantumCoreMesh.rotation.y = -elapsedTime * 0.35;
      quantumOrbitalRing.rotation.z = elapsedTime * 0.4;
    }

    // Procedural wave harmonics displacement on point sphere
    const posAttr = quantumSpherePoints.geometry.attributes.position;
    const currentPositions = posAttr.array;
    const count = currentPositions.length / 3;

    for (let i = 0; i < count; i++) {
      const ox = quantumSpherePositionsOriginal[i * 3];
      const oy = quantumSpherePositionsOriginal[i * 3 + 1];
      const oz = quantumSpherePositionsOriginal[i * 3 + 2];

      const wave = Math.sin(ox * 3.0 + elapsedTime * 3.0) * Math.cos(oy * 3.0 + elapsedTime * 2.0) * 0.16;
      currentPositions[i * 3] = ox * (1.0 + wave);
      currentPositions[i * 3 + 1] = oy * (1.0 + wave);
      currentPositions[i * 3 + 2] = oz * (1.0 + wave);
    }
    posAttr.needsUpdate = true;
  }

  // 2. Animate Scene: Quantum FX Coins
  if (sceneContainers.quantum.visible) {
    quantumCoins.forEach((item) => {
      const bob = Math.sin(elapsedTime * item.speed + item.phase) * 0.18;
      item.mesh.position.y = item.basePos.y + bob;

      if (isAutoSpinning) {
        item.mesh.rotation.y += 0.012 * item.speed;
        item.mesh.rotation.z = Math.sin(elapsedTime * 0.8 + item.phase) * 0.15;
      }
    });
  }

  // 3. Animate Scene: About Pedestal
  if (sceneContainers.about.visible) {
    if (isAutoSpinning) {
      pedestalCoin.rotation.y += 0.015;
      pedestalCoin.position.y = 0.85 + Math.sin(elapsedTime * 1.6) * 0.08;

      spiralTori.forEach(torus => {
        torus.mesh.rotation.z += 0.01 * torus.speed;
      });
    }
  }

  // 4. Animate Scene: Revolution Ribbon & Coin
  if (sceneContainers.revolution.visible) {
    if (isAutoSpinning) {
      ribbonCoin.rotation.y += 0.018;
      ribbonCoin.position.y = 1.4 + Math.sin(elapsedTime * 1.8) * 0.12;
      ribbonMesh.rotation.y = Math.sin(elapsedTime * 0.4) * 0.1;
    }
  }

  // 5. Animate Scene: Licensed FX Trading
  if (sceneContainers.trading.visible) {
    if (isAutoSpinning) {
      tradingCoin.rotation.y += 0.02;
      tradingCoin.position.y = 0.3 + Math.sin(elapsedTime * 1.5) * 0.1;
      tradingTrack.rotation.z += 0.008;
    }
  }

  renderer.render(scene, camera);
}

// Start Render Loop
animate();
