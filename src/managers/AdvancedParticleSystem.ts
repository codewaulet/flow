import * as THREE from 'three';
import { FlowSettings } from '../types';

export class AdvancedParticleSystem {
  private scene: THREE.Scene;
  private settings: FlowSettings;
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private alphas: Float32Array;
  private particleCount: number;
  private time: number = 0;

  constructor(scene: THREE.Scene, settings: FlowSettings) {
    this.scene = scene;
    this.settings = settings;
    this.particleCount = settings.particleCount;
    
    this.initGeometry();
    this.initMaterial();
    this.createParticles();
    this.scene.add(this.particles);
  }

  private initGeometry() {
    this.geometry = new THREE.BufferGeometry();
    
    // Инициализируем массивы данных
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.colors = new Float32Array(this.particleCount * 3);
    this.sizes = new Float32Array(this.particleCount);
    this.alphas = new Float32Array(this.particleCount);

    // Заполняем начальные данные
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Позиции
      this.positions[i3] = (Math.random() - 0.5) * 100;
      this.positions[i3 + 1] = (Math.random() - 0.5) * 100;
      this.positions[i3 + 2] = (Math.random() - 0.5) * 100;
      
      // Скорости
      this.velocities[i3] = (Math.random() - 0.5) * 0.1;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
      
      // Цвета
      this.colors[i3] = Math.random();
      this.colors[i3 + 1] = Math.random();
      this.colors[i3 + 2] = Math.random();
      
      // Размеры и альфа
      this.sizes[i] = Math.random() * 2 + 1;
      this.alphas[i] = Math.random() * 0.8 + 0.2;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));
  }

  private initMaterial() {
    this.material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
  }

  private createParticles() {
    this.particles = new THREE.Points(this.geometry, this.material);
  }

  public update(deltaTime: number) {
    this.time += deltaTime;
    
    switch (this.settings.mode) {
      case 'smooth':
        this.updateSmoothMode(deltaTime);
        break;
      case 'crawl':
        this.updateCrawlMode(deltaTime);
        break;
      case 'dynamic':
        this.updateDynamicMode(deltaTime);
        break;
    }

    // Обновляем геометрию
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.alpha.needsUpdate = true;
  }

  private updateSmoothMode(deltaTime: number) {
    const speed = this.settings.baseSpeed * deltaTime * 0.01;
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Плавное движение по спирали
      const angle = this.time * 0.001 + i * 0.01;
      const radius = 20 + Math.sin(this.time * 0.002 + i * 0.02) * 10;
      
      this.positions[i3] = Math.cos(angle) * radius;
      this.positions[i3 + 1] = Math.sin(this.time * 0.001 + i * 0.01) * 5;
      this.positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Цветовые переходы
      this.colors[i3] = 0.5 + Math.sin(this.time * 0.001 + i * 0.01) * 0.3;
      this.colors[i3 + 1] = 0.8 + Math.cos(this.time * 0.001 + i * 0.01) * 0.2;
      this.colors[i3 + 2] = 0.9;
      
      // Мерцание размера
      if (this.settings.flickerSize) {
        this.sizes[i] = 1 + Math.sin(this.time * 0.01 + i * 0.1) * 0.5;
      }
      
      // Мерцание альфы
      if (this.settings.flickerAlpha) {
        this.alphas[i] = 0.5 + Math.sin(this.time * 0.008 + i * 0.05) * 0.3;
      }
    }
  }

  private updateCrawlMode(deltaTime: number) {
    const speed = this.settings.baseSpeed * deltaTime * 0.02;
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Движение сверху вниз с перспективой
      const progress = (this.time * 0.001 + i * 0.001) % 1;
      const y = 50 - progress * 100;
      const scale = 1 - progress * 0.8; // Уменьшение размера
      
      this.positions[i3] = (Math.random() - 0.5) * 20 * scale;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = -20 + progress * 40;
      
      // Цвета в стиле Star Wars
      this.colors[i3] = 0.1;
      this.colors[i3 + 1] = 0.8 + Math.sin(this.time * 0.01) * 0.2;
      this.colors[i3 + 2] = 0.1;
      
      // Размер зависит от позиции
      this.sizes[i] = 2 * scale;
      this.alphas[i] = 0.8 * scale;
    }
  }

  private updateDynamicMode(deltaTime: number) {
    const speed = this.settings.baseSpeed * deltaTime * 0.015;
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      switch (this.settings.subMode) {
        case 'spiral':
          this.updateSpiralPattern(i, i3, deltaTime);
          break;
        case 'waves':
          this.updateWavePattern(i, i3, deltaTime);
          break;
        case 'vortex':
          this.updateVortexPattern(i, i3, deltaTime);
          break;
      }
      
      // Динамические цвета
      this.colors[i3] = 0.2 + Math.sin(this.time * 0.005 + i * 0.02) * 0.3;
      this.colors[i3 + 1] = 0.6 + Math.cos(this.time * 0.003 + i * 0.015) * 0.4;
      this.colors[i3 + 2] = 0.8 + Math.sin(this.time * 0.007 + i * 0.025) * 0.2;
    }
  }

  private updateSpiralPattern(i: number, i3: number, deltaTime: number) {
    const angle = this.time * 0.002 + i * 0.02;
    const radius = 15 + Math.sin(this.time * 0.001 + i * 0.01) * 8;
    const height = Math.sin(this.time * 0.001 + i * 0.005) * 20;
    
    this.positions[i3] = Math.cos(angle) * radius;
    this.positions[i3 + 1] = height;
    this.positions[i3 + 2] = Math.sin(angle) * radius;
    
    this.sizes[i] = 1.5 + Math.sin(this.time * 0.01 + i * 0.1) * 0.5;
    this.alphas[i] = 0.7 + Math.cos(this.time * 0.008 + i * 0.05) * 0.3;
  }

  private updateWavePattern(i: number, i3: number, deltaTime: number) {
    const x = (i / this.particleCount) * 40 - 20;
    const wave1 = Math.sin(this.time * 0.002 + x * 0.1) * 10;
    const wave2 = Math.sin(this.time * 0.003 + x * 0.15) * 5;
    
    this.positions[i3] = x;
    this.positions[i3 + 1] = wave1 + wave2;
    this.positions[i3 + 2] = Math.sin(this.time * 0.001 + x * 0.2) * 15;
    
    this.sizes[i] = 2 + Math.sin(this.time * 0.01 + i * 0.1) * 0.8;
    this.alphas[i] = 0.6 + Math.cos(this.time * 0.005 + i * 0.05) * 0.4;
  }

  private updateVortexPattern(i: number, i3: number, deltaTime: number) {
    const angle = this.time * 0.003 + i * 0.03;
    const radius = 10 + Math.sin(this.time * 0.001 + i * 0.01) * 5;
    const height = (i / this.particleCount) * 40 - 20;
    
    this.positions[i3] = Math.cos(angle) * radius;
    this.positions[i3 + 1] = height;
    this.positions[i3 + 2] = Math.sin(angle) * radius;
    
    this.sizes[i] = 1 + Math.sin(this.time * 0.015 + i * 0.1) * 0.7;
    this.alphas[i] = 0.8 + Math.cos(this.time * 0.01 + i * 0.05) * 0.2;
  }

  public updateSettings(newSettings: FlowSettings) {
    this.settings = newSettings;
    
    // Обновляем количество частиц если изменилось
    if (newSettings.particleCount !== this.particleCount) {
      this.particleCount = newSettings.particleCount;
      this.dispose();
      this.initGeometry();
      this.initMaterial();
      this.createParticles();
      this.scene.add(this.particles);
    }
  }

  public dispose() {
    if (this.particles) {
      this.scene.remove(this.particles);
      this.geometry.dispose();
      this.material.dispose();
    }
  }
}
