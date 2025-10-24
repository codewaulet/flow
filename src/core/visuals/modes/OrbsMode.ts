/**
 * Orbs Mode - Lissajous curve orbital motion
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

interface OrbData {
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  radius: number;
  trailPositions: THREE.Vector3[];
}

export class OrbsMode extends BaseMode {
  private orbs: THREE.Points | null = null;
  private trails: THREE.LineSegments | null = null;
  private orbData: OrbData[] = [];
  private trailLength: number = 20;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'orbs',
      name: 'Orbs',
      description: 'Orbital harmonics with Lissajous patterns',
      icon: '🔮',
      defaultConfig: {
        speed: 0.5,
        intensity: 0.7,
        particleCount: 200,
        color: '#a78bfa',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    // Setup camera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, 0, 40);
      this.camera.lookAt(0, 0, 0);
    }
    
    const count = this.config.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    this.orbData = [];
    const baseColor = new THREE.Color(this.config.color);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    
    for (let i = 0; i < count; i++) {
      const orbData: OrbData = {
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseZ: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        speedZ: (Math.random() - 0.5) * 0.5,
        radius: 5 + Math.random() * 15,
        trailPositions: [],
      };
      
      this.orbData.push(orbData);
      
      // Initial position
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      // Color variation
      const hueOffset = (i / count) * 0.2;
      const color = new THREE.Color().setHSL(
        (hsl.h + hueOffset) % 1,
        hsl.s,
        hsl.l
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size variation
      sizes[i] = 0.15 + Math.random() * 0.15;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    this.orbs = new THREE.Points(geometry, material);
    this.scene.add(this.orbs);
    
    // Create trails
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(count * this.trailLength * 3);
    const trailColors = new Float32Array(count * this.trailLength * 3);
    
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
    
    const trailMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    
    this.trails = new THREE.LineSegments(trailGeometry, trailMaterial);
    this.scene.add(this.trails);
  }
  
  update(time: number, deltaTime: number): void {
    if (!this.orbs || !this.trails) return;
    
    const positions = this.orbs.geometry.attributes.position.array as Float32Array;
    const trailPositions = this.trails.geometry.attributes.position.array as Float32Array;
    const trailColors = this.trails.geometry.attributes.color.array as Float32Array;
    const colors = this.orbs.geometry.attributes.color.array as Float32Array;
    const speed = this.config.speed * 0.1 * this.config.intensity;
    
    for (let i = 0; i < this.orbData.length; i++) {
      const data = this.orbData[i];
      
      // Update phases (Lissajous curves)
      data.phaseX += data.speedX * speed;
      data.phaseY += data.speedY * speed;
      data.phaseZ += data.speedZ * speed;
      
      // Calculate position using 3D Lissajous curve
      const x = Math.sin(data.phaseX) * data.radius;
      const y = Math.cos(data.phaseY) * data.radius;
      const z = Math.sin(data.phaseZ) * Math.cos(data.phaseX) * data.radius;
      
      const currentPos = new THREE.Vector3(x, y, z);
      
      // Update position
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Update trail
      data.trailPositions.unshift(currentPos.clone());
      if (data.trailPositions.length > this.trailLength) {
        data.trailPositions.pop();
      }
      
      // Draw trail
      for (let t = 0; t < data.trailPositions.length - 1; t++) {
        const idx = (i * this.trailLength + t) * 3;
        const p1 = data.trailPositions[t];
        const p2 = data.trailPositions[t + 1];
        
        trailPositions[idx] = p1.x;
        trailPositions[idx + 1] = p1.y;
        trailPositions[idx + 2] = p1.z;
        
        // Fade trail
        const alpha = 1 - (t / this.trailLength);
        trailColors[idx] = colors[i * 3] * alpha;
        trailColors[idx + 1] = colors[i * 3 + 1] * alpha;
        trailColors[idx + 2] = colors[i * 3 + 2] * alpha;
      }
    }
    
    this.orbs.geometry.attributes.position.needsUpdate = true;
    this.trails.geometry.attributes.position.needsUpdate = true;
    this.trails.geometry.attributes.color.needsUpdate = true;
    
    // Gentle rotation
    if (this.orbs) {
      this.orbs.rotation.y += deltaTime * 0.05;
    }
  }
  
  destroy(): void {
    if (this.orbs) {
      this.orbs.geometry.dispose();
      if (this.orbs.material instanceof THREE.Material) {
        this.orbs.material.dispose();
      }
      this.scene.remove(this.orbs);
      this.orbs = null;
    }
    
    if (this.trails) {
      this.trails.geometry.dispose();
      if (this.trails.material instanceof THREE.Material) {
        this.trails.material.dispose();
      }
      this.scene.remove(this.trails);
      this.trails = null;
    }
    
    this.orbData = [];
  }
  
  protected onConfigUpdate(): void {
    // Speed and intensity are used directly in update
  }
}

