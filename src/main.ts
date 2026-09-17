/**
 * 3D Game Design Studio - Core Bootstrap Engine
 * WebGL / WebGPU interactive 3D scene with procedural lighting & dynamic actors
 */

import * as THREE from 'three';

class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private canvas: HTMLCanvasElement;
  private monolith!: THREE.Mesh;
  private rings: THREE.Mesh[] = [];
  private particles!: THREE.Points;
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private fpsDisplay: HTMLElement | null;
  private entitiesDisplay: HTMLElement | null;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.fpsDisplay = document.getElementById('stat-fps');
    this.entitiesDisplay = document.getElementById('stat-entities');
    this.clock = new THREE.Clock();

    // 1. Scene Initialization
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060814);
    this.scene.fog = new THREE.FogExp2(0x060814, 0.025);

    // 2. Camera Setup
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 8, 18);
    this.camera.lookAt(0, 2, 0);

    // 3. High Performance Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Build Environment
    this.setupLighting();
    this.buildWorld();
    this.setupEventListeners();

    if (this.entitiesDisplay) {
      this.entitiesDisplay.innerText = `${this.scene.children.length}`;
    }
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0x223355, 1.5);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x00ffff, 2.5);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xff0077, 4, 30);
    pointLight.position.set(-8, 6, -8);
    this.scene.add(pointLight);
  }

  private buildWorld(): void {
    // Cyberpunk Neon Grid Floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x00ffcc, 0x1e293b);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    // Reflective Base Platform
    const floorGeo = new THREE.CylinderGeometry(12, 14, 0.6, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.3;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Central Monolith
    const monolithGeo = new THREE.BoxGeometry(2, 6, 2);
    const monolithMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.2
    });
    this.monolith = new THREE.Mesh(monolithGeo, monolithMat);
    this.monolith.position.set(0, 3.5, 0);
    this.monolith.castShadow = true;
    this.scene.add(this.monolith);

    // Floating Energy Rings
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(3.5 + i * 1.5, 0.08, 16, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x00ffcc : i === 1 ? 0xff00aa : 0x38bdf8,
        wireframe: true
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 3.5;
      ring.rotation.x = Math.PI / 2 + i * 0.2;
      this.rings.push(ring);
      this.scene.add(ring);
    }

    // Floating Particle Cloud
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00ffff);
    const c2 = new THREE.Color(0xff0088);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = (Math.random() - 0.5) * 40;

      const mixed = c1.clone().lerp(c2, Math.random());
      colors[i] = mixed.r;
      colors[i + 1] = mixed.g;
      colors[i + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.onResize());

    // Basic Orbit / Camera Drag Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handlePointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = (clientX - prevMouseX) * 0.005;
      const deltaY = (clientY - prevMouseY) * 0.005;

      const radius = Math.hypot(this.camera.position.x, this.camera.position.z);
      const theta = Math.atan2(this.camera.position.z, this.camera.position.x) + deltaX;

      this.camera.position.x = radius * Math.cos(theta);
      this.camera.position.z = radius * Math.sin(theta);
      this.camera.position.y = Math.max(2, Math.min(25, this.camera.position.y - deltaY * 10));
      this.camera.lookAt(0, 2, 0);

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    this.canvas.addEventListener('mousedown', (e) => handlePointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => handlePointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', handlePointerUp);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public start(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      this.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private update(): void {
    const elapsed = this.clock.getElapsedTime();

    // Rotate monolith
    if (this.monolith) {
      this.monolith.rotation.y = elapsed * 0.5;
      this.monolith.position.y = 3.5 + Math.sin(elapsed * 2) * 0.25;
    }

    // Rotate energy rings
    this.rings.forEach((ring, idx) => {
      const speed = (idx + 1) * 0.4;
      ring.rotation.z = elapsed * speed;
      ring.rotation.x = Math.PI / 2 + Math.sin(elapsed + idx) * 0.3;
    });

    // Animate particles
    if (this.particles) {
      this.particles.rotation.y = elapsed * 0.05;
    }

    // FPS Meter
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      if (this.fpsDisplay) this.fpsDisplay.innerText = `${fps}`;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }
}

// Start Game Studio
window.addEventListener('DOMContentLoaded', () => {
  const engine = new GameEngine();
  engine.start();
  console.log('🎮 [3D Game Studio] Engine successfully mounted and running!');
});
