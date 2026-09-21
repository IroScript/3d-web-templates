/**
 * EXITO · TRUE 3D SPATIAL ARTICLE READING ENGINE
 * 3 Interactive Paradigms:
 * 1. 3D Cyber-Book (Realistic curved page-curl & flip physics)
 * 2. 3D Curved Spatial Ribbon (Cylindrical panoramic wrap)
 * 3. 3D Deep-Z Galaxy Stepper (Cinematic camera flythrough across deep monoliths)
 */

import * as THREE from 'three';
import { OrbitControls } from '../OrbitControls.js';

// ─── DOM References ──────────────────────────────────────────────
const canvas = document.getElementById('spatial-canvas');
const spaceAmbientGlow = document.getElementById('space-ambient-glow');
const hudArticleTitle = document.getElementById('hud-article-title');
const spatialHintPill = document.getElementById('spatial-hint-pill');
const hintMessage = document.getElementById('hint-message');

const hudChapterBadge = document.getElementById('hud-chapter-badge');
const hudProgressFill = document.getElementById('hud-progress-fill');
const hudPageDetail = document.getElementById('hud-page-detail');

const btnNavPrev = document.getElementById('btn-nav-prev');
const btnNavNext = document.getElementById('btn-nav-next');
const modeButtons = document.querySelectorAll('.spatial-mode-btn');

const btnToggleAudio = document.getElementById('btn-toggle-audio');
const audioIcon = document.getElementById('audio-icon');
const audioLabel = document.getElementById('audio-label');
const btnToggleAutoRotate = document.getElementById('btn-toggle-autorotate');
const btnResetCam = document.getElementById('btn-reset-cam');

// ─── Content Data: 5 Spatial Chapters ────────────────────────────
const CHAPTERS = [
  {
    id: 1,
    title: 'The Quantum Awakening',
    subtitle: 'Topological Coherence Beyond Absolute Zero',
    category: 'QUANTUM PHYSICS',
    color: '#00f3ff',
    glow: 'rgba(0, 243, 255, 0.25)',
    leftText: [
      'CHAPTER 01: THE TOPOLOGICAL QUANTUM DAWN',
      'For nearly a century, quantum computing was imprisoned inside helium dilution refrigerators—massive cryostats hummed at millikelvin temperatures, isolated from the chaotic warmth of the biological world.',
      'Today, room-temperature topological coherence has shattered those cryogenic walls.',
      '“Where classical computation struggles through sequential gates, quantum topological coherence navigates a unified multidimensional geometric manifold.”'
    ],
    rightText: [
      'BRAIDED ANYONS & ZERO NOISE',
      'By braiding non-Abelian anyons along superconducting graphene nanoribbons, quantum states retain phase coherence amidst thermal noise.',
      'Information is no longer stored in fragile electronic charges, but in the immutable topology of quantum knots.',
      'FORMULA: H = ∑ J_ij (σ_i^x σ_j^x + σ_i^y σ_j^y) + ∆ ∑ (c_i^† c_j^† + h.c.)',
      'This grants unconditional immunity to environmental decoherence, unlocking real-time planetary neural simulations.'
    ]
  },
  {
    id: 2,
    title: 'The Neural Mesh',
    subtitle: 'Decentralized Planetary Cognitive Synapses',
    category: 'COGNITIVE AI',
    color: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.25)',
    leftText: [
      'CHAPTER 02: DECENTRALIZED COGNITIVE ENGINES',
      'Centralized data centers consumed four percent of planetary energy by 2025. The transition to neuromorphic edge meshes distributes reasoning across millions of event-driven spiking nodes.',
      'These synthetic synapses mimic the cellular architecture of the human neocortex, consuming zero idle power.',
      '“Intelligence is not measured by static parameter count, but by the velocity of decentralized adaptation.”'
    ],
    rightText: [
      'MICROSECOND REASONING AT THE EDGE',
      '• Synaptic Latency: Sub-0.08 milliseconds at localized sensors.',
      '• Energy Efficiency: 100,000× lower power than brute-force GPUs.',
      '• Distributed Capacity: Exa-scale cognitive graph synchronization.',
      'Nodes synchronize high-level intuitions through cryptographic zero-knowledge semantic proofs without broadcasting heavy weight tensors.'
    ]
  },
  {
    id: 3,
    title: 'Orbital Foundries',
    subtitle: 'Microgravity Metallurgy & Zero-G Superalloys',
    category: 'SPACE TECH',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    leftText: [
      'CHAPTER 03: METALLURGY BEYOND GRAVITY',
      'Terrestrial manufacturing is fundamentally constrained by Earth’s gravitational well. Convection currents, thermal buoyancy, and sedimentation introduce micro-fractures and grain dislocations into molten silicon.',
      'In Low Earth Orbit, fluids float in hydrostatic equilibrium without contact containers.',
      '“In microgravity, electromagnetic levitation yields monocrystalline superalloys of mathematical perfection.”'
    ],
    rightText: [
      'ZBLAN LIGHTGUIDES & MONOCRYSTALS',
      '• Fluorozirconate optical fibers drawn in microgravity boast 100× lower attenuation than quartz glass.',
      '• Containerless solar smelting generates 3,000°C with zero crucible chemical contamination.',
      '• Self-assembling titanium-carbide alloys construct lightweight radiation shields for deep-space transport.',
      'Orbital foundries now supply the crystalline backbone of transcontinental optical computing.'
    ]
  },
  {
    id: 4,
    title: 'Living Bio-Silicon',
    subtitle: 'Synthetic DNA Nucleotide Exabyte Archives',
    category: 'CYBERNETICS',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.25)',
    leftText: [
      'CHAPTER 04: BIOLOGICAL DIGITAL IMMORTALITY',
      'All the digital data ever produced by human civilization—from ancient library scrolls to planetary climate simulations—can fit into a single spoonful of synthetic DNA weighing less than five grams.',
      'Nature mastered petabyte-density storage four billion years ago in biological cells.',
      '“Flash memory degrades in years; synthetic DNA recovered from prehistoric fossils remains legible after a million years.”'
    ],
    rightText: [
      'QUATERNARY NUCLEOTIDE ENCODING',
      '• 4-Base Architecture: A, C, G, T mapped to dual binary qubits (00, 01, 10, 11).',
      '• Volumetric Density: 10¹⁸ bytes per cubic millimeter.',
      '• Error Correction: Reed-Solomon polynomial check-sums embedded directly in synthesized primers.',
      'Living bio-silicon guarantees civilizational knowledge preservation across tens of thousands of years.'
    ]
  },
  {
    id: 5,
    title: 'The Post-Digital Era',
    subtitle: 'Volumetric Symbiosis & Spatial Consciousness',
    category: 'POST-DIGITAL',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.25)',
    leftText: [
      'CHAPTER 05: THE FIFTY-THOUSAND-YEAR SYNTHESIS',
      'We have crossed the threshold from digital screen tools into spatial symbiosis. The planar rectangle has dissolved; the interface has merged with physical light, quantum topology, and biological consciousness.',
      'Knowledge is no longer confined to static paper sheets or flat 2D phone glass.',
      '“Knowledge in the post-digital era is volumetric, participatory, and eternally alive in three dimensions.”'
    ],
    rightText: [
      'THE EMBODIED HUMAN INTERFACE',
      '• Direct Cortex Bus: Graphene ribbon threads monitoring 100,000 synaptic action potentials.',
      '• Volumetric Canvas: Holographic lightfields anchored persistently in room architecture.',
      '• Infinite Permanence: Human thought, science, and art synchronized across interplanetary nodes.',
      'The book has become a living cosmos.'
    ]
  }
];

// ─── Engine State ────────────────────────────────────────────────
let currentMode = 'book'; // 'book' | 'ribbon' | 'galaxy'
let activeChapterIdx = 0;
let isAudioEnabled = true;
let isFlipping = false;

// ─── Three.js Scene Setup ────────────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070a13, 0.014);

const isMobile = window.innerWidth < 768;
const defaultCamZ = isMobile ? 18.5 : 15.0;

const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 1.2, defaultCamZ);

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

// ─── Orbit Controls (Configured for 3D Reading Inspection) ───────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxDistance = 50;
controls.minDistance = 6;
controls.target.set(0, 0, 0);
controls.autoRotate = false;
controls.autoRotateSpeed = 0.8;

// ─── Studio Lighting Rig ─────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xf8faff, 2.6);
keyLight.position.set(15, 25, 20);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
scene.add(keyLight);

const blueRim = new THREE.DirectionalLight(0x00f3ff, 2.2);
blueRim.position.set(-20, 15, -10);
scene.add(blueRim);

const pinkFill = new THREE.DirectionalLight(0xec4899, 1.4);
pinkFill.position.set(10, -15, 12);
scene.add(pinkFill);

// ─── Cosmic Starfield Particles ──────────────────────────────────
const starCount = 800;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starCol = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 80;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 120 - 20;

  const col = new THREE.Color().setHSL(0.55 + Math.random() * 0.25, 0.85, 0.7);
  starCol[i * 3] = col.r;
  starCol[i * 3 + 1] = col.g;
  starCol[i * 3 + 2] = col.b;
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));

const starMat = new THREE.PointsMaterial({
  size: 0.12,
  vertexColors: true,
  transparent: true,
  opacity: 0.85
});
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// ─── Web Audio API Procedural Sound Engine ───────────────────────
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

// Crisp paper page turn swoosh sound
function playPageFlipSound() {
  if (!isAudioEnabled) return;
  initAudioContext();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  // White noise buffer simulation with bandpass
  const bufferSize = audioCtx.sampleRate * 0.28;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.25);
  filter.Q.setValueAtTime(2.5, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.26);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  whiteNoise.start();
}

// Deep spatial swoop sound for galaxy travel
function playSwoopSound() {
  if (!isAudioEnabled) return;
  initAudioContext();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.2);
  osc.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime + 0.45);

  gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.22, audioCtx.currentTime + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.46);
}

// ─── High-DPI Procedural 2D Texture Generators ───────────────────
function createBookPageTexture(chapter, isLeftPage) {
  const w = 1600;
  const h = 2200;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  // Page background: pristine frosted paper with subtle grain
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h);

  // Soft page edge vignette & spine shadow
  const grad = ctx.createLinearGradient(isLeftPage ? w - 120 : 0, 0, isLeftPage ? w : 120, 0);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.12)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Outer margin padding
  const padX = 140;
  ctx.save();
  ctx.translate(isLeftPage ? padX : padX - 40, 140);

  // Running Header
  ctx.fillStyle = '#64748b';
  ctx.font = '700 24px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(chapter.category, 0, 0);

  ctx.textAlign = 'right';
  ctx.fillText(`VOLUME 0${chapter.id} / 05`, w - padX * 2, 0);
  ctx.textAlign = 'left';

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 24); ctx.lineTo(w - padX * 2, 24);
  ctx.stroke();

  ctx.translate(0, 100);

  if (isLeftPage) {
    // Left Page: Chapter Title & Opening Excerpt
    ctx.fillStyle = chapter.color;
    ctx.font = '800 28px "Space Grotesk", sans-serif';
    ctx.fillText(`CHAPTER 0${chapter.id}`, 0, 0);

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 68px "Space Grotesk", sans-serif';
    const titleWords = chapter.title.split(' ');
    let line = '';
    let y = 70;
    for (let word of titleWords) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > (w - padX * 2 - 60) && line !== '') {
        ctx.fillText(line, 0, y);
        line = word + ' ';
        y += 82;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, 0, y);
    y += 90;

    // Subtitle Callout
    ctx.fillStyle = '#475569';
    ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(chapter.subtitle, 0, y);
    y += 100;

    // Opening Paragraph with Drop Cap
    const p1 = chapter.leftText[1];
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 96px "Space Grotesk", sans-serif';
    ctx.fillText(p1.charAt(0), 0, y + 60);

    ctx.font = '400 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1e293b';
    wrapText(ctx, p1.substring(1), 100, y + 10, w - padX * 2 - 100, 52);
    y += 360;

    // Callout Box
    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.beginPath();
    ctx.roundRect(0, y, w - padX * 2, 280, 24);
    ctx.fill();
    ctx.strokeStyle = chapter.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic 500 34px "Plus Jakarta Sans", sans-serif';
    wrapText(ctx, chapter.leftText[3], 40, y + 70, w - padX * 2 - 80, 52);

  } else {
    // Right Page: Technical Narrative, Specs, and Formulas
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 38px "Space Grotesk", sans-serif';
    ctx.fillText(chapter.rightText[0], 0, 0);

    ctx.fillStyle = '#1e293b';
    ctx.font = '400 33px "Plus Jakarta Sans", sans-serif';
    let y = 70;
    y = wrapText(ctx, chapter.rightText[1], 0, y, w - padX * 2, 50) + 40;
    y = wrapText(ctx, chapter.rightText[2], 0, y, w - padX * 2, 50) + 60;

    // Formula / Spec Box
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(0, y, w - padX * 2, 190, 20);
    ctx.fill();

    ctx.fillStyle = chapter.color;
    ctx.font = '700 22px "JetBrains Mono", monospace';
    ctx.fillText('TECHNICAL FORMULATION', 36, y + 54);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 26px "JetBrains Mono", monospace';
    wrapText(ctx, chapter.rightText[3], 36, y + 100, w - padX * 2 - 72, 42);
    y += 260;

    ctx.fillStyle = '#334155';
    ctx.font = '400 33px "Plus Jakarta Sans", sans-serif';
    wrapText(ctx, chapter.rightText[4], 0, y, w - padX * 2, 50);
  }

  // Footer Page Number
  ctx.restore();
  ctx.fillStyle = '#64748b';
  ctx.font = '700 26px "Space Grotesk", sans-serif';
  if (isLeftPage) {
    ctx.fillText(`PAGE ${chapter.id * 2 - 1}`, padX, h - 90);
  } else {
    ctx.textAlign = 'right';
    ctx.fillText(`PAGE ${chapter.id * 2}`, w - padX, h - 90);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  return tex;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
  return curY + lineHeight;
}

// ─── Procedural 3D Micro-Models for Deep-Z Galaxy Mode ───────────
function createQuantumLatticeMesh() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    new THREE.MeshPhysicalMaterial({ color: 0x00f3ff, roughness: 0.1, metalness: 0.9, clearcoat: 0.8 })
  );
  g.add(core);

  for (let i = 0; i < 4; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(2.0 + i * 0.45, 0.04, 16, 64),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f3ff : 0xa855f7, wireframe: true })
    );
    r.rotation.x = 0.3 + i * 0.5;
    r.rotation.y = i * 0.9;
    g.add(r);
  }
  return g;
}

function createNeuralMeshNode() {
  const g = new THREE.Group();
  const nodes = [];
  for (let i = 0; i < 36; i++) {
    const p = new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3);
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0x6366f1 }));
    m.position.copy(p);
    g.add(m);
    nodes.push(p);
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].distanceTo(nodes[j]) < 1.8) {
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]),
          new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
        );
        g.add(line);
      }
    }
  }
  return g;
}

function createOrbitalMoltenCore() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.4, 1),
    new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.95, emissive: 0x78350f, emissiveIntensity: 0.4 })
  );
  g.add(core);

  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2 + i * 0.5, 0.06, 16, 64),
      new THREE.MeshPhysicalMaterial({ color: 0xec4899, metalness: 0.9, roughness: 0.1 })
    );
    ring.rotation.x = 1.0 + i * 0.4;
    g.add(ring);
  }
  return g;
}

function createDnaHelix() {
  const g = new THREE.Group();
  const pairs = 28;
  const turns = 2.2;
  const height = 5.0;
  for (let i = 0; i < pairs; i++) {
    const t = (i / pairs) * (Math.PI * 2 * turns);
    const y = (i / pairs) * height - height / 2;
    const x = Math.cos(t) * 1.4;
    const z = Math.sin(t) * 1.4;
    const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00f3ff }));
    b1.position.set(x, y, z);
    g.add(b1);
    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0xec4899 }));
    b2.position.set(-x, y, -z);
    g.add(b2);
    const rung = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, z), new THREE.Vector3(-x, y, -z)]),
      new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.6 })
    );
    g.add(rung);
  }
  return g;
}

function createTesseractHypercube() {
  const g = new THREE.Group();
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.7, roughness: 0.1, clearcoat: 1.0 })
  );
  const outer = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 2.8, 2.8),
    new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true })
  );
  g.add(inner);
  g.add(outer);
  return g;
}

// ─── PARADIGM 1: Physical 3D Cyber-Book Engine ───────────────────
const bookMasterGroup = new THREE.Group();
bookMasterGroup.position.set(0, 0, 0);
scene.add(bookMasterGroup);

// Book Hardcover Binding
const BOOK_W = 5.4;
const BOOK_H = 7.4;
const BOOK_D = 0.45;

const coverMesh = new THREE.Mesh(
  new THREE.BoxGeometry(BOOK_W * 2 + 0.6, BOOK_H + 0.4, BOOK_D),
  new THREE.MeshPhysicalMaterial({ color: 0x0b1120, roughness: 0.25, metalness: 0.85, clearcoat: 0.8 })
);
coverMesh.position.set(0, 0, -BOOK_D / 2);
bookMasterGroup.add(coverMesh);

// Spine Gold Emboss
const spineMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.32, 0.32, BOOK_H + 0.4, 32),
  new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9 })
);
spineMesh.position.set(0, 0, -BOOK_D / 2);
bookMasterGroup.add(spineMesh);

// Left Stationary Page Mesh
const pageGeo = new THREE.PlaneGeometry(BOOK_W, BOOK_H, 32, 32);
const leftPageMat = new THREE.MeshStandardMaterial({
  map: createBookPageTexture(CHAPTERS[0], true),
  roughness: 0.35
});
const leftPageMesh = new THREE.Mesh(pageGeo, leftPageMat);
leftPageMesh.position.set(-BOOK_W / 2 - 0.05, 0, 0.05);
bookMasterGroup.add(leftPageMesh);

// Right Stationary Page Mesh
const rightPageMat = new THREE.MeshStandardMaterial({
  map: createBookPageTexture(CHAPTERS[0], false),
  roughness: 0.35
});
const rightPageMesh = new THREE.Mesh(pageGeo, rightPageMat);
rightPageMesh.position.set(BOOK_W / 2 + 0.05, 0, 0.05);
bookMasterGroup.add(rightPageMesh);

// 3D Flipping Page Mesh with Curved Geometry
const flipPivot = new THREE.Group();
flipPivot.position.set(0, 0, 0.08);
bookMasterGroup.add(flipPivot);

// Front and Back Materials for the Flipping Page
const flipPageFrontMat = new THREE.MeshStandardMaterial({
  map: createBookPageTexture(CHAPTERS[0], false),
  roughness: 0.35,
  side: THREE.FrontSide
});
const flipPageBackMat = new THREE.MeshStandardMaterial({
  map: createBookPageTexture(CHAPTERS[Math.min(1, CHAPTERS.length - 1)], true),
  roughness: 0.35,
  side: THREE.BackSide
});

const flipPageMeshFront = new THREE.Mesh(pageGeo, flipPageFrontMat);
flipPageMeshFront.position.set(BOOK_W / 2 + 0.05, 0, 0);
flipPivot.add(flipPageMeshFront);

const flipPageMeshBack = new THREE.Mesh(pageGeo, flipPageBackMat);
flipPageMeshBack.position.set(BOOK_W / 2 + 0.05, 0, 0);
flipPivot.add(flipPageMeshBack);

flipPivot.rotation.y = 0;

// Apply vertex sine curl to the turning page
function applyPageCurl(mesh, curlFactor) {
  const pos = mesh.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const u = (x + BOOK_W / 2) / BOOK_W;
    const zCurl = Math.sin(u * Math.PI) * curlFactor;
    pos.setZ(i, zCurl);
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function animateBookPageTurn(direction) {
  if (isFlipping) return;
  if (direction === 'next' && activeChapterIdx >= CHAPTERS.length - 1) return;
  if (direction === 'prev' && activeChapterIdx <= 0) return;

  isFlipping = true;
  playPageFlipSound();

  const nextChapter = direction === 'next'
    ? CHAPTERS[activeChapterIdx + 1]
    : CHAPTERS[activeChapterIdx - 1];

  let frame = 0;
  const totalFrames = 48; // ~0.8s smooth flip

  if (direction === 'next') {
    flipPageFrontMat.map = createBookPageTexture(CHAPTERS[activeChapterIdx], false);
    flipPageBackMat.map = createBookPageTexture(nextChapter, true);
    flipPivot.rotation.y = 0;

    function stepNext() {
      frame++;
      const t = frame / totalFrames;
      // Cubic easing for realistic page weight
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const angle = -Math.PI * ease;
      flipPivot.rotation.y = angle;

      const curl = Math.sin(ease * Math.PI) * 1.4;
      applyPageCurl(flipPageMeshFront, curl);
      applyPageCurl(flipPageMeshBack, -curl);

      if (frame < totalFrames) {
        requestAnimationFrame(stepNext);
      } else {
        flipPivot.rotation.y = 0;
        applyPageCurl(flipPageMeshFront, 0);
        applyPageCurl(flipPageMeshBack, 0);
        activeChapterIdx++;
        updateActiveChapterUI();
        leftPageMat.map = createBookPageTexture(CHAPTERS[activeChapterIdx], true);
        rightPageMat.map = createBookPageTexture(CHAPTERS[activeChapterIdx], false);
        isFlipping = false;
      }
    }
    requestAnimationFrame(stepNext);

  } else {
    // Flip backwards from left to right
    flipPageFrontMat.map = createBookPageTexture(CHAPTERS[activeChapterIdx], true);
    flipPageBackMat.map = createBookPageTexture(nextChapter, false);
    flipPivot.rotation.y = -Math.PI;

    function stepPrev() {
      frame++;
      const t = frame / totalFrames;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const angle = -Math.PI * (1 - ease);
      flipPivot.rotation.y = angle;

      const curl = Math.sin(ease * Math.PI) * 1.4;
      applyPageCurl(flipPageMeshFront, -curl);
      applyPageCurl(flipPageMeshBack, curl);

      if (frame < totalFrames) {
        requestAnimationFrame(stepPrev);
      } else {
        flipPivot.rotation.y = 0;
        applyPageCurl(flipPageMeshFront, 0);
        applyPageCurl(flipPageMeshBack, 0);
        activeChapterIdx--;
        updateActiveChapterUI();
        leftPageMat.map = createBookPageTexture(CHAPTERS[activeChapterIdx], true);
        rightPageMat.map = createBookPageTexture(CHAPTERS[activeChapterIdx], false);
        isFlipping = false;
      }
    }
    requestAnimationFrame(stepPrev);
  }
}

// ─── PARADIGM 2: 3D Curved Spatial Ribbon (Cylindrical Wrap) ─────
const ribbonMasterGroup = new THREE.Group();
ribbonMasterGroup.position.set(0, 0, 0);
ribbonMasterGroup.visible = false;
scene.add(ribbonMasterGroup);

const RIBBON_RADIUS = 13.5;
const ribbonMeshes = [];

CHAPTERS.forEach((ch, idx) => {
  const slateGroup = new THREE.Group();

  // Glass backing
  const slateGeo = new THREE.BoxGeometry(9.2, 6.2, 0.18);
  const slateMat = new THREE.MeshPhysicalMaterial({
    map: createBookPageTexture(ch, false),
    roughness: 0.15,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1
  });
  const slateMesh = new THREE.Mesh(slateGeo, slateMat);
  slateGroup.add(slateMesh);

  // Glowing rim border
  const rimGeo = new THREE.BoxGeometry(9.4, 6.4, 0.04);
  const rimMat = new THREE.MeshBasicMaterial({ color: ch.color, wireframe: true });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.z = 0.1;
  slateGroup.add(rim);

  slateGroup.userData = { index: idx, chapter: ch };
  ribbonMasterGroup.add(slateGroup);
  ribbonMeshes.push(slateGroup);
});

function updateRibbonPositions() {
  ribbonMeshes.forEach((mesh, idx) => {
    const diff = idx - activeChapterIdx;
    const theta = diff * 0.44;
    const targetX = Math.sin(theta) * RIBBON_RADIUS;
    const targetZ = Math.cos(theta) * RIBBON_RADIUS - RIBBON_RADIUS;
    mesh.position.set(targetX, 0, targetZ);
    mesh.rotation.y = theta;

    // Fade and scale distant slates
    const distFactor = Math.abs(diff);
    mesh.scale.setScalar(distFactor === 0 ? 1.05 : 0.85);
  });
}
updateRibbonPositions();

// ─── PARADIGM 3: 3D Deep-Z Galaxy Flythrough ─────────────────────
const galaxyMasterGroup = new THREE.Group();
galaxyMasterGroup.position.set(0, 0, 0);
galaxyMasterGroup.visible = false;
scene.add(galaxyMasterGroup);

const GALAXY_STEP_Z = 24.0;
const galaxySteles = [];

const chapter3DAssetFactories = [
  createQuantumLatticeMesh,
  createNeuralMeshNode,
  createOrbitalMoltenCore,
  createDnaHelix,
  createTesseractHypercube
];

CHAPTERS.forEach((ch, idx) => {
  const steleGroup = new THREE.Group();
  const zPos = -idx * GALAXY_STEP_Z;
  steleGroup.position.set(0, 0, zPos);

  // Monolithic Glass Stele
  const steleGeo = new THREE.BoxGeometry(10.5, 7.2, 0.22);
  const steleMat = new THREE.MeshPhysicalMaterial({
    map: createBookPageTexture(ch, false),
    roughness: 0.18,
    metalness: 0.1,
    clearcoat: 0.9
  });
  const steleMesh = new THREE.Mesh(steleGeo, steleMat);
  steleGroup.add(steleMesh);

  // Floating 3D Micro-Model above the stele
  const modelFactory = chapter3DAssetFactories[idx % chapter3DAssetFactories.length];
  const model3d = modelFactory();
  model3d.position.set(0, 5.0, 0);
  model3d.scale.setScalar(1.2);
  steleGroup.add(model3d);

  steleGroup.userData = { index: idx, chapter: ch, model3d };
  galaxyMasterGroup.add(steleGroup);
  galaxySteles.push(steleGroup);
});

let targetCameraZ = defaultCamZ;
let targetLookAtZ = 0;

function flyToGalaxyChapter(idx) {
  playSwoopSound();
  targetLookAtZ = -idx * GALAXY_STEP_Z;
  targetCameraZ = targetLookAtZ + (isMobile ? 18.5 : 15.0);
}

// ─── Experience Mode Switcher ────────────────────────────────────
function setSpatialMode(mode) {
  currentMode = mode;

  modeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  if (mode === 'book') {
    bookMasterGroup.visible = true;
    ribbonMasterGroup.visible = false;
    galaxyMasterGroup.visible = false;

    controls.target.set(0, 0, 0);
    camera.position.set(0, 1.2, isMobile ? 18.5 : 15.0);
    hintMessage.textContent = 'Drag in 3D to orbit Cyber-Book • Swipe or tap PREV/NEXT to turn pages';

  } else if (mode === 'ribbon') {
    bookMasterGroup.visible = false;
    ribbonMasterGroup.visible = true;
    galaxyMasterGroup.visible = false;

    controls.target.set(0, 0, 0);
    camera.position.set(0, 0.8, isMobile ? 19.5 : 16.0);
    updateRibbonPositions();
    hintMessage.textContent = '3D Curved Ribbon wrapping around you • Tap PREV/NEXT to spin carousel';

  } else if (mode === 'galaxy') {
    bookMasterGroup.visible = false;
    ribbonMasterGroup.visible = false;
    galaxyMasterGroup.visible = true;

    flyToGalaxyChapter(activeChapterIdx);
    hintMessage.textContent = 'Deep-Z Galaxy Flythrough • Tap NEXT/PREV to warp camera through space';
  }

  updateActiveChapterUI();
}

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => setSpatialMode(btn.dataset.mode));
});

// ─── Update UI Indicators & Navigation ───────────────────────────
function updateActiveChapterUI() {
  const ch = CHAPTERS[activeChapterIdx];
  hudArticleTitle.textContent = `${ch.title.toUpperCase()}`;
  hudChapterBadge.textContent = `CH 0${ch.id} / 05`;
  hudProgressFill.style.width = `${(ch.id / CHAPTERS.length) * 100}%`;
  hudPageDetail.textContent = `Chapter ${ch.id} of 5`;

  // Update dynamic ambient backdrop
  spaceAmbientGlow.style.background = `radial-gradient(circle at 50% 50%, ${ch.glow} 0%, rgba(15, 23, 42, 0.1) 45%, transparent 70%)`;
}
updateActiveChapterUI();

// ─── Navigation Triggers (Thumb Bar Buttons) ─────────────────────
function navigateChapter(direction) {
  if (currentMode === 'book') {
    animateBookPageTurn(direction);
  } else if (currentMode === 'ribbon') {
    if (direction === 'next' && activeChapterIdx < CHAPTERS.length - 1) {
      activeChapterIdx++;
      playPageFlipSound();
      updateRibbonPositions();
      updateActiveChapterUI();
    } else if (direction === 'prev' && activeChapterIdx > 0) {
      activeChapterIdx--;
      playPageFlipSound();
      updateRibbonPositions();
      updateActiveChapterUI();
    }
  } else if (currentMode === 'galaxy') {
    if (direction === 'next' && activeChapterIdx < CHAPTERS.length - 1) {
      activeChapterIdx++;
      flyToGalaxyChapter(activeChapterIdx);
      updateActiveChapterUI();
    } else if (direction === 'prev' && activeChapterIdx > 0) {
      activeChapterIdx--;
      flyToGalaxyChapter(activeChapterIdx);
      updateActiveChapterUI();
    }
  }
}

btnNavNext.addEventListener('click', () => navigateChapter('next'));
btnNavPrev.addEventListener('click', () => navigateChapter('prev'));

// ─── Touch Swipe Detection for Mobile ────────────────────────────
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
  if (e.target.closest('#spatial-hud-header') || e.target.closest('#spatial-thumb-bar')) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (e.target.closest('#spatial-hud-header') || e.target.closest('#spatial-thumb-bar')) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
    if (dx < 0) {
      // Swiped Left -> Go Next
      navigateChapter('next');
    } else {
      // Swiped Right -> Go Prev
      navigateChapter('prev');
    }
  }
}, { passive: true });

// Keyboard Arrow Support
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    navigateChapter('next');
  } else if (e.key === 'ArrowLeft') {
    navigateChapter('prev');
  } else if (e.key === '1') {
    setSpatialMode('book');
  } else if (e.key === '2') {
    setSpatialMode('ribbon');
  } else if (e.key === '3') {
    setSpatialMode('galaxy');
  }
});

// ─── Top Action Pill Toggles ─────────────────────────────────────
btnToggleAudio.addEventListener('click', () => {
  isAudioEnabled = !isAudioEnabled;
  audioIcon.textContent = isAudioEnabled ? '🔊' : '🔇';
  audioLabel.textContent = isAudioEnabled ? 'SFX: ON' : 'SFX: OFF';
  btnToggleAudio.style.borderColor = isAudioEnabled ? '#00f3ff' : '#475569';
});

btnToggleAutoRotate.addEventListener('click', () => {
  controls.autoRotate = !controls.autoRotate;
  btnToggleAutoRotate.style.borderColor = controls.autoRotate ? '#00f3ff' : 'rgba(255, 255, 255, 0.14)';
});

btnResetCam.addEventListener('click', () => {
  controls.autoRotate = false;
  btnToggleAutoRotate.style.borderColor = 'rgba(255, 255, 255, 0.14)';

  if (currentMode === 'galaxy') {
    flyToGalaxyChapter(activeChapterIdx);
  } else {
    controls.target.set(0, 0, 0);
    camera.position.set(0, 1.2, defaultCamZ);
  }
  controls.update();
});

// ─── Main Animation Render Loop ──────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Controls update
  controls.update();

  // Rotate starfield particle dust
  starField.rotation.y = elapsedTime * 0.015;

  // Mode 1: Cyber-Book subtle breathing motion
  if (currentMode === 'book' && !isFlipping) {
    bookMasterGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;
  }

  // Mode 2: Ribbon gentle floating
  if (currentMode === 'ribbon') {
    ribbonMasterGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.14;
  }

  // Mode 3: Galaxy Camera Lerp & Micro-Models Animation
  if (currentMode === 'galaxy') {
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ, 0.06);
    controls.target.z = THREE.MathUtils.lerp(controls.target.z, targetLookAtZ, 0.06);

    galaxySteles.forEach(stele => {
      const m = stele.userData.model3d;
      if (m) {
        m.rotation.y += 0.012;
      }
    });
  }

  renderer.render(scene, camera);
}
animate();

// ─── Responsive Resize Handler ───────────────────────────────────
window.addEventListener('resize', () => {
  const isNowMobile = window.innerWidth < 768;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (currentMode !== 'galaxy') {
    camera.position.z = isNowMobile ? 18.5 : 15.0;
  }
});
