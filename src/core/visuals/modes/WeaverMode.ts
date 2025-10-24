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
  private maxDistance: number = 10; // Max distance for line connections
  
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
    
    // Create line geometry for connections
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(count * count * 6); // Overa llocate
    const lineColors = new Float32Array(count * count * 6);
    
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });
    
    this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.lines);
  }
  
  update(time: number, deltaTime: number): void {
    if (!this.particles || !this.lines) return;
    
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
    
    // Update connections
    this.updateConnections();
  }
  
  /**
   * Update line connections between nearby particles
   */
  private updateConnections(): void {
    if (!this.lines) return;
    
    const linePositions = this.lines.geometry.attributes.position.array as Float32Array;
    const lineColors = this.lines.geometry.attributes.color.array as Float32Array;
    const maxDistSq = this.maxDistance * this.maxDistance;
    const baseColor = new THREE.Color(this.config.color);
    
    let lineIndex = 0;
    const maxConnections = Math.min(50, this.particleData.length); // Limit for performance
    
    for (let i = 0; i < maxConnections && i < this.particleData.length; i++) {
      const p1 = this.particleData[i];
      
      // Check only a subset of other particles
      for (let j = i + 1; j < Math.min(i + 20, this.particleData.length); j++) {
        const p2 = this.particleData[j];
        const distSq = p1.position.distanceToSquared(p2.position);
        
        if (distSq < maxDistSq) {
          // Add line
          linePositions[lineIndex * 6] = p1.position.x;
          linePositions[lineIndex * 6 + 1] = p1.position.y;
          linePositions[lineIndex * 6 + 2] = p1.position.z;
          linePositions[lineIndex * 6 + 3] = p2.position.x;
          linePositions[lineIndex * 6 + 4] = p2.position.y;
          linePositions[lineIndex * 6 + 5] = p2.position.z;
          
          // Fade based on distance
          const alpha = 1 - Math.sqrt(distSq) / this.maxDistance;
          lineColors[lineIndex * 6] = baseColor.r * alpha;
          lineColors[lineIndex * 6 + 1] = baseColor.g * alpha;
          lineColors[lineIndex * 6 + 2] = baseColor.b * alpha;
          lineColors[lineIndex * 6 + 3] = baseColor.r * alpha;
          lineColors[lineIndex * 6 + 4] = baseColor.g * alpha;
          lineColors[lineIndex * 6 + 5] = baseColor.b * alpha;
          
          lineIndex++;
        }
      }
    }
    
    // Hide unused lines
    for (let i = lineIndex * 6; i < linePositions.length; i++) {
      linePositions[i] = 0;
      lineColors[i] = 0;
    }
    
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;
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

