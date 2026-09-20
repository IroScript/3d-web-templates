import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { TextureGenerator } from '../textures/TextureGenerator';

/**
 * JungleWorld
 * Generates an immersive, photorealistic 3D tropical jungle environment:
 * - Detailed organic terrain with trail carve
 * - Winding dirt road mesh matching the Street View spline
 * - Multi-tiered tree canopy (giant banyans, rainforest canopy trees, curved palms)
 * - Undergrowth (monstera broadleaf plants, ferns, grass tufts, mossy rocks, hanging vines)
 * - Natural lighting (warm sunlight piercing canopy, soft shadows, hemisphere bounce)
 * - Atmospheric fog, volumetric god rays, and floating forest spores
 */
export class JungleWorld {
  public scene: THREE.Scene;
  public roadCurve: THREE.CatmullRomCurve3;

  private sunLight!: THREE.DirectionalLight;
  private godRays: THREE.Mesh[] = [];
  private vines: THREE.Line[] = [];
  private sporeParticles!: THREE.Points;
  private noise2D = createNoise2D();

  // Foliage materials for reuse
  private groundMaterial!: THREE.MeshStandardMaterial;
  private roadMaterial!: THREE.MeshStandardMaterial;
  private barkMaterial!: THREE.MeshStandardMaterial;
  private leafMaterial!: THREE.MeshStandardMaterial;
  private fernMaterial!: THREE.MeshStandardMaterial;
  private palmMaterial!: THREE.MeshStandardMaterial;
  private monsteraMaterial!: THREE.MeshStandardMaterial;
  private rockMaterial!: THREE.MeshStandardMaterial;

  constructor(scene: THREE.Scene, roadCurve: THREE.CatmullRomCurve3) {
    this.scene = scene;
    this.roadCurve = roadCurve;

    this.initMaterials();
    this.setupAtmosphereAndLighting();
    this.buildTerrainAndRoad();
    this.buildDenseForest();
    this.buildUndergrowthAndProps();
    this.buildGodRaysAndSpores();
  }

  private initMaterials(): void {
    // 1. Forest Ground
    const groundTex = TextureGenerator.createGroundTexture();
    this.groundMaterial = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.9,
      metalness: 0.05,
      color: 0x3d4b2e
    });

    // 2. Winding Dirt Road
    const roadTex = TextureGenerator.createRoadTexture();
    this.roadMaterial = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.85,
      metalness: 0.08,
      color: 0x8a7056
    });

    // 3. Tree Bark
    const barkTex = TextureGenerator.createBarkTexture();
    this.barkMaterial = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.88,
      metalness: 0.02
    });

    // 4. Canopy Foliage
    this.leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x22621c,
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide
    });

    // 5. Tropical Ferns
    const fernTex = TextureGenerator.createFernLeafTexture();
    this.fernMaterial = new THREE.MeshStandardMaterial({
      map: fernTex,
      transparent: true,
      alphaTest: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.5,
      metalness: 0.05
    });

    // 6. Palm Fronds
    const palmTex = TextureGenerator.createPalmFrondTexture();
    this.palmMaterial = new THREE.MeshStandardMaterial({
      map: palmTex,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      roughness: 0.55
    });

    // 7. Broadleaf Monstera
    const monsteraTex = TextureGenerator.createMonsteraLeafTexture();
    this.monsteraMaterial = new THREE.MeshStandardMaterial({
      map: monsteraTex,
      transparent: true,
      alphaTest: 0.3,
      side: THREE.DoubleSide,
      roughness: 0.45
    });

    // 8. Mossy Rocks
    this.rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a5444,
      roughness: 0.92,
      metalness: 0.1
    });
  }

  private setupAtmosphereAndLighting(): void {
    // Atmospheric natural jungle fog (emerald mist)
    const fogColor = new THREE.Color(0x162c1e);
    this.scene.background = fogColor;
    this.scene.fog = new THREE.FogExp2(0x162c1e, 0.015);

    // Natural sky & earth bounce light
    const hemiLight = new THREE.HemisphereLight(0x75ba8a, 0x2e2316, 1.4);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // Ambient forest under-canopy green bounce
    const ambientLight = new THREE.AmbientLight(0x1a3821, 0.8);
    this.scene.add(ambientLight);

    // Warm tropical sunlight piercing the canopy at a high golden angle
    this.sunLight = new THREE.DirectionalLight(0xfff7d4, 2.6);
    this.sunLight.position.set(40, 75, -50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 220;
    this.sunLight.shadow.camera.left = -50;
    this.sunLight.shadow.camera.right = 50;
    this.sunLight.shadow.camera.top = 50;
    this.sunLight.shadow.camera.bottom = -50;
    this.sunLight.shadow.bias = -0.0006;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
    this.sunLight.target.position.set(0, 0, -80);
  }

  private buildTerrainAndRoad(): void {
    // 1. Terrain Mesh with Road Carving
    const terrainSize = 280;
    const segments = 140;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const samplePt = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      // Multi-octave natural terrain height
      const n1 = this.noise2D(x * 0.012, z * 0.012) * 4.5;
      const n2 = this.noise2D(x * 0.035, z * 0.035) * 1.8;
      const n3 = this.noise2D(x * 0.08, z * 0.08) * 0.6;
      let height = n1 + n2 + n3;

      // Find distance to the closest point along the road curve
      let minDistance = 9999;
      let roadHeight = 0;

      // Sample along curve to carve the path
      for (let t = 0; t <= 1.0; t += 0.03) {
        this.roadCurve.getPointAt(t, samplePt);
        const dist = Math.hypot(x - samplePt.x, z - samplePt.z);
        if (dist < minDistance) {
          minDistance = dist;
          roadHeight = samplePt.y;
        }
      }

      // Smoothly carve terrain to road level within 6 meters
      if (minDistance < 6.0) {
        const blend = minDistance / 6.0;
        const smoothBlend = blend * blend * (3 - 2 * blend);
        height = THREE.MathUtils.lerp(roadHeight - 0.06, height, smoothBlend);
      }

      // Distant perimeter jungle ridges
      const distFromCenter = Math.hypot(x, z + 80);
      if (distFromCenter > 70) {
        height += Math.pow((distFromCenter - 70) * 0.18, 1.6);
      }

      posAttr.setY(i, height);
    }

    terrainGeo.computeVertexNormals();
    const terrainMesh = new THREE.Mesh(terrainGeo, this.groundMaterial);
    terrainMesh.receiveShadow = true;
    this.scene.add(terrainMesh);

    // 2. Extruded Winding Road Ribbon
    this.buildRoadRibbon();
  }

  private buildRoadRibbon(): void {
    const steps = 180;
    const roadWidth = 3.6;
    const points: THREE.Vector3[] = [];
    const tangents: THREE.Vector3[] = [];
    const binormals: THREE.Vector3[] = [];

    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pt = new THREE.Vector3();
      const tan = new THREE.Vector3();
      this.roadCurve.getPointAt(t, pt);
      this.roadCurve.getTangentAt(t, tan).normalize();

      const binormal = new THREE.Vector3().crossVectors(tan, up).normalize();

      points.push(pt);
      tangents.push(tan);
      binormals.push(binormal);
    }

    const roadGeo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= steps; i++) {
      const pt = points[i];
      const bin = binormals[i];
      const v = i / steps;

      // 4 cross-points per ring for slight natural crown / convex road curvature
      const leftEdge = pt.clone().addScaledVector(bin, -roadWidth / 2);
      const leftMid = pt.clone().addScaledVector(bin, -roadWidth / 4).add(new THREE.Vector3(0, 0.03, 0));
      const rightMid = pt.clone().addScaledVector(bin, roadWidth / 4).add(new THREE.Vector3(0, 0.03, 0));
      const rightEdge = pt.clone().addScaledVector(bin, roadWidth / 2);

      const crossPts = [leftEdge, leftMid, rightMid, rightEdge];
      const uVals = [0.0, 0.33, 0.67, 1.0];

      for (let j = 0; j < 4; j++) {
        vertices.push(crossPts[j].x, crossPts[j].y + 0.04, crossPts[j].z);
        uvs.push(uVals[j], v);
      }
    }

    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < 3; j++) {
        const row1 = i * 4 + j;
        const row2 = (i + 1) * 4 + j;

        indices.push(row1, row2, row1 + 1);
        indices.push(row1 + 1, row2, row2 + 1);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();

    const roadMesh = new THREE.Mesh(roadGeo, this.roadMaterial);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);
  }

  private buildDenseForest(): void {
    // 1. Massive Ancient Banyan / Rainforest Emergent Tree
    const banyanPos = new THREE.Vector3(14, 0, -38);
    banyanPos.y = this.getGroundHeight(banyanPos.x, banyanPos.z);
    this.buildAncientBanyanTree(banyanPos);

    // 2. High Canopy Trees lining the trail
    const treePositions: { pos: THREE.Vector3; scale: number; type: 'canopy' | 'palm' }[] = [];

    // Left and right side scatter along the road
    for (let t = 0.02; t <= 0.98; t += 0.035) {
      const roadPt = new THREE.Vector3();
      const roadTan = new THREE.Vector3();
      this.roadCurve.getPointAt(t, roadPt);
      this.roadCurve.getTangentAt(t, roadTan);
      const normal = new THREE.Vector3(-roadTan.z, 0, roadTan.x).normalize();

      // Left flank trees
      const leftDist = 4.5 + Math.random() * 16;
      const leftPos = roadPt.clone().addScaledVector(normal, -leftDist);
      leftPos.y = this.getGroundHeight(leftPos.x, leftPos.z);
      treePositions.push({
        pos: leftPos,
        scale: 0.85 + Math.random() * 0.5,
        type: Math.random() > 0.35 ? 'canopy' : 'palm'
      });

      // Right flank trees
      const rightDist = 4.5 + Math.random() * 16;
      const rightPos = roadPt.clone().addScaledVector(normal, rightDist);
      rightPos.y = this.getGroundHeight(rightPos.x, rightPos.z);
      treePositions.push({
        pos: rightPos,
        scale: 0.85 + Math.random() * 0.5,
        type: Math.random() > 0.4 ? 'canopy' : 'palm'
      });

      // Background dense forest filler
      for (let k = 0; k < 2; k++) {
        const bgDist = 20 + Math.random() * 45;
        const side = Math.random() > 0.5 ? 1 : -1;
        const bgPos = roadPt.clone().addScaledVector(normal, side * bgDist);
        bgPos.x += (Math.random() - 0.5) * 15;
        bgPos.z += (Math.random() - 0.5) * 15;
        bgPos.y = this.getGroundHeight(bgPos.x, bgPos.z);
        treePositions.push({
          pos: bgPos,
          scale: 0.9 + Math.random() * 0.7,
          type: Math.random() > 0.25 ? 'canopy' : 'palm'
        });
      }
    }

    treePositions.forEach((tree) => {
      if (tree.type === 'canopy') {
        this.createCanopyTree(tree.pos, tree.scale);
      } else {
        this.createPalmTree(tree.pos, tree.scale);
      }
    });
  }

  /**
   * Creates a magnificent ancient Banyan tree with multi-roots, buttress, wide branching crown, and hanging vines
   */
  private buildAncientBanyanTree(pos: THREE.Vector3): void {
    const treeGroup = new THREE.Group();
    pos.y = this.getGroundHeight(pos.x, pos.z);
    treeGroup.position.copy(pos);

    // Massive trunk deeply anchored 4 meters into ground
    const trunkGeo = new THREE.CylinderGeometry(1.8, 3.6, 20, 16);
    const trunk = new THREE.Mesh(trunkGeo, this.barkMaterial);
    trunk.position.y = 6.0; // Sunk 4 meters below ground level (bottom at -4.0)
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Aerial buttress roots spreading and deeply piercing into ground
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const rootGeo = new THREE.CylinderGeometry(0.35, 0.85, 10, 8);
      const root = new THREE.Mesh(rootGeo, this.barkMaterial);
      root.position.set(Math.cos(angle) * 2.8, 2.0, Math.sin(angle) * 2.8);
      root.rotation.z = Math.cos(angle) * -0.25;
      root.rotation.x = Math.sin(angle) * 0.25;
      root.castShadow = true;
      root.receiveShadow = true;
      treeGroup.add(root);
    }

    // Heavy branching arches reaching over the road
    for (let i = 0; i < 5; i++) {
      const branchAngle = (i / 5) * Math.PI * 2 + 0.3;
      const branchGeo = new THREE.CylinderGeometry(0.4, 0.9, 9, 8);
      const branch = new THREE.Mesh(branchGeo, this.barkMaterial);
      branch.position.set(Math.cos(branchAngle) * 3.5, 12, Math.sin(branchAngle) * 3.5);
      branch.rotation.z = Math.cos(branchAngle) * -0.7;
      branch.rotation.x = Math.sin(branchAngle) * 0.7;
      branch.castShadow = true;
      treeGroup.add(branch);

      // Foliage cloud for this branch
      const foliageGeo = new THREE.DodecahedronGeometry(4.5 + Math.random() * 1.5, 2);
      const foliage = new THREE.Mesh(foliageGeo, this.leafMaterial);
      foliage.position.set(Math.cos(branchAngle) * 7.5, 15, Math.sin(branchAngle) * 7.5);
      foliage.scale.set(1.4, 0.8, 1.4);
      foliage.castShadow = true;
      treeGroup.add(foliage);

      // Hanging lianas / vines
      for (let v = 0; v < 3; v++) {
        this.createHangingVine(
          new THREE.Vector3(
            pos.x + Math.cos(branchAngle) * (5 + v * 1.2),
            pos.y + 13,
            pos.z + Math.sin(branchAngle) * (5 + v * 1.2)
          ),
          5 + Math.random() * 4
        );
      }
    }

    // Main top canopy dome
    const mainFoliageGeo = new THREE.DodecahedronGeometry(8.5, 2);
    const mainFoliage = new THREE.Mesh(mainFoliageGeo, this.leafMaterial);
    mainFoliage.position.y = 17.5;
    mainFoliage.scale.set(1.6, 0.75, 1.6);
    mainFoliage.castShadow = true;
    treeGroup.add(mainFoliage);

    this.scene.add(treeGroup);
  }

  /**
   * Creates tropical rainforest canopy tree with deeply embedded trunk base
   */
  private createCanopyTree(pos: THREE.Vector3, scale: number): void {
    const group = new THREE.Group();
    pos.y = this.getGroundHeight(pos.x, pos.z);
    group.position.copy(pos);
    group.scale.setScalar(scale);

    const trunkHeight = 14 + Math.random() * 4;
    // Submerge trunk 4.0 meters into the ground so trunk never floats on undulating terrain
    const submergeDepth = 4.0;
    const totalTrunkHeight = trunkHeight + submergeDepth;
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.9, totalTrunkHeight, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.barkMaterial);
    // Cylinder center positioned so its bottom reaches down to -submergeDepth (-4.0m)
    trunk.position.y = (totalTrunkHeight / 2) - submergeDepth;
    trunk.rotation.x = (Math.random() - 0.5) * 0.12;
    trunk.rotation.z = (Math.random() - 0.5) * 0.12;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Multi-layer canopy puff
    const canopyCount = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < canopyCount; i++) {
      const radius = 3.5 + Math.random() * 2;
      const canopyGeo = new THREE.DodecahedronGeometry(radius, 1);
      const canopy = new THREE.Mesh(canopyGeo, this.leafMaterial);
      const offsetAngle = (i / canopyCount) * Math.PI * 2;
      const offsetDist = 1.5 + Math.random() * 2;
      canopy.position.set(
        Math.cos(offsetAngle) * offsetDist,
        trunkHeight - 1 + Math.random() * 4,
        Math.sin(offsetAngle) * offsetDist
      );
      canopy.scale.set(1.3, 0.8, 1.3);
      canopy.castShadow = true;
      group.add(canopy);
    }

    this.scene.add(group);
  }

  /**
   * Creates tropical palm tree with curved trunk starting well beneath the ground
   */
  private createPalmTree(pos: THREE.Vector3, scale: number): void {
    const group = new THREE.Group();
    pos.y = this.getGroundHeight(pos.x, pos.z);
    group.position.copy(pos);
    group.scale.setScalar(scale);

    const trunkHeight = 11 + Math.random() * 3;
    const segments = 14;
    const curvePoints: THREE.Vector3[] = [];
    const leanAngle = Math.random() * Math.PI * 2;
    const leanAmount = 2.5 + Math.random() * 2.0;

    // Submerge 3.0 meters below ground so palm trunk emerges naturally from the soil
    const submergeDepth = 3.0;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = Math.cos(leanAngle) * (t * t * leanAmount);
      const y = -submergeDepth + t * (trunkHeight + submergeDepth);
      const z = Math.sin(leanAngle) * (t * t * leanAmount);
      curvePoints.push(new THREE.Vector3(x, y, z));
    }

    const trunkCurve = new THREE.CatmullRomCurve3(curvePoints);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 18, 0.36, 8, false);
    const trunk = new THREE.Mesh(trunkGeo, this.barkMaterial);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Palm Crown Fronds
    const crownTop = curvePoints[curvePoints.length - 1];
    const frondCount = 14;
    const frondGeo = new THREE.PlaneGeometry(3.6, 1.4);

    for (let i = 0; i < frondCount; i++) {
      const frondAngle = (i / frondCount) * Math.PI * 2;
      const frond = new THREE.Mesh(frondGeo, this.palmMaterial);
      frond.position.copy(crownTop);
      frond.rotation.y = frondAngle;
      frond.rotation.x = 0.45 + (i % 2) * 0.25; // Gentle droop
      frond.castShadow = true;
      group.add(frond);
    }

    this.scene.add(group);
  }

  /**
   * Creates a natural hanging vine / liana
   */
  private createHangingVine(startPos: THREE.Vector3, length: number): void {
    const points: THREE.Vector3[] = [];
    const segments = 10;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startPos.x + Math.sin(t * Math.PI * 2) * 0.3;
      const y = startPos.y - t * length;
      const z = startPos.z + Math.cos(t * Math.PI * 2) * 0.3;
      points.push(new THREE.Vector3(x, y, z));
    }

    const vineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const vineMat = new THREE.LineBasicMaterial({
      color: 0x3d4b2e,
      linewidth: 2
    });
    const vine = new THREE.Line(vineGeo, vineMat);
    this.vines.push(vine);
    this.scene.add(vine);
  }

  private buildUndergrowthAndProps(): void {
    // 1. Broadleaf Tropical Plants (Monstera / Giant Taro) along road borders
    const monsteraGeo = new THREE.PlaneGeometry(1.6, 2.2);

    for (let t = 0.01; t <= 0.99; t += 0.02) {
      const pt = new THREE.Vector3();
      const tan = new THREE.Vector3();
      this.roadCurve.getPointAt(t, pt);
      this.roadCurve.getTangentAt(t, tan);
      const side = Math.random() > 0.5 ? 1 : -1;
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const plantPos = pt.clone().addScaledVector(normal, side * (2.2 + Math.random() * 3.5));
      const groundY = this.getGroundHeight(plantPos.x, plantPos.z);

      const cluster = new THREE.Group();
      cluster.position.set(plantPos.x, groundY, plantPos.z);

      const leafCount = 4 + Math.floor(Math.random() * 3);
      for (let l = 0; l < leafCount; l++) {
        const leaf = new THREE.Mesh(monsteraGeo, this.monsteraMaterial);
        const leafAngle = (l / leafCount) * Math.PI * 2;
        leaf.rotation.y = leafAngle;
        leaf.rotation.x = 0.5 + Math.random() * 0.3;
        leaf.position.y = 0.4 + Math.random() * 0.3;
        leaf.castShadow = true;
        cluster.add(leaf);
      }
      this.scene.add(cluster);
    }

    // 2. Tropical Ferns
    const fernGeo = new THREE.PlaneGeometry(1.2, 1.8);
    for (let t = 0.02; t <= 0.98; t += 0.025) {
      const pt = new THREE.Vector3();
      const tan = new THREE.Vector3();
      this.roadCurve.getPointAt(t, pt);
      this.roadCurve.getTangentAt(t, tan);
      const side = Math.random() > 0.5 ? 1 : -1;
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      const fernPos = pt.clone().addScaledVector(normal, side * (1.9 + Math.random() * 2.8));
      const groundY = this.getGroundHeight(fernPos.x, fernPos.z);

      const fernGroup = new THREE.Group();
      fernGroup.position.set(fernPos.x, groundY, fernPos.z);

      for (let f = 0; f < 5; f++) {
        const frond = new THREE.Mesh(fernGeo, this.fernMaterial);
        frond.rotation.y = (f / 5) * Math.PI * 2;
        frond.rotation.x = 0.6;
        frond.position.y = 0.3;
        frond.castShadow = true;
        fernGroup.add(frond);
      }
      this.scene.add(fernGroup);
    }

    // 3. Mossy Boulders along trail bends
    const rockGeo = new THREE.DodecahedronGeometry(1.5, 1);
    const rockWaypoints = [0.15, 0.32, 0.48, 0.65, 0.82];

    rockWaypoints.forEach((wp) => {
      const pt = new THREE.Vector3();
      const tan = new THREE.Vector3();
      this.roadCurve.getPointAt(wp, pt);
      this.roadCurve.getTangentAt(wp, tan);
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();

      const rock = new THREE.Mesh(rockGeo, this.rockMaterial);
      const rockPos = pt.clone().addScaledVector(normal, (Math.random() > 0.5 ? 1 : -1) * 2.8);
      const groundY = this.getGroundHeight(rockPos.x, rockPos.z);
      rock.position.set(rockPos.x, groundY + 0.25, rockPos.z);
      rock.scale.set(1.2 + Math.random() * 0.6, 0.8 + Math.random() * 0.4, 1.4 + Math.random() * 0.5);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    });
  }

  private buildGodRaysAndSpores(): void {
    // 1. Volumetric God Rays (angled light shafts piercing the canopy)
    const beamTex = TextureGenerator.createSunbeamTexture();
    const beamMat = new THREE.MeshBasicMaterial({
      map: beamTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const beamGeo = new THREE.PlaneGeometry(6, 32);

    const rayLocations = [
      new THREE.Vector3(4, 14, -20),
      new THREE.Vector3(12, 16, -42),
      new THREE.Vector3(-2, 14, -75),
      new THREE.Vector3(-12, 15, -112),
      new THREE.Vector3(4, 16, -165)
    ];

    rayLocations.forEach((loc) => {
      const ray = new THREE.Mesh(beamGeo, beamMat);
      ray.position.copy(loc);
      ray.rotation.x = THREE.MathUtils.degToRad(35);
      ray.rotation.y = THREE.MathUtils.degToRad(-25);
      ray.rotation.z = THREE.MathUtils.degToRad(15);
      this.godRays.push(ray);
      this.scene.add(ray);
    });

    // 2. Glowing Jungle Spores / Atmospheric Dust Motes
    const sporeCount = 900;
    const sporeGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(sporeCount * 3);

    for (let i = 0; i < sporeCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = 0.5 + Math.random() * 16;
      positions[i + 2] = -Math.random() * 200;
    }

    sporeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const sporeMat = new THREE.PointsMaterial({
      color: 0xcdff9e,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.sporeParticles = new THREE.Points(sporeGeo, sporeMat);
    this.scene.add(this.sporeParticles);
  }

  /**
   * Per-frame animation update (swaying vines, shimmering spores, breathing god rays)
   */
  public update(elapsedTime: number): void {
    // Gentle pulse in god rays
    const rayPulse = 0.85 + Math.sin(elapsedTime * 1.5) * 0.15;
    this.godRays.forEach((ray) => {
      (ray.material as THREE.MeshBasicMaterial).opacity = rayPulse * 0.35;
    });

    // Floating spores motion
    if (this.sporeParticles) {
      const posAttr = this.sporeParticles.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + Math.sin(elapsedTime + i) * 0.005;
        if (y > 18) y = 0.5;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  }

  /**
   * Returns organic ground elevation at given (x, z) coordinates
   * factoring in procedural noise and carved road geometry
   */
  public getGroundHeight(x: number, z: number): number {
    const n1 = this.noise2D(x * 0.012, z * 0.012) * 4.5;
    const n2 = this.noise2D(x * 0.035, z * 0.035) * 1.8;
    const n3 = this.noise2D(x * 0.08, z * 0.08) * 0.6;
    let height = n1 + n2 + n3;

    let minDistance = 9999;
    let roadHeight = 0;
    const samplePt = new THREE.Vector3();

    for (let t = 0; t <= 1.0; t += 0.03) {
      this.roadCurve.getPointAt(t, samplePt);
      const dist = Math.hypot(x - samplePt.x, z - samplePt.z);
      if (dist < minDistance) {
        minDistance = dist;
        roadHeight = samplePt.y;
      }
    }

    if (minDistance < 6.0) {
      const blend = minDistance / 6.0;
      const smoothBlend = blend * blend * (3 - 2 * blend);
      height = THREE.MathUtils.lerp(roadHeight - 0.06, height, smoothBlend);
    }
    return height;
  }
}
