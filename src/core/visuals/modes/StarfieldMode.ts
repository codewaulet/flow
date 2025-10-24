/**
 * Starfield Mode - Warp speed star field visualization
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class StarfieldMode extends BaseMode {
  private stars: THREE.Points | null = null;
  private starData: { z: number; speed: number }[] = [];
  private currentSpeed: number = 0.5;
  private targetSpeed: number = 0.5;
  private isAccelerating: boolean = false;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'starfield',
      name: 'Starfield',
      description: 'Warp speed through the cosmos',
      icon: '✨',
      defaultConfig: {
        speed: 0.5,
        intensity: 1.0,
        particleCount: 5000,
        color: '#ffffff',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    // Setup camera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.z = 10;
      this.camera.lookAt(0, 0, 0);
    }
    
    const count = this.config.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    this.starData = [];
    
    for (let i = 0; i < count; i++) {
      // Random position - spread stars further out
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 100;
      
      // Color variation (white to blue)
      const color = new THREE.Color();
      const temp = 0.7 + Math.random() * 0.3; // Color temperature
      color.setHSL(0.6, 0.3 * (1 - temp), temp);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size variation
      sizes[i] = Math.random() * 0.3 + 0.05;
      
      // Store z and individual speed
      this.starData.push({
        z: positions[i * 3 + 2],
        speed: 0.5 + Math.random() * 1.0, // More variation in speed
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
    
    // Initialize speed properly
    this.currentSpeed = this.config.speed;
    this.targetSpeed = this.config.speed;
  }
  
  update(_time: number, deltaTime: number): void {
    if (!this.stars) return;
    
    // Smooth speed transition
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * deltaTime * 5;
    
    const positions = this.stars.geometry.attributes.position.array as Float32Array;
    const sizes = this.stars.geometry.attributes.size.array as Float32Array;
    
    for (let i = 0; i < this.starData.length; i++) {
      // Move star forward - increased multiplier for visible movement
      const speed = this.currentSpeed * this.starData[i].speed * this.config.intensity;
      this.starData[i].z += speed * 100 * deltaTime; // Increased from 50 to 100
      positions[i * 3 + 2] = this.starData[i].z;
      
      // Wrap around when star passes camera
      if (this.starData[i].z > 20) {
        this.starData[i].z = -100;
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = this.starData[i].z;
      }
      
      // Size based on depth (closer = bigger)
      const depth = (this.starData[i].z + 100) / 120;
      sizes[i] = (0.05 + depth * 1.0) * (1 + this.currentSpeed * 0.8);
    }
    
    this.stars.geometry.attributes.position.needsUpdate = true;
    this.stars.geometry.attributes.size.needsUpdate = true;
  }
  
  destroy(): void {
    if (this.stars) {
      this.stars.geometry.dispose();
      if (this.stars.material instanceof THREE.Material) {
        this.stars.material.dispose();
      }
      this.scene.remove(this.stars);
      this.stars = null;
    }
    this.starData = [];
  }
  
  handleInteraction(_x: number, _y: number, type: 'start' | 'move' | 'end'): void {
    if (type === 'start') {
      // Accelerate on touch/click
      this.isAccelerating = true;
      this.targetSpeed = this.config.speed * 3;
    } else if (type === 'end') {
      // Return to normal speed
      this.isAccelerating = false;
      this.targetSpeed = this.config.speed;
    }
  }
  
  protected onConfigUpdate(): void {
    if (!this.isAccelerating) {
      this.targetSpeed = this.config.speed;
    }
  }
}

