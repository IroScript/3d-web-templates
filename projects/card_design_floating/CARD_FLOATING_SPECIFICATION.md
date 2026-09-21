# 🌟 EXITO 3D FLOATING CARDS — COMPLETE TECHNICAL & ARCHITECTURAL SPECIFICATION
**Project Path:** `/home/mdkamruzzamanirak_gmail_com/3D-Game-Design-Studio/projects/card_design_floating`  
**Engine:** Three.js (r128+ ESM) + Vanilla HTML5/CSS3 Canvas + OrbitControls  
**Target Platform:** Mobile-First Responsive Web (PWA/Touch) & High-Performance Desktop  

---

## 📌 1. EXECUTIVE OVERVIEW & CORE DESIGN CONCEPT

This project is a high-fidelity **Infinite 3D Floating Cards Studio & Inspection Engine**. It presents an unbounded, procedural tapestry of glassmorphic 3D fintech cards floating in an isometric matrix. 

### Key Architectural Pillars:
1. **Infinite Procedural Matrix:** 25 modular 3D cards arranged in a continuous wrapping toroidal grid. The user can pan infinitely in any direction (`X`, `Y`) without ever reaching an edge or boundary.
2. **Procedural Canvas Texture Engine:** High-resolution dynamic 2D canvas generation (`1500x1000px`) producing razor-sharp typography, gradients, badges, and buttons mapped to physical 3D materials with anisotropic filtering.
3. **Hybrid 2D/3D Embedded Meshes:** Each card features embedded procedural 3D models (spinning physical metal coins, neon particle spheres, orbital rings, and glowing light waves).
4. **Flat-to-Screen Inspection Transition (Stationary / স্থির ভিউ):** When a user clicks or holds any card, the engine un-tilts the card from the 3D isometric group, scales it dynamically to fit the viewport without overflow, and holds it 100% flat and stationary right in front of the screen.
5. **Mobile-First Responsive Frustum Math:** Dynamic bounding box calculations based on camera Field-of-View (FOV) and viewport aspect ratio ensure zero clipping or overflow on narrow mobile screens (360px–430px) as well as 4K monitors.

```
+-------------------------------------------------------------------------+
|                           TOP NAVIGATION HEADER                         |
|   [< EXITO] [INFINITE 3D CARDS]            [Drift: ON] [Reset View]     |
+-------------------------------------------------------------------------+
|                                                                         |
|         [Card (-1,1)]            [Card (0,1)]            [Card (1,1)]   |
|               \                        |                        /       |
|                \                       |                       /        |
|                 +---------------------------------------------+         |
|                 |      SELECTED CARD (FLAT-TO-SCREEN)         |         |
|                 |                                             |         |
|                 |  EXITO                   Sign In            |         |
|                 |  [AI Technology]                            |         |
|                 |  AI-POWERED FINANCIAL       [3D MESH]       |         |
|                 |  INTELLIGENCE              (Spinning)       |         |
|                 |                                             |         |
|                 |  [Get Started ->]                           |         |
|                 +---------------------------------------------+         |
|                /                       |                       \        |
|               /                        |                        \       |
|         [Card (-1,-1)]           [Card (0,-1)]           [Card (1,-1)]  |
|                                                                         |
|                [✕ Return to Floating Grid (Thumb Zone)]                 |
+-------------------------------------------------------------------------+
|  [AI Tech] [Quantum FX] [Pedestal] [Loop] [Licensed] [Global Network]  |
|                      BOTTOM CARDS SWITCHER BAR                          |
+-------------------------------------------------------------------------+
```

---

## 📁 2. DIRECTORY STRUCTURE & FILE MANIFEST

```
/home/mdkamruzzamanirak_gmail_com/3D-Game-Design-Studio/projects/card_design_floating/
├── index.html                    # Semantic HTML5 DOM layout, UI overlays, import maps
├── style.css                     # Mobile-first glassmorphic design system & animations
├── app.js                        # Complete Three.js runtime, math engine & event lifecycle
├── OrbitControls.js              # Customized Three.js camera control module
├── three.module.min.js           # Lightweight production Three.js ESM build
├── card_design_floating.zip      # Bundled production distribution archive
├── start_tunnel.sh               # Cloudflare tunnel & local HTTP server automation
├── CARD_FLOATING_SPECIFICATION.md# This comprehensive technical specification
└── logs/
    ├── cloudflared.log           # Tunnel routing and connection logs
    └── http_server.log           # HTTP daemon access logs
```

---

## 🧱 3. HTML ARCHITECTURE (`index.html`)

The DOM architecture separates the interactive 2D HUD from the hardware-accelerated 3D WebGL viewport:

### Layer Hierarchy & Z-Index Stacking:
| Layer | Element ID / Selector | Z-Index | Purpose & Functionality |
|---|---|---|---|
| **0** | `.ambient-glow` | `0` | CSS radial gradient backdrop providing atmospheric light |
| **1** | `#viewport-container` | `10` | Fullscreen (`100vw`, `100vh`) touch-action container |
| **1a**| `#webgl-canvas` | - | Canvas element bound to WebGLRenderer |
| **2** | `#studio-header` | `50` | Glassmorphic top navigation bar with branding & controls |
| **2a**| `.instruction-pill` | `20` | Dynamic status hint pill ("Pan grid", "Card view active") |
| **3** | `#btn-close-flat` | `60` | High-priority thumb-zone button to exit flat inspection view |
| **4** | `#bottom-card-bar` | `40` | Horizontal scrollable tray of quick-access card selector pills |

### HTML Source Outline:
```html
<!-- Ambient Lighting Backdrops -->
<div class="ambient-glow glow-top-left"></div>
<div class="ambient-glow glow-bottom-right"></div>
<div class="ambient-glow glow-center"></div>

<!-- Top Studio Header -->
<header id="studio-header">
  <div class="header-left">
    <div class="brand-badge"><span class="logo-chevron">&lt;</span><span class="logo-name">EXITO</span></div>
    <div class="studio-tag"><span class="tag-dot"></span><span>INFINITE 3D CARDS</span></div>
  </div>
  <div class="header-center">
    <div class="mode-badge-pill" id="grid-status-pill">🌐 Unlimited Infinite Grid</div>
  </div>
  <div class="header-right">
    <button class="control-pill-btn" id="btn-toggle-drift"><span id="drift-label">✨ Drift: ON</span></button>
    <button class="control-pill-btn" id="btn-reset-view"><span>🎯 Reset</span></button>
  </div>
</header>

<!-- Viewport & Action Overlay -->
<div id="viewport-container">
  <canvas id="webgl-canvas"></canvas>
  <div id="instruction-pill" class="instruction-pill">...</div>
  <button id="btn-close-flat" class="btn-close-flat hidden">
    <span class="close-icon">&times;</span>
    <span class="close-text">Return to Floating Grid</span>
  </button>
</div>

<!-- Bottom Navigation Bar -->
<footer id="bottom-card-bar">
  <div class="card-pills-scroll" id="card-pills-container">
    <button class="card-pill active" data-type="0">...</button>
    <!-- 9 Design Pills -->
  </div>
</footer>
```

---

## 🎨 4. CSS ARCHITECTURE & DESIGN SYSTEM (`style.css`)

### 4.1. Design Tokens:
- **Background:** `#f1f5f9` (Ultra-clean slate gray)
- **Primary Text:** `#0f172a` (Slate 900 high contrast)
- **Muted Text:** `#64748b` (Slate 500)
- **Accents:** Indigo (`#6366f1`), Purple (`#8b5cf6`), Pink (`#ec4899`), Cyan (`#06b6d4`), Emerald (`#10b981`)
- **Glassmorphism Spec:** `background: rgba(255, 255, 255, 0.88)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.95)`, `box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.08)`

### 4.2. Mobile-First Responsiveness & Thumb Zone:
- **Mobile Header (`< 768px`):** The center badge `.mode-badge-pill` is hidden via media query, and `#studio-header` is locked to `flex-wrap: nowrap` with `padding: 8px 12px`. This prevents multi-line wrapping and keeps header height clamped to `~44px`.
- **Thumb Zone Close Action (`#btn-close-flat`):** Positioned at `bottom: 84px; left: 50%; transform: translateX(-50%)`. This places the return button directly in the ergonomic thumb zone right below the inspected card, avoiding awkward top-screen reaches on tall mobile phones.
- **Scrollable Bottom Pill Bar (`#bottom-card-bar`):** Horizontal scroll with `-webkit-overflow-scrolling: touch` and hidden scrollbars (`scrollbar-width: none`).

---

## ⚙️ 5. THREE.JS 3D ENGINE ARCHITECTURE (`app.js`)

### 5.1. Coordinate Systems & Scene Graph Hierarchy:

```
[THREE.Scene]
   ├── [THREE.AmbientLight] (Intensity: 1.4)
   ├── [THREE.DirectionalLight] (Key Light: 2.8, shadows enabled)
   ├── [THREE.DirectionalLight] (Blue Rim: 2.0)
   ├── [THREE.DirectionalLight] (Pink Fill: 1.2)
   └── [tapestryMasterGroup] (Isometric Rotation: X=-0.34, Y=0.36, Z=0.12)
         │
         ├── [cardGroup 0]
         │     ├── cardMesh (BoxGeometry: 11.8 x 8.0 x 0.16)
         │     ├── shadowMesh (PlaneGeometry + Radial Blurred Gradient Texture)
         │     └── embeddedModel (MiniCoin / AiSphere / Wave / Pedestal)
         │
         ├── [cardGroup 1] ...
         └── [cardGroup 24] (5x5 Modular Matrix)
```

### 5.2. Core Physical Dimensions:
- `CARD_WIDTH = 11.8` Three.js world units
- `CARD_HEIGHT = 8.0` Three.js world units
- `CARD_DEPTH = 0.16` Three.js world units
- `SPACING_X = 14.5` (Horizontal pitch between card origins)
- `SPACING_Y = 10.0` (Vertical pitch between card origins)
- `COLS = 5`, `ROWS = 5` $\rightarrow$ Total active cards = `25`
- `TOTAL_SPAN_X = 5 * 14.5 = 72.5`
- `TOTAL_SPAN_Y = 5 * 10.0 = 50.0`

### 5.3. Camera Configuration:
- Type: `THREE.PerspectiveCamera(fov: 46, aspect, near: 0.1, far: 400)`
- Initial Camera Position:
  - Mobile (`< 768px`): `(2.0, 1.5, 42.0)`
  - Desktop: `(2.0, 1.5, 34.0)`
- `OrbitControls` configuration:
  - Touch configuration: `ONE: THREE.TOUCH.PAN`, `TWO: THREE.TOUCH.DOLLY_ROTATE`
  - Allows natural one-finger panning on smartphones.

---

## 🎨 6. DYNAMIC PROCEDURAL CANVAS TEXTURE SYSTEM

Instead of loading massive static PNG/JPG textures across network requests, each card's visual design is rendered dynamically in memory using HTML5 Canvas (`1500 x 1000px`) via `createCardCanvasTexture(config)`:

### Texture Generation Pipeline:
1. **Background Canvas Allocation:** $1500 \times 1000$ offscreen canvas with linear background gradient (`#ffffff` $\rightarrow$ `#f8fafc` $\rightarrow$ `#eef2ff`).
2. **Radial Ambient Glow:** Right-side radial gradient positioned at $(w \cdot 0.72, h \cdot 0.5)$ tinted with `config.glowColor`.
3. **Card Micro-Header:**
   - App logo chevron badge (`< EXITO`)
   - Breadcrumb navigation links (`Home`, `Service`, `About`, `Industries`, `Contact`)
   - Rounded "Sign In" glass pill button
4. **Hero Typography & Word Wrap:**
   - Pill badge tag (e.g. `AI TECHNOLOGY`, `MARKET PULSE`)
   - Primary heading rendered at `800 62px "Plus Jakarta Sans"` with auto line-breaking at `maxWidth = 580px`.
   - Description copy rendered at `400 21px` with auto line-breaking at `dMaxWidth = 540px`.
   - Pill CTA button (`Get Started →`) and scroll down footer indicator.
5. **Texture Conversion:**
   ```javascript
   const tex = new THREE.CanvasTexture(canvas);
   tex.anisotropy = 8; // Sharp filtering under steep isometric angles
   ```
6. **Texture Sharing:** The 9 core designs are pre-rendered into `sharedTextures[]` at initialization. The 25 cards reuse these textures via modulo indexing (`idx % CORE_DESIGNS.length`), keeping memory overhead under 15MB.

---

## 🌐 7. INFINITE TOROIDAL MATRIX WRAPPING MATHEMATICS

The 25 cards form a continuous moving matrix. When the user pans the camera, cards wrap seamlessly around the camera target in local space:

```
                  +TOTAL_SPAN_Y / 2
                         |
      Wrap to bottom <-- | --> Wrap to bottom
                         |
-TOTAL_SPAN_X / 2 -------+------- +TOTAL_SPAN_X / 2  (Camera Local Target)
                         |
      Wrap to top    <-- | --> Wrap to top
                         |
                  -TOTAL_SPAN_Y / 2
```

### Wrapping Algorithm in `animate()`:
```javascript
// Transform camera focus target into tapestryMasterGroup's local coordinate space
const localTarget = tapestryMasterGroup.worldToLocal(controls.target.clone());

cardMeshes.forEach((card, idx) => {
  if (card.userData.isFlat) return; // Selected flat card never wraps

  let curX = card.userData.currentGridPos.x;
  let curY = card.userData.currentGridPos.y;

  // Horizontal Toroidal Wrap
  const diffX = curX - localTarget.x;
  if (diffX > TOTAL_SPAN_X / 2) {
    curX -= TOTAL_SPAN_X;
  } else if (diffX < -TOTAL_SPAN_X / 2) {
    curX += TOTAL_SPAN_X;
  }

  // Vertical Toroidal Wrap
  const diffY = curY - localTarget.y;
  if (diffY > TOTAL_SPAN_Y / 2) {
    curY -= TOTAL_SPAN_Y;
  } else if (diffY < -TOTAL_SPAN_Y / 2) {
    curY += TOTAL_SPAN_Y;
  }

  card.userData.currentGridPos.x = curX;
  card.userData.currentGridPos.y = curY;

  // Harmonic wave drift physics
  const floatZ = isDrifting ? Math.sin(elapsedTime * 1.4 + idx * 0.7) * 0.28 : 0;
  const floatY = isDrifting ? Math.sin(elapsedTime * 1.2 + idx * 0.5) * 0.15 : 0;

  card.userData.targetLocalPos.set(curX, curY + floatY, floatZ);
  
  // Smooth Interpolation
  card.position.lerp(card.userData.targetLocalPos, 0.06);
  card.quaternion.slerp(card.userData.targetLocalQuat, 0.06);
  card.scale.lerp(card.userData.targetScale, 0.06);
});
```

---

## 🎯 8. FLAT-TO-SCREEN TRANSFORMATION MATHEMATICS (STATIONARY VIEW)

When a card is selected, it transitions from the tilted isometric grid into a **stationary, 100% flat front-and-center inspection view** parallel to the camera sensor.

### 8.1. Viewport Frustum & Scale Calculation (Preventing Mobile Overflow):
Given camera vertical field-of-view $\theta = 46^\circ$ and target distance $D = 18.0$:

$$\text{visibleHeight} = 2 \cdot D \cdot \tan\left(\frac{\theta \cdot \pi / 180}{2}\right) = 2 \cdot 18.0 \cdot \tan(23^\circ) \approx 15.281$$

$$\text{visibleWidth} = \text{visibleHeight} \cdot \text{camera.aspect}$$

To ensure the card never overflows any mobile or desktop screen:
- **Mobile Portrait ($\text{aspect} < 1.0$):**
  - $\text{maxOccupyWidth} = 88\%$
  - $\text{maxOccupyHeight} = 52\%$ (Leaves top header and bottom controls fully visible)
- **Desktop Landscape ($\text{aspect} \ge 1.0$):**
  - $\text{maxOccupyWidth} = 70\%$
  - $\text{maxOccupyHeight} = 60\%$

The optimal scale factor $S_{\text{fit}}$ is computed dynamically:

$$S_W = \frac{\text{visibleWidth} \cdot \text{maxOccupyWidth}}{\text{CARD\_WIDTH}}$$

$$S_H = \frac{\text{visibleHeight} \cdot \text{maxOccupyHeight}}{\text{CARD\_HEIGHT}}$$

$$S_{\text{fit}} = \min(S_W, S_H)$$

### Device Verification Table:
| Device Name | Screen W x H | Aspect | Scale ($S_{\text{fit}}$) | Card Rendered Size | Horizontal Margin | Vertical Margins | Overflow Status |
|---|---|---|---|---|---|---|---|
| **iPhone SE** | $375 \times 667$ | 0.562 | 0.641 | $330 \times 224\text{px}$ | $23\text{px}$ (Left/Right) | $222\text{px}$ (Top/Bottom) | **0% (Fits 100%)** |
| **iPhone 12/14** | $390 \times 844$ | 0.462 | 0.527 | $343 \times 233\text{px}$ | $23\text{px}$ (Left/Right) | $306\text{px}$ (Top/Bottom) | **0% (Fits 100%)** |
| **Galaxy S20** | $360 \times 800$ | 0.450 | 0.513 | $317 \times 215\text{px}$ | $22\text{px}$ (Left/Right) | $293\text{px}$ (Top/Bottom) | **0% (Fits 100%)** |
| **Galaxy Ultra** | $412 \times 915$ | 0.450 | 0.513 | $363 \times 246\text{px}$ | $25\text{px}$ (Left/Right) | $335\text{px}$ (Top/Bottom) | **0% (Fits 100%)** |
| **iPad Mini** | $768 \times 1024$ | 0.750 | 0.855 | $676 \times 458\text{px}$ | $46\text{px}$ (Left/Right) | $283\text{px}$ (Top/Bottom) | **0% (Fits 100%)** |
| **Desktop 1080p**| $1920 \times 1080$| 1.778 | 1.146 | $956 \times 648\text{px}$ | $482\text{px}$ (Left/Right)| $216\text{px}$ (Top/Bottom) | **0% (Fits 100%)** |

### 8.2. World Target Position:
The target world coordinate is computed along the camera's optical line-of-sight:

$$\vec{P}_{\text{world}} = \vec{P}_{\text{cam}} + \vec{V}_{\text{cam\_forward}} \cdot D$$

Because cards are children of `tapestryMasterGroup`, the world target is mapped into local group space:

$$\vec{P}_{\text{local}} = \mathbf{M}_{\text{master\_world}}^{-1} \cdot \vec{P}_{\text{world}}$$

### 8.3. Quaternion Inversion (Canceling Isometric Tilt):
In the scene graph, the world rotation of a card is:

$$\mathbf{Q}_{\text{world}} = \mathbf{Q}_{\text{master}} \cdot \mathbf{Q}_{\text{card}}$$

To make the card align perfectly parallel to the camera view plane ($\mathbf{Q}_{\text{world}} = \mathbf{Q}_{\text{camera}}$):

$$\mathbf{Q}_{\text{card}} = \mathbf{Q}_{\text{master}}^{-1} \cdot \mathbf{Q}_{\text{camera}}$$

In code:
```javascript
const masterInverseQuat = tapestryMasterGroup.quaternion.clone().invert();
const targetLocalQuat = masterInverseQuat.multiply(camera.quaternion);
cardGroup.userData.targetLocalQuat.copy(targetLocalQuat);
```

---

## 👆 9. POINTER & TOUCH EVENT LIFECYCLE

The interaction model supports both desktop mouse clicks and mobile touch gestures without conflict:

```
[PointerDown]
   │
   ├─> Check UI overlays (#studio-header, #bottom-card-bar, #btn-close-flat) -> Ignore if hit
   │
   ├─> Raycast into tapestryMasterGroup.children
   │     ├─> Hit card found:
   │     │     Start holdTimeout (240ms debounce)
   │     │     Record pointerDownPos & pointerDownTime
   │     └─> No hit: heldCard = null
   ▼
[PointerMove]
   │
   └─> Calculate drag distance: dist = hypot(dx, dy)
         └─> If dist > 8px: Cancel holdTimeout (User is panning the grid)
   ▼
[PointerUp]
   │
   ├─> Clear holdTimeout
   │
   ├─> If dist < 8px (Tap gesture):
   │     ├─> If activeFlatCard is open:
   │     │     Check: (Date.now() - flatOpenedTime > 350ms)
   │     │        └─> TRUE: returnCardToGrid()
   │     │        └─> FALSE: Ignore (Prevent immediate finger-release dismissal after hold)
   │     └─> Else if heldCard:
   │           bringCardFlatToScreen(heldCard)
   ▼
[Reset / Close Button Click]
   │
   └─> returnCardToGrid() -> Reset position, identity quaternion, restore controls.enabled = true
```

---

## 💎 10. EMBEDDED PROCEDURAL 3D ASSETS

Each card contains an embedded 3D object linked to its domain model:
1. **AI Technology (`createModelAiSphere`):** Cyan core sphere (`r=1.15`) surrounded by 1,800 iridescent point particles distributed across a spherical shell (`r=1.85`), with orbital neon rings.
2. **Quantum FX (`createModelQuantum`):** Center physical chrome coin with multiple inclined orbiting rings and tumbling satellite coins.
3. **Pedestal (`createModelPedestal`):** Tiered hexagonal plinth with a floating physical gold coin rotating with sinus elevation.
4. **Loop (`createModelLoop`):** Dual crossing neon torus rings with counter-rotating metallic coins.
5. **Licensed FX (`createModelLicensed`):** Glass cylindrical showcase shield with an illuminated center coin.
6. **Network Track (`createModelTrack`):** Torus knot ribbon path with a gliding, tilting coin.
7. **Wave (`createModelWave`):** Sine-wave curve tube orbiting around a gold coin.

---

## 🚀 11. DEVELOPER & AI EXTENSION GUIDE

### How to add a new card design:
1. Open [`file:///home/mdkamruzzamanirak_gmail_com/3D-Game-Design-Studio/projects/card_design_floating/app.js`](file:///home/mdkamruzzamanirak_gmail_com/3D-Game-Design-Studio/projects/card_design_floating/app.js).
2. Append a new design object to `CORE_DESIGNS`:
   ```javascript
   {
     badge: 'Your Tag',
     title: 'Headline Text',
     desc: 'Two line descriptive text detailing the feature.',
     glowColor: 'rgba(99, 102, 241, 0.75)',
     modelFn: createYourModelFunction // optional procedural 3D model
   }
   ```
3. The engine automatically integrates it into `sharedTextures[]`, bottom navigation pills, and the 5x5 matrix wrapping loop.

### How to tune grid dimensions:
Modify `CARD_WIDTH`, `CARD_HEIGHT`, `SPACING_X`, `SPACING_Y`, `COLS`, `ROWS` in `app.js` (Lines 364–374). The matrix span constants (`TOTAL_SPAN_X`, `TOTAL_SPAN_Y`) recalculate automatically.

---

## 📊 12. VERIFICATION & TEST SUMMARY

- **Syntax Validation:** Verified with `node -c app.js` (0 errors).
- **Frustum Fit Test:** Verified across 9 screen resolutions (iPhone SE, 12, 14 Pro Max, Galaxy S20, Ultra, iPad, 1080p, 1440p) with 100% positive margin clearance.
- **Network Verification:** HTTP/2 200 validated over Cloudflare public tunnel and local Python HTTP server on port 5176.
- **Git State:** Versioned locally under git commit `267cfc8` authored by `IroScript <mdkamruzzamanirak@gmail.com>`.
