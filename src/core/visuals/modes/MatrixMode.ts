/**
 * Matrix Mode - Digital rain effect with 2D canvas
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class MatrixMode extends BaseMode {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private columns: number = 0;
  private drops: number[] = [];
  private fontSize: number = 16;
  private characters: string = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'matrix',
      name: 'Matrix',
      description: 'Digital rain code cascade',
      icon: '💚',
      defaultConfig: {
        speed: 1.0,
        intensity: 1.0,
        particleCount: 100, // columns
        color: '#00ff00',
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    // Setup orthographic camera for full screen
    const aspect = window.innerWidth / window.innerHeight;
    if (!(this.camera instanceof THREE.OrthographicCamera)) {
      this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    }
    this.camera.position.z = 1;
    
    // Set scene background to black for Matrix mode
    this.scene.background = new THREE.Color('#000000');
    
    // Create canvas - full screen size
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.zIndex = '0';
    
    // Add canvas to DOM for full screen rendering
    document.body.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    if (!this.ctx) {
      throw new Error('Could not get 2D context');
    }
    
    // Calculate columns based on screen width
    this.fontSize = Math.max(14, Math.min(24, window.innerWidth / 80));
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    
    // Initialize drops
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.random() * -(this.canvas.height / this.fontSize);
    }
    
    // Fill canvas with black initially
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  update(time: number, _deltaTime: number): void {
    if (!this.ctx || !this.canvas) return;
    
    // Fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // CRT scanline effect
    this.addScanlines(time);
    
    // Set text properties
    this.ctx.fillStyle = this.config.color;
    this.ctx.font = `bold ${this.fontSize}px monospace`;
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = this.config.color;
    
    // Draw characters
    for (let i = 0; i < this.columns; i++) {
      // Random character
      const char = this.characters.charAt(
        Math.floor(Math.random() * this.characters.length)
      );
      
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;
      
      // Highlight leading character
      if (this.drops[i] > 1) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(char, x, y);
        
        // Draw fading trail
        this.ctx.fillStyle = this.config.color;
        const trailLength = 5;
        for (let t = 1; t < trailLength; t++) {
          const alpha = 1 - (t / trailLength);
          this.ctx.globalAlpha = alpha;
          this.ctx.fillText(
            this.characters.charAt(Math.floor(Math.random() * this.characters.length)),
            x,
            y - t * this.fontSize
          );
        }
        this.ctx.globalAlpha = 1;
      } else {
        this.ctx.fillText(char, x, y);
      }
      
      // Reset drop randomly or when it goes off screen
      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      
      // Move drop down
      this.drops[i] += this.config.speed * this.config.intensity;
    }
    
    // Add glitch effect occasionally
    if (Math.random() > 0.98) {
      this.addGlitch();
    }
  }
  
  /**
   * Add CRT scanline effect
   */
  private addScanlines(time: number): void {
    if (!this.ctx || !this.canvas) return;
    
    // Subtle scanlines
    const scanlineY = ((time * 100) % this.canvas.height);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let y = 0; y < this.canvas.height; y += 4) {
      this.ctx.fillRect(0, y, this.canvas.width, 2);
    }
    
    // Moving scanline
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.fillRect(0, scanlineY, this.canvas.width, 3);
  }
  
  /**
   * Add random glitch effect
   */
  private addGlitch(): void {
    if (!this.ctx || !this.canvas) return;
    
    const glitchHeight = 20;
    const y = Math.random() * this.canvas.height;
    
    // Save and restore image data with offset
    const imageData = this.ctx.getImageData(
      0,
      y,
      this.canvas.width,
      glitchHeight
    );
    this.ctx.putImageData(
      imageData,
      Math.random() * 20 - 10,
      y
    );
  }
  
  destroy(): void {
    // Remove canvas from DOM
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    this.canvas = null;
    this.ctx = null;
    this.drops = [];
  }
  
  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.columns = Math.floor(width / this.fontSize);
      
      // Reinitialize drops
      this.drops = [];
      for (let i = 0; i < this.columns; i++) {
        this.drops[i] = Math.random() * -(height / this.fontSize);
      }
    }
  }
  
  protected onConfigUpdate(): void {
    // Speed and intensity are used directly in update
    // Color is used in update method
  }
}

