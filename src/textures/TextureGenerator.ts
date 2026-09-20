import * as THREE from 'three';

/**
 * Procedural Texture Generator for High-Fidelity 3D Jungle Environment
 * Creates lightweight, organic canvas-based textures with zero external asset dependencies.
 */
export class TextureGenerator {
  /**
   * Generates forest floor soil & moss texture
   */
  public static createGroundTexture(): THREE.CanvasTexture {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base dark loamy earth
    ctx.fillStyle = '#1e1a12';
    ctx.fillRect(0, 0, size, size);

    // Multi-layer dirt & moss speckles
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const noise = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 20 + (Math.random() - 0.5) * 35;
        const mossNoise = Math.sin(x * 0.02 + y * 0.015) + Math.cos(x * 0.01 - y * 0.02);

        if (mossNoise > 0.4) {
          // Lush green moss patch
          data[idx] = Math.min(255, Math.max(0, 30 + noise * 0.4)); // R
          data[idx + 1] = Math.min(255, Math.max(0, 65 + noise * 0.8 + 25)); // G
          data[idx + 2] = Math.min(255, Math.max(0, 25 + noise * 0.3)); // B
        } else {
          // Dark humus / dirt
          data[idx] = Math.min(255, Math.max(0, 42 + noise * 0.5));
          data[idx + 1] = Math.min(255, Math.max(0, 32 + noise * 0.4));
          data[idx + 2] = Math.min(255, Math.max(0, 22 + noise * 0.3));
        }
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Add fallen dry leaves / twigs
    ctx.fillStyle = 'rgba(75, 45, 20, 0.45)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      const w = 4 + Math.random() * 8;
      const h = 2 + Math.random() * 4;
      ctx.beginPath();
      ctx.ellipse(rx, ry, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    return texture;
  }

  /**
   * Generates forest trail / path texture with worn dirt, packed stones, and mossy edges
   */
  public static createRoadTexture(): THREE.CanvasTexture {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Packed dirt baseline
    const gradient = ctx.createLinearGradient(0, 0, size, 0);
    gradient.addColorStop(0, '#2b331f'); // Mossy left verge
    gradient.addColorStop(0.15, '#3b2f21'); // Edge dirt
    gradient.addColorStop(0.5, '#5c4832'); // Center worn path
    gradient.addColorStop(0.85, '#3b2f21'); // Edge dirt
    gradient.addColorStop(1, '#2b331f'); // Mossy right verge
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add pebbled texture and trail tire/foot impressions
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 30;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n * 0.9));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n * 0.7));
    }
    ctx.putImageData(imgData, 0, 0);

    // Scattered pebbles and small river stones along the road
    for (let i = 0; i < 300; i++) {
      const px = size * 0.15 + Math.random() * size * 0.7;
      const py = Math.random() * size;
      const rad = 2 + Math.random() * 5;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(90, 85, 80, 0.7)' : 'rgba(120, 105, 85, 0.6)';
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 16);
    return texture;
  }

  /**
   * Generates organic tree bark texture with vertical fissures & moss patches
   */
  public static createBarkTexture(): THREE.CanvasTexture {
    const width = 512;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Dark woody base
    ctx.fillStyle = '#261b14';
    ctx.fillRect(0, 0, width, height);

    // Vertical bark ridges
    for (let x = 0; x < width; x += 3) {
      const tone = 20 + Math.sin(x * 0.2) * 15 + Math.random() * 25;
      const g = tone * 0.85 + (Math.random() > 0.85 ? 15 : 0);
      ctx.fillStyle = `rgb(${Math.floor(tone + 10)}, ${Math.floor(g)}, ${Math.floor(tone * 0.6)})`;
      ctx.fillRect(x, 0, 2 + Math.random() * 2, height);
    }

    // Organic crack lines
    ctx.strokeStyle = 'rgba(15, 10, 6, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      let sx = Math.random() * width;
      let sy = Math.random() * height;
      ctx.moveTo(sx, sy);
      for (let s = 0; s < 5; s++) {
        sx += (Math.random() - 0.5) * 10;
        sy += 20 + Math.random() * 30;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Moss patches on bark
    ctx.fillStyle = 'rgba(40, 85, 30, 0.4)';
    for (let i = 0; i < 20; i++) {
      const mx = Math.random() * width;
      const my = Math.random() * height;
      ctx.beginPath();
      ctx.ellipse(mx, my, 25 + Math.random() * 20, 40 + Math.random() * 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }

  /**
   * Generates realistic tropical fern leaf with transparent alpha cutout
   */
  public static createFernLeafTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Transparent background
    ctx.clearRect(0, 0, size, size);

    // Central rachis (stem)
    ctx.strokeStyle = '#2d5a27';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(size / 2, size - 20);
    ctx.quadraticCurveTo(size / 2 - 20, size / 2, size / 2, 20);
    ctx.stroke();

    // Leaflets (pinnae) branching outward
    const pairs = 22;
    for (let i = 0; i < pairs; i++) {
      const t = i / pairs;
      const y = (size - 40) - t * (size - 60);
      const stemX = size / 2 + Math.sin(t * Math.PI) * -15;
      const leafLength = Math.sin(t * Math.PI) * 180 + 20;

      // Left leaflet
      ctx.fillStyle = t > 0.5 ? '#38782a' : '#27581c';
      ctx.beginPath();
      ctx.moveTo(stemX, y);
      ctx.quadraticCurveTo(stemX - leafLength * 0.6, y - 10, stemX - leafLength, y - 5);
      ctx.quadraticCurveTo(stemX - leafLength * 0.5, y + 10, stemX, y + 5);
      ctx.fill();

      // Right leaflet
      ctx.fillStyle = t > 0.5 ? '#468b35' : '#2f6523';
      ctx.beginPath();
      ctx.moveTo(stemX, y);
      ctx.quadraticCurveTo(stemX + leafLength * 0.6, y - 10, stemX + leafLength, y - 5);
      ctx.quadraticCurveTo(stemX + leafLength * 0.5, y + 10, stemX, y + 5);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates tropical palm fan frond with alpha transparency
   */
  public static createPalmFrondTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    // Arching thick palm spine
    const cx = size / 2;
    const startY = size - 30;

    // Fan-like leaflets radiating from spine
    const segments = 32;
    for (let i = 0; i < segments; i++) {
      const angle = (i / (segments - 1) - 0.5) * 1.3 - Math.PI / 2;
      const len = 200 + Math.sin((i / segments) * Math.PI) * 180;

      const grad = ctx.createLinearGradient(cx, startY, cx + Math.cos(angle) * len, startY + Math.sin(angle) * len);
      grad.addColorStop(0, '#2d5e22');
      grad.addColorStop(0.7, '#448b30');
      grad.addColorStop(1, '#61aa44');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx, startY);
      ctx.lineTo(cx + Math.cos(angle) * len, startY + Math.sin(angle) * len);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates broadleaf jungle foliage (Monstera / Giant Taro) with rich veins
   */
  public static createMonsteraLeafTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    // Large waxy heart-shaped leaf
    ctx.save();
    ctx.translate(size / 2, size / 2);

    const grad = ctx.createRadialGradient(0, -40, 20, 0, 0, 240);
    grad.addColorStop(0, '#38832a');
    grad.addColorStop(0.6, '#23611a');
    grad.addColorStop(1, '#15410e');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 210); // Tip
    ctx.bezierCurveTo(-140, 150, -220, 20, -180, -90);
    ctx.bezierCurveTo(-150, -180, -60, -200, 0, -130);
    ctx.bezierCurveTo(60, -200, 150, -180, 180, -90);
    ctx.bezierCurveTo(220, 20, 140, 150, 0, 210);
    ctx.fill();

    // Central primary vein
    ctx.strokeStyle = '#5cb842';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -130);
    ctx.lineTo(0, 210);
    ctx.stroke();

    // Lateral veins
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(92, 184, 66, 0.6)';
    for (let y = -90; y < 180; y += 30) {
      // Left
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(-70, y - 15, -140 + Math.abs(y) * 0.3, y - 40);
      ctx.stroke();
      // Right
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(70, y - 15, 140 - Math.abs(y) * 0.3, y - 40);
      ctx.stroke();
    }

    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates volumetric sunbeam texture with gentle gaussian falloff
   */
  public static createSunbeamTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(255, 248, 200, 0.45)');
    grad.addColorStop(0.3, 'rgba(255, 240, 170, 0.25)');
    grad.addColorStop(0.8, 'rgba(180, 230, 150, 0.08)');
    grad.addColorStop(1, 'rgba(100, 200, 120, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Radial edge softness
    const hGrad = ctx.createLinearGradient(0, 0, 256, 0);
    hGrad.addColorStop(0, 'rgba(0,0,0,1)');
    hGrad.addColorStop(0.2, 'rgba(0,0,0,0)');
    hGrad.addColorStop(0.8, 'rgba(0,0,0,0)');
    hGrad.addColorStop(1, 'rgba(0,0,0,1)');

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, 256, 512);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates exotic jungle wild fruit texture
   */
  public static createFruitTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
    grad.addColorStop(0, '#ff3366');
    grad.addColorStop(0.6, '#ff6600');
    grad.addColorStop(0.9, '#ffcc00');
    grad.addColorStop(1, '#339933');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Exotic spots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 80; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
}
