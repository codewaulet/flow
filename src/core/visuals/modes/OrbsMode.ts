/**
 * Crawl Mode - Star Wars style text crawl with animated particles
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class OrbsMode extends BaseMode {
  private particles: THREE.Points | null = null;
  private textLines: { particles: number[]; lineIndex: number }[] = [];
  private stars: number[] = [];
  
  private lines: string[] = [
    'A long time ago in a galaxy far, far away...',
    '',
    'ENTER THE FLOW STATE',
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
      description: 'Star Wars style text crawl into infinity',
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
    // Setup camera for crawl perspective
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, -5, 5);
      this.camera.lookAt(0, 10, 0);
      this.camera.rotation.x = Math.PI / 4; // 45 degree angle for crawl effect
    }
    
    const count = this.config.particleCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const baseColor = new THREE.Color(this.config.color);
    
    let particleIndex = 0;
    const charSpacing = 0.6;
    const lineSpacing = 1.5;
    
    // Create text lines from particles
    for (let lineIdx = 0; lineIdx < this.lines.length && particleIndex < count; lineIdx++) {
      const line = this.lines[lineIdx];
      const lineParticles: number[] = [];
      
      const startX = -(line.length * charSpacing) / 2;
      const baseY = lineIdx * lineSpacing;
      
      for (let charIdx = 0; charIdx < line.length && particleIndex < count; charIdx++) {
        const char = line[charIdx];
        
        if (char !== ' ') {
          // Each character is made of multiple particles
          const particlesPerChar = 15;
          const gridSize = 4;
          
          for (let p = 0; p < particlesPerChar && particleIndex < count; p++) {
            const gridX = (p % gridSize) - gridSize / 2;
            const gridY = Math.floor(p / gridSize) - gridSize / 2;
            
            const x = startX + charIdx * charSpacing + gridX * 0.1;
            const y = baseY + gridY * 0.1;
            const z = -Math.random() * 0.5; // Slight depth variation
            
            positions[particleIndex * 3] = x;
            positions[particleIndex * 3 + 1] = y;
            positions[particleIndex * 3 + 2] = z;
            
            colors[particleIndex * 3] = baseColor.r;
            colors[particleIndex * 3 + 1] = baseColor.g;
            colors[particleIndex * 3 + 2] = baseColor.b;
            
            sizes[particleIndex] = 0.15 + Math.random() * 0.1;
            
            lineParticles.push(particleIndex);
            particleIndex++;
          }
        }
      }
      
      if (lineParticles.length > 0) {
        this.textLines.push({ particles: lineParticles, lineIndex: lineIdx });
      }
    }
    
    // Fill remaining with background stars
    this.stars = [];
    for (let i = particleIndex; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
      
      const starBrightness = 0.2 + Math.random() * 0.5;
      colors[i * 3] = starBrightness;
      colors[i * 3 + 1] = starBrightness;
      colors[i * 3 + 2] = starBrightness;
      
      sizes[i] = Math.random() * 0.15 + 0.05;
      
      this.stars.push(i);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthTest: false,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  update(_time: number, deltaTime: number): void {
    if (!this.particles) return;
    
    const positions = this.particles.geometry.attributes.position.array as Float32Array;
    const colors = this.particles.geometry.attributes.color.array as Float32Array;
    const sizes = this.particles.geometry.attributes.size.array as Float32Array;
    const baseColor = new THREE.Color(this.config.color);
    
    const speed = this.config.speed * this.config.intensity * 8;
    
    // Animate text particles crawling upward (Star Wars style)
    for (const line of this.textLines) {
      for (const particleIdx of line.particles) {
        const idx = particleIdx * 3;
        
        // Move upward
        positions[idx + 1] += speed * deltaTime;
        
        // Wrap around when too far
        if (positions[idx + 1] > 40) {
          positions[idx + 1] = 0;
        }
        
        const y = positions[idx + 1];
        
        // Calculate distance-based scale and fade
        const distanceFactor = y / 40; // 0 at bottom, 1 at top
        
        // Size increases with distance (perspective)
        sizes[particleIdx] = (0.15 + distanceFactor * 0.3) * (1 + this.config.intensity * 0.5);
        
        // Fade in at bottom, fade out at top
        let alpha = 1;
        if (y < 2) {
          alpha = y / 2; // Fade in
        } else if (y > 30) {
          alpha = Math.max(0, 1 - (y - 30) / 10); // Fade out
        }
        
        // Apply color with alpha
        colors[idx] = baseColor.r * alpha;
        colors[idx + 1] = baseColor.g * alpha;
        colors[idx + 2] = baseColor.b * alpha;
      }
    }
    
    // Animate background stars (slower)
    for (const starIdx of this.stars) {
      const idx = starIdx * 3;
      
      positions[idx + 1] += speed * deltaTime * 0.3;
      
      // Wrap around
      if (positions[idx + 1] > 50) {
        positions[idx + 1] = 0;
        positions[idx] = (Math.random() - 0.5) * 50;
        positions[idx + 2] = (Math.random() - 0.5) * 20 - 10;
      }
      
      const y = positions[idx + 1];
      
      // Fade stars
      let alpha = 1;
      if (y < 5) {
        alpha = y / 5;
      } else if (y > 40) {
        alpha = Math.max(0, 1 - (y - 40) / 10);
      }
      
      const starBrightness = (0.2 + Math.random() * 0.3) * alpha;
      colors[idx] = starBrightness;
      colors[idx + 1] = starBrightness;
      colors[idx + 2] = starBrightness;
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
    this.particles.geometry.attributes.size.needsUpdate = true;
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
    this.textLines = [];
    this.stars = [];
  }
  
  protected onConfigUpdate(): void {
    // Speed and intensity are handled in update loop
    if (this.particles) {
      const material = this.particles.material as THREE.PointsMaterial;
      material.color = new THREE.Color(this.config.color);
    }
  }
}