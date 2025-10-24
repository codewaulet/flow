/**
 * Universe Mode - Mesmerizing galaxy spiral with particle nebula
 * Formerly Breathe Mode - now enhanced for deeper flow state immersion
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class BreatheMode extends BaseMode {
  private galaxy: THREE.Points | null = null;
  private nebula: THREE.Points | null = null;
  private rotationSpeed: number = 0;
  private pulsePhase: number = 0;
  private breathCount: number = 0;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'breathe',
      name: 'Universe',
      description: 'Hypnotic galaxy spiral - enter the cosmic flow',
      icon: '🌌',
      defaultConfig: {
        speed: 0.3,
        intensity: 0.8,
        particleCount: 15000,
        color: '#a78bfa',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    // Setup camera for dramatic view
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, 5, 15);
      this.camera.lookAt(0, 0, 0);
    }
    
    // Create spiral galaxy - cap particle count for performance
    const count = Math.min(Math.floor(this.config.particleCount), 5000);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const baseColor = new THREE.Color(this.config.color);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      
      // Logarithmic spiral (galaxy arms)
      const branch = Math.floor(Math.random() * 5); // 5 spiral arms
      const angle = branch * (Math.PI * 2 / 5) + t * Math.PI * 3; // 3 rotations
      const radius = t * 12 * (1 + Math.random() * 0.3);
      
      // Add some randomness for natural look
      const randomness = 0.5;
      const randomX = (Math.random() - 0.5) * randomness * radius;
      const randomY = (Math.random() - 0.5) * randomness * 0.2;
      const randomZ = (Math.random() - 0.5) * randomness * radius;
      
      positions[i * 3] = Math.cos(angle) * radius + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(angle) * radius + randomZ;
      
      // Color gradient from center (bright) to edge (dim)
      const distanceToCenter = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 2] ** 2);
      const colorMix = distanceToCenter / 12;
      
      const color = new THREE.Color().setHSL(
        (hsl.h + colorMix * 0.2 + branch * 0.05) % 1,
        Math.max(0.3, hsl.s - colorMix * 0.4),
        hsl.l * (1.2 - colorMix * 0.5)
      );
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size variation (center brighter, bigger)
      sizes[i] = Math.max(0.02, 0.15 * (1 - colorMix) + Math.random() * 0.05);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    this.galaxy = new THREE.Points(geometry, material);
    this.scene.add(this.galaxy);
  }
  
  update(time: number, deltaTime: number): void {
    if (!this.galaxy) return;
    
    // Gentle rotation - the galaxy spiral slowly rotates
    const baseRotationSpeed = this.config.speed * 0.05;
    this.rotationSpeed = baseRotationSpeed;
    
    this.galaxy.rotation.y += this.rotationSpeed * deltaTime;
    
    // Subtle pulsing effect (like breathing cosmos)
    this.pulsePhase += deltaTime * this.config.speed * 0.5;
    const pulseFactor = 1 + Math.sin(this.pulsePhase) * 0.05 * this.config.intensity;
    this.galaxy.scale.setScalar(pulseFactor);
    
    // Hypnotic camera sway
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.x = Math.sin(time * 0.1) * 0.5;
      this.camera.position.y = 5 + Math.cos(time * 0.15) * 0.3;
      this.camera.lookAt(0, 0, 0);
    }
    
    // Subtle opacity pulsing
    const opacity = 0.85 + Math.sin(time * 0.5) * 0.1;
    if (this.galaxy.material instanceof THREE.PointsMaterial) {
      this.galaxy.material.opacity = opacity;
    }
  }
  
  destroy(): void {
    if (this.galaxy) {
      this.galaxy.geometry.dispose();
      if (this.galaxy.material instanceof THREE.Material) {
        this.galaxy.material.dispose();
      }
      this.scene.remove(this.galaxy);
      this.galaxy = null;
    }
    
    if (this.nebula) {
      this.nebula.geometry.dispose();
      if (this.nebula.material instanceof THREE.Material) {
        this.nebula.material.dispose();
      }
      this.scene.remove(this.nebula);
      this.nebula = null;
    }
  }
  
  protected onConfigUpdate(): void {
    // Speed and intensity are used directly in update
  }
}

