/**
 * Breathe Mode - Circular breathing visualization with petal animation
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class BreatheMode extends BaseMode {
  private petals: THREE.Points | null = null;
  private baseScale: number = 0.6;
  private targetScale: number = 1.0;
  private currentScale: number = 0.6;
  private breathPhase: number = 0; // 0-3: inhale, hold, exhale, hold
  private phaseDuration: number = 4; // seconds per phase
  private phaseTime: number = 0;
  private breathCount: number = 0;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'breathe',
      name: 'Breathe',
      description: 'Guided breathing with circular petal animation',
      icon: '🫁',
      defaultConfig: {
        speed: 8.0,
        intensity: 0.7,
        particleCount: 6,
        color: '#a78bfa',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    // Setup camera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, 0, 10);
      this.camera.lookAt(0, 0, 0);
    }
    
    // Create petal particles
    const petalCount = this.config.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(petalCount * 300 * 3); // 300 particles per petal
    const colors = new Float32Array(petalCount * 300 * 3);
    
    let index = 0;
    for (let p = 0; p < petalCount; p++) {
      const angle = (p / petalCount) * Math.PI * 2;
      const baseColor = new THREE.Color(this.config.color);
      const hsl = { h: 0, s: 0, l: 0 };
      baseColor.getHSL(hsl);
      
      for (let i = 0; i < 300; i++) {
        const t = i / 300;
        const radius = t * 3;
        const theta = angle + t * 0.5;
        
        positions[index * 3] = Math.cos(theta) * radius;
        positions[index * 3 + 1] = Math.sin(theta) * radius;
        positions[index * 3 + 2] = 0;
        
        // Color gradient from center to edge
        const col = new THREE.Color().setHSL(
          hsl.h + t * 0.1,
          hsl.s,
          hsl.l * (1 - t * 0.3)
        );
        colors[index * 3] = col.r;
        colors[index * 3 + 1] = col.g;
        colors[index * 3 + 2] = col.b;
        
        index++;
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    this.petals = new THREE.Points(geometry, material);
    this.scene.add(this.petals);
  }
  
  update(time: number, deltaTime: number): void {
    if (!this.petals) return;
    
    // Update breath cycle
    this.phaseTime += deltaTime;
    const cycleDuration = this.config.speed;
    
    if (this.phaseTime >= cycleDuration) {
      this.phaseTime = 0;
      this.breathPhase = (this.breathPhase + 1) % 4;
      
      if (this.breathPhase === 0) {
        this.breathCount++;
      }
    }
    
    // Calculate target scale based on phase
    switch (this.breathPhase) {
      case 0: // Inhale
        this.targetScale = this.lerp(0.6, 1.0, this.phaseTime / cycleDuration);
        break;
      case 1: // Hold (inhaled)
        this.targetScale = 1.0;
        break;
      case 2: // Exhale
        this.targetScale = this.lerp(1.0, 0.6, this.phaseTime / cycleDuration);
        break;
      case 3: // Hold (exhaled)
        this.targetScale = 0.6;
        break;
    }
    
    // Smooth scale transition
    this.currentScale += (this.targetScale - this.currentScale) * deltaTime * 2;
    this.petals.scale.setScalar(this.currentScale * this.config.intensity);
    
    // Rotation
    this.petals.rotation.z += deltaTime * 0.1;
    
    // Gentle pulsing opacity
    const opacity = 0.6 + Math.sin(time * 2) * 0.2;
    if (this.petals.material instanceof THREE.PointsMaterial) {
      this.petals.material.opacity = opacity;
    }
  }
  
  destroy(): void {
    if (this.petals) {
      this.petals.geometry.dispose();
      if (this.petals.material instanceof THREE.Material) {
        this.petals.material.dispose();
      }
      this.scene.remove(this.petals);
      this.petals = null;
    }
  }
  
  protected onConfigUpdate(): void {
    // Update colors if needed
    if (this.petals && this.petals.material instanceof THREE.PointsMaterial) {
      // Color will be updated on next init if mode is restarted
    }
  }
  
  /**
   * Get current breath phase info
   */
  public getBreathInfo(): { phase: string; progress: number; count: number } {
    const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
    return {
      phase: phases[this.breathPhase],
      progress: this.phaseTime / this.config.speed,
      count: this.breathCount,
    };
  }
  
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }
}

