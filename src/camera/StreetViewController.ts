import * as THREE from 'three';

/**
 * First-person 360° Street View Controller
 * Delivers true Google Maps Street View navigation:
 * - 360° Panoramic Look Around (Yaw and Pitch) without direction locking.
 * - LOOK-DIRECTION-BASED MOVEMENT: Forward movement direction is ALWAYS the horizontal
 *   projection of whichever direction the camera is currently facing.
 *   • Looking forward -> Wheel Up moves forward down the trail.
 *   • Looking 90° left -> Wheel Up moves 90° to the left.
 *   • Looking 90° right -> Wheel Up moves 90° to the right.
 *   • Looking 180° backward -> Wheel Up moves backward along the view direction.
 *   • Looking up/down -> Movement direction remains purely horizontal on the ground plane.
 * - Wheel Down moves in the exact opposite direction of the current facing angle.
 * - Smooth inertial damping for authentic, high-end Street View navigation feel.
 * - Automatic terrain elevation tracking keeping camera at natural human eye level.
 */
export class StreetViewController {
  public camera: THREE.PerspectiveCamera;
  public roadCurve: THREE.CatmullRomCurve3;
  private domElement: HTMLElement;

  // World Position (meters)
  public position = new THREE.Vector3(0, 2.08, 0);
  public targetPosition = new THREE.Vector3(0, 2.08, 0);

  // 360° Viewing angles (radians)
  public yaw = 0;          // Horizontal azimuth angle (0 = facing -Z forward down trail)
  public targetYaw = 0;
  public pitch = 0;        // Vertical elevation angle (+ = look up, - = look down)
  public targetPitch = 0;

  // Interaction flags
  private isDragging = false;
  private previousMouseX = 0;
  private previousMouseY = 0;
  private hasInteracted = false;

  // Constants
  private readonly eyeHeight = 1.68; // Human eye height in meters
  private readonly wheelStepSize = 2.4; // Meters per mouse wheel notch

  // Terrain height sampler callback
  public getGroundHeight?: (x: number, z: number) => number;

  // Navigation callbacks
  public onNavigate?: (progress: number, headingDeg: number) => void;
  public onFirstInteraction?: () => void;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Define the scenic jungle pathway curve (x, y, z)
    const waypoints = [
      new THREE.Vector3(0, 0.4, 0),        // 0.00: Trailhead glade
      new THREE.Vector3(4, 0.6, -18),      // 0.12: Gentle right curve
      new THREE.Vector3(12, 0.9, -38),     // 0.25: Approaching ancient banyan
      new THREE.Vector3(8, 0.7, -62),      // 0.38: Under hanging vine canopy
      new THREE.Vector3(-4, 0.5, -84),     // 0.50: Left curve past exotic fruit grove
      new THREE.Vector3(-14, 0.8, -108),   // 0.62: Beside mossy rock boulders & stone marker
      new THREE.Vector3(-10, 1.2, -134),   // 0.75: Slope upwards through bamboo arch
      new THREE.Vector3(2, 1.6, -160),     // 0.88: Emerging into sunlit vista
      new THREE.Vector3(10, 1.8, -188)     // 1.00: Jungle overlook platform
    ];

    this.roadCurve = new THREE.CatmullRomCurve3(waypoints, false, 'centripetal', 0.5);

    // Initial positioning at trailhead
    this.position.set(0, 0.4 + this.eyeHeight, 0);
    this.targetPosition.copy(this.position);

    // Camera rotation setup using YXZ Euler order (independent yaw & pitch without roll)
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;
    this.camera.position.copy(this.position);

    this.initEventListeners();
  }

  /**
   * Computes the normalized horizontal forward vector corresponding to
   * the camera's CURRENT facing direction projected onto the XZ ground plane.
   */
  public getHorizontalForwardDirection(): THREE.Vector3 {
    const fwd = new THREE.Vector3();
    this.camera.getWorldDirection(fwd);
    fwd.y = 0; // Strip vertical component to keep movement strictly horizontal
    if (fwd.lengthSq() < 0.0001) {
      // Fallback if looking straight down or straight up
      fwd.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    }
    return fwd.normalize();
  }

  /**
   * Moves the viewpoint along the camera's CURRENT horizontal facing direction.
   * Positive distance = forward in look direction.
   * Negative distance = backward from look direction.
   */
  public moveForward(distance: number): void {
    const forward = this.getHorizontalForwardDirection();
    this.targetPosition.addScaledVector(forward, distance);
    this.clampTargetPosition();
    this.triggerFirstInteraction();
  }

  /**
   * Clamp target position to keep exploration within the lush jungle environment.
   */
  private clampTargetPosition(): void {
    this.targetPosition.x = THREE.MathUtils.clamp(this.targetPosition.x, -55, 55);
    this.targetPosition.z = THREE.MathUtils.clamp(this.targetPosition.z, -195, 12);
  }

  private initEventListeners(): void {
    // 1. Mouse Wheel: Look-Direction-Based Movement
    // Wheel Up   -> Advance along camera facing direction
    // Wheel Down -> Retreat backwards along camera facing direction
    this.domElement.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      this.triggerFirstInteraction();

      // Normalize delta
      const deltaSign = Math.sign(e.deltaY);
      const intensity = Math.min(Math.abs(e.deltaY), 100) / 100;
      const step = (this.wheelStepSize * intensity) || 1.8;

      // Wheel Up (deltaY < 0) -> move forward in look direction
      // Wheel Down (deltaY > 0) -> move backward in look direction
      if (deltaSign < 0) {
        this.moveForward(step);
      } else if (deltaSign > 0) {
        this.moveForward(-step);
      }
    }, { passive: false });

    // 2. Mouse Drag -> 360 Panoramic Look (Yaw and Pitch)
    this.domElement.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return; // Left mouse click only
      this.isDragging = true;
      this.previousMouseX = e.clientX;
      this.previousMouseY = e.clientY;
      this.triggerFirstInteraction();
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMouseX;
      const deltaY = e.clientY - this.previousMouseY;

      // First-person look sensitivity
      const sensitivity = 0.0032;
      this.targetYaw -= deltaX * sensitivity;
      this.targetPitch -= deltaY * sensitivity;

      // Clamp pitch to prevent flipping (-72 deg looking down to +68 deg looking up)
      const maxPitch = THREE.MathUtils.degToRad(68);
      const minPitch = THREE.MathUtils.degToRad(-72);
      this.targetPitch = THREE.MathUtils.clamp(this.targetPitch, minPitch, maxPitch);

      this.previousMouseX = e.clientX;
      this.previousMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // 3. Touch Drag -> 360 Panoramic Look for Mobile
    let touchStartX = 0;
    let touchStartY = 0;

    this.domElement.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        this.triggerFirstInteraction();
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;

      const sensitivity = 0.004;
      this.targetYaw -= deltaX * sensitivity;
      this.targetPitch -= deltaY * sensitivity;

      const maxPitch = THREE.MathUtils.degToRad(68);
      const minPitch = THREE.MathUtils.degToRad(-72);
      this.targetPitch = THREE.MathUtils.clamp(this.targetPitch, minPitch, maxPitch);

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // 4. Keyboard Navigation (W/Up = Forward in look direction, S/Down = Backward, A/D = Look left/right)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.moveForward(1.6);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.moveForward(-1.6);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.targetYaw += 0.05;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.targetYaw -= 0.05;
      }
    });
  }

  private triggerFirstInteraction(): void {
    if (!this.hasInteracted) {
      this.hasInteracted = true;
      if (this.onFirstInteraction) this.onFirstInteraction();
    }
  }

  /**
   * Jump or smoothly seek to a point along the road curve [0.0 - 1.0]
   */
  public seekTo(progress: number, immediate = false): void {
    const clampedProgress = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    const targetPt = new THREE.Vector3();
    this.roadCurve.getPointAt(clampedProgress, targetPt);

    const groundY = this.getGroundHeight ? this.getGroundHeight(targetPt.x, targetPt.z) : targetPt.y;
    targetPt.y = groundY + this.eyeHeight;

    this.targetPosition.copy(targetPt);
    if (immediate) {
      this.position.copy(targetPt);
      this.camera.position.copy(targetPt);
    }
    this.triggerFirstInteraction();
  }

  /**
   * Update per render frame with smooth Street View damping
   */
  public update(deltaTime: number): void {
    // 1. Damped rotational look (Yaw & Pitch)
    const rotDamping = 1 - Math.exp(-deltaTime * 16.0);
    this.yaw = THREE.MathUtils.lerp(this.yaw, this.targetYaw, rotDamping);
    this.pitch = THREE.MathUtils.lerp(this.pitch, this.targetPitch, rotDamping);

    // Apply rotation to camera in YXZ Euler order
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;

    // 2. Damped horizontal position movement (X & Z)
    const posDamping = 1 - Math.exp(-deltaTime * 8.0);
    this.position.x = THREE.MathUtils.lerp(this.position.x, this.targetPosition.x, posDamping);
    this.position.z = THREE.MathUtils.lerp(this.position.z, this.targetPosition.z, posDamping);

    // 3. Dynamic ground height tracking with eye elevation
    const groundY = this.getGroundHeight
      ? this.getGroundHeight(this.position.x, this.position.z)
      : 0.4;
    const targetEyeY = groundY + this.eyeHeight;
    this.position.y = THREE.MathUtils.lerp(this.position.y, targetEyeY, posDamping * 1.2);

    this.camera.position.copy(this.position);

    // 4. Update Navigation Callbacks
    if (this.onNavigate) {
      // Trail progress estimation based on -Z distance traveled from trailhead (0) to overlook (-188)
      const trailProgress = THREE.MathUtils.clamp(-this.position.z / 188.0, 0.0, 1.0);
      // Compass heading (0 deg = North/-Z, 90 deg = West/-X, 180 deg = South/+Z, 270 deg = East/+X)
      const headingDeg = (THREE.MathUtils.radToDeg(-this.yaw) % 360 + 360) % 360;
      this.onNavigate(trailProgress, headingDeg);
    }
  }

  /**
   * Returns current world position of the human eye camera
   */
  public getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  /**
   * Returns current progress along the path (0.0 to 1.0)
   */
  public getProgress(): number {
    return THREE.MathUtils.clamp(-this.position.z / 188.0, 0.0, 1.0);
  }
}
