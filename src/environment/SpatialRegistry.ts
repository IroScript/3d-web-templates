import * as THREE from 'three';

export interface SpatialOption {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
  action: (node: SpatialNode) => void;
}

export interface SpatialNodeConfig {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  position: THREE.Vector3;
  triggerDistance?: number; // Distance in meters where full spatial card reveals
  options: SpatialOption[];
  onInspect?: (node: SpatialNode) => void;
}

export interface SpatialNode extends SpatialNodeConfig {
  meshGroup: THREE.Group;
  domCard: HTMLElement;
  screenPos: THREE.Vector2;
  distanceToCamera: number;
  isFocused: boolean;
}

/**
 * SpatialRegistry
 * Manages 3D world-anchored interactive objects and spatial UI cards.
 * Integrates directly with the Three.js 3D scene and renders world-projected
 * interactive elements without traditional 2D website clutter.
 */
export class SpatialRegistry {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private domContainer: HTMLElement;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private nodes: SpatialNode[] = [];
  private activeModalNode: SpatialNode | null = null;
  private interactiveMeshes: THREE.Object3D[] = [];

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, domContainer: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.domContainer = domContainer;

    this.initDefaultSpatialNodes();
    this.initClickRaycasting();
  }

  /**
   * Registers a new 3D spatial interactive node
   */
  public registerNode(config: SpatialNodeConfig): SpatialNode {
    const triggerDist = config.triggerDistance || 18.0;

    // 1. Build 3D physical world anchor mesh
    const meshGroup = new THREE.Group();
    meshGroup.position.copy(config.position);

    // Outer subtle spatial ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x55ffaa,
      transparent: true,
      opacity: 0.7,
      wireframe: true
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    meshGroup.add(ringMesh);

    // Inner glowing spatial gem / focal beacon
    const coreGeo = new THREE.OctahedronGeometry(0.24, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00ffaa,
      emissive: 0x00ff88,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.2;
    meshGroup.add(coreMesh);

    // Subtle pulsing light aura
    const pointLight = new THREE.PointLight(0x44ffaa, 1.2, 8);
    pointLight.position.y = 0.3;
    meshGroup.add(pointLight);

    // Register mesh for raycasting
    coreMesh.userData = { nodeId: config.id };
    this.interactiveMeshes.push(coreMesh);

    this.scene.add(meshGroup);

    // 2. Build World-Anchored DOM Spatial Card
    const domCard = document.createElement('div');
    domCard.className = 'spatial-node-card';
    domCard.innerHTML = `
      <div class="spatial-card-header">
        <div class="spatial-icon">${config.icon}</div>
        <div class="spatial-info">
          <div class="spatial-cat">${config.category}</div>
          <div class="spatial-title">${config.title}</div>
        </div>
      </div>
      <div class="spatial-card-body">
        <p class="spatial-desc">${config.subtitle}</p>
        <div class="spatial-actions">
          ${config.options
            .map(
              (opt, idx) => `
            <button class="spatial-btn" data-opt-idx="${idx}">
              ${opt.icon ? `<span class="btn-icon">${opt.icon}</span>` : ''}
              <span>${opt.label}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    // Attach button click events
    const buttons = domCard.querySelectorAll<HTMLButtonElement>('.spatial-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-opt-idx') || '0', 10);
        const node = this.nodes.find((n) => n.id === config.id);
        if (node && node.options[idx]) {
          node.options[idx].action(node);
        }
      });
    });

    // Clicking anywhere on card focuses or inspects
    domCard.addEventListener('click', (e) => {
      e.stopPropagation();
      const node = this.nodes.find((n) => n.id === config.id);
      if (node) {
        this.openSpatialModal(node);
      }
    });

    this.domContainer.appendChild(domCard);

    const spatialNode: SpatialNode = {
      ...config,
      triggerDistance: triggerDist,
      meshGroup,
      domCard,
      screenPos: new THREE.Vector2(),
      distanceToCamera: 9999,
      isFocused: false
    };

    this.nodes.push(spatialNode);
    return spatialNode;
  }

  /**
   * Initializes initial scenic interactive spots along the jungle trail
   */
  private initDefaultSpatialNodes(): void {
    // 1. Ancient Banyan Tree Node (Tree-anchored interaction)
    this.registerNode({
      id: 'ancient-banyan',
      title: 'মহাবটবৃক্ষ আশ্রয়',
      subtitle: 'শতবর্ষী বটের শাখা ও বায়ো-ডাইভারসিটি হাব। এখান থেকে বনের আবহাওয়া ও ক্যানোপি পর্যবেক্ষণ করা যায়।',
      category: 'বৃক্ষ নোড · Tree Anchor',
      icon: '🌳',
      position: new THREE.Vector3(12.5, 2.2, -36),
      triggerDistance: 22,
      options: [
        {
          id: 'banyan-shade',
          label: 'ছায়াতল পরিবেশ বিশ্লেষণ',
          icon: '🍃',
          action: (n) => this.showNotification(n.title, 'বটবৃক্ষের ছায়াতলে তাপমাত্রা ২.৪°C শীতল এবং আর্দ্রতা ৮২% রেকর্ড করা হয়েছে।')
        },
        {
          id: 'banyan-canopy',
          label: 'ক্যানোপি ভিউ মোড',
          icon: '🔭',
          action: (n) => this.openSpatialModal(n)
        }
      ]
    });

    // 2. Exotic Wild Jungle Fruit (Flora/Fruit-anchored interaction)
    this.registerNode({
      id: 'wild-flora-fruit',
      title: 'অরণ্য ফল ও দুর্লভ গুল্ম',
      subtitle: 'বুনো রেইনফরেস্ট অর্কিড ও বন্য ফলের লতা। এর রেনু বনে প্রাকৃতিক সুগন্ধি ছড়ায়।',
      category: 'গুল্ম ও ফল · Wild Flora',
      icon: '🌺',
      position: new THREE.Vector3(-4.8, 1.4, -82),
      triggerDistance: 18,
      options: [
        {
          id: 'inspect-fruit',
          label: 'উদ্ভিদ বৈচিত্র্য নোট',
          icon: '🔬',
          action: (n) => this.showNotification(n.title, 'অর্কিড প্রজাতির এপিফাইট গুল্ম যা গাছের ডাল থেকে সরাসরি আর্দ্রতা শোষণ করে।')
        },
        {
          id: 'sample-pollen',
          label: 'পুষ্পরস বিস্তারিত',
          icon: '✨',
          action: (n) => this.openSpatialModal(n)
        }
      ]
    });

    // 3. Ancient Stone Trail Marker (Roadside Waypoint interaction)
    this.registerNode({
      id: 'mossy-waystone',
      title: 'শৈবালমণ্ডিত প্রাচীন স্তম্ভ',
      subtitle: 'পথের মধ্যভাগের প্রাকৃতিক দিকনির্দেশনা ও রেইনফরেস্ট উচ্চতামাপক চিহ্ন।',
      category: 'পথের নির্দেশিকা · Trail Waypoint',
      icon: '🗿',
      position: new THREE.Vector3(-12.8, 1.6, -106),
      triggerDistance: 19,
      options: [
        {
          id: 'read-waypoint',
          label: 'দূরত্ব ও উচ্চতা পাঠ',
          icon: '🧭',
          action: (n) => this.showNotification(n.title, 'যাত্রার ৬০% সম্পন্ন। সামনে বাঁক নিয়ে রাস্তা রোদঝলমল ভিউপয়েন্টে উন্মুক্ত হবে।')
        },
        {
          id: 'waypoint-details',
          label: 'সম্পূর্ণ গাইড খুলুন',
          icon: '📜',
          action: (n) => this.openSpatialModal(n)
        }
      ]
    });

    // 4. Scenic Vista Overlook (Jungle End Vista interaction)
    this.registerNode({
      id: 'jungle-vista-point',
      title: 'রেইনফরেস্ট প্যানোরামা ভিউ',
      subtitle: 'জঙ্গলের শেষ প্রান্তে অবস্থিত উচ্চভূমি। যেখান থেকে দূরবর্তী সবুজ পাহাড় ও কুয়াশাচ্ছন্ন উপত্যকা দেখা যায়।',
      category: 'উচ্চভূমি ওভারলুক · Vista Point',
      icon: '🌄',
      position: new THREE.Vector3(8.5, 2.6, -185),
      triggerDistance: 24,
      options: [
        {
          id: 'vista-capture',
          label: '৩৬০° প্যানোরামা পর্যবেক্ষণ',
          icon: '👀',
          action: (n) => this.showNotification(n.title, 'আপনি ট্রেইলের সর্বোচ্চ প্রাকৃতিক শীর্ষে পৌঁছেছেন! মাউস ড্র্যাগ করে সম্পূর্ণ উপত্যকা দেখুন।')
        },
        {
          id: 'vista-summary',
          label: 'ট্রেইল সামারি',
          icon: '🗺️',
          action: (n) => this.openSpatialModal(n)
        }
      ]
    });
  }

  private initClickRaycasting(): void {
    window.addEventListener('click', (e: MouseEvent) => {
      // Raycast against 3D interactive beacons
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0];
        const nodeId = hit.object.userData.nodeId;
        const node = this.nodes.find((n) => n.id === nodeId);
        if (node) {
          this.openSpatialModal(node);
        }
      }
    });
  }

  /**
   * Projects 3D nodes to 2D screen positions and updates visibility based on camera distance
   */
  public update(elapsedTime: number): void {
    const tempVec = new THREE.Vector3();
    const camPos = this.camera.position;

    this.nodes.forEach((node) => {
      // 1. Calculate distance from camera to node
      node.distanceToCamera = camPos.distanceTo(node.position);

      // 2. Animate 3D physical beacon
      const meshGroup = node.meshGroup;
      if (meshGroup.children[0]) {
        // Rotating outer ring
        meshGroup.children[0].rotation.z = elapsedTime * 0.7;
      }
      if (meshGroup.children[1]) {
        // Floating bobbing core gem
        meshGroup.children[1].rotation.y = elapsedTime * 1.2;
        meshGroup.children[1].position.y = 0.25 + Math.sin(elapsedTime * 2.5 + node.position.x) * 0.08;
      }

      // 3. Project 3D coordinate to screen space
      tempVec.copy(node.position);
      tempVec.y += 0.8; // Position card slightly above anchor
      tempVec.project(this.camera);

      // Check if behind camera
      const isBehind = tempVec.z > 1.0;

      // Convert normalized device coordinates to screen pixels
      const screenX = (tempVec.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-(tempVec.y * 0.5) + 0.5) * window.innerHeight;

      // Distance threshold
      const maxDistance = node.triggerDistance || 20.0;
      const isVisible = !isBehind && node.distanceToCamera < maxDistance;

      const card = node.domCard;
      if (isVisible) {
        // Smooth proximity opacity
        const distRatio = Math.max(0, Math.min(1, 1 - (node.distanceToCamera - 4) / (maxDistance - 4)));
        const opacity = Math.min(1, distRatio * 1.4);
        const scale = THREE.MathUtils.lerp(0.85, 1.0, distRatio);

        card.style.display = 'block';
        card.style.transform = `translate(-50%, -100%) translate3d(${screenX}px, ${screenY}px, 0) scale(${scale})`;
        card.style.opacity = `${opacity}`;
        card.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';

        // Add subtle active class when very close
        if (node.distanceToCamera < 10.0) {
          card.classList.add('in-range');
        } else {
          card.classList.remove('in-range');
        }
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
      }
    });
  }

  /**
   * Opens spatial inspection modal with options
   */
  public openSpatialModal(node: SpatialNode): void {
    this.activeModalNode = node;
    const modal = document.getElementById('spatial-modal');
    if (!modal) return;

    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDesc = document.getElementById('modal-desc');
    const modalActions = document.getElementById('modal-actions');

    if (modalIcon) modalIcon.innerText = node.icon;
    if (modalTitle) modalTitle.innerText = node.title;
    if (modalCategory) modalCategory.innerText = node.category;
    if (modalDesc) modalDesc.innerText = node.subtitle;

    if (modalActions) {
      modalActions.innerHTML = '';
      node.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'modal-action-btn';
        btn.innerHTML = `${opt.icon ? `<span class="btn-icon">${opt.icon}</span>` : ''} <span>${opt.label}</span>`;
        btn.addEventListener('click', () => {
          opt.action(node);
          this.closeSpatialModal();
        });
        modalActions.appendChild(btn);
      });
    }

    modal.classList.add('active');
  }

  public closeSpatialModal(): void {
    this.activeModalNode = null;
    const modal = document.getElementById('spatial-modal');
    if (modal) modal.classList.remove('active');
  }

  public getActiveNode(): SpatialNode | null {
    return this.activeModalNode;
  }

  /**
   * Displays subtle non-intrusive spatial notification
   */
  private showNotification(title: string, message: string): void {
    const toast = document.getElementById('spatial-toast');
    if (!toast) return;

    toast.innerHTML = `
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    `;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}
