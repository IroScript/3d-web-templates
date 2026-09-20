/**
 * 3D Jungle Street View - Core Frontend Experience
 * Google Maps Street View-style 3D Navigation with World-Anchored Spatial Interactions
 */

import * as THREE from 'three';
import { StreetViewController } from './camera/StreetViewController';
import { JungleWorld } from './environment/JungleWorld';
import { SpatialRegistry } from './environment/SpatialRegistry';

export class JungleStreetViewApp {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private clock: THREE.Clock;

  private controller: StreetViewController;
  private world: JungleWorld;
  private spatialRegistry: SpatialRegistry;

  // UI elements
  private progressBar: HTMLElement | null;
  private progressPercent: HTMLElement | null;
  private compassDial: HTMLElement | null;
  private hintElement: HTMLElement | null;

  // Vertical Navigation Slider (Mobile wheel alternative)
  private vSliderFill: HTMLElement | null;
  private vSliderThumb: HTMLElement | null;
  private vSliderBadge: HTMLElement | null;
  private vSliderTrack: HTMLElement | null;
  private vNavUpBtn: HTMLElement | null;
  private vNavDownBtn: HTMLElement | null;

  constructor() {
    this.canvas = document.getElementById('streetview-canvas') as HTMLCanvasElement;
    this.clock = new THREE.Clock();

    this.progressBar = document.getElementById('trail-progress-fill');
    this.progressPercent = document.getElementById('trail-percent');
    this.compassDial = document.getElementById('compass-dial');
    this.hintElement = document.getElementById('streetview-hint');

    this.vSliderFill = document.getElementById('v-slider-fill');
    this.vSliderThumb = document.getElementById('v-slider-thumb');
    this.vSliderBadge = document.getElementById('v-slider-badge');
    this.vSliderTrack = document.getElementById('v-slider-track');
    this.vNavUpBtn = document.getElementById('v-nav-up-btn');
    this.vNavDownBtn = document.getElementById('v-nav-down-btn');

    // 1. Scene Setup
    this.scene = new THREE.Scene();

    // 2. Camera Setup (Human eye level initial placement)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.1, 800);

    // 3. Renderer with Photorealistic Tone Mapping & Shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Street View Controller (True 360 First-Person Street View)
    this.controller = new StreetViewController(this.camera, this.canvas);

    // 5. Jungle World (Terrain, road, trees, undergrowth, lighting, god rays)
    this.world = new JungleWorld(this.scene, this.controller.roadCurve);

    // Link dynamic terrain ground height sampling to Street View controller
    this.controller.getGroundHeight = (x: number, z: number) => this.world.getGroundHeight(x, z);

    // 6. Spatial Registry (World-anchored interactive nodes & options)
    const spatialContainer = document.getElementById('spatial-container') as HTMLElement;
    this.spatialRegistry = new SpatialRegistry(this.scene, this.camera, spatialContainer);

    // 7. Bind UI Events
    this.initUI();
    this.initResizeHandler();
  }

  private initUI(): void {
    // Controller navigation callback to update Street View compass and progress bars
    this.controller.onNavigate = (progress: number, headingDeg: number) => {
      const pct = Math.round(progress * 100);
      if (this.progressBar) {
        this.progressBar.style.width = `${pct}%`;
      }
      if (this.progressPercent) {
        this.progressPercent.innerText = `${pct}%`;
      }
      if (this.vSliderFill) {
        this.vSliderFill.style.height = `${pct}%`;
      }
      if (this.vSliderThumb) {
        this.vSliderThumb.style.bottom = `${pct}%`;
      }
      if (this.vSliderBadge) {
        this.vSliderBadge.innerText = `${pct}%`;
      }
      if (this.compassDial) {
        this.compassDial.style.transform = `rotate(${headingDeg}deg)`;
      }
    };

    // First interaction fades out instruction hint
    this.controller.onFirstInteraction = () => {
      if (this.hintElement) {
        this.hintElement.classList.add('fade-out');
        setTimeout(() => {
          if (this.hintElement) this.hintElement.style.display = 'none';
        }, 1200);
      }
    };

    // Modal close button
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBackdrop = document.getElementById('spatial-modal');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.spatialRegistry.closeSpatialModal();
      });
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          this.spatialRegistry.closeSpatialModal();
        }
      });
    }

    // Road progress bar click seeking (horizontal trail bar)
    const track = document.getElementById('trail-progress-track');
    if (track) {
      track.addEventListener('click', (e: MouseEvent) => {
        const rect = track.getBoundingClientRect();
        const clickRatio = (e.clientX - rect.left) / rect.width;
        this.controller.seekTo(clickRatio);
      });
    }

    // ─── Vertical Navigation Slider (Mobile Touch Drag & Wheel Replacement) ───
    if (this.vSliderTrack) {
      let isDraggingSlider = false;
      let lastClientY = 0;

      const handleSliderMove = (clientY: number) => {
        const delta = lastClientY - clientY; // Dragging UP (delta > 0) = forward in look direction
        lastClientY = clientY;
        if (Math.abs(delta) > 0.5) {
          const moveStep = THREE.MathUtils.clamp(delta * 0.16, -3.5, 3.5);
          this.controller.moveForward(moveStep);
        }
      };

      // Touch events on vertical slider
      this.vSliderTrack.addEventListener('touchstart', (e: TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        isDraggingSlider = true;
        lastClientY = e.touches[0].clientY;
        if (this.vSliderThumb) this.vSliderThumb.classList.add('dragging');
      }, { passive: false });

      window.addEventListener('touchmove', (e: TouchEvent) => {
        if (!isDraggingSlider || e.touches.length === 0) return;
        e.preventDefault();
        handleSliderMove(e.touches[0].clientY);
      }, { passive: false });

      window.addEventListener('touchend', () => {
        if (isDraggingSlider) {
          isDraggingSlider = false;
          if (this.vSliderThumb) this.vSliderThumb.classList.remove('dragging');
        }
      });

      // Mouse events on vertical slider
      this.vSliderTrack.addEventListener('mousedown', (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        isDraggingSlider = true;
        lastClientY = e.clientY;
        if (this.vSliderThumb) this.vSliderThumb.classList.add('dragging');
      });

      window.addEventListener('mousemove', (e: MouseEvent) => {
        if (!isDraggingSlider) return;
        handleSliderMove(e.clientY);
      });

      window.addEventListener('mouseup', () => {
        if (isDraggingSlider) {
          isDraggingSlider = false;
          if (this.vSliderThumb) this.vSliderThumb.classList.remove('dragging');
        }
      });
    }

    // ─── Step Buttons (Up: Forward in Look Direction, Down: Backward) ───
    const setupStepButton = (btn: HTMLElement | null, stepDir: number) => {
      if (!btn) return;
      let intervalId: number | null = null;

      const stepOnce = () => {
        // Move in camera's current horizontal facing direction
        this.controller.moveForward(stepDir * 2.2);
      };

      const startHolding = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        stepOnce();
        intervalId = window.setInterval(() => {
          this.controller.moveForward(stepDir * 0.6);
        }, 40);
      };

      const stopHolding = () => {
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };

      btn.addEventListener('pointerdown', startHolding);
      btn.addEventListener('pointerup', stopHolding);
      btn.addEventListener('pointerleave', stopHolding);
      btn.addEventListener('pointercancel', stopHolding);
    };

    setupStepButton(this.vNavUpBtn, 1);   // Forward in look direction
    setupStepButton(this.vNavDownBtn, -1); // Backward from look direction
  }

  private initResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public start(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.getElapsedTime();

      // 1. Update first-person Street View camera along the road
      this.controller.update(delta);

      // 2. Update jungle animations (god rays pulse, spore floating)
      this.world.update(elapsed);

      // 3. Update spatial world-anchored interactive nodes
      this.spatialRegistry.update(elapsed);

      // 4. Render 3D Scene
      this.renderer.render(this.scene, this.camera);
    };

    loop();
    console.log('🌿 [Jungle Street View] 3D Environment and Spatial Interface loaded successfully!');
  }
}

// Bootstrap application on page mount
window.addEventListener('DOMContentLoaded', () => {
  const app = new JungleStreetViewApp();
  app.start();
});
