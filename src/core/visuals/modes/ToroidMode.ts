/**
 * Toroid Mode - Particle torus with flowing motion
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

interface ParticleData {
  u: number; // Major angle
  v: number; // Minor angle
  speed: number;
  phaseOffset: number;
}

export class ToroidMode extends BaseMode {
  private particles: THREE.Points | null = null;
  private particleData: ParticleData[] = [];
  private majorRadius: number = 15;
  private minorRadius: number = 5;
  private isDragging: boolean = false;
  private lastMouse: { x: number; y: number } = { x: 0, y: 0 };
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'toroid',
      name: 'Toroid',
      description: 'Flowing particle torus',
      icon: '⭕',
      defaultConfig: {
        speed: 0.5,
        intensity: 0.8,
        particleCount: 5000,
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
    
    this.particleData = [];
    const baseColor = new THREE.Color(this.config.color);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);
    
    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.4;
      const phaseOffset = Math.random() * Math.PI * 2;
      
      this.particleData.push({ u, v, speed, phaseOffset });
      
      // Calculate position on torus
      const x = (this.majorRadius + this.minorRadius * Math.cos(v)) * Math.cos(u);
      const y = (this.majorRadius + this.minorRadius * Math.cos(v)) * Math.sin(u);
      const z = this.minorRadius * Math.sin(v);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Color variation based on position
      const colorVariation = Math.sin(u * 3) * 0.5 + 0.5;
      const color = new THREE.Color().setHSL(
        hsl.h + colorVariation * 0.1,
        hsl.s,
        hsl.l * (0.7 + colorVariation * 0.3)
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size variation
      sizes[i] = 0.08 + Math.random() * 0.04;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  update(time: number, deltaTime: number): void {
    if (!this.particles) return;
    
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const speed = this.config.speed * 0.1 * this.config.intensity;
    
    for (let i = 0; i < this.particleData.length; i++) {
      const data = this.particleData[i];
      
      // Update angles
      data.u += data.speed * speed;
      data.v += 0.01 * speed + Math.sin(time + data.phaseOffset) * 0.005;
      
      // Calculate new position
      const x = (this.majorRadius + this.minorRadius * Math.cos(data.v)) * Math.cos(data.u);
      const y = (this.majorRadius + this.minorRadius * Math.cos(data.v)) * Math.sin(data.u);
      const z = this.minorRadius * Math.sin(data.v);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    
    // Auto-rotation when not dragging
    if (!this.isDragging) {
      this.particles.rotation.x += deltaTime * 0.1;
      this.particles.rotation.y += deltaTime * 0.15;
    }
  }
  
  handleInteraction(x: number, y: number, type: 'start' | 'move' | 'end'): void {
    if (!this.particles) return;
    
    if (type === 'start') {
      this.isDragging = true;
      this.lastMouse = { x, y };
    } else if (type === 'move' && this.isDragging) {
      const deltaX = x - this.lastMouse.x;
      const deltaY = y - this.lastMouse.y;
      
      this.particles.rotation.y += deltaX * 0.01;
      this.particles.rotation.x += deltaY * 0.01;
      
      this.lastMouse = { x, y };
    } else if (type === 'end') {
      this.isDragging = false;
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
    this.particleData = [];
  }
  
  protected onConfigUpdate(): void {
    // Update particle count would require reinit
    // Speed and intensity are used directly in update
  }
}

