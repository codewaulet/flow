/**
 * Crawl Mode - Star Wars style text crawl into perspective
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class OrbsMode extends BaseMode {
  private particles: THREE.Points | null = null;
  private scrollOffset: number = 0;
  private lines: string[] = [
    'A long time ago in a galaxy far, far away...',
    '',
    'Enter the FLOW state',
    '',
    'Where focus meets infinity',
    'And creativity knows no bounds',
    '',
    'Let the particles guide you',
    'Into deep concentration',
    '',
    'Breathe... Flow... Create...',
  ];
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'orbs',
      name: 'Crawl',
      description: 'Hypnotic text crawl into the void',
      icon: '⭐',
      defaultConfig: {
        speed: 0.3,
        intensity: 1.0,
        particleCount: 5000,
        color: '#ffeb3b',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    // Setup camera with perspective for crawl effect
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, -15, 20);
      this.camera.lookAt(0, 0, -50);
      this.camera.rotation.x = -0.4; // Tilt for perspective
    }
    
    const count = this.config.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const baseColor = new THREE.Color(this.config.color);
    
    // Generate text as particles
    let particleIndex = 0;
    const spacing = 0.3;
    const lineHeight = 2;
    
    for (let lineIdx = 0; lineIdx < this.lines.length && particleIndex < count; lineIdx++) {
      const line = this.lines[lineIdx];
      const yPos = -lineIdx * lineHeight;
      
      // Center the text
      const startX = -(line.length * spacing) / 2;
      
      for (let charIdx = 0; charIdx < line.length && particleIndex < count; charIdx++) {
        const char = line[charIdx];
        
        if (char !== ' ') {
          // Create particles in a grid pattern for each character
          const particlesPerChar = 8;
          for (let p = 0; p < particlesPerChar && particleIndex < count; p++) {
            const xOffset = (Math.random() - 0.5) * spacing * 0.8;
            const yOffset = (Math.random() - 0.5) * lineHeight * 0.4;
            
            positions[particleIndex * 3] = startX + charIdx * spacing + xOffset;
            positions[particleIndex * 3 + 1] = yPos + yOffset;
            positions[particleIndex * 3 + 2] = -lineIdx * 5; // Depth
            
            // Color with slight variation
            const brightness = 0.9 + Math.random() * 0.1;
            colors[particleIndex * 3] = baseColor.r * brightness;
            colors[particleIndex * 3 + 1] = baseColor.g * brightness;
            colors[particleIndex * 3 + 2] = baseColor.b * brightness;
            
            // Size variation
            sizes[particleIndex] = 0.15 + Math.random() * 0.1;
            
            particleIndex++;
          }
        }
      }
    }
    
    // Fill remaining particles with stars
    for (let i = particleIndex; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 100;
      
      const starColor = new THREE.Color().setHSL(0, 0, 0.7 + Math.random() * 0.3);
      colors[i * 3] = starColor.r;
      colors[i * 3 + 1] = starColor.g;
      colors[i * 3 + 2] = starColor.b;
      
      sizes[i] = Math.random() * 0.08 + 0.02;
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
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    
    this.scrollOffset = 0;
  }
  
  update(_time: number, deltaTime: number): void {
    if (!this.particles) return;
    
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const colors = this.particles.geometry.attributes.color.array as Float32Array;
    
    // Scroll speed (crawling into distance)
    const scrollSpeed = this.config.speed * 10 * this.config.intensity;
    this.scrollOffset += scrollSpeed * deltaTime;
    
    const baseColor = new THREE.Color(this.config.color);
    
    // Update all particles
    for (let i = 0; i < positions.length / 3; i++) {
      // Move particles backward (into the distance)
      positions[i * 3 + 2] -= scrollSpeed * deltaTime;
      
      // Fade based on distance
      const distance = Math.abs(positions[i * 3 + 2]);
      let alpha = 1;
      
      if (distance > 100) {
        // Reset particle to front when too far
        positions[i * 3 + 2] += 200;
      }
      
      // Calculate fade based on distance
      if (distance > 50) {
        alpha = Math.max(0, 1 - (distance - 50) / 50);
      } else if (distance < 10) {
        alpha = distance / 10; // Fade in when approaching
      }
      
      colors[i * 3] = baseColor.r * alpha;
      colors[i * 3 + 1] = baseColor.g * alpha;
      colors[i * 3 + 2] = baseColor.b * alpha;
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
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
  }
  
  protected onConfigUpdate(): void {
    // Speed and intensity are used directly in update
  }
}

