/**
 * Tunnel Mode - Геометрический туннель
 * Features: Concentric rings with alternating rotation and pulsing effect
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class TunnelMode extends BaseMode {
  private rings: THREE.Mesh[] = [];
  private time: number = 0;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'tunnel',
      name: 'Туннель',
      description: 'Концентрические кольца с вращением в разные стороны',
      icon: '🌀',
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
    
    // Create concentric rings
    for (let i = 0; i < 6; i++) {
      const radius = 2 + i * 2;
      const geometry = new THREE.RingGeometry(radius - 0.3, radius + 0.3, 32);
      
      const material = new THREE.ShaderMaterial({
        vertexShader: `
          uniform float time;
          uniform float intensity;
          uniform vec3 color;
          uniform float ringIndex;
          
          varying vec2 vUv;
          varying float vRadius;
          
          void main() {
            vUv = uv;
            vRadius = length(position.xy);
            
            // Pulsing effect
            float pulse = sin(time * 2.0 + ringIndex * 0.5) * 0.1 + 1.0;
            vec3 pos = position;
            pos.z += pulse * intensity * 0.3;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float intensity;
          uniform vec3 color;
          uniform float ringIndex;
          
          varying vec2 vUv;
          varying float vRadius;
          
          void main() {
            // Create ring effect
            vec2 center = vec2(0.5, 0.5);
            float distance = length(vUv - center);
            float ringGlow = 1.0 - smoothstep(0.0, 0.15, abs(distance - 0.5));
            
            // Rotation in different directions
            float rotation = time * (ringIndex < 0.5 ? 1.0 : -1.0) * 2.0;
            float angle = atan(vUv.y - center.y, vUv.x - center.x) + rotation;
            float spiralPattern = sin(angle * 8.0) * 0.4 + 0.6;
            
            // Add pulsation
            float pulse = sin(time * 3.0 + ringIndex * 0.8) * 0.2 + 0.8;
            
            vec3 finalColor = color * spiralPattern * ringGlow * pulse * 2.0;
            
            gl_FragColor = vec4(finalColor, ringGlow * 1.0);
          }
        `,
        uniforms: {
          time: { value: 0 },
          intensity: { value: this.config.intensity },
          color: { value: new THREE.Color(this.config.color) },
          ringIndex: { value: i }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });

      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      this.rings.push(ring);
      this.scene.add(ring);
    }
    
    this.time = 0;
  }
  
  update(time: number, deltaTime: number): void {
    this.time = time * this.config.speed;
    
    this.rings.forEach((ring, index) => {
      const material = ring.material as THREE.ShaderMaterial;
      material.uniforms.time.value = this.time;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
      
      // Rotate rings at different speeds and directions
      ring.rotation.z += deltaTime * (index % 2 === 0 ? 0.02 : -0.02) * this.config.speed;
    });
  }
  
  destroy(): void {
    this.rings.forEach(ring => {
      ring.geometry.dispose();
      if (ring.material instanceof THREE.Material) {
        ring.material.dispose();
      }
      this.scene.remove(ring);
    });
    this.rings = [];
  }
  
  protected onConfigUpdate(): void {
    this.rings.forEach(ring => {
      const material = ring.material as THREE.ShaderMaterial;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
    });
  }
}

