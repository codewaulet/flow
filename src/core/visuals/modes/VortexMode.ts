/**
 * Vortex Mode - Плавный водоворот
 * Features: Smooth spiral vortex with organic fluid motion
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class VortexMode extends BaseMode {
  private mesh: THREE.Mesh | null = null;
  private time: number = 0;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'vortex',
      name: 'Водоворот',
      description: 'Плавный водоворот с органичной спиральной формой',
      icon: '🌊',
      defaultConfig: {
        speed: 1.0,
        intensity: 1.0,
        particleCount: 0,
        color: '#ff6b35',
        particleSize: 1.0,
      },
    };
    super(scene, camera, renderer, metadata);
  }
  
  async init(): Promise<void> {
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.position.set(0, 0, 20);
      this.camera.lookAt(0, 0, 0);
    }
    
    // Dark background
    this.scene.background = new THREE.Color('#0a0a0a');
    
    // Create spiral geometry
    const geometry = this.createSpiralGeometry();
    
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float time;
        uniform float intensity;
        uniform vec3 color;
        
        varying vec3 vPosition;
        varying float vDistance;
        
        void main() {
          vPosition = position;
          vDistance = length(position.xy);
          
          // Spiral distortion
          float angle = atan(position.y, position.x);
          float spiralOffset = sin(angle * 3.0 + time * 2.0) * intensity * 0.5;
          
          vec3 distortedPosition = position;
          distortedPosition.xy += normalize(position.xy) * spiralOffset;
          
          // Wave distortions
          float wave = sin(time * 3.0 + vDistance * 0.5) * intensity * 0.3;
          distortedPosition.z += wave;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(distortedPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform vec3 color;
        
        varying vec3 vPosition;
        varying float vDistance;
        
        void main() {
          // Gradient from center to edges
          float normalizedDistance = clamp(vDistance / 15.0, 0.0, 1.0);
          vec3 baseColor = color;
          
          // Add spiral variations
          float angle = atan(vPosition.y, vPosition.x);
          float spiralVariation = sin(angle * 4.0 + time * 2.0) * 0.3 + 0.7;
          baseColor *= spiralVariation;
          
          // Pulsation
          float pulse = sin(time * 2.0 + vDistance * 0.3) * 0.2 + 0.8;
          baseColor *= pulse;
          
          // Opacity
          float opacity = 1.0 - smoothstep(0.0, 15.0, vDistance);
          
          gl_FragColor = vec4(baseColor, opacity * 0.8);
        }
      `,
      uniforms: {
        time: { value: 0 },
        intensity: { value: this.config.intensity },
        color: { value: new THREE.Color(this.config.color) }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    
    this.time = 0;
  }
  
  private createSpiralGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    const rings = 20;
    const segments = 32;
    
    for (let ring = 0; ring < rings; ring++) {
      const t = ring / rings;
      const radius = 15 * (1 - t) * (1 - t);
      const height = (t - 0.5) * 8;
      
      for (let segment = 0; segment < segments; segment++) {
        const angle = (segment / segments) * Math.PI * 2;
        
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const z = height;
        
        vertices.push(x, y, z);
        uvs.push(ring / rings, segment / segments);
      }
    }
    
    for (let ring = 0; ring < rings - 1; ring++) {
      for (let segment = 0; segment < segments; segment++) {
        const currentRing = ring * segments;
        const nextRing = (ring + 1) * segments;
        const currentSegment = segment;
        const nextSegment = (segment + 1) % segments;
        
        const i1 = currentRing + currentSegment;
        const i2 = currentRing + nextSegment;
        const i3 = nextRing + currentSegment;
        const i4 = nextRing + nextSegment;
        
        indices.push(i1, i2, i3);
        indices.push(i2, i4, i3);
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }
  
  update(time: number, deltaTime: number): void {
    this.time = time * this.config.speed;
    
    if (this.mesh) {
      const material = this.mesh.material as THREE.ShaderMaterial;
      material.uniforms.time.value = this.time;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
      
      // Rotate the vortex
      this.mesh.rotation.z += deltaTime * 0.01 * this.config.speed;
    }
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
  }
  
  protected onConfigUpdate(): void {
    if (this.mesh) {
      const material = this.mesh.material as THREE.ShaderMaterial;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
    }
  }
}

