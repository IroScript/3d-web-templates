/**
 * EXITO · 3D ARTICLE & PUBLISHING UNIVERSE ENGINE
 * Spatial 3D Library • Decoupled Data Layer • Infinite Toroidal Matrix • Serene Reader Mode
 */

import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import { ARTICLES, CATEGORIES, queryArticles } from './articles-data.js';

// ─── DOM Elements ────────────────────────────────────────────────
const canvas = document.getElementById('webgl-canvas');
const btnToggleDrift = document.getElementById('btn-toggle-drift');
const driftLabel = document.getElementById('drift-label');
const btnResetView = document.getElementById('btn-reset-view');
const instructionPill = document.getElementById('instruction-pill');
const instructionText = document.getElementById('instruction-text');

// Search & Category Filters (Layer B)
const inputSearch = document.getElementById('input-article-search');
const btnClearSearch = document.getElementById('btn-clear-search');
const categoryPills = document.querySelectorAll('.card-pill');

// Flat Card Actions (Thumb-Zone at Bottom)
const flatCardActions = document.getElementById('flat-card-actions');
const btnReadArticle = document.getElementById('btn-read-article');
const btnCloseFlat = document.getElementById('btn-close-flat');

// Full Article Reader Modal (Layer C)
const readerModal = document.getElementById('article-reader-modal');
const readerProgressBar = document.getElementById('reader-progress-bar');
const readerScrollViewport = document.getElementById('reader-scroll-viewport');
const readerArticleContent = document.getElementById('reader-article-content');
const readerFooterAuthor = document.getElementById('reader-footer-author');
const readerNavCategory = document.getElementById('reader-nav-category');
const readerNavReadTime = document.getElementById('reader-nav-readtime');
const btnReaderBack = document.getElementById('btn-reader-back');
const btnReaderClose = document.getElementById('btn-reader-close');
const btnReaderFooterBack = document.getElementById('btn-reader-footer-back');
const btnReaderBookmark = document.getElementById('btn-reader-bookmark');
const bookmarkLabel = document.getElementById('bookmark-label');

// ─── App State ───────────────────────────────────────────────────
let currentSearch = '';
let currentCategory = 'All';
let activeArticles = [...ARTICLES];
let savedArticleIds = new Set();
let isDrifting = true;
let activeFlatCard = null;
let flatOpenedTime = 0;
let searchDebounceTimeout = null;

// ─── Three.js Scene Setup (Layer A: Spatial Browsing) ────────────
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

// ─── Orbit Controls ──────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.minDistance = 8;
controls.maxDistance = 90;
controls.target.copy(ISO_LOOK_AT);

controls.touches = {
  ONE: THREE.TOUCH.PAN,
  TWO: THREE.TOUCH.DOLLY_ROTATE
};

// ─── Lighting Rig ────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
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

// ─── Dynamic Article Canvas Texture Generator ────────────────────
const textureCache = new Map();

function createArticleCanvasTexture(article) {
  if (textureCache.has(article.id)) {
    return textureCache.get(article.id);
  }

  const w = 1500;
  const h = 1000;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // Background subtle gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.65, '#f8fafc');
  bg.addColorStop(1, '#eef2ff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Colored radial ambient glow
  const glow = ctx.createRadialGradient(w * 0.72, h * 0.5, 40, w * 0.72, h * 0.5, 440);
  glow.addColorStop(0, article.glowColor || 'rgba(99, 102, 241, 0.75)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Top Nav Bar
  ctx.save();
  ctx.translate(65, 58);

  // Logo Chevron & Brand
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
  ctx.font = '800 22px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EXITO PUBLISHING', 48, 19);

  // Reading time badge
  ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
  ctx.beginPath();
  ctx.roundRect(w - 380, -4, 130, 42, 21);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`⏱ ${article.readingTime.toUpperCase()}`, w - 315, 19);

  // Status Badge
  ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
  ctx.beginPath();
  ctx.roundRect(w - 230, -4, 115, 42, 21);
  ctx.fill();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#6366f1';
  ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(article.status.toUpperCase(), w - 172, 19);

  ctx.restore();

  // Left Content Body (Hierarchy L1 to L4)
  ctx.save();
  ctx.translate(65, 220);

  // Level 3: Category Pill
  ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
  ctx.beginPath();
  const catText = article.category.toUpperCase();
  ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
  const catWidth = ctx.measureText(catText).width + 36;
  ctx.roundRect(0, 0, catWidth, 34, 17);
  ctx.fill();

  ctx.fillStyle = '#6366f1';
  ctx.textAlign = 'left';
  ctx.fillText(catText, 18, 22);

  ctx.translate(0, 58);

  // Level 1: Article Title (Wrap cleanly)
  ctx.fillStyle = '#0f172a';
  ctx.font = '800 52px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';

  const titleWords = article.title.split(' ');
  let titleLine = '';
  let yPos = 0;
  const maxTitleWidth = 640;

  for (let n = 0; n < titleWords.length; n++) {
    const testLine = titleLine + titleWords[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTitleWidth && n > 0) {
      ctx.fillText(titleLine, 0, yPos);
      titleLine = titleWords[n] + ' ';
      yPos += 64;
    } else {
      titleLine = testLine;
    }
  }
  ctx.fillText(titleLine, 0, yPos);
  yPos += 76;

  // Level 2: Short Excerpt
  ctx.fillStyle = '#475569';
  ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
  const descWords = article.excerpt.split(' ');
  let descLine = '';
  const maxDescWidth = 600;

  for (let n = 0; n < descWords.length; n++) {
    const testLine = descLine + descWords[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxDescWidth && n > 0) {
      ctx.fillText(descLine, 0, yPos);
      descLine = descWords[n] + ' ';
      yPos += 36;
    } else {
      descLine = testLine;
    }
  }
  ctx.fillText(descLine, 0, yPos);
  yPos += 60;

  // Level 3: Author & Date Row
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(16, yPos + 10, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(article.author.charAt(0), 16, yPos + 14);

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(article.author, 44, yPos + 8);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`•  ${article.publishedAt}`, 44 + ctx.measureText(article.author).width + 16, yPos + 8);

  yPos += 54;

  // CTA Button: [ Read Article -> ]
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, yPos, 210, 56, 28);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Read Article  →', 34, yPos + 35);

  // Level 4: Tags
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(article.tags.map(t => `#${t}`).join('   '), 240, yPos + 35);

  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  textureCache.set(article.id, tex);
  return tex;
}

// ─── Procedural 3D Micro-Models for Cards ────────────────────────
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

  const count = 1600;
  const radius = 1.85;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c1 = new THREE.Color(0x00f3ff);
  const c2 = new THREE.Color(0x8b5cf6);

  for (let i = 0; i < count; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = 2 * Math.PI * Math.random();
    const r = radius * (0.88 + Math.random() * 0.24);
    pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    pos[i * 3 + 2] = r * Math.cos(theta);

    const mixed = c1.clone().lerp(c2, Math.random());
    col[i * 3] = mixed.r;
    col[i * 3 + 1] = mixed.g;
    col[i * 3 + 2] = mixed.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const pMat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.9 });
  const points = new THREE.Points(pGeo, pMat);
  g.add(points);

  const ringGeo = new THREE.TorusGeometry(2.0, 0.04, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  g.add(ring);

  g.userData = { points, core, ring };
  return g;
}

function createModelQuantum() {
  const g = new THREE.Group();
  const coin = createMiniCoin(1.15, 0.22);
  coin.rotation.x = 0.4;
  g.add(coin);

  const tori = [];
  const angles = [0.2, 0.8, -0.6];
  angles.forEach((ang, idx) => {
    const tGeo = new THREE.TorusGeometry(1.6 + idx * 0.35, 0.035, 16, 64);
    const tMat = new THREE.MeshBasicMaterial({ color: idx === 1 ? 0xa855f7 : 0x00f3ff, transparent: true, opacity: 0.85 });
    const t = new THREE.Mesh(tGeo, tMat);
    t.rotation.x = ang;
    t.rotation.y = idx * 1.1;
    g.add(t);
    tori.push(t);
  });

  const satCoins = [];
  for (let i = 0; i < 3; i++) {
    const sc = createMiniCoin(0.4, 0.1);
    sc.position.set(Math.cos(i * 2.1) * 2.1, Math.sin(i * 2.1) * 2.1, 0.2);
    g.add(sc);
    satCoins.push({ mesh: sc, speed: 0.8 + i * 0.4 });
  }

  g.userData = { coin, tori, coins: satCoins };
  return g;
}

function createModelPedestal() {
  const g = new THREE.Group();
  const coin = createMiniCoin(1.1, 0.2);
  coin.position.y = 0.65;
  coin.rotation.x = 0.25;
  g.add(coin);

  const p1 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.25, 6), new THREE.MeshPhysicalMaterial({ color: 0xec4899, roughness: 0.2, metalness: 0.8 }));
  p1.position.y = -0.6;
  g.add(p1);

  const p2 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.2, 6), new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, roughness: 0.3, metalness: 0.7 }));
  p2.position.y = -0.85;
  g.add(p2);

  g.userData = { coin };
  return g;
}

function createModelLoop() {
  const g = new THREE.Group();
  const coin = createMiniCoin(1.1, 0.2);
  coin.position.set(-0.2, 0.1, 0.2);
  g.add(coin);

  const loopGeo = new THREE.TorusGeometry(1.8, 0.08, 24, 72);
  const loopMat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, metalness: 0.9, roughness: 0.1, emissive: 0x1d4ed8, emissiveIntensity: 0.3 });
  const loop = new THREE.Mesh(loopGeo, loopMat);
  loop.rotation.x = 1.1;
  loop.rotation.y = 0.4;
  g.add(loop);

  g.userData = { coin, loop };
  return g;
}

function createModelWave() {
  const g = new THREE.Group();
  const coin = createMiniCoin(1.0, 0.18);
  g.add(coin);

  class SinCurve extends THREE.Curve {
    getPoint(t) {
      const tx = (t - 0.5) * 4.0;
      const ty = Math.sin(t * Math.PI * 4) * 0.7;
      const tz = Math.cos(t * Math.PI * 2) * 0.5;
      return new THREE.Vector3(tx, ty, tz);
    }
  }

  const waveGeo = new THREE.TubeGeometry(new SinCurve(), 64, 0.06, 8, false);
  const waveMat = new THREE.MeshBasicMaterial({ color: 0xf472b6 });
  const wave = new THREE.Mesh(waveGeo, waveMat);
  g.add(wave);

  g.userData = { coin, wave };
  return g;
}

function getModelForType(type) {
  switch (type) {
    case 'ai-sphere': return createModelAiSphere();
    case 'quantum': return createModelQuantum();
    case 'pedestal': return createModelPedestal();
    case 'loop': return createModelLoop();
    case 'wave': return createModelWave();
    default: return createModelAiSphere();
  }
}

// ─── Infinite Procedural Matrix Setup (5x5 Grid = 25 Cards) ──────
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
    const posX = (c - (COLS - 1) / 2) * SPACING_X;
    const posY = ((ROWS - 1) / 2 - r) * SPACING_Y;

    const cardGroup = new THREE.Group();
    cardGroup.position.set(posX, posY, 0);

    // Card Mesh
    const cardGeo = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
    const cardMat = new THREE.MeshPhysicalMaterial({
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

    // Model placeholder slot
    const modelContainer = new THREE.Group();
    modelContainer.position.set(2.6, 0.1, 0.95);
    cardGroup.add(modelContainer);

    cardGroup.userData = {
      index: idx,
      baseGridPos: new THREE.Vector3(posX, posY, 0),
      currentGridPos: new THREE.Vector3(posX, posY, 0),
      targetLocalPos: cardGroup.position.clone(),
      targetLocalQuat: new THREE.Quaternion().identity(),
      targetScale: new THREE.Vector3(1, 1, 1),
      isFlat: false,
      cardMesh,
      modelContainer,
      article: null
    };

    tapestryMasterGroup.add(cardGroup);
    cardMeshes.push(cardGroup);
  }
}

// ─── Virtualized Article Binding Engine ──────────────────────────
function bindArticlesToGrid() {
  if (activeArticles.length === 0) {
    instructionText.textContent = `No articles found for "${currentSearch}". Try another query.`;
    return;
  }

  cardMeshes.forEach((card, idx) => {
    const article = activeArticles[idx % activeArticles.length];
    card.userData.article = article;

    // Update texture
    const tex = createArticleCanvasTexture(article);
    card.userData.cardMesh.material.map = tex;
    card.userData.cardMesh.material.needsUpdate = true;

    // Update 3D micro-model
    const container = card.userData.modelContainer;
    while (container.children.length > 0) {
      container.remove(container.children[0]);
    }
    const model = getModelForType(article.modelType);
    container.add(model);
    card.userData.model = model;
  });

  if (currentSearch.trim() !== '') {
    instructionText.textContent = `Found ${activeArticles.length} article(s) matching "${currentSearch}"`;
  } else if (currentCategory !== 'All') {
    instructionText.textContent = `Category: ${currentCategory} (${activeArticles.length} articles)`;
  } else {
    instructionText.textContent = 'Pan 3D library • Tap any card to inspect or read';
  }
}

// Initial binding
bindArticlesToGrid();

// ─── Flat-to-Screen Transformation Controller ────────────────────
function calculateFlatTransform() {
  const dist = 18.0;
  const vFovRad = (camera.fov * Math.PI) / 180;
  const visibleH = 2 * dist * Math.tan(vFovRad / 2);
  const visibleW = visibleH * camera.aspect;

  const isPortrait = camera.aspect < 1.0;
  // Responsive occupancy leaving comfortable margins
  const maxOccupyW = isPortrait ? 0.88 : 0.70;
  const maxOccupyH = isPortrait ? 0.52 : 0.60;

  const maxAllowedW = visibleW * maxOccupyW;
  const maxAllowedH = visibleH * maxOccupyH;

  const scaleByW = maxAllowedW / CARD_WIDTH;
  const scaleByH = maxAllowedH / CARD_HEIGHT;
  const fitScale = Math.min(scaleByW, scaleByH);

  const forwardDir = new THREE.Vector3();
  camera.getWorldDirection(forwardDir);
  const targetWorldPos = camera.position.clone().add(forwardDir.multiplyScalar(dist));

  tapestryMasterGroup.updateMatrixWorld(true);
  const targetLocalPos = tapestryMasterGroup.worldToLocal(targetWorldPos);

  // Invert isometric tilt so card aligns 100% flat with camera sensor
  const masterInverseQuat = tapestryMasterGroup.quaternion.clone().invert();
  const targetLocalQuat = masterInverseQuat.multiply(camera.quaternion);

  return {
    localPos: targetLocalPos,
    localQuat: targetLocalQuat,
    scale: fitScale
  };
}

function bringCardFlatToScreen(cardGroup) {
  if (activeFlatCard && activeFlatCard !== cardGroup) {
    returnCardToGrid(activeFlatCard);
  }

  activeFlatCard = cardGroup;
  flatOpenedTime = Date.now();
  cardGroup.userData.isFlat = true;
  cardGroup.renderOrder = 999;

  const transform = calculateFlatTransform();
  cardGroup.userData.targetLocalPos.copy(transform.localPos);
  cardGroup.userData.targetLocalQuat.copy(transform.localQuat);
  cardGroup.userData.targetScale.set(transform.scale, transform.scale, transform.scale);

  // Pause pan fighting while stationary
  controls.enabled = false;

  // Show Thumb-Zone Actions
  flatCardActions.classList.remove('hidden');
  const article = cardGroup.userData.article;
  instructionText.textContent = `Focused: "${article.title.substring(0, 38)}..." • Tap READ ARTICLE`;
}

function returnCardToGrid(cardGroup = activeFlatCard) {
  if (!cardGroup) return;

  cardGroup.userData.isFlat = false;
  cardGroup.renderOrder = 0;

  cardGroup.userData.targetLocalPos.copy(cardGroup.userData.currentGridPos);
  cardGroup.userData.targetLocalQuat.identity();
  cardGroup.userData.targetScale.set(1, 1, 1);

  activeFlatCard = null;
  controls.enabled = true;

  flatCardActions.classList.add('hidden');
  instructionText.textContent = 'Pan 3D library • Tap any card to inspect or read';
}

btnCloseFlat.addEventListener('click', (e) => {
  e.stopPropagation();
  returnCardToGrid();
});

// ─── Markdown Parser for Article Reader ──────────────────────────
function parseMarkdown(md) {
  let html = '';
  const lines = md.trim().split('\n');
  let inCode = false;
  let codeBuffer = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCode) {
        html += `<pre><code>${codeBuffer.join('\n')}</code></pre>\n`;
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }

    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      const item = line.trim().substring(2);
      html += `<li>${formatInline(item)}</li>\n`;
      continue;
    } else if (inList) {
      html += '</ul>\n';
      inList = false;
    }

    if (line.trim().startsWith('# ')) {
      html += `<h1 class="article-hero-title">${formatInline(line.trim().substring(2))}</h1>\n`;
    } else if (line.trim().startsWith('## ')) {
      html += `<h2>${formatInline(line.trim().substring(3))}</h2>\n`;
    } else if (line.trim().startsWith('### ')) {
      html += `<h3>${formatInline(line.trim().substring(4))}</h3>\n`;
    } else if (line.trim().startsWith('> ')) {
      html += `<blockquote>${formatInline(line.trim().substring(2))}</blockquote>\n`;
    } else if (line.trim() === '---') {
      html += `<hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;" />\n`;
    } else if (line.trim() !== '') {
      html += `<p>${formatInline(line.trim())}</p>\n`;
    }
  }

  if (inList) html += '</ul>\n';
  if (inCode) html += `<pre><code>${codeBuffer.join('\n')}</code></pre>\n`;
  return html;
}

function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\`(.*?)\`/g, '<code>$1</code>');
}

// ─── Serene Full Article Reader Controller (Layer C) ─────────────
function openArticleReader(article) {
  if (!article) return;

  readerNavCategory.textContent = article.category.toUpperCase();
  readerNavReadTime.textContent = article.readingTime;

  // Render hero header + parsed markdown body
  const parsedBody = parseMarkdown(article.content);
  readerArticleContent.innerHTML = `
    <header class="article-hero-header">
      <span class="article-hero-category">${article.category}</span>
      <div class="article-hero-meta-row">
        <span class="meta-author">By ${article.author}</span>
        <span>•</span>
        <span>${article.publishedAt}</span>
        <span>•</span>
        <span>${article.readingTime}</span>
      </div>
    </header>
    <div class="article-excerpt-callout">${article.excerpt}</div>
    ${parsedBody}
    <div class="reader-tags-row">
      ${article.tags.map(t => `<span class="reader-tag">#${t}</span>`).join('')}
    </div>
  `;

  // Render author bio box
  readerFooterAuthor.innerHTML = `
    <div class="author-avatar">${article.author.charAt(0)}</div>
    <div class="author-info-wrap">
      <h4>${article.author}</h4>
      <p>${article.authorRole} • Exito Publishing Contributor</p>
    </div>
  `;

  // Update Bookmark State
  const isSaved = savedArticleIds.has(article.id);
  bookmarkLabel.textContent = isSaved ? 'Saved' : 'Save';
  btnReaderBookmark.style.borderColor = isSaved ? '#6366f1' : '#cbd5e1';

  readerModal.classList.remove('hidden');
  readerModal.setAttribute('aria-hidden', 'false');
  readerScrollViewport.scrollTop = 0;
  readerProgressBar.style.width = '0%';
}

function closeArticleReader() {
  readerModal.classList.add('hidden');
  readerModal.setAttribute('aria-hidden', 'true');
  // Return card smoothly back to stable 3D library
  returnCardToGrid();
}

btnReadArticle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (activeFlatCard && activeFlatCard.userData.article) {
    openArticleReader(activeFlatCard.userData.article);
  }
});

btnReaderBack.addEventListener('click', closeArticleReader);
btnReaderClose.addEventListener('click', closeArticleReader);
btnReaderFooterBack.addEventListener('click', closeArticleReader);

btnReaderBookmark.addEventListener('click', () => {
  if (activeFlatCard && activeFlatCard.userData.article) {
    const id = activeFlatCard.userData.article.id;
    if (savedArticleIds.has(id)) {
      savedArticleIds.delete(id);
      bookmarkLabel.textContent = 'Save';
      btnReaderBookmark.style.borderColor = '#cbd5e1';
    } else {
      savedArticleIds.add(id);
      bookmarkLabel.textContent = 'Saved';
      btnReaderBookmark.style.borderColor = '#6366f1';
    }
  }
});

// Scroll reading progress indicator
readerScrollViewport.addEventListener('scroll', () => {
  const scrollTotal = readerScrollViewport.scrollHeight - readerScrollViewport.clientHeight;
  if (scrollTotal > 0) {
    const percent = (readerScrollViewport.scrollTop / scrollTotal) * 100;
    readerProgressBar.style.width = `${percent}%`;
  }
});

// ─── Search & Category Filter Listeners (Layer B) ────────────────
inputSearch.addEventListener('input', (e) => {
  const q = e.target.value;
  btnClearSearch.classList.toggle('hidden', q.trim() === '');

  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    currentSearch = q;
    activeArticles = queryArticles(ARTICLES, currentSearch, currentCategory);
    if (activeFlatCard) returnCardToGrid();
    bindArticlesToGrid();
  }, 120);
});

btnClearSearch.addEventListener('click', () => {
  inputSearch.value = '';
  btnClearSearch.classList.add('hidden');
  currentSearch = '';
  activeArticles = queryArticles(ARTICLES, currentSearch, currentCategory);
  if (activeFlatCard) returnCardToGrid();
  bindArticlesToGrid();
});

categoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    categoryPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    currentCategory = pill.dataset.category;
    activeArticles = queryArticles(ARTICLES, currentSearch, currentCategory);
    if (activeFlatCard) returnCardToGrid();
    bindArticlesToGrid();
  });
});

btnResetView.addEventListener('click', () => {
  inputSearch.value = '';
  btnClearSearch.classList.add('hidden');
  currentSearch = '';
  currentCategory = 'All';
  categoryPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'All'));

  activeArticles = queryArticles(ARTICLES, '', 'All');
  if (activeFlatCard) returnCardToGrid();
  bindArticlesToGrid();

  camera.position.copy(ISO_CAM_POS);
  controls.target.copy(ISO_LOOK_AT);
  controls.update();
});

btnToggleDrift.addEventListener('click', () => {
  isDrifting = !isDrifting;
  driftLabel.textContent = isDrifting ? '✨ Drift: ON' : '⏸️ Drift: PAUSED';
  btnToggleDrift.style.borderColor = isDrifting ? '#6366f1' : '#cbd5e1';
});

// ─── Pointer Interaction & Touch Handling (Layer A) ──────────────
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let pointerDownTime = 0;
let pointerDownPos = { x: 0, y: 0 };
let heldCard = null;
let holdTimeout = null;

function onPointerDown(e) {
  if (
    e.target.closest('#studio-header') ||
    e.target.closest('#bottom-card-bar') ||
    e.target.closest('#flat-card-actions') ||
    e.target.closest('#article-reader-modal')
  ) {
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

    if (obj.userData && obj.userData.article) {
      heldCard = obj;
      clearTimeout(holdTimeout);
      // Press-and-hold (240ms threshold)
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
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  if (dist > 8) {
    clearTimeout(holdTimeout);
  }
}

function onPointerUp(e) {
  clearTimeout(holdTimeout);
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);

  if (dist < 8) {
    if (activeFlatCard) {
      // If opened < 350ms ago (from hold), prevent instant dismiss on finger lift
      if (Date.now() - flatOpenedTime > 350) {
        returnCardToGrid();
      }
    } else if (heldCard) {
      bringCardFlatToScreen(heldCard);
    }
  }
  heldCard = null;
}

window.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// ─── Main Animation & Render Loop ────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 1. Controls update
  if (controls.enabled) {
    controls.update();
  }

  // 2. Toroidal Matrix Wrapping relative to camera target
  const localTarget = tapestryMasterGroup.worldToLocal(controls.target.clone());

  cardMeshes.forEach((card, idx) => {
    // If flat in front, interpolate smoothly to target flat transform
    if (card.userData.isFlat) {
      card.position.lerp(card.userData.targetLocalPos, 0.08);
      card.quaternion.slerp(card.userData.targetLocalQuat, 0.08);
      card.scale.lerp(card.userData.targetScale, 0.08);
      return;
    }

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

    // Harmonic wave drift
    const floatZ = isDrifting ? Math.sin(elapsedTime * 1.4 + idx * 0.7) * 0.28 : 0;
    const floatY = isDrifting ? Math.sin(elapsedTime * 1.2 + idx * 0.5) * 0.15 : 0;

    card.userData.targetLocalPos.set(curX, curY + floatY, floatZ);

    card.position.lerp(card.userData.targetLocalPos, 0.06);
    card.quaternion.slerp(card.userData.targetLocalQuat, 0.06);
    card.scale.lerp(card.userData.targetScale, 0.06);

    // Animate embedded 3D micro-models
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
      if (model.userData.loop) {
        model.userData.coin.rotation.y += 0.018;
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

  if (activeFlatCard) {
    const transform = calculateFlatTransform();
    activeFlatCard.userData.targetLocalPos.copy(transform.localPos);
    activeFlatCard.userData.targetLocalQuat.copy(transform.localQuat);
    activeFlatCard.userData.targetScale.set(transform.scale, transform.scale, transform.scale);
  } else {
    camera.position.z = isNowMobile ? 42.0 : 34.0;
  }
});
