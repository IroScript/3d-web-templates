/**
 * ═══════════════════════════════════════════════════════════════════
 * TRUE 3D SPATIAL ARTICLE READING ENGINE
 * ═══════════════════════════════════════════════════════════════════
 * Features:
 * - 3 Distinct Spatial Worlds:
 *   1. Spatial Library (Pedestals, steles & architectural bookshelf arches)
 *   2. Knowledge Tunnel (Continuous luminous hexagonal corridor)
 *   3. Knowledge Constellation (Synaptic cosmic helix with orbital steles)
 * - 5 Reading Modes:
 *   1. 3D Read (Continuous spatial travel through the article world)
 *   2. Focus (Distraction-free stabilized reading surface)
 *   3. Hybrid (70% crystal editorial panel + 30% live 3D scene)
 *   4. Explore (Free orbital inspection with interactive raycasting)
 *   5. 2D Fallback View (Traditional accessible editorial layout)
 * - Interactive 3D Content Elements:
 *   • 3D Typographic Quote Sculptures
 *   • 5-Point 3D Interactive Timeline (2017–2035)
 *   • 4-Column 3D Interactive Data Visualization (Compute vs Efficiency)
 *   • 5-Node 3D Interactive Concept Network (Neuro-Symbolic Constellation)
 * - Multi-Layer Information Depth (Layer 1: Essential, 2: Context, 3: Research)
 * - Full Touch & Keyboard Ergonomics, Web Audio API, URL Hash & LocalStorage
 */

import * as THREE from 'three';
import { OrbitControls } from '../OrbitControls.js';
import { ARTICLE_DATA } from './article-data.js';

// ─── Application State ───────────────────────────────────────────
const state = {
  currentSection: 0,
  currentWorld: 'library', // 'library' | 'tunnel' | 'constellation'
  currentMode: 'spatial',   // 'spatial' | 'focus' | 'hybrid' | 'explore' | 'fallback'
  motion: 'full',           // 'full' | 'reduced' | 'off'
  audioEnabled: true,
  debug: false,
  activeLayer: 'essential', // 'essential' | 'context' | 'research'
  isTransitioning: false,
  raycastActive: true
};

// ─── DOM References ──────────────────────────────────────────────
const canvas = document.getElementById('spatial-canvas');
const spaceAmbientGlow = document.getElementById('space-ambient-glow');
const hudArticleTitle = document.getElementById('hud-article-title');
const spatialHintPill = document.getElementById('spatial-hint-pill');
const hintMessage = document.getElementById('hint-message');

const modeButtons = document.querySelectorAll('.spatial-mode-btn');
const btnWorldSelect = document.getElementById('btn-world-select');
const worldDropdown = document.getElementById('world-dropdown');
const worldMenu = document.getElementById('world-menu');
const worldOptions = document.querySelectorAll('.world-opt');
const activeWorldName = document.getElementById('active-world-name');

const btnToggleAudio = document.getElementById('btn-toggle-audio');
const audioIcon = document.getElementById('audio-icon');
const audioLabel = document.getElementById('audio-label');
const btnToggleMotion = document.getElementById('btn-toggle-motion');
const motionIcon = document.getElementById('motion-icon');
const motionLabel = document.getElementById('motion-label');
const btnResetCam = document.getElementById('btn-reset-cam');
const btnToggleDebug = document.getElementById('btn-toggle-debug');

const btnToggleOutline = document.getElementById('btn-toggle-outline');
const outlineDrawer = document.getElementById('spatial-outline-drawer');
const outlineBackdrop = document.getElementById('outline-backdrop');
const btnCloseOutline = document.getElementById('btn-close-outline');
const outlineNavList = document.getElementById('outline-nav-list');
const outlineProgressFill = document.getElementById('outline-progress-fill');
const outlineSectionLabel = document.getElementById('outline-section-label');
const outlinePercentage = document.getElementById('outline-percentage');

// Spatial Focus Surface
const focusSurface = document.getElementById('spatial-focus-surface');
const focusZoneTag = document.getElementById('focus-zone-tag');
const focusChapterTag = document.getElementById('focus-chapter-tag');
const focusTitle = document.getElementById('focus-title');
const focusParagraphs = document.getElementById('focus-paragraphs');
const layerTabs = document.querySelectorAll('.layer-tab');
const layerPanels = document.querySelectorAll('.layer-content-panel');
const focusContextText = document.getElementById('focus-context-text');
const focusResearchText = document.getElementById('focus-research-text');
const surfaceQuoteBox = document.getElementById('surface-quote-box');
const surfaceQuoteText = document.getElementById('surface-quote-text');
const surfaceQuoteAuthor = document.getElementById('surface-quote-author');
const surfaceInteractiveBadge = document.getElementById('surface-interactive-badge');
const surfaceInteractiveText = document.getElementById('surface-interactive-text');
const btnInspect3d = document.getElementById('btn-inspect-3d');

// Thumb Bar
const btnNavPrev = document.getElementById('btn-nav-prev');
const btnNavNext = document.getElementById('btn-nav-next');
const hudChapterBadge = document.getElementById('hud-chapter-badge');
const hudProgressFill = document.getElementById('hud-progress-fill');
const hudPageDetail = document.getElementById('hud-page-detail');
const btnOpenOutlineThumb = document.getElementById('btn-open-outline-thumb');

// Inspect Modal
const inspectModal = document.getElementById('spatial-inspect-modal');
const modalBadge = document.getElementById('modal-badge');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalBtnClose = document.getElementById('modal-btn-close');

// Fallback View
const fallbackView = document.getElementById('fallback-2d-view');
const fallbackBodyContent = document.getElementById('fallback-body-content');
const btnReturn3d = document.getElementById('btn-return-3d');

// Debug HUD
const debugHud = document.getElementById('debug-hud');
const dbgFps = document.getElementById('dbg-fps');
const dbgDrawcalls = document.getElementById('dbg-drawcalls');
const dbgObjects = document.getElementById('dbg-objects');
const dbgWorld = document.getElementById('dbg-world');
const dbgSection = document.getElementById('dbg-section');
const dbgCamPos = document.getElementById('dbg-cam-pos');
const dbgCamTarget = document.getElementById('dbg-cam-target');

// ─── Web Audio API (Procedural Sound Design) ─────────────────────
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq = 440, type = 'sine', duration = 0.25, volume = 0.15) {
  if (!state.audioEnabled) return;
  try {
    initAudioContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio non-blocking
  }
}

function playTransitionSound() {
  if (!state.audioEnabled) return;
  playTone(523.25, 'sine', 0.35, 0.12); // C5 harmonic
}

function playClickSound() {
  if (!state.audioEnabled) return;
  playTone(880, 'triangle', 0.12, 0.08); // A5 tick
}

// ─── Three.js Scene Setup ─────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050811);
scene.fog = new THREE.FogExp2(0x050811, 0.008);

const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 800);
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.6;
controls.zoomSpeed = 0.8;
controls.panSpeed = 0.5;
controls.maxDistance = 60;
controls.minDistance = 3;

// Lighting Rig
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.4);
keyLight.position.set(12, 24, 18);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x00f3ff, 2.0);
rimLight.position.set(-15, -10, -15);
scene.add(rimLight);

const accentLight = new THREE.PointLight(0x6366f1, 3.5, 40);
accentLight.position.set(0, 5, 0);
scene.add(accentLight);

// Floating Cosmic Dust Particles
const dustCount = 600;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
const dustCol = new Float32Array(dustCount * 3);

for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3 + 0] = (Math.random() - 0.5) * 160;
  dustPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 220;

  const colorChoice = Math.random() > 0.5 ? new THREE.Color(0x00f3ff) : new THREE.Color(0x6366f1);
  dustCol[i * 3 + 0] = colorChoice.r;
  dustCol[i * 3 + 1] = colorChoice.g;
  dustCol[i * 3 + 2] = colorChoice.b;
}

dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3));

const dustMat = new THREE.PointsMaterial({
  size: 0.28,
  vertexColors: true,
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending
});
const dustParticles = new THREE.Points(dustGeo, dustMat);
scene.add(dustParticles);

// ─── Raycasting & Interactivity ──────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-999, -999);
const interactiveObjects = []; // Clickable items

// ─── High-Resolution Editorial Texture Generator ─────────────────
function createSectionCanvasTexture(section) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Background Gradient Card
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  bgGrad.addColorStop(0, '#0d1322');
  bgGrad.addColorStop(0.5, '#090d18');
  bgGrad.addColorStop(1, '#05070d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Border Accent Glow
  ctx.lineWidth = 14;
  ctx.strokeStyle = section.color || '#00f3ff';
  ctx.strokeRect(16, 16, 992, 992);

  // Inner subtle border
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.strokeRect(36, 36, 952, 952);

  // Category & Zone Tag
  ctx.fillStyle = section.color || '#00f3ff';
  ctx.font = '700 24px "Space Grotesk", sans-serif';
  ctx.fillText(`${section.spatialZone.toUpperCase()} • SEC 0${section.index + 1}`, 60, 90);

  // Section Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 42px "Space Grotesk", sans-serif';
  const words = section.title.split(' ');
  let line = '';
  let y = 160;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 900 && n > 0) {
      ctx.fillText(line, 60, y);
      line = words[n] + ' ';
      y += 56;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 60, y);

  // Decorative Divider
  y += 30;
  const lineGrad = ctx.createLinearGradient(60, y, 960, y);
  lineGrad.addColorStop(0, section.color || '#00f3ff');
  lineGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(60, y, 880, 4);

  // Body Paragraphs Excerpt
  y += 50;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 28px "Newsreader", serif';

  const bodyText = section.paragraphs[0] || '';
  const bodyWords = bodyText.split(' ');
  line = '';
  for (let n = 0; n < bodyWords.length; n++) {
    const testLine = line + bodyWords[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 890 && n > 0) {
      ctx.fillText(line, 60, y);
      line = bodyWords[n] + ' ';
      y += 42;
      if (y > 780) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 60, y);

  // Quote or Feature Highlight if present
  if (section.quote) {
    y = 830;
    ctx.fillStyle = 'rgba(99, 102, 241, 0.18)';
    ctx.fillRect(60, y, 904, 130);
    ctx.fillStyle = section.accentColor || '#38bdf8';
    ctx.font = 'italic 500 24px "Newsreader", serif';
    ctx.fillText(`“${section.quote.text.substring(0, 80)}...”`, 80, y + 55);
    ctx.font = '600 18px "Space Grotesk", sans-serif';
    ctx.fillText(`— ${section.quote.attribution}`, 80, y + 100);
  } else {
    // Spatial Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillText('CLICK OBJECT OR USE THUMB BAR TO INSPECT SPATIAL CONTENT', 60, 940);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

// ─── World Groups ────────────────────────────────────────────────
const worldGroups = {
  library: new THREE.Group(),
  tunnel: new THREE.Group(),
  constellation: new THREE.Group()
};

scene.add(worldGroups.library);
scene.add(worldGroups.tunnel);
scene.add(worldGroups.constellation);

worldGroups.tunnel.visible = false;
worldGroups.constellation.visible = false;

// ─── 3D Spatial Builders ─────────────────────────────────────────

// 1. Interactive 3D Quote Sculpture
function createQuoteSculpture(quoteData, position) {
  const quoteGroup = new THREE.Group();
  quoteGroup.position.copy(position);

  // Glowing quotation mark geometry
  const markGeo = new THREE.TorusGeometry(1.2, 0.22, 16, 32, Math.PI * 1.4);
  const markMat = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    emissive: 0x6366f1,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.8
  });
  const markMesh = new THREE.Mesh(markGeo, markMat);
  markMesh.position.set(-3.2, 1.8, 0.2);
  markMesh.rotation.z = Math.PI * 0.6;
  quoteGroup.add(markMesh);

  // Floating crystalline backplate
  const plateGeo = new THREE.BoxGeometry(6.5, 3.2, 0.25);
  const plateMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.15,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85,
    reflectivity: 0.9,
    clearcoat: 1.0
  });
  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  quoteGroup.add(plateMesh);

  // Border neon frame
  const frameGeo = new THREE.EdgesGeometry(plateGeo);
  const frameMat = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 2 });
  const frameLine = new THREE.LineSegments(frameGeo, frameMat);
  quoteGroup.add(frameLine);

  plateMesh.userData = {
    type: 'quote',
    data: quoteData,
    title: '3D Spatial Quote'
  };
  interactiveObjects.push(plateMesh);

  return quoteGroup;
}

// 2. 5-Point 3D Interactive Timeline
function create3DTimeline(timelineData, origin) {
  const timelineGroup = new THREE.Group();
  timelineGroup.position.copy(origin);

  // Curved Chronological Rail
  const curvePoints = [];
  const spacing = 4.2;
  for (let i = 0; i < timelineData.length; i++) {
    curvePoints.push(new THREE.Vector3((i - 2) * spacing, Math.sin(i * 0.8) * 0.6, (i - 2) * 1.5));
  }
  const railCurve = new THREE.CatmullRomCurve3(curvePoints);
  const railGeo = new THREE.TubeGeometry(railCurve, 32, 0.08, 8, false);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.5,
    roughness: 0.3
  });
  const railMesh = new THREE.Mesh(railGeo, railMat);
  timelineGroup.add(railMesh);

  // Steles for each Year
  timelineData.forEach((item, idx) => {
    const pt = curvePoints[idx];
    const steleGeo = new THREE.CylinderGeometry(0.35, 0.45, 2.2, 16);
    const steleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2,
      metalness: 0.7,
      roughness: 0.3
    });
    const stele = new THREE.Mesh(steleGeo, steleMat);
    stele.position.set(pt.x, pt.y + 1.1, pt.z);

    // Glowing Node Orb
    const orbGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 1.0
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(pt.x, pt.y + 2.4, pt.z);
    timelineGroup.add(stele);
    timelineGroup.add(orb);

    orb.userData = {
      type: 'timeline',
      data: item,
      title: `Epoch ${item.year}: ${item.title}`
    };
    interactiveObjects.push(orb);
  });

  return timelineGroup;
}

// 3. 4-Column 3D Interactive Data Visualization
function create3DDataColosseum(dataVis, origin) {
  const dataGroup = new THREE.Group();
  dataGroup.position.copy(origin);

  // Holographic Grid Floor
  const gridHelper = new THREE.GridHelper(8, 8, 0x10b981, 0x1e3a8a);
  gridHelper.position.y = -0.05;
  dataGroup.add(gridHelper);

  const maxVal = Math.max(...dataVis.bars.map(b => b.value));

  dataVis.bars.forEach((bar, idx) => {
    const height = (bar.value / maxVal) * 4.5 + 0.4;
    const barGeo = new THREE.BoxGeometry(1.0, height, 1.0);
    const barMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bar.color),
      emissive: new THREE.Color(bar.color),
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.2,
      transparent: true,
      opacity: 0.92
    });

    const barMesh = new THREE.Mesh(barGeo, barMat);
    const xPos = (idx - 1.5) * 1.8;
    barMesh.position.set(xPos, height / 2, 0);

    // Border Neon outline
    const wireGeo = new THREE.EdgesGeometry(barGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    barMesh.add(wire);

    dataGroup.add(barMesh);

    barMesh.userData = {
      type: 'data',
      data: bar,
      title: `${bar.epoch} Metrics`
    };
    interactiveObjects.push(barMesh);
  });

  return dataGroup;
}

// 4. 5-Node 3D Concept Network (Constellation Graph)
function create3DConceptNetwork(networkData, origin) {
  const netGroup = new THREE.Group();
  netGroup.position.copy(origin);

  const nodeMap = {};

  networkData.nodes.forEach(n => {
    const sphereGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0xa78bfa,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(n.x * 0.7, n.y * 0.7, n.z * 0.7);

    // Outer orbiting ring
    const ringGeo = new THREE.RingGeometry(0.75, 0.85, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    sphere.add(ring);

    sphere.userData = {
      type: 'concept',
      data: n,
      title: `Node: ${n.label}`
    };
    interactiveObjects.push(sphere);
    nodeMap[n.id] = sphere.position;
    netGroup.add(sphere);
  });

  // Dynamic Connecting Lines
  networkData.links.forEach(l => {
    const p1 = nodeMap[l.from];
    const p2 = nodeMap[l.to];
    if (p1 && p2) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      netGroup.add(line);
    }
  });

  return netGroup;
}

// ─── Build World A: Spatial Library ──────────────────────────────
function buildSpatialLibrary() {
  const group = worldGroups.library;

  // Hallway Pillars / Bookshelf Colonnades
  const pillarGeo = new THREE.BoxGeometry(0.8, 14, 0.8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.6
  });

  for (let z = 20; z >= -140; z -= 14) {
    const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
    pLeft.position.set(-8.5, 6, z);
    const pRight = new THREE.Mesh(pillarGeo, pillarMat);
    pRight.position.set(8.5, 6, z);

    // Connecting arch
    const archGeo = new THREE.BoxGeometry(17.8, 0.4, 0.8);
    const arch = new THREE.Mesh(archGeo, pillarMat);
    arch.position.set(0, 13, z);

    group.add(pLeft);
    group.add(pRight);
    group.add(arch);
  }

  // Section Reading Steles (8 Zones)
  ARTICLE_DATA.sections.forEach((sec, idx) => {
    const zPos = -idx * 16;
    const steleGroup = new THREE.Group();
    steleGroup.position.set(0, 2.5, zPos);

    // Stone Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(4.2, 4.6, 0.6, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.5,
      roughness: 0.3
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -2.2;
    steleGroup.add(base);

    // Glowing Base Ring
    const ringGeo = new THREE.TorusGeometry(4.5, 0.08, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(sec.color) });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.9;
    steleGroup.add(ring);

    // Main Reading Stele (High-Res Canvas Texture)
    const steleWidth = 5.2;
    const steleHeight = 5.2;
    const steleGeo = new THREE.BoxGeometry(steleWidth, steleHeight, 0.2);
    const steleMat = new THREE.MeshStandardMaterial({
      map: createSectionCanvasTexture(sec),
      roughness: 0.25,
      metalness: 0.1
    });
    const steleMesh = new THREE.Mesh(steleGeo, steleMat);
    steleMesh.position.y = 1.0;
    steleGroup.add(steleMesh);

    // Section Specific 3D Artifacts
    if (sec.quote && idx === 1) {
      const quoteObj = createQuoteSculpture(sec.quote, new THREE.Vector3(5.8, 1.2, 0));
      steleGroup.add(quoteObj);
    }

    if (sec.timeline) {
      const timelineObj = create3DTimeline(sec.timeline, new THREE.Vector3(0, -0.8, 4.2));
      steleGroup.add(timelineObj);
    }

    if (sec.dataVisualization) {
      const dataObj = create3DDataColosseum(sec.dataVisualization, new THREE.Vector3(0, -1.8, 4.5));
      steleGroup.add(dataObj);
    }

    if (sec.conceptNetwork) {
      const netObj = create3DConceptNetwork(sec.conceptNetwork, new THREE.Vector3(0, 1.5, 4.5));
      steleGroup.add(netObj);
    }

    if (sec.quote && idx === 7) {
      const quoteObj = createQuoteSculpture(sec.quote, new THREE.Vector3(0, 5.0, 0));
      steleGroup.add(quoteObj);
    }

    steleMesh.userData = {
      type: 'section-stele',
      sectionIndex: idx,
      title: sec.title
    };
    interactiveObjects.push(steleMesh);

    group.add(steleGroup);
  });
}

// ─── Build World B: Knowledge Tunnel ─────────────────────────────
function buildKnowledgeTunnel() {
  const group = worldGroups.tunnel;

  // Hexagonal Ribs along continuous spline
  const ribCount = 40;
  for (let i = 0; i < ribCount; i++) {
    const z = 10 - i * 4.5;
    const ringGeo = new THREE.RingGeometry(6.5, 6.8, 6);
    const ringMat = new THREE.MeshBasicMaterial({
      color: i % 4 === 0 ? 0x00f3ff : 0x6366f1,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 2.5, z);
    group.add(ringMesh);
  }

  // Section Panels suspended in tunnel
  ARTICLE_DATA.sections.forEach((sec, idx) => {
    const zPos = -idx * 18;
    const panelGeo = new THREE.BoxGeometry(5.4, 4.2, 0.15);
    const panelMat = new THREE.MeshStandardMaterial({
      map: createSectionCanvasTexture(sec),
      roughness: 0.3
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 2.5, zPos);
    panel.userData = { type: 'section-stele', sectionIndex: idx, title: sec.title };
    interactiveObjects.push(panel);
    group.add(panel);
  });
}

// ─── Build World C: Knowledge Constellation ──────────────────────
function buildKnowledgeConstellation() {
  const group = worldGroups.constellation;

  ARTICLE_DATA.sections.forEach((sec, idx) => {
    const angle = (idx / ARTICLE_DATA.sections.length) * Math.PI * 2;
    const radius = 16.0;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(idx * 0.8) * 3.5 + 2.0;
    const z = Math.sin(angle) * radius - 15;

    const panelGeo = new THREE.BoxGeometry(4.8, 4.2, 0.15);
    const panelMat = new THREE.MeshStandardMaterial({
      map: createSectionCanvasTexture(sec),
      roughness: 0.25
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(x, y, z);
    panel.lookAt(0, 2, -15);

    panel.userData = { type: 'section-stele', sectionIndex: idx, title: sec.title };
    interactiveObjects.push(panel);
    group.add(panel);

    // Orbital Synaptic Ring
    const orbitRingGeo = new THREE.TorusGeometry(3.2, 0.04, 16, 64);
    const orbitRingMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(sec.color) });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.position.set(x, y, z);
    orbitRing.rotation.x = Math.PI / 2;
    group.add(orbitRing);
  });
}

// Initialize all 3 Worlds
buildSpatialLibrary();
buildKnowledgeTunnel();
buildKnowledgeConstellation();

// ─── Camera Waypoints & Transitions ──────────────────────────────
function getCameraWaypoint(sectionIdx, world = state.currentWorld) {
  if (world === 'library') {
    const zPos = -sectionIdx * 16;
    return {
      position: new THREE.Vector3(0, 3.4, zPos + 8.5),
      target: new THREE.Vector3(0, 2.8, zPos)
    };
  } else if (world === 'tunnel') {
    const zPos = -sectionIdx * 18;
    return {
      position: new THREE.Vector3(0, 2.5, zPos + 7.5),
      target: new THREE.Vector3(0, 2.5, zPos)
    };
  } else {
    const angle = (sectionIdx / ARTICLE_DATA.sections.length) * Math.PI * 2;
    const radius = 16.0;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(sectionIdx * 0.8) * 3.5 + 2.0;
    const z = Math.sin(angle) * radius - 15;
    return {
      position: new THREE.Vector3(x * 0.65, y + 1.2, z * 0.65),
      target: new THREE.Vector3(x, y, z)
    };
  }
}

let targetCamPos = new THREE.Vector3();
let targetCamLook = new THREE.Vector3();

function navigateToSection(index, updateHash = true) {
  if (index < 0 || index >= ARTICLE_DATA.sections.length) return;
  state.currentSection = index;

  const section = ARTICLE_DATA.sections[index];
  const wp = getCameraWaypoint(index);
  targetCamPos.copy(wp.position);
  targetCamLook.copy(wp.target);

  if (state.motion === 'off') {
    camera.position.copy(targetCamPos);
    controls.target.copy(targetCamLook);
  }

  // Update Dynamic Light & Fog
  accentLight.color.set(section.color || 0x00f3ff);
  accentLight.position.set(wp.target.x, wp.target.y + 4, wp.target.z + 2);

  // Update Ambient Glow
  spaceAmbientGlow.style.background = `radial-gradient(circle at 50% 50%, ${section.color}26 0%, ${section.accentColor}14 35%, transparent 70%)`;

  // Update HUD elements
  hudArticleTitle.textContent = section.title;
  hudChapterBadge.textContent = `SEC 0${index + 1} / 0${ARTICLE_DATA.sections.length}`;
  hudPageDetail.textContent = section.spatialZone;
  const progressPct = ((index + 1) / ARTICLE_DATA.sections.length) * 100;
  hudProgressFill.style.width = `${progressPct}%`;
  outlineProgressFill.style.width = `${progressPct}%`;
  outlineSectionLabel.textContent = `Section ${index + 1} of ${ARTICLE_DATA.sections.length}`;
  outlinePercentage.textContent = `${Math.round(progressPct)}% Read`;

  // Update Spatial Focus Surface Content
  focusZoneTag.textContent = section.spatialZone;
  focusZoneTag.style.color = section.color;
  focusChapterTag.textContent = `SECTION 0${index + 1} / 0${ARTICLE_DATA.sections.length}`;
  focusTitle.textContent = section.title;
  focusTitle.style.borderLeftColor = section.color;

  focusParagraphs.innerHTML = section.paragraphs.map(p => `<p>${p}</p>`).join('');

  if (section.quote) {
    surfaceQuoteBox.style.display = 'block';
    surfaceQuoteText.textContent = section.quote.text;
    surfaceQuoteAuthor.textContent = `— ${section.quote.attribution}`;
  } else {
    surfaceQuoteBox.style.display = 'none';
  }

  if (section.timeline || section.dataVisualization || section.conceptNetwork) {
    surfaceInteractiveBadge.style.display = 'flex';
    surfaceInteractiveText.textContent = section.timeline
      ? '3D Chronological Timeline active in scene'
      : section.dataVisualization
      ? '3D Data Colosseum active in scene'
      : '3D Concept Constellation active in scene';
  } else {
    surfaceInteractiveBadge.style.display = 'none';
  }

  focusContextText.textContent = section.layerContext || 'No contextual addenda available.';
  focusResearchText.textContent = section.layerDeepResearch || 'No formal specification recorded.';

  // Highlight Active Outline Item
  document.querySelectorAll('.outline-nav-item').forEach((item, idx) => {
    item.classList.toggle('active', idx === index);
  });

  // URL Hash Sync
  if (updateHash && section.hash) {
    window.location.hash = section.hash;
  }

  // Audio trigger
  playTransitionSound();

  // Save to LocalStorage
  saveState();
}

function setReadingMode(mode) {
  state.currentMode = mode;
  document.body.className = `mode-${mode} world-${state.currentWorld} motion-${state.motion}`;

  modeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  if (mode === 'explore') {
    controls.enabled = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    hintMessage.textContent = 'Explore Mode: Click or drag to orbit objects • Scroll to zoom • Click items to inspect';
  } else if (mode === 'focus') {
    controls.enabled = false;
    controls.autoRotate = false;
    hintMessage.textContent = 'Focus Mode: Ambient distraction dimmed • Crystal editorial reading';
  } else if (mode === 'hybrid') {
    controls.enabled = true;
    controls.autoRotate = false;
    hintMessage.textContent = 'Hybrid Mode: 60% Reading panel + 40% Live 3D spatial view';
  } else if (mode === 'spatial') {
    controls.enabled = true;
    controls.autoRotate = false;
    hintMessage.textContent = '3D Read Mode: Scroll or swipe to travel through article space';
    reCenterCamera();
  }

  playClickSound();
  saveState();
}

function setWorld(worldKey) {
  state.currentWorld = worldKey;
  worldGroups.library.visible = worldKey === 'library';
  worldGroups.tunnel.visible = worldKey === 'tunnel';
  worldGroups.constellation.visible = worldKey === 'constellation';

  document.body.classList.remove('world-library', 'world-tunnel', 'world-constellation');
  document.body.classList.add(`world-${worldKey}`);

  activeWorldName.textContent = worldKey === 'library' ? 'Library' : worldKey === 'tunnel' ? 'Tunnel' : 'Constellation';

  worldOptions.forEach(opt => {
    opt.classList.toggle('active', opt.dataset.world === worldKey);
  });

  navigateToSection(state.currentSection, false);
  playClickSound();
  saveState();
}

function reCenterCamera() {
  const wp = getCameraWaypoint(state.currentSection);
  targetCamPos.copy(wp.position);
  targetCamLook.copy(wp.target);
  controls.target.copy(wp.target);
  playClickSound();
}

// ─── Modal Inspection Logic ──────────────────────────────────────
function openInspectModal(title, badge, htmlContent) {
  modalTitle.textContent = title;
  modalBadge.textContent = badge;
  modalBody.innerHTML = htmlContent;
  inspectModal.classList.add('open');
  playClickSound();
}

function closeInspectModal() {
  inspectModal.classList.remove('open');
  playClickSound();
}

// ─── Populate Outline Drawer & Fallback View ─────────────────────
function populateContentStructures() {
  // Outline drawer items
  outlineNavList.innerHTML = ARTICLE_DATA.sections.map((sec, idx) => `
    <button class="outline-nav-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
      <span class="nav-item-num">0${idx + 1}</span>
      <div class="nav-item-content">
        <span class="nav-item-title">${sec.title}</span>
        <span class="nav-item-zone">${sec.spatialZone}</span>
      </div>
    </button>
  `).join('');

  document.querySelectorAll('.outline-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      navigateToSection(idx);
      closeOutlineDrawer();
    });
  });

  // 2D Fallback view items
  fallbackBodyContent.innerHTML = ARTICLE_DATA.sections.map((sec, idx) => `
    <section class="fallback-section" id="fallback-${sec.hash}">
      <h2>0${idx + 1}. ${sec.title}</h2>
      ${sec.paragraphs.map(p => `<p>${p}</p>`).join('')}
      ${sec.quote ? `<div class="fallback-quote">“${sec.quote.text}”<br><small>— ${sec.quote.attribution}</small></div>` : ''}
      ${sec.timeline ? `
        <div style="background: rgba(245, 158, 11, 0.1); padding: 14px; border-radius: 8px; margin: 12px 0;">
          <strong>Timeline Milestones:</strong>
          <ul>
            ${sec.timeline.map(t => `<li><strong>${t.year}:</strong> ${t.title} — ${t.description}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </section>
  `).join('');
}

function openOutlineDrawer() {
  outlineDrawer.classList.add('open');
  outlineBackdrop.classList.add('open');
  playClickSound();
}

function closeOutlineDrawer() {
  outlineDrawer.classList.remove('open');
  outlineBackdrop.classList.remove('open');
}

// ─── Persistence (LocalStorage) ──────────────────────────────────
function saveState() {
  try {
    const s = {
      section: state.currentSection,
      world: state.currentWorld,
      mode: state.currentMode,
      motion: state.motion,
      audio: state.audioEnabled
    };
    localStorage.setItem('spatial_article_state', JSON.stringify(s));
  } catch (e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('spatial_article_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.section === 'number') state.currentSection = parsed.section;
      if (parsed.world) state.currentWorld = parsed.world;
      if (parsed.mode) state.currentMode = parsed.mode;
      if (parsed.motion) state.motion = parsed.motion;
      if (typeof parsed.audio === 'boolean') state.audioEnabled = parsed.audio;
    }
  } catch (e) {}
}

// ─── Event Listeners & Controls ──────────────────────────────────

// Mode button switching
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setReadingMode(btn.dataset.mode);
  });
});

// World switcher dropdown
btnWorldSelect.addEventListener('click', (e) => {
  e.stopPropagation();
  worldDropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
  worldDropdown.classList.remove('open');
});

worldOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    setWorld(opt.dataset.world);
    worldDropdown.classList.remove('open');
  });
});

// Audio & Motion controls
btnToggleAudio.addEventListener('click', () => {
  state.audioEnabled = !state.audioEnabled;
  audioIcon.textContent = state.audioEnabled ? '🔊' : '🔇';
  audioLabel.textContent = state.audioEnabled ? 'SFX: ON' : 'SFX: OFF';
  saveState();
});

btnToggleMotion.addEventListener('click', () => {
  if (state.motion === 'full') state.motion = 'reduced';
  else if (state.motion === 'reduced') state.motion = 'off';
  else state.motion = 'full';

  motionLabel.textContent = `Motion: ${state.motion.toUpperCase()}`;
  document.body.className = `mode-${state.currentMode} world-${state.currentWorld} motion-${state.motion}`;
  saveState();
  playClickSound();
});

btnResetCam.addEventListener('click', reCenterCamera);

// Outline drawer open/close
btnToggleOutline.addEventListener('click', openOutlineDrawer);
btnOpenOutlineThumb.addEventListener('click', openOutlineDrawer);
btnCloseOutline.addEventListener('click', closeOutlineDrawer);
outlineBackdrop.addEventListener('click', closeOutlineDrawer);

// Navigation Next/Prev
btnNavPrev.addEventListener('click', () => {
  if (state.currentSection > 0) {
    navigateToSection(state.currentSection - 1);
  }
});

btnNavNext.addEventListener('click', () => {
  if (state.currentSection < ARTICLE_DATA.sections.length - 1) {
    navigateToSection(state.currentSection + 1);
  }
});

// Layer tabs (Essential / Context / Deep Research)
layerTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetLayer = tab.dataset.layer;
    state.activeLayer = targetLayer;
    layerTabs.forEach(t => t.classList.toggle('active', t.dataset.layer === targetLayer));
    layerPanels.forEach(p => p.classList.toggle('active', p.id === `panel-layer-${targetLayer}`));
    playClickSound();
  });
});

// Modal close
modalCloseBtn.addEventListener('click', closeInspectModal);
modalBtnClose.addEventListener('click', closeInspectModal);
inspectModal.addEventListener('click', (e) => {
  if (e.target === inspectModal) closeInspectModal();
});

// Fallback return
btnReturn3d.addEventListener('click', () => {
  setReadingMode('spatial');
});

// Inspect 3D trigger button from surface
btnInspect3d.addEventListener('click', () => {
  const sec = ARTICLE_DATA.sections[state.currentSection];
  if (sec.timeline) {
    openInspectModal(
      'Chronological Timeline (2017–2035)',
      'TEMPORAL REASONING',
      `<ul>${sec.timeline.map(t => `<li style="margin-bottom: 10px;"><strong>${t.year} — ${t.title}:</strong> ${t.description}</li>`).join('')}</ul>`
    );
  } else if (sec.dataVisualization) {
    openInspectModal(
      sec.dataVisualization.metric,
      'DATA COLOSSEUM',
      `<ul>${sec.dataVisualization.bars.map(b => `<li style="margin-bottom: 10px;"><strong>${b.epoch}:</strong> Index ${b.value} (${b.energyKw} kW)</li>`).join('')}</ul>`
    );
  } else if (sec.conceptNetwork) {
    openInspectModal(
      'Neuro-Symbolic Constellation',
      'KNOWLEDGE GRAPH',
      `<ul>${sec.conceptNetwork.nodes.map(n => `<li style="margin-bottom: 10px;"><strong>${n.label}:</strong> ${n.desc}</li>`).join('')}</ul>`
    );
  }
});

// Debug mode toggle
btnToggleDebug.addEventListener('click', () => {
  state.debug = !state.debug;
  debugHud.style.display = state.debug ? 'flex' : 'none';
  playClickSound();
});

// Keyboard navigation
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
    if (state.currentSection < ARTICLE_DATA.sections.length - 1) {
      e.preventDefault();
      navigateToSection(state.currentSection + 1);
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
    if (state.currentSection > 0) {
      e.preventDefault();
      navigateToSection(state.currentSection - 1);
    }
  } else if (e.key === 'Home') {
    e.preventDefault();
    navigateToSection(0);
  } else if (e.key === 'End') {
    e.preventDefault();
    navigateToSection(ARTICLE_DATA.sections.length - 1);
  } else if (e.key === 'd' || e.key === 'D') {
    state.debug = !state.debug;
    debugHud.style.display = state.debug ? 'flex' : 'none';
  }
});

// Scroll wheel spatial navigation
let wheelAccum = 0;
window.addEventListener('wheel', (e) => {
  if (state.currentMode === 'focus' || state.currentMode === 'fallback') return;
  wheelAccum += e.deltaY;
  if (Math.abs(wheelAccum) > 120) {
    if (wheelAccum > 0 && state.currentSection < ARTICLE_DATA.sections.length - 1) {
      navigateToSection(state.currentSection + 1);
    } else if (wheelAccum < 0 && state.currentSection > 0) {
      navigateToSection(state.currentSection - 1);
    }
    wheelAccum = 0;
  }
}, { passive: true });

// Mobile Touch gestures (Swipe detection)
let touchStartX = 0;
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (e.changedTouches.length === 1) {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0 && state.currentSection < ARTICLE_DATA.sections.length - 1) {
        navigateToSection(state.currentSection + 1);
      } else if (deltaX > 0 && state.currentSection > 0) {
        navigateToSection(state.currentSection - 1);
      }
    }
  }
}, { passive: true });

// Raycasting click detection on 3D objects
window.addEventListener('pointerdown', (e) => {
  if (e.target !== canvas) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, true);

  if (intersects.length > 0) {
    let hit = intersects[0].object;
    while (hit && !hit.userData.type && hit.parent) {
      hit = hit.parent;
    }
    if (hit && hit.userData.type) {
      const u = hit.userData;
      if (u.type === 'timeline') {
        openInspectModal(
          `${u.data.year}: ${u.data.title}`,
          'TEMPORAL MILESTONE',
          `<p style="font-size: 15px; margin-bottom: 8px;">${u.data.description}</p><p><strong>Significance:</strong> ${u.data.significance}</p>`
        );
      } else if (u.type === 'data') {
        openInspectModal(
          u.title,
          'COMPUTE METRIC',
          `<p><strong>Model Epoch:</strong> ${u.data.epoch}</p><p><strong>Efficiency Ratio:</strong> ${u.data.value} index</p><p><strong>Power Consumption:</strong> ${u.data.energyKw} kW</p>`
        );
      } else if (u.type === 'concept') {
        openInspectModal(
          u.title,
          'COGNITIVE NODE',
          `<p style="font-size: 15px; line-height: 1.6;">${u.data.desc}</p>`
        );
      } else if (u.type === 'quote') {
        openInspectModal(
          'Editorial Axiom',
          'SPATIAL QUOTE',
          `<blockquote style="font-style: italic; font-size: 16px; margin-bottom: 10px;">“${u.data.text}”</blockquote><p>— ${u.data.attribution}</p>`
        );
      } else if (u.type === 'section-stele') {
        navigateToSection(u.sectionIndex);
      }
    }
  }
});

// URL Hash listener
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  const foundIdx = ARTICLE_DATA.sections.findIndex(s => s.hash === hash);
  if (foundIdx !== -1 && foundIdx !== state.currentSection) {
    navigateToSection(foundIdx, false);
  }
});

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ─── Animation & Render Loop ─────────────────────────────────────
let lastTime = performance.now();
let frameCount = 0;
let fpsTimer = performance.now();

function animate(currentTime) {
  requestAnimationFrame(animate);

  // Smooth Camera Interpolation
  const lerpFactor = state.motion === 'reduced' ? 0.08 : 0.045;
  if (state.motion !== 'off') {
    camera.position.lerp(targetCamPos, lerpFactor);
    controls.target.lerp(targetCamLook, lerpFactor);
  }
  controls.update();

  // Floating Dust Particles Motion
  if (state.motion !== 'off') {
    dustParticles.rotation.y += 0.0004;
    dustParticles.rotation.x += 0.0002;
  }

  // Render Scene
  renderer.render(scene, camera);

  // Debug HUD Updates
  frameCount++;
  if (currentTime - fpsTimer >= 500) {
    if (state.debug) {
      dbgFps.textContent = Math.round((frameCount * 1000) / (currentTime - fpsTimer));
      dbgDrawcalls.textContent = renderer.info.render.calls;
      dbgObjects.textContent = `${renderer.info.memory.geometries} / ${renderer.info.memory.textures}`;
      dbgWorld.textContent = state.currentWorld;
      dbgSection.textContent = `${state.currentSection} (${ARTICLE_DATA.sections[state.currentSection].spatialZone})`;
      dbgCamPos.textContent = `${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)}`;
      dbgCamTarget.textContent = `${controls.target.x.toFixed(1)}, ${controls.target.y.toFixed(1)}, ${controls.target.z.toFixed(1)}`;
    }
    frameCount = 0;
    fpsTimer = currentTime;
  }
}

// ─── Initializer ─────────────────────────────────────────────────
function init() {
  loadState();
  populateContentStructures();

  // Check URL hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    const hashIdx = ARTICLE_DATA.sections.findIndex(s => s.hash === initialHash);
    if (hashIdx !== -1) state.currentSection = hashIdx;
  }

  setWorld(state.currentWorld);
  setReadingMode(state.currentMode);
  navigateToSection(state.currentSection, false);

  const initialWp = getCameraWaypoint(state.currentSection);
  camera.position.copy(initialWp.position);
  controls.target.copy(initialWp.target);
  targetCamPos.copy(initialWp.position);
  targetCamLook.copy(initialWp.target);

  animate(performance.now());
}

init();
