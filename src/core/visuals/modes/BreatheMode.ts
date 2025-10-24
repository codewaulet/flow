/**
 * Black Hole Mode - Mesmerizing particle suction animation
 * Particles spiral inward toward a central black hole
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';
import { CircleParticleShader } from '../shaders/CircleParticleShader';

export class BreatheMode extends BaseMode {
  private particles: THREE.Points | null = null;
  private time: number = 0;
  private blackHoleRadius: number = 0.5;
  private originalPositions: Float32Array | null = null;
  private mousePosition: THREE.Vector2 = new THREE.Vector2(0, 0);
  private interactionStrength: number = 0;
  private blackHoleIntensity: number = 1.0;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'breathe',
      name: 'Черная дыра',
      description: 'Завораживающая черная дыра',
      icon: '🕳️',
      defaultConfig: {
        speed: 0.8,
        intensity: 1.2,
        particleCount: 3000,
        color: '#8b5cf6',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, 0, 20);
      this.camera.lookAt(0, 0, 0);
    }
    
    // Add background color for contrast
    this.scene.background = new THREE.Color('#0a0a14'); // Very dark blue instead of black
    
    const count = this.config.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const distances = new Float32Array(count);
    
    const baseColor = new THREE.Color(this.config.color);
    
    // Create particles in expanding spiral formation
    for (let i = 0; i < count; i++) {
      // Create spiral distribution
      const spiralRadius = 3 + Math.random() * 12; // Start closer, max radius 15
      const spiralAngle = (i / count) * Math.PI * 8; // Multiple spiral turns
      const height = (Math.random() - 0.5) * 10; // Random height
      
      // Initial spiral position
      positions[i * 3] = spiralRadius * Math.cos(spiralAngle);
      positions[i * 3 + 1] = spiralRadius * Math.sin(spiralAngle);
      positions[i * 3 + 2] = height;
      
      // Store initial distance from center
      distances[i] = Math.sqrt(
        positions[i * 3] ** 2 + 
        positions[i * 3 + 1] ** 2 + 
        positions[i * 3 + 2] ** 2
      );
      
      // Color based on distance (closer = brighter)
      const distanceRatio = Math.min(distances[i] / 25, 1);
      const colorIntensity = 0.5 + (1 - distanceRatio) * 0.5;
      
      // Add some color variation
      const hue = (baseColor.getHSL({ h: 0, s: 0, l: 0 }).h + Math.random() * 0.2 - 0.1) % 1;
      const color = new THREE.Color().setHSL(hue, 0.8, colorIntensity);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size based on distance (closer = smaller, more compressed)
      const baseSize = 0.15 + Math.random() * 0.2 + (1 - distanceRatio) * 0.05;
      const sizeMultiplier = this.config.particleSize || 1.0;
      sizes[i] = baseSize * sizeMultiplier;
      
      // Initial velocities (tangential motion)
      const tangentialSpeed = 1.0 + Math.random() * 1.0; // Increased from 0.5-1.0
      velocities[i * 3] = -spiralRadius * Math.sin(spiralAngle) * tangentialSpeed * 0.2; // Increased from 0.1
      velocities[i * 3 + 1] = spiralRadius * Math.cos(spiralAngle) * tangentialSpeed * 0.2; // Increased from 0.1
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4; // Increased from 0.2
    }
    
    this.originalPositions = new Float32Array(positions);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('distance', new THREE.BufferAttribute(distances, 1));
    
    // Create beautiful circular particles with custom shader
    const material = new THREE.ShaderMaterial({
      vertexShader: CircleParticleShader.vertexShader,
      fragmentShader: CircleParticleShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    
    // Debug logging
    console.log('Black Hole initialized:', {
      particleCount: this.particles.geometry.attributes.position.count,
      cameraZ: this.camera.position.z,
      firstParticlePos: positions.slice(0, 3)
    });
    
    // Override quality for debugging
    if (this.particles) {
      console.log('Particle system ready:', {
        count: this.particles.geometry.attributes.position.count,
        visible: this.particles.visible,
        material: this.particles.material,
        inScene: this.scene.children.includes(this.particles)
      });
    }
    
    this.time = 0;
    this.blackHoleIntensity = this.config.intensity;
  }
  
  update(_time: number, deltaTime: number): void {
    if (!this.particles || !this.originalPositions) return;
    
    // Check if geometry attributes exist
    const positionAttr = this.particles.geometry.attributes.position;
    const colorAttr = this.particles.geometry.attributes.customColor;
    const sizeAttr = this.particles.geometry.attributes.size;
    const velocityAttr = this.particles.geometry.attributes.velocity;
    const distanceAttr = this.particles.geometry.attributes.distance;
    
    if (!positionAttr || !colorAttr || !sizeAttr || !velocityAttr || !distanceAttr) {
      console.warn('BreatheMode: Geometry attributes not ready');
      return;
    }
    
    this.time += deltaTime * this.config.speed;
    
    const positions = positionAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;
    const velocities = velocityAttr.array as Float32Array;
    const distances = distanceAttr.array as Float32Array;
    
    // Update black hole intensity based on interaction
    this.blackHoleIntensity += (this.config.intensity - this.blackHoleIntensity) * deltaTime * 2;
    
    // Black hole physics
    const blackHoleStrength = this.blackHoleIntensity * (1 + this.interactionStrength * 0.5);
    const blackHoleSize = this.blackHoleRadius * (1 + this.interactionStrength * 0.3);
    
    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      // Calculate distance from center
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
      
      // Black hole gravitational pull - ALWAYS apply to all particles
      if (distanceFromCenter > 0.1) { // Only avoid division by zero
        // Strong gravitational force toward center
        const pullForce = blackHoleStrength / Math.max(distanceFromCenter * distanceFromCenter, 0.1);
        const pullX = (-x / distanceFromCenter) * pullForce;
        const pullY = (-y / distanceFromCenter) * pullForce;
        const pullZ = (-z / distanceFromCenter) * pullForce * 0.3; // Reduced vertical pull
        
        // Apply gravitational pull - MUCH STRONGER
        velocities[i * 3] += pullX * deltaTime * 200; // Much stronger pull
        velocities[i * 3 + 1] += pullY * deltaTime * 200; // Much stronger pull
        velocities[i * 3 + 2] += pullZ * deltaTime * 200; // Much stronger pull
      }
      
      // Spiral motion (Coriolis effect) - Apply to all particles
      if (distanceFromCenter > 0.1) {
        const spiralForce = blackHoleStrength * 0.5; // Increased spiral force
        const spiralX = -y * spiralForce;
        const spiralY = x * spiralForce;
        
        velocities[i * 3] += spiralX * deltaTime * 30; // Increased spiral speed
        velocities[i * 3 + 1] += spiralY * deltaTime * 30; // Increased spiral speed
      }
      
      // Apply velocities
      positions[i * 3] += velocities[i * 3] * deltaTime * 20; // Increased from 10
      positions[i * 3 + 1] += velocities[i * 3 + 1] * deltaTime * 20; // Increased from 10
      positions[i * 3 + 2] += velocities[i * 3 + 2] * deltaTime * 20; // Increased from 10
      
      // Reset particles that get too close to center or escape
      const newDistance = Math.sqrt(
        positions[i * 3] ** 2 + 
        positions[i * 3 + 1] ** 2 + 
        positions[i * 3 + 2] ** 2
      );
      
      if (newDistance < blackHoleSize * 0.3 || newDistance > 20) { // Smaller reset distance
        // Reset particle to outer edge
        const resetRadius = 8 + Math.random() * 7; // Now 8-15, closer to center
        const resetAngle = Math.random() * Math.PI * 2;
        
        positions[i * 3] = resetRadius * Math.cos(resetAngle);
        positions[i * 3 + 1] = resetRadius * Math.sin(resetAngle);
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        
        // Reset velocity with some initial speed toward center
        const initialSpeed = 0.5 + Math.random() * 1.0;
        velocities[i * 3] = -positions[i * 3] * initialSpeed * 0.1;
        velocities[i * 3 + 1] = -positions[i * 3 + 1] * initialSpeed * 0.1;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        
        distances[i] = resetRadius;
      }
      
      // Update distance
      distances[i] = newDistance;
      
      // Color based on distance and speed
      const distanceRatio = Math.min(newDistance / 25, 1);
      const speed = Math.sqrt(
        velocities[i * 3] ** 2 + 
        velocities[i * 3 + 1] ** 2 + 
        velocities[i * 3 + 2] ** 2
      );
      
      const colorIntensity = 0.6 + (1 - distanceRatio) * 0.4 + Math.min(speed * 0.1, 0.3);
      
      // Add time-based color variation
      const hue = (this.time * 0.1 + i * 0.01) % 1;
      const color = new THREE.Color().setHSL(hue, 0.7, colorIntensity);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size compression near black hole
      const compressionFactor = Math.max(0.1, 1 - (1 - distanceRatio) * 0.8);
      const baseSize = 0.15 + Math.random() * 0.15;
      const sizeMultiplier = this.config.particleSize || 1.0;
      sizes[i] = Math.max(0.1, baseSize * compressionFactor * sizeMultiplier);
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.customColor.needsUpdate = true;
    this.particles.geometry.attributes.size.needsUpdate = true;
    
    // Gentle rotation of the entire system
    this.particles.rotation.y += deltaTime * 0.1;
  }
  
  handleInteraction(x: number, y: number, type: 'start' | 'move' | 'end'): void {
    if (type === 'start' || type === 'move') {
      this.mousePosition.x = (x / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(y / window.innerHeight) * 2 + 1;
      
      // Increase black hole intensity on interaction
      this.interactionStrength = Math.min(1, this.interactionStrength + 0.1);
    } else if (type === 'end') {
      this.interactionStrength = Math.max(0, this.interactionStrength - 0.05);
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
    this.originalPositions = null;
  }
  
  protected onConfigUpdate(): void {
    if (this.particles && this.config.particleCount !== this.particles.geometry.attributes.position.count) {
      this.destroy();
      this.init();
    }
    
    // Update black hole size based on intensity
    this.blackHoleRadius = 0.3 + this.config.intensity * 0.7;
  }
}