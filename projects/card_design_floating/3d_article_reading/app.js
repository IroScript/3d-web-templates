/**
 * EXITO · 3D SPATIAL ARTICLE READING EXPERIENCE ENGINE
 * Narrative Scrollytelling • 3D Book Page Flip • Vision Pro Glass HUD • Dynamic Lightspace
 */

import * as THREE from 'three';

// ─── DOM References ──────────────────────────────────────────────
const canvas = document.getElementById('spatial-canvas');
const ambientLightspace = document.getElementById('ambient-lightspace');
const lightspaceIndicator = document.getElementById('lightspace-indicator');
const readingProgressBar = document.getElementById('reading-progress-bar');
const spatialReadingViewport = document.getElementById('spatial-reading-viewport');
const narrativeScrollArea = document.getElementById('narrative-scroll-area');
const spatialGlassSlab = document.getElementById('spatial-glass-slab');
const journalFlipContainer = document.getElementById('journal-flip-container');
const btnPrevPage = document.getElementById('btn-prev-page');
const btnNextPage = document.getElementById('btn-next-page');
const journalPageCounter = document.getElementById('journal-page-counter');

// Navigation & Mode Controls
const modeButtons = document.querySelectorAll('.mode-btn');
const chapterNodes = document.querySelectorAll('.chapter-node');
const chapterSections = document.querySelectorAll('.reading-chapter-section');
const focusParagraphs = document.querySelectorAll('.focus-paragraph');
const btnToggleTheme = document.getElementById('btn-toggle-theme');
const themeIcon = document.getElementById('theme-icon');
const btnToggleDof = document.getElementById('btn-toggle-dof');
const btnReRead = document.getElementById('btn-re-read');

// Thumb Controls
const btnThumbPrev = document.getElementById('btn-thumb-prev-chapter');
const btnThumbNext = document.getElementById('btn-thumb-next-chapter');
const btnThumbMode = document.getElementById('btn-thumb-toggle-mode');
const thumbModeLabel = document.getElementById('thumb-mode-label');

// ─── State Variables ─────────────────────────────────────────────
let currentMode = 'narrative'; // 'narrative' | 'journal' | 'vision'
let activeChapterIndex = 0;
let isDarkMode = false;
let isDofActive = true;
let readingProgress = 0;
let journalCurrentPage = 1;
const journalTotalPages = 6;
let isFlipping = false;

// ─── Three.js Scene Setup ────────────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xf8fafc, 0.018);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 1.0, 18.0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ─── Dynamic Lightspace System ───────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xf8faff, 2.5);
keyLight.position.set(15, 25, 20);
keyLight.castShadow = true;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x00f3ff, 2.0);
rimLight.position.set(-20, 15, -10);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xec4899, 1.2);
fillLight.position.set(5, -15, 12);
scene.add(fillLight);

// Lightspace Phases based on Reading Progress (0% to 100%)
const LIGHT_PHASES = [
  { p: 0.00, label: '09:00 AM · AURORA DAWN', amb: 0xf0fdf4, key: 0xf8faff, rim: 0x00f3ff, glow: 'rgba(0, 243, 255, 0.22)' },
  { p: 0.25, label: '12:00 PM · SOLAR COHERENCE', amb: 0xffffff, key: 0xffffff, rim: 0x38bdf8, glow: 'rgba(56, 189, 248, 0.22)' },
  { p: 0.60, label: '05:30 PM · GOLDEN TWILIGHT', amb: 0xfef3c7, key: 0xf59e0b, rim: 0xec4899, glow: 'rgba(245, 158, 11, 0.24)' },
  { p: 0.85, label: '11:00 PM · STELLAR MIDNIGHT', amb: 0x1e1b4b, key: 0x818cf8, rim: 0xa855f7, glow: 'rgba(168, 85, 247, 0.25)' }
];

function updateLightspace(progress) {
  let phase = LIGHT_PHASES[0];
  for (let i = 0; i < LIGHT_PHASES.length; i++) {
    if (progress >= LIGHT_PHASES[i].p) {
      phase = LIGHT_PHASES[i];
    }
  }

  lightspaceIndicator.textContent = phase.label;
  ambientLight.color.setHex(phase.amb);
  keyLight.color.setHex(phase.key);
  rimLight.color.setHex(phase.rim);

  ambientLightspace.style.background = `radial-gradient(circle at 75% 30%, ${phase.glow} 0%, rgba(99, 102, 241, 0.1) 45%, transparent 75%)`;
}

// ─── Ambient Stardust Particle Field (Depth Layer) ───────────────
const starCount = 600;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starCol = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 45;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 35 - 5;

  const col = new THREE.Color().setHSL(0.55 + Math.random() * 0.2, 0.8, 0.7);
  starCol[i * 3] = col.r;
  starCol[i * 3 + 1] = col.g;
  starCol[i * 3 + 2] = col.b;
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));

const starMat = new THREE.PointsMaterial({
  size: 0.08,
  vertexColors: true,
  transparent: true,
  opacity: 0.75
});
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// ─── Procedural Contextual 3D Chapter Models ─────────────────────
const modelGroup = new THREE.Group();
modelGroup.position.set(4.5, 0, -2);
scene.add(modelGroup);

// Model 0: Quantum Atom Lattice
function createQuantumLattice() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    new THREE.MeshPhysicalMaterial({ color: 0x00f3ff, roughness: 0.1, metalness: 0.9, clearcoat: 0.8 })
  );
  g.add(core);

  const rings = [];
  const ringAngles = [0.3, 0.9, -0.6, 1.4];
  ringAngles.forEach((ang, idx) => {
    const rGeo = new THREE.TorusGeometry(2.0 + idx * 0.4, 0.04, 16, 80);
    const rMat = new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? 0x00f3ff : 0xa855f7, wireframe: true });
    const r = new THREE.Mesh(rGeo, rMat);
    r.rotation.x = ang;
    r.rotation.y = idx * 0.8;
    g.add(r);
    rings.push(r);
  });

  g.userData = { core, rings };
  return g;
}

// Model 1: Neural Mesh
function createNeuralMeshModel() {
  const g = new THREE.Group();
  const nodeCount = 42;
  const nodes = [];
  const nodePos = [];

  for (let i = 0; i < nodeCount; i++) {
    const p = new THREE.Vector3(
      (Math.random() - 0.5) * 4.2,
      (Math.random() - 0.5) * 4.2,
      (Math.random() - 0.5) * 3.5
    );
    nodePos.push(p);

    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x6366f1 })
    );
    m.position.copy(p);
    g.add(m);
    nodes.push(m);
  }

  // Synaptic Connecting Lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (nodePos[i].distanceTo(nodePos[j]) < 2.0) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([nodePos[i], nodePos[j]]);
        const line = new THREE.Line(lineGeo, lineMat);
        g.add(line);
      }
    }
  }

  g.userData = { nodes };
  return g;
}

// Model 2: Orbital Space Foundry
function createOrbitalModel() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.4, 1),
    new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.95, emissive: 0x78350f, emissiveIntensity: 0.3 })
  );
  g.add(core);

  const solarRings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.3 + i * 0.5, 0.06, 16, 64),
      new THREE.MeshPhysicalMaterial({ color: 0xec4899, metalness: 0.9, roughness: 0.1 })
    );
    ring.rotation.x = 1.0 + i * 0.4;
    ring.rotation.z = i * 0.8;
    g.add(ring);
    solarRings.push(ring);
  }

  g.userData = { core, rings: solarRings };
  return g;
}

// Model 3: Living Bio-Silicon DNA Helix
function createDnaHelixModel() {
  const g = new THREE.Group();
  const turns = 2.5;
  const height = 5.5;
  const radius = 1.5;
  const pairs = 32;

  const matStrand1 = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
  const matStrand2 = new THREE.MeshBasicMaterial({ color: 0xec4899 });
  const matRung = new THREE.LineBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.6 });

  for (let i = 0; i < pairs; i++) {
    const t = (i / pairs) * (Math.PI * 2 * turns);
    const y = (i / pairs) * height - height / 2;

    const x1 = Math.cos(t) * radius;
    const z1 = Math.sin(t) * radius;
    const x2 = Math.cos(t + Math.PI) * radius;
    const z2 = Math.sin(t + Math.PI) * radius;

    const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), matStrand1);
    b1.position.set(x1, y, z1);
    g.add(b1);

    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), matStrand2);
    b2.position.set(x2, y, z2);
    g.add(b2);

    const rungGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x1, y, z1), new THREE.Vector3(x2, y, z2)]);
    const rung = new THREE.Line(rungGeo, matRung);
    g.add(rung);
  }

  return g;
}

// Model 4: Post-Digital Synthesis (Tesseract)
function createSynthesisModel() {
  const g = new THREE.Group();
  const innerBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.65, roughness: 0.1, clearcoat: 1.0 })
  );
  g.add(innerBox);

  const outerBox = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 2.8, 2.8),
    new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true })
  );
  g.add(outerBox);

  g.userData = { innerBox, outerBox };
  return g;
}

// Map models to chapters
const chapter3DModels = [
  createQuantumLattice(),
  createNeuralMeshModel(),
  createOrbitalModel(),
  createDnaHelixModel(),
  createSynthesisModel()
];

chapter3DModels.forEach((m, idx) => {
  m.visible = (idx === 0);
  m.position.set(0, 0, 0);
  modelGroup.add(m);
});

// ─── Mode 2: 3D Holographic Journal Book Mesh ────────────────────
const bookGroup = new THREE.Group();
bookGroup.position.set(0, 0, 8.5);
bookGroup.visible = false;
scene.add(bookGroup);

// Hard book cover
const coverGeo = new THREE.BoxGeometry(7.2, 5.0, 0.3);
const coverMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8, clearcoat: 0.7 });
const bookCover = new THREE.Mesh(coverGeo, coverMat);
bookGroup.add(bookCover);

// Left stationary page plane
function createJournalPageTexture(pageNum) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 768;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 768);

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 36px "Space Grotesk", sans-serif';
  ctx.fillText(`3D JOURNAL · PAGE ${pageNum}`, 60, 90);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 115); ctx.lineTo(964, 115);
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
  const sampleLines = [
    `Chapter Content Volume ${pageNum} — The Architecture of Thought`,
    'Quantum coherence navigates multidimensional topological surfaces.',
    'Distributed neural meshes replace traditional centralized architectures.',
    'Decentralized event-driven spikes mirror cortical columns.',
    'Data density is stored in synthesized nucleotide strands with zero decay.'
  ];
  sampleLines.forEach((l, idx) => {
    ctx.fillText(l, 60, 180 + idx * 56);
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 18px "Space Grotesk", sans-serif';
  ctx.fillText(`[ EXITO 3D SPATIAL PUBLISHING • CHAPTER 0${Math.min(pageNum, 5)} ]`, 60, 680);

  return new THREE.CanvasTexture(c);
}

const pageGeo = new THREE.PlaneGeometry(3.3, 4.6, 24, 24);
const leftPageMat = new THREE.MeshStandardMaterial({ map: createJournalPageTexture(1), roughness: 0.3 });
const leftPage = new THREE.Mesh(pageGeo, leftPageMat);
leftPage.position.set(-1.7, 0, 0.16);
bookGroup.add(leftPage);

const rightPageMat = new THREE.MeshStandardMaterial({ map: createJournalPageTexture(2), roughness: 0.3 });
const rightPage = new THREE.Mesh(pageGeo, rightPageMat);
rightPage.position.set(1.7, 0, 0.16);
bookGroup.add(rightPage);

// 3D Flipping Page Mesh with Curved Geometry
const flipPagePivot = new THREE.Group();
flipPagePivot.position.set(0, 0, 0.18);
bookGroup.add(flipPagePivot);

const flipPageMat = new THREE.MeshStandardMaterial({ map: createJournalPageTexture(3), side: THREE.DoubleSide, roughness: 0.3 });
const flipPageMesh = new THREE.Mesh(pageGeo, flipPageMat);
flipPageMesh.position.set(1.65, 0, 0);
flipPagePivot.add(flipPageMesh);
flipPagePivot.rotation.y = 0;

// ─── Scrollytelling & Intersection Observer ─────────────────────
function switchActiveChapter(newIndex) {
  if (newIndex === activeChapterIndex || newIndex < 0 || newIndex >= chapter3DModels.length) return;

  activeChapterIndex = newIndex;

  // Update Left Node Graph UI
  chapterNodes.forEach((node, idx) => {
    node.classList.toggle('active', idx === activeChapterIndex);
  });

  // Switch 3D Model with Smooth Crossfade
  chapter3DModels.forEach((m, idx) => {
    m.visible = (idx === activeChapterIndex);
  });
}

// Observe Narrative Chapters as they enter viewport
const chapterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
      const idx = parseInt(entry.target.dataset.index, 10);
      switchActiveChapter(idx);
    }
  });
}, {
  root: narrativeScrollArea,
  threshold: [0.35, 0.6]
});

chapterSections.forEach(sec => chapterObserver.observe(sec));

// Depth-of-Field (DOF) Paragraph Observer
const dofObserver = new IntersectionObserver((entries) => {
  if (!isDofActive) return;
  entries.forEach(entry => {
    entry.target.classList.toggle('active-focus', entry.isIntersecting);
  });
}, {
  root: narrativeScrollArea,
  rootMargin: '-30% 0px -30% 0px',
  threshold: 0.2
});

focusParagraphs.forEach(p => dofObserver.observe(p));

// ─── Scroll Progress & Dynamic Lighting Engine ───────────────────
narrativeScrollArea.addEventListener('scroll', () => {
  const maxScroll = narrativeScrollArea.scrollHeight - narrativeScrollArea.clientHeight;
  if (maxScroll > 0) {
    readingProgress = narrativeScrollArea.scrollTop / maxScroll;
    readingProgressBar.style.width = `${readingProgress * 100}%`;
    updateLightspace(readingProgress);

    // Parallax depth motion on 3D model
    modelGroup.position.y = -readingProgress * 3.5;
    starField.position.y = -readingProgress * 5.0;
  }
});

// ─── Chapter Node Click & Smooth Scroll ──────────────────────────
chapterNodes.forEach((node, idx) => {
  node.addEventListener('click', () => {
    const targetSection = document.getElementById(`chapter-${idx}`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Experience Mode Switcher (Narrative vs Journal vs Vision) ───
function setExperienceMode(mode) {
  currentMode = mode;

  modeButtons.forEach(btn => {
    const isActive = btn.dataset.mode === mode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  spatialReadingViewport.className = `spatial-viewport mode-${mode}`;
  thumbModeLabel.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;

  if (mode === 'narrative') {
    narrativeScrollArea.classList.remove('hidden');
    journalFlipContainer.classList.add('hidden');
    bookGroup.visible = false;
    modelGroup.visible = true;
    camera.position.set(0, 1.0, 18.0);
  } else if (mode === 'journal') {
    narrativeScrollArea.classList.add('hidden');
    journalFlipContainer.classList.remove('hidden');
    bookGroup.visible = true;
    modelGroup.visible = false;
    camera.position.set(0, 0, 13.5);
  } else if (mode === 'vision') {
    narrativeScrollArea.classList.remove('hidden');
    journalFlipContainer.classList.add('hidden');
    bookGroup.visible = false;
    modelGroup.visible = true;
    camera.position.set(0, 1.0, 17.0);
  }
}

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => setExperienceMode(btn.dataset.mode));
});

// ─── 3D Journal Flip Controller ──────────────────────────────────
function flipToNextPage() {
  if (isFlipping || journalCurrentPage >= journalTotalPages) return;
  isFlipping = true;

  let progress = 0;
  const duration = 45; // frames (~0.75s)

  function stepFlip() {
    progress++;
    const t = progress / duration;
    // Ease out cubic
    const angle = -Math.PI * (1 - Math.pow(1 - t, 3));
    flipPagePivot.rotation.y = angle;

    if (progress < duration) {
      requestAnimationFrame(stepFlip);
    } else {
      journalCurrentPage += 2;
      journalPageCounter.textContent = `Page ${journalCurrentPage} of ${journalTotalPages}`;
      leftPageMat.map = createJournalPageTexture(journalCurrentPage);
      rightPageMat.map = createJournalPageTexture(journalCurrentPage + 1);
      flipPagePivot.rotation.y = 0;
      isFlipping = false;
    }
  }
  requestAnimationFrame(stepFlip);
}

function flipToPrevPage() {
  if (isFlipping || journalCurrentPage <= 1) return;
  isFlipping = true;

  journalCurrentPage -= 2;
  journalPageCounter.textContent = `Page ${journalCurrentPage} of ${journalTotalPages}`;
  leftPageMat.map = createJournalPageTexture(journalCurrentPage);
  rightPageMat.map = createJournalPageTexture(journalCurrentPage + 1);

  flipPagePivot.rotation.y = -Math.PI;
  let progress = 0;
  const duration = 45;

  function stepFlipBack() {
    progress++;
    const t = progress / duration;
    const angle = -Math.PI * (1 - t * t);
    flipPagePivot.rotation.y = angle;

    if (progress < duration) {
      requestAnimationFrame(stepFlipBack);
    } else {
      flipPagePivot.rotation.y = 0;
      isFlipping = false;
    }
  }
  requestAnimationFrame(stepFlipBack);
}

btnNextPage.addEventListener('click', flipToNextPage);
btnPrevPage.addEventListener('click', flipToPrevPage);

// ─── Vision Pro Glass Tilt (Pointer Tracking) ────────────────────
window.addEventListener('pointermove', (e) => {
  const normX = (e.clientX / window.innerWidth) - 0.5;
  const normY = (e.clientY / window.innerHeight) - 0.5;

  if (currentMode === 'vision') {
    spatialGlassSlab.style.setProperty('--tilt-x', `${-normY * 12}deg`);
    spatialGlassSlab.style.setProperty('--tilt-y', `${normX * 14}deg`);
  }

  // Soft Parallax on 3D Model in Background
  modelGroup.rotation.y = normX * 0.45;
  modelGroup.rotation.x = normY * 0.35;
});

// ─── Theme & Focus Depth Toggles ─────────────────────────────────
btnToggleTheme.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('theme-dark-obsidian', isDarkMode);
  document.body.classList.toggle('theme-light-glass', !isDarkMode);
  themeIcon.textContent = isDarkMode ? '☀️' : '🌙';

  scene.fog.color.setHex(isDarkMode ? 0x0b0f19 : 0xf8fafc);
  renderer.setClearColor(isDarkMode ? 0x0b0f19 : 0xf8fafc, 0);
});

btnToggleDof.addEventListener('click', () => {
  isDofActive = !isDofActive;
  document.body.classList.toggle('focus-mode-active', isDofActive);
  btnToggleDof.innerHTML = `<span>🎯 Focus: ${isDofActive ? 'ON' : 'OFF'}</span>`;
  btnToggleDof.style.borderColor = isDofActive ? '#6366f1' : '#cbd5e1';
});

// Initialize Focus Mode
document.body.classList.add('focus-mode-active');

btnReRead.addEventListener('click', () => {
  narrativeScrollArea.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── Mobile Thumb Controls Actions ───────────────────────────────
btnThumbPrev.addEventListener('click', () => {
  if (currentMode === 'journal') {
    flipToPrevPage();
  } else {
    const prevIdx = Math.max(0, activeChapterIndex - 1);
    const target = document.getElementById(`chapter-${prevIdx}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

btnThumbNext.addEventListener('click', () => {
  if (currentMode === 'journal') {
    flipToNextPage();
  } else {
    const nextIdx = Math.min(chapter3DModels.length - 1, activeChapterIndex + 1);
    const target = document.getElementById(`chapter-${nextIdx}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

btnThumbMode.addEventListener('click', () => {
  const modes = ['narrative', 'journal', 'vision'];
  const nextModeIdx = (modes.indexOf(currentMode) + 1) % modes.length;
  setExperienceMode(modes[nextModeIdx]);
});

// ─── Main Animation Render Loop ──────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Subtle rotation on stardust particles
  starField.rotation.y = elapsedTime * 0.02;

  // Animate Active 3D Chapter Model
  const activeModel = chapter3DModels[activeChapterIndex];
  if (activeModel && activeModel.visible) {
    activeModel.rotation.y += 0.008;

    if (activeModel.userData.rings) {
      activeModel.userData.rings.forEach((r, idx) => {
        r.rotation.z += 0.006 * (idx + 1);
      });
    }

    if (activeModel.userData.nodes) {
      activeModel.userData.nodes.forEach((n, idx) => {
        n.position.y += Math.sin(elapsedTime * 2.0 + idx) * 0.002;
      });
    }

    if (activeModel.userData.innerBox) {
      activeModel.userData.innerBox.rotation.x = elapsedTime * 0.25;
      activeModel.userData.innerBox.rotation.y = elapsedTime * 0.35;
      activeModel.userData.outerBox.rotation.z = -elapsedTime * 0.2;
    }
  }

  // Animate Book when in Journal Mode
  if (bookGroup.visible) {
    bookGroup.rotation.y = Math.sin(elapsedTime * 0.6) * 0.06;
  }

  renderer.render(scene, camera);
}
animate();

// ─── Responsive Resize Handler ───────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerWidth < 768) {
    modelGroup.position.set(0, 2.5, -4);
  } else {
    modelGroup.position.set(4.5, 0, -2);
  }
});

// Initial responsive model position
if (window.innerWidth < 768) {
  modelGroup.position.set(0, 2.5, -4);
}
