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
  private texture: THREE.CanvasTexture | null = null;
  private mesh: THREE.Mesh | null = null;
  
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
    // Setup orthographic camera
    const aspect = window.innerWidth / window.innerHeight;
    if (!(this.camera instanceof THREE.OrthographicCamera)) {
      this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    }
    this.camera.position.z = 1;
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('Could not get 2D context');
    }
    
    // Calculate columns
    this.fontSize = Math.max(12, Math.min(20, this.config.particleCount / 5));
    this.columns = Math.floor(this.canvas.width / this.fontSize);
    
    // Initialize drops
    this.drops = [];
    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.random() * -(this.canvas.height / this.fontSize);
    }
    
    // Fill canvas with black initially
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Create texture from canvas
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.needsUpdate = true;
    
    // Create plane to display the canvas
    const geometry = new THREE.PlaneGeometry(2 * aspect, 2);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: false,
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }
  
  update(time: number, deltaTime: number): void {
    if (!this.ctx || !this.canvas || !this.texture) return;
    
    // Fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set text properties
    this.ctx.fillStyle = this.config.color;
    this.ctx.font = `${this.fontSize}px monospace`;
    
    // Draw characters
    for (let i = 0; i < this.columns; i++) {
      // Random character
      const char = this.characters.charAt(
        Math.floor(Math.random() * this.characters.length)
      );
      
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;
      
      this.ctx.fillText(char, x, y);
      
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
    
    // Update texture
    this.texture.needsUpdate = true;
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
    if (this.mesh) {
      this.mesh.geometry.dispose();
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
    
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
    
    this.canvas = null;
    this.ctx = null;
    this.drops = [];
  }
  
  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.columns = Math.floor(width / this.fontSize);
      
      // Reinitialize drops
      this.drops = [];
      for (let i = 0; i < this.columns; i++) {
        this.drops[i] = Math.random() * -(height / this.fontSize);
      }
    }
    
    // Update camera
    const aspect = width / height;
    if (this.camera instanceof THREE.OrthographicCamera) {
      this.camera.left = -aspect;
      this.camera.right = aspect;
      this.camera.updateProjectionMatrix();
    }
    
    // Update mesh
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = new THREE.PlaneGeometry(2 * aspect, 2);
    }
  }
}

