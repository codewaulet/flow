/**
 * Weaver Mode - Gravity well particle system with connections
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export class WeaverMode extends BaseMode {
  private particles: THREE.Points | null = null;
  private lines: THREE.LineSegments | null = null;
  private particleData: Particle[] = [];
  private gravityWell: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private isAttracting: boolean = false;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'weaver',
      name: 'Weaver',
      description: 'Interactive gravity well with particle connections',
      icon: '🕸️',
      defaultConfig: {
        speed: 0.8,
        intensity: 0.5,
        particleCount: 3000,
        color: '#a78bfa',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    // Setup camera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, 0, 60);
      this.camera.lookAt(0, 0, 0);
    }
    
    const count = this.config.particleCount;
    
    // Create particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    this.particleData = [];
    const baseColor = new THREE.Color(this.config.color);
    
    for (let i = 0; i < count; i++) {
      const particle: Particle = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 100,
          (Math.random() - 0.5) * 20
        ),
        velocity: new THREE.Vector3(0, 0, 0),
      };
      
      this.particleData.push(particle);
      
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    
    // Connection lines disabled for performance
    // Can be re-enabled with a performance toggle
  }
  
  update(_time: number, _deltaTime: number): void {
    if (!this.particles) return;
    
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const gravity = this.config.intensity * 0.1;
    const damping = 0.96;
    const returnForce = 0.003;
    const maxDistSq = 150 * 150;
    
    // Update particles
    for (let i = 0; i < this.particleData.length; i++) {
      const particle = this.particleData[i];
      
      // Apply gravity well if attracting
      if (this.isAttracting) {
        const dx = this.gravityWell.x - particle.position.x;
        const dy = this.gravityWell.y - particle.position.y;
        const dz = this.gravityWell.z - particle.position.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        
        if (distSq > 1) {
          const force = gravity / (distSq + 1);
          particle.velocity.x += dx * force;
          particle.velocity.y += dy * force;
          particle.velocity.z += dz * force;
        }
      }
      
      // Return force to keep particles from escaping
      const currentDistSq = particle.position.lengthSq();
      if (currentDistSq > maxDistSq) {
        particle.velocity.x -= particle.position.x * returnForce;
        particle.velocity.y -= particle.position.y * returnForce;
        particle.velocity.z -= particle.position.z * returnForce;
        
        // Teleport back if too far
        if (currentDistSq > maxDistSq * 1.5) {
          particle.position.multiplyScalar(0.1);
        }
      }
      
      // Apply damping
      particle.velocity.multiplyScalar(damping);
      
      // Update position
      particle.position.add(particle.velocity);
      
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
  
  handleInteraction(x: number, y: number, type: 'start' | 'move' | 'end'): void {
    // Convert screen coordinates to world coordinates
    const normalized = {
      x: (x / window.innerWidth) * 2 - 1,
      y: -(y / window.innerHeight) * 2 + 1,
    };
    
    // Simple projection to world space
    this.gravityWell.x = normalized.x * 50;
    this.gravityWell.y = normalized.y * 50;
    this.gravityWell.z = 0;
    
    if (type === 'start' || type === 'move') {
      this.isAttracting = true;
    } else if (type === 'end') {
      this.isAttracting = false;
    }
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
    
    if (this.lines) {
      this.lines.geometry.dispose();
      if (this.lines.material instanceof THREE.Material) {
        this.lines.material.dispose();
      }
      this.scene.remove(this.lines);
      this.lines = null;
    }
    
    this.particleData = [];
  }
}

