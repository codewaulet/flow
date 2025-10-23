import * as THREE from 'three';
import { Particle, FlowSettings, SubMode } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private particleSystem: THREE.Points | null = null;
  private trailSystem: THREE.LineSegments | null = null;
  private scene: THREE.Scene;
  private settings: FlowSettings;

  constructor(scene: THREE.Scene, settings: FlowSettings) {
    this.scene = scene;
    this.settings = settings;
    this.createParticleSystem();
  }

  private createParticleSystem(): void {
    const particleCount = this.settings.particleCount;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Инициализируем частицы
    for (let i = 0; i < particleCount; i++) {
      const { position, velocity, color, size } = this.initializeParticle(i);
      
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = size;

      this.particles.push({
        position: position.clone(),
        velocity: velocity.clone(),
        trail: [],
        life: 0,
        alpha: 1.0,
        color: color.clone()
      });
    }

    // Создаем геометрию и материал
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: { 
        time: { value: 0 },
        flowLevel: { value: 0 },
        flickerSize: { value: this.settings.flickerSize },
        flickerAlpha: { value: this.settings.flickerAlpha }
      },
      vertexShader: `
        attribute float size; 
        attribute vec3 color; 
        varying vec3 vColor;
        varying float vAlpha; 
        uniform float time;
        uniform float flowLevel;
        uniform bool flickerSize;
        
        void main() {
          vColor = color; 
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          float pulse = flickerSize ? sin(time * 0.8 + length(position) * 0.05) * 0.15 + 0.85 : 1.0;
          float heightFactor = smoothstep(-25.0, 15.0, position.y);
          float lineSize = size * pulse * heightFactor * (1.0 + flowLevel * 0.3);
          
          gl_PointSize = lineSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          vAlpha = smoothstep(-25.0, 5.0, position.y) * smoothstep(15.0, 5.0, position.y) * 0.9;
        }
      `,
      fragmentShader: `
        varying vec3 vColor; 
        varying float vAlpha;
        uniform bool flickerAlpha;
        uniform float time;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5); 
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float intensity = smoothstep(0.5, 0.0, dist);
          float softGlow = pow(intensity, 0.6);
          
          float alphaPulse = flickerAlpha ? sin(time * 0.8) * 0.2 + 0.8 : 1.0;
          
          vec3 finalColor = vColor * (0.9 + softGlow * 0.4);
          float alpha = intensity * vAlpha * alphaPulse;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true, 
      blending: THREE.AdditiveBlending, 
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(particleGeom, particleMat);
    this.scene.add(this.particleSystem);

    // Создаем trail систему
    this.createTrailSystem();
  }

  private createTrailSystem(): void {
    const particleCount = this.settings.particleCount;
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(particleCount * 8 * 3);
    const trailColors = new Float32Array(particleCount * 8 * 3);
    
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

    const trailMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.trailSystem = new THREE.LineSegments(trailGeometry, trailMaterial);
    this.scene.add(this.trailSystem);
  }

  private initializeParticle(_index: number): { position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, size: number } {
    const mode = this.settings.mode;
    const subMode = this.settings.subMode;

    if (mode === 'crawl') {
      return this.initializeCrawlParticle();
    } else if (mode === 'dynamic') {
      return this.initializeDynamicParticle(subMode);
    } else {
      return this.initializeSmoothParticle();
    }
  }

  private initializeCrawlParticle(): { position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, size: number } {
    const startRadius = 8 + Math.random() * 12;
    const startHeight = -20 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    
    const position = new THREE.Vector3(
      Math.cos(theta) * startRadius,
      startHeight,
      Math.sin(theta) * startRadius
    );
    
    const velocity = new THREE.Vector3(0, 1.5, -0.2);
    
    // Градиент цвета по высоте
    const heightFactor = Math.max(0, Math.min(1, (startHeight + 20) / 30));
    let color: THREE.Color;
    if (heightFactor > 0.7) {
      color = new THREE.Color(0.0, 0.9, 0.8);
    } else if (heightFactor > 0.3) {
      color = new THREE.Color(0.12, 0.53, 0.9);
    } else {
      color = new THREE.Color(0.04, 0.3, 0.55);
    }
    
    const size = 0.6 + Math.random() * 1.2;
    
    return { position, velocity, color, size };
  }

  private initializeDynamicParticle(subMode: SubMode): { position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, size: number } {
    const startRadius = 5 + Math.random() * 15;
    const startHeight = -10 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    
    const position = new THREE.Vector3(
      Math.cos(theta) * startRadius,
      startHeight,
      Math.sin(theta) * startRadius
    );
    
    let velocity: THREE.Vector3;
    if (subMode === 'spiral') {
      velocity = new THREE.Vector3(
        Math.cos(theta + Math.PI/2) * 0.3,
        0.1,
        Math.sin(theta + Math.PI/2) * 0.3
      );
    } else if (subMode === 'waves') {
      velocity = new THREE.Vector3(
        Math.sin(theta) * 0.4,
        Math.cos(theta * 2) * 0.2,
        Math.cos(theta) * 0.4
      );
    } else { // vortex
      velocity = new THREE.Vector3(
        -Math.sin(theta) * 0.2,
        0.05,
        Math.cos(theta) * 0.2
      );
    }
    
    // Цвета для динамических паттернов
    const patternFactor = Math.random();
    let color: THREE.Color;
    if (patternFactor > 0.6) {
      color = new THREE.Color(0.0, 0.8, 0.9);
    } else if (patternFactor > 0.3) {
      color = new THREE.Color(0.1, 0.6, 0.8);
    } else {
      color = new THREE.Color(0.2, 0.4, 0.7);
    }
    
    const size = 0.3 + Math.random() * 0.9;
    
    return { position, velocity, color, size };
  }

  private initializeSmoothParticle(): { position: THREE.Vector3, velocity: THREE.Vector3, color: THREE.Color, size: number } {
    const startRadius = 3 + Math.random() * 4;
    const startHeight = -5 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    
    const position = new THREE.Vector3(
      Math.cos(theta) * startRadius,
      startHeight,
      Math.sin(theta) * startRadius
    );
    
    const velocity = new THREE.Vector3(0, -0.5, 0.1);
    
    // Градиент цвета по высоте
    const heightFactor = Math.max(0, Math.min(1, (startHeight + 5) / 20));
    let color: THREE.Color;
    if (heightFactor > 0.7) {
      color = new THREE.Color(0.0, 0.9, 0.8);
    } else if (heightFactor > 0.3) {
      color = new THREE.Color(0.12, 0.53, 0.9);
    } else {
      color = new THREE.Color(0.04, 0.3, 0.55);
    }
    
    const size = 0.4 + Math.random() * 0.8;
    
    return { position, velocity, color, size };
  }

  public updateParticles(delta: number, time: number, flowLevel: number, currentSpeed: number): void {
    if (!this.particleSystem) return;

    const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;
    const colors = this.particleSystem.geometry.attributes.color.array as Float32Array;

    this.particles.forEach((p, i) => {
      this.updateParticle(p, delta, time, flowLevel, currentSpeed, i);
      
      // Обновляем позицию в буфере
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;
      
      // Обновляем цвет в буфере
      colors[i * 3] = p.color.r;
      colors[i * 3 + 1] = p.color.g;
      colors[i * 3 + 2] = p.color.b;
    });

    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    this.particleSystem.geometry.attributes.color.needsUpdate = true;

    // Обновляем uniforms шейдера
    const material = this.particleSystem.material as THREE.ShaderMaterial;
    material.uniforms.time.value = time;
    material.uniforms.flowLevel.value = flowLevel;
    material.uniforms.flickerSize.value = this.settings.flickerSize;
    material.uniforms.flickerAlpha.value = this.settings.flickerAlpha;
  }

  private updateParticle(particle: Particle, delta: number, time: number, flowLevel: number, currentSpeed: number, _index: number): void {
    const mode = this.settings.mode;
    const subMode = this.settings.subMode;

    if (mode === 'crawl') {
      this.updateCrawlParticle(particle, delta, time, currentSpeed);
    } else if (mode === 'dynamic') {
      this.updateDynamicParticle(particle, delta, time, currentSpeed, subMode);
    } else {
      this.updateSmoothParticle(particle, delta, time, flowLevel, currentSpeed);
    }

    // Обновляем trail
    particle.trail.push(particle.position.clone());
    if (particle.trail.length > 8) {
      particle.trail.shift();
    }

    // Обновляем альфу
    const alphaFactor = Math.max(0.2, Math.min(1, 0.8 + flowLevel * 0.2));
    particle.alpha = alphaFactor;
  }

  private updateCrawlParticle(particle: Particle, delta: number, time: number, currentSpeed: number): void {
    const swirlX = Math.sin(time * 0.5 + particle.position.x * 0.1) * 0.1;
    const swirlZ = Math.cos(time * 0.5 + particle.position.z * 0.1) * 0.1;
    
    particle.velocity.x = swirlX;
    particle.velocity.y = 1.5 * currentSpeed;
    particle.velocity.z = -0.2 + swirlZ;
    
    particle.position.add(particle.velocity.clone().multiplyScalar(delta));
    
    // Телепорт при достижении верха
    if (particle.position.y > 20) {
      const { position } = this.initializeCrawlParticle();
      particle.position.copy(position);
      particle.trail = [];
    }
  }

  private updateDynamicParticle(particle: Particle, delta: number, time: number, currentSpeed: number, subMode: SubMode): void {
    if (subMode === 'spiral') {
      const angle = Math.atan2(particle.position.z, particle.position.x);
      particle.velocity.x = Math.cos(angle + Math.PI/2) * 0.3 * currentSpeed;
      particle.velocity.y = 0.1 * currentSpeed;
      particle.velocity.z = Math.sin(angle + Math.PI/2) * 0.3 * currentSpeed;
      
      const centerForce = 0.02;
      particle.velocity.x -= particle.position.x * centerForce;
      particle.velocity.z -= particle.position.z * centerForce;
      
    } else if (subMode === 'waves') {
      const waveX = Math.sin(time * 2 + particle.position.x * 0.1) * 0.4;
      const waveY = Math.cos(time * 1.5 + particle.position.y * 0.1) * 0.2;
      const waveZ = Math.cos(time * 2 + particle.position.z * 0.1) * 0.4;
      
      particle.velocity.x = waveX * currentSpeed;
      particle.velocity.y = waveY * currentSpeed;
      particle.velocity.z = waveZ * currentSpeed;
      
    } else { // vortex
      const angle = Math.atan2(particle.position.z, particle.position.x);
      particle.velocity.x = -Math.sin(angle) * 0.2 * currentSpeed;
      particle.velocity.y = 0.05 * currentSpeed;
      particle.velocity.z = Math.cos(angle) * 0.2 * currentSpeed;
      
      const centerForce = 0.05;
      particle.velocity.x -= particle.position.x * centerForce;
      particle.velocity.z -= particle.position.z * centerForce;
    }
    
    particle.position.add(particle.velocity.clone().multiplyScalar(delta));
    
    // Телепорт при выходе за границы
    const distance = Math.sqrt(particle.position.x * particle.position.x + particle.position.z * particle.position.z);
    if (distance > 25 || Math.abs(particle.position.y) > 15) {
      const { position } = this.initializeDynamicParticle(subMode);
      particle.position.copy(position);
      particle.trail = [];
    }
  }

  private updateSmoothParticle(particle: Particle, delta: number, time: number, flowLevel: number, currentSpeed: number): void {
    const flowVector = this.getFlowVector(particle.position, time, flowLevel);
    
    const smoothing = 0.03;
    particle.velocity.lerp(flowVector, smoothing);
    
    particle.position.add(particle.velocity.clone().multiplyScalar(delta * currentSpeed));
    
    // Телепорт при достижении низа
    if (particle.position.y < -25) {
      const { position, velocity } = this.initializeSmoothParticle();
      particle.position.copy(position);
      particle.velocity.copy(velocity);
      particle.trail = [];
    }
  }

  private getFlowVector(position: THREE.Vector3, time: number, flowLevel: number): THREE.Vector3 {
    const mainFlow = new THREE.Vector3(0, -1, 0.3);
    
    // Curl noise
    const eps = 0.05;
    const noiseScale1 = 0.02;
    const noiseScale2 = 0.05;
    const noiseScale3 = 0.1;
    
    const curl1 = this.getCurlNoise(position, time, noiseScale1, eps);
    const curl2 = this.getCurlNoise(position, time * 0.5, noiseScale2, eps);
    const curl3 = this.getCurlNoise(position, time * 0.2, noiseScale3, eps);
    
    const combinedCurl = curl1.multiplyScalar(0.5)
      .add(curl2.multiplyScalar(0.3))
      .add(curl3.multiplyScalar(0.2));
    
    const curlIntensity = 0.3 + flowLevel * 0.2;
    
    return mainFlow.clone().add(combinedCurl.multiplyScalar(curlIntensity));
  }

  private getCurlNoise(position: THREE.Vector3, time: number, scale: number, eps: number): THREE.Vector3 {
    const n1 = Math.sin(position.x * scale + time * 0.1) * Math.cos(position.y * scale);
    const n2 = Math.sin(position.x * scale + time * 0.1) * Math.cos((position.y - eps) * scale);
    const curlX = (n1 - n2) / eps;
    
    const n3 = Math.cos(position.y * scale + time * 0.1) * Math.sin(position.z * scale);
    const n4 = Math.cos((position.y - eps) * scale + time * 0.1) * Math.sin(position.z * scale);
    const curlZ = (n3 - n4) / eps;
    
    const n5 = Math.sin(position.z * scale + time * 0.1) * Math.cos(position.x * scale);
    const n6 = Math.sin((position.z - eps) * scale + time * 0.1) * Math.cos(position.x * scale);
    const curlY = (n5 - n6) / eps;
    
    return new THREE.Vector3(curlX, curlY, curlZ);
  }

  public updateTrails(): void {
    if (!this.trailSystem || !this.settings.showTrails) {
      if (this.trailSystem) {
        this.trailSystem.visible = false;
      }
      return;
    }

    const trailPositions = this.trailSystem.geometry.attributes.position.array as Float32Array;
    const trailColors = this.trailSystem.geometry.attributes.color.array as Float32Array;
    
    let lineIndex = 0;
    
    this.particles.forEach((p) => {
      const trailLength = Math.min(p.trail.length, 8);
      
      for (let j = 0; j < trailLength - 1; j++) {
        if (lineIndex * 2 + 1 < trailPositions.length / 3) {
          const startIdx = lineIndex * 6;
          const endIdx = startIdx + 3;
          
          trailPositions[startIdx] = p.trail[j].x;
          trailPositions[startIdx + 1] = p.trail[j].y;
          trailPositions[startIdx + 2] = p.trail[j].z;
          
          trailPositions[endIdx] = p.trail[j + 1].x;
          trailPositions[endIdx + 1] = p.trail[j + 1].y;
          trailPositions[endIdx + 2] = p.trail[j + 1].z;
          
          const alpha = (j / (trailLength - 1)) * 0.6;
          trailColors[startIdx] = p.color.r * alpha;
          trailColors[startIdx + 1] = p.color.g * alpha;
          trailColors[startIdx + 2] = p.color.b * alpha;
          
          trailColors[endIdx] = p.color.r * alpha;
          trailColors[endIdx + 1] = p.color.g * alpha;
          trailColors[endIdx + 2] = p.color.b * alpha;
          
          lineIndex++;
        }
      }
    });
    
    // Очищаем неиспользуемые сегменты
    for (let i = lineIndex * 6; i < trailPositions.length; i++) {
      trailPositions[i] = 0;
      trailColors[i] = 0;
    }
    
    this.trailSystem.geometry.attributes.position.needsUpdate = true;
    this.trailSystem.geometry.attributes.color.needsUpdate = true;
    this.trailSystem.visible = true;
  }

  public updateSettings(newSettings: FlowSettings): void {
    this.settings = newSettings;
    
    // Пересоздаем систему частиц если изменилось количество
    if (this.particles.length !== newSettings.particleCount) {
      this.dispose();
      this.createParticleSystem();
    }
  }

  public dispose(): void {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      const material = this.particleSystem.material as THREE.Material;
      material.dispose();
    }
    
    if (this.trailSystem) {
      this.scene.remove(this.trailSystem);
      this.trailSystem.geometry.dispose();
      const trailMaterial = this.trailSystem.material as THREE.Material;
      trailMaterial.dispose();
    }
    
    this.particles = [];
  }
}
