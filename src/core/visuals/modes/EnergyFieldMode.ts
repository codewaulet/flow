/**
 * Energy Field Mode - Interactive force field visualization
 * Particles react to touch/mouse creating ripples of energy
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

interface FieldParticle {
  homeX: number;
  homeY: number;
  homeZ: number;
  currentX: number;
  currentY: number;
  currentZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
}

export class EnergyFieldMode extends BaseMode {
  private particles: THREE.Points | null = null;
  private particleData: FieldParticle[] = [];
  private mousePos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private isInteracting: boolean = false;
  private gridSize: number = 50;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'energy',
      name: 'Energy Field',
      description: 'Interactive force field - touch creates energy waves',
      icon: '⚡',
      defaultConfig: {
        speed: 0.8,
        intensity: 1.5,
        particleCount: 2500,
        color: '#00ffff',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    // Setup camera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, 0, 50);
      this.camera.lookAt(0, 0, 0);
    }
    
    const gridSize = Math.floor(Math.sqrt(this.config.particleCount));
    this.gridSize = gridSize;
    const count = gridSize * gridSize;
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    this.particleData = [];
    const baseColor = new THREE.Color(this.config.color);
    const spacing = 0.8;
    const offset = -(gridSize * spacing) / 2;
    
    let index = 0;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const homeX = offset + x * spacing;
        const homeY = offset + y * spacing;
        const homeZ = 0;
        
        this.particleData.push({
          homeX,
          homeY,
          homeZ,
          currentX: homeX,
          currentY: homeY,
          currentZ: homeZ,
          velocityX: 0,
          velocityY: 0,
          velocityZ: 0,
        });
        
        positions[index * 3] = homeX;
        positions[index * 3 + 1] = homeY;
        positions[index * 3 + 2] = homeZ;
        
        colors[index * 3] = baseColor.r;
        colors[index * 3 + 1] = baseColor.g;
        colors[index * 3 + 2] = baseColor.b;
        
        sizes[index] = 0.1;
        
        index++;
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  update(time: number, deltaTime: number): void {
    if (!this.particles) return;
    
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const colors = this.particles.geometry.attributes.color.array as Float32Array;
    const baseColor = new THREE.Color(this.config.color);
    
    const returnForce = 0.03;
    const damping = 0.95;
    const forceRadius = 10 * this.config.intensity;
    
    for (let i = 0; i < this.particleData.length; i++) {
      const p = this.particleData[i];
      
      // Apply force from mouse/touch
      if (this.isInteracting) {
        const dx = this.mousePos.x - p.currentX;
        const dy = this.mousePos.y - p.currentY;
        const dz = this.mousePos.z - p.currentZ;
        const distSq = dx * dx + dy * dy + dz * dz;
        
        if (distSq < forceRadius * forceRadius) {
          const force = (1 - Math.sqrt(distSq) / forceRadius) * this.config.speed * 0.5;
          p.velocityX -= dx * force;
          p.velocityY -= dy * force;
          p.velocityZ -= dz * force;
        }
      }
      
      // Return to home position
      p.velocityX += (p.homeX - p.currentX) * returnForce;
      p.velocityY += (p.homeY - p.currentY) * returnForce;
      p.velocityZ += (p.homeZ - p.currentZ) * returnForce;
      
      // Apply damping
      p.velocityX *= damping;
      p.velocityY *= damping;
      p.velocityZ *= damping;
      
      // Update position
      p.currentX += p.velocityX;
      p.currentY += p.velocityY;
      p.currentZ += p.velocityZ;
      
      positions[i * 3] = p.currentX;
      positions[i * 3 + 1] = p.currentY;
      positions[i * 3 + 2] = p.currentZ;
      
      // Color based on displacement
      const displacement = Math.sqrt(
        (p.currentX - p.homeX) ** 2 +
        (p.currentY - p.homeY) ** 2 +
        (p.currentZ - p.homeZ) ** 2
      );
      const energy = Math.min(displacement / 5, 1);
      
      colors[i * 3] = baseColor.r * (0.5 + energy * 0.5);
      colors[i * 3 + 1] = baseColor.g * (0.5 + energy * 0.5);
      colors[i * 3 + 2] = baseColor.b * (0.5 + energy * 0.5);
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
  }
  
  handleInteraction(x: number, y: number, type: 'start' | 'move' | 'end'): void {
    // Convert screen to world coordinates
    const normalized = {
      x: (x / window.innerWidth) * 2 - 1,
      y: -(y / window.innerHeight) * 2 + 1,
    };
    
    // Simple projection
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.mousePos.x = normalized.x * 25 * aspectRatio;
    this.mousePos.y = normalized.y * 25;
    this.mousePos.z = 0;
    
    this.isInteracting = type === 'start' || type === 'move';
  }
  
  destroy(): void {
    if (this.particles) {
      this.particles.geometry.dispose();
      if (this.particles.material instanceof THREE.Material) {
        this.particles.material.dispose();
      }
      this.scene.remove(this.particles);
      this.particles = null;
    }
    this.particleData = [];
  }
  
  protected onConfigUpdate(): void {
    // Speed and intensity used directly in update
  }
}

