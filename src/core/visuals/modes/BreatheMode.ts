/**
 * Vortex Black Hole Mode - Organic fluid vortex animation
 * Features: Smooth spiral vortex, accretion disk, event horizon, gravitational lensing
 */

import * as THREE from 'three';
import { BaseMode, ModeMetadata } from '../BaseMode';

export class BreatheMode extends BaseMode {
  private vortexMesh: THREE.Mesh | null = null;
  private accretionDisk: THREE.Mesh | null = null;
  private eventHorizon: THREE.Mesh | null = null;
  private distortionRings: THREE.Mesh[] = [];
  private time: number = 0;
  private mousePosition: THREE.Vector2 = new THREE.Vector2(0, 0);
  private interactionStrength: number = 0;
  
  // Black hole physics constants
  private readonly EVENT_HORIZON_RADIUS = 1.0;
  private readonly ACCRETION_DISK_INNER = 1.5;
  private readonly ACCRETION_DISK_OUTER = 8.0;
  private readonly VORTEX_RADIUS = 12.0;
  private readonly DISTORTION_RINGS_COUNT = 3;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    const metadata: ModeMetadata = {
      id: 'breathe',
      name: 'Черная дыра',
      description: 'Органичная вихревая черная дыра',
      icon: '🕳️',
      defaultConfig: {
        speed: 1.0,
        intensity: 1.0,
        particleCount: 3000,
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
    
    // Dark space background
    this.scene.background = new THREE.Color('#000011');
    
    // Create all components
    await this.createEventHorizon();
    await this.createAccretionDisk();
    await this.createVortexMesh();
    await this.createDistortionRings();
    
    this.time = 0;
  }
  
  private async createEventHorizon(): Promise<void> {
    const geometry = new THREE.SphereGeometry(this.EVENT_HORIZON_RADIUS, 32, 32);
    
    // Custom shader for event horizon with edge glow
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normal;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform vec3 color;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Calculate distance from center
          float distance = length(vPosition);
          
          // Create edge glow effect
          float edgeGlow = 1.0 - smoothstep(0.7, 1.0, distance);
          
          // Add pulsing effect
          float pulse = sin(time * 4.0) * 0.1 + 0.9;
          
          // Black center with glowing edge
          vec3 glowColor = color * edgeGlow * pulse * intensity;
          
          gl_FragColor = vec4(glowColor, edgeGlow * 0.8);
        }
      `,
      uniforms: {
        time: { value: 0.0 },
        intensity: { value: 1.0 },
        color: { value: new THREE.Color(this.config.color) }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    this.eventHorizon = new THREE.Mesh(geometry, material);
    this.scene.add(this.eventHorizon);
  }
  
  private async createAccretionDisk(): Promise<void> {
    const geometry = new THREE.RingGeometry(
      this.ACCRETION_DISK_INNER,
      this.ACCRETION_DISK_OUTER,
      64
    );
    
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float time;
        uniform float rotationSpeed;
        uniform float intensity;
        
        varying vec2 vUv;
        varying float vRadius;
        varying float vAngle;
        
        void main() {
          vUv = uv;
          
          // Calculate radius and angle for heat mapping
          vec2 center = vec2(0.5, 0.5);
          vRadius = length(uv - center);
          vAngle = atan(uv.y - center.y, uv.x - center.x);
          
          // Add subtle height variation for 3D effect
          vec3 pos = position;
          float heightVariation = sin(vAngle * 6.0 + time * rotationSpeed) * intensity * 0.05;
          pos.z += heightVariation;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float rotationSpeed;
        uniform float intensity;
        uniform vec3 color;
        uniform float innerRadius;
        uniform float outerRadius;
        
        varying vec2 vUv;
        varying float vRadius;
        varying float vAngle;
        
        void main() {
          // Create rotating UV coordinates
          vec2 center = vec2(0.5, 0.5);
          vec2 rotatedUv = vUv - center;
          
          float rotationAngle = time * rotationSpeed;
          float cosAngle = cos(rotationAngle);
          float sinAngle = sin(rotationAngle);
          
          rotatedUv = vec2(
            rotatedUv.x * cosAngle - rotatedUv.y * sinAngle,
            rotatedUv.x * sinAngle + rotatedUv.y * cosAngle
          ) + center;
          
          // Calculate distance from center
          float distance = length(rotatedUv - center);
          
          // Create realistic radial gradient (hotter toward center)
          float normalizedDistance = clamp((distance - innerRadius) / (outerRadius - innerRadius), 0.0, 1.0);
          
          // Heat map color interpolation (realistic temperature)
          vec3 baseColor = color;
          
          // Add spiral pattern (like real accretion disk)
          float spiralPattern = sin(vAngle * 8.0 + time * rotationSpeed * 1.5) * 0.2 + 0.8;
          baseColor *= spiralPattern;
          
          // Add flowing motion effect
          float flowEffect = sin(distance * 15.0 - time * rotationSpeed * 2.0) * 0.15 + 0.85;
          baseColor *= flowEffect;
          
          // Add inner glow (hotter material)
          float innerGlow = 1.0 - smoothstep(0.0, innerRadius * 0.3, distance);
          baseColor += innerGlow * color * 0.4;
          
          // Add outer edge glow
          float outerGlow = smoothstep(outerRadius * 0.85, outerRadius, distance);
          baseColor += outerGlow * color * 0.2;
          
          // Distance-based opacity with realistic falloff
          float distanceOpacity = 1.0 - smoothstep(outerRadius * 0.9, outerRadius, distance);
          
          // Add time-based pulsing (accretion variability)
          float pulse = sin(time * 1.5) * 0.1 + 0.9;
          
          gl_FragColor = vec4(baseColor, distanceOpacity * pulse * 0.7);
        }
      `,
      uniforms: {
        time: { value: 0.0 },
        rotationSpeed: { value: 1.0 },
        intensity: { value: this.config.intensity },
        color: { value: new THREE.Color(this.config.color) },
        innerRadius: { value: this.ACCRETION_DISK_INNER / this.ACCRETION_DISK_OUTER },
        outerRadius: { value: 1.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    this.accretionDisk = new THREE.Mesh(geometry, material);
    this.accretionDisk.rotation.x = Math.PI / 2; // Rotate to be horizontal
    this.scene.add(this.accretionDisk);
  }
  
  private async createVortexMesh(): Promise<void> {
    // Create organic vortex geometry using parametric surface
    const geometry = this.createOrganicVortexGeometry();
    
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float time;
        uniform float intensity;
        uniform float spiralSpeed;
        uniform vec3 color;
        
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vDistance;
        varying float vSpiralPhase;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Calculate distance from center
          vec2 center = vec2(0.0, 0.0);
          vDistance = length(position.xy - center);
          
          // Spiral phase based on angle and time
          float angle = atan(position.y, position.x);
          vSpiralPhase = angle + time * spiralSpeed;
          
          // Create smooth spiral distortion
          float spiralOffset = sin(vSpiralPhase * 2.0) * intensity * 0.3;
          
          // Apply spiral distortion to position
          vec3 distortedPosition = position;
          distortedPosition.xy += normalize(position.xy) * spiralOffset;
          
          // Add flowing motion with smooth waves
          float flowPhase = time * 2.0 + vDistance * 0.3;
          distortedPosition.z += sin(flowPhase) * intensity * 0.2;
          
          // Add gravitational lensing effect
          float lensingFactor = 1.0 / (1.0 + vDistance * 0.1);
          distortedPosition.xy *= lensingFactor;
          
          // Apply vertex position
          vec4 mvPosition = modelViewMatrix * vec4(distortedPosition, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform vec3 color;
        uniform float opacity;
        
        varying vec3 vPosition;
        varying vec2 vUv;
        varying float vDistance;
        varying float vSpiralPhase;
        
        void main() {
          // Distance-based color interpolation (realistic temperature gradient)
          float normalizedDistance = clamp(vDistance / 15.0, 0.0, 1.0);
          
          // Create smooth spiral color variation
          float spiralColor = sin(vSpiralPhase * 1.5) * 0.2 + 0.8;
          
          // Interpolate between outer and inner colors (hotter toward center)
          vec3 baseColor = color;
          
          // Add spiral variation
          baseColor *= spiralColor;
          
          // Add time-based pulsing (like real accretion)
          float pulse = sin(time * 2.0 + vDistance * 0.3) * 0.15 + 0.85;
          baseColor *= pulse;
          
          // Distance-based opacity with realistic falloff
          float distanceOpacity = 1.0 - smoothstep(0.0, 15.0, vDistance);
          
          // Add inner glow effect (hotter material)
          float innerGlow = 1.0 - smoothstep(0.0, 2.0, vDistance);
          baseColor += innerGlow * color * 0.3;
          
          // Add relativistic effects near center
          float relativisticEffect = 1.0 - smoothstep(0.0, 1.0, vDistance);
          baseColor += relativisticEffect * color * 0.2;
          
          gl_FragColor = vec4(baseColor, opacity * distanceOpacity);
        }
      `,
      uniforms: {
        time: { value: 0.0 },
        intensity: { value: this.config.intensity },
        spiralSpeed: { value: 1.0 },
        color: { value: new THREE.Color(this.config.color) },
        opacity: { value: 0.9 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    this.vortexMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.vortexMesh);
  }
  
  private createOrganicVortexGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // Create organic vortex using parametric surface
    const rings = 20;
    const segments = 32;
    
    for (let ring = 0; ring < rings; ring++) {
      const t = ring / rings;
      const radius = this.VORTEX_RADIUS * (1 - t) * (1 - t); // Quadratic falloff for organic shape
      const height = (t - 0.5) * 4; // Height variation
      
      for (let segment = 0; segment < segments; segment++) {
        const angle = (segment / segments) * Math.PI * 2;
        
        // Add organic variation
        const organicVariation = Math.sin(t * Math.PI * 4) * 0.3;
        const finalRadius = radius * (1 + organicVariation);
        
        const x = finalRadius * Math.cos(angle);
        const y = finalRadius * Math.sin(angle);
        const z = height + Math.sin(angle * 3) * 0.2; // Add wave variation
        
        vertices.push(x, y, z);
        uvs.push(ring / rings, segment / segments);
      }
    }
    
    // Create faces
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
        
        // Create two triangles
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
  
  private async createDistortionRings(): Promise<void> {
    this.distortionRings = [];
    
    for (let i = 0; i < this.DISTORTION_RINGS_COUNT; i++) {
      const radius = this.ACCRETION_DISK_OUTER + (i + 1) * 2;
      const geometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 32);
      
      const material = new THREE.ShaderMaterial({
        vertexShader: `
          uniform float time;
          uniform float ringIndex;
          
          varying vec2 vUv;
          varying float vDistance;
          
          void main() {
            vUv = uv;
            vDistance = length(position.xy);
            
            // Add wave distortion
            float wave = sin(vDistance * 0.5 - time * 2.0 + ringIndex * 2.0) * 0.1;
            vec3 pos = position;
            pos.z += wave;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float ringIndex;
          uniform vec3 color;
          uniform float opacity;
          
          varying vec2 vUv;
          varying float vDistance;
          
          void main() {
            // Create ring glow effect
            float ringGlow = 1.0 - smoothstep(0.0, 0.1, abs(vDistance - 8.0 - ringIndex * 2.0));
            
            // Add time-based pulsing
            float pulse = sin(time * 1.5 + ringIndex * 1.0) * 0.3 + 0.7;
            
            // Color based on ring index
            vec3 ringColor = color * (1.0 - ringIndex * 0.2);
            
            gl_FragColor = vec4(ringColor, ringGlow * opacity * pulse);
          }
        `,
        uniforms: {
          time: { value: 0.0 },
          ringIndex: { value: i },
          color: { value: new THREE.Color(this.config.color) },
          opacity: { value: 0.3 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      this.distortionRings.push(ring);
      this.scene.add(ring);
    }
  }
  
  update(time: number, deltaTime: number): void {
    this.time = time * this.config.speed;
    
    // Update event horizon
    if (this.eventHorizon) {
      const material = this.eventHorizon.material as THREE.ShaderMaterial;
      material.uniforms.time.value = this.time;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
      
      // Subtle pulsing
      const pulse = 1 + Math.sin(this.time * 3) * 0.05;
      this.eventHorizon.scale.setScalar(pulse);
    }
    
    // Update accretion disk
    if (this.accretionDisk) {
      const material = this.accretionDisk.material as THREE.ShaderMaterial;
      material.uniforms.time.value = this.time;
      material.uniforms.rotationSpeed.value = 0.5 * this.config.speed;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
      
      // Rotate the disk
      this.accretionDisk.rotation.z += deltaTime * 0.3 * this.config.speed;
    }
    
    // Update vortex mesh
    if (this.vortexMesh) {
      const material = this.vortexMesh.material as THREE.ShaderMaterial;
      material.uniforms.time.value = this.time;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.spiralSpeed.value = 1.0 * this.config.speed;
      material.uniforms.color.value = new THREE.Color(this.config.color);
      
      // Rotate the vortex
      this.vortexMesh.rotation.z += deltaTime * 0.2 * this.config.speed;
    }
    
    // Update distortion rings
    this.distortionRings.forEach((ring, index) => {
      const material = ring.material as THREE.ShaderMaterial;
      material.uniforms.time.value = this.time;
      material.uniforms.color.value = new THREE.Color(this.config.color);
      
      // Rotate rings at different speeds
      ring.rotation.z += deltaTime * (0.1 + index * 0.05) * this.config.speed;
    });
  }
  
  handleInteraction(x: number, y: number, type: 'start' | 'move' | 'end'): void {
    if (type === 'start' || type === 'move') {
      this.mousePosition.x = (x / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(y / window.innerHeight) * 2 + 1;
      
      // Increase interaction strength
      this.interactionStrength = Math.min(1, this.interactionStrength + 0.1);
      
      // Enhance vortex intensity on interaction
      if (this.vortexMesh) {
        const material = this.vortexMesh.material as THREE.ShaderMaterial;
        material.uniforms.intensity.value = this.config.intensity * (1 + this.interactionStrength);
      }
    } else if (type === 'end') {
      this.interactionStrength = Math.max(0, this.interactionStrength - 0.05);
    }
  }
  
  destroy(): void {
    // Clean up event horizon
    if (this.eventHorizon) {
      this.eventHorizon.geometry.dispose();
      if (this.eventHorizon.material instanceof THREE.Material) {
        this.eventHorizon.material.dispose();
      }
      this.scene.remove(this.eventHorizon);
      this.eventHorizon = null;
    }
    
    // Clean up accretion disk
    if (this.accretionDisk) {
      this.accretionDisk.geometry.dispose();
      if (this.accretionDisk.material instanceof THREE.Material) {
        this.accretionDisk.material.dispose();
      }
      this.scene.remove(this.accretionDisk);
      this.accretionDisk = null;
    }
    
    // Clean up vortex mesh
    if (this.vortexMesh) {
      this.vortexMesh.geometry.dispose();
      if (this.vortexMesh.material instanceof THREE.Material) {
        this.vortexMesh.material.dispose();
      }
      this.scene.remove(this.vortexMesh);
      this.vortexMesh = null;
    }
    
    // Clean up distortion rings
    this.distortionRings.forEach(ring => {
      ring.geometry.dispose();
      if (ring.material instanceof THREE.Material) {
        ring.material.dispose();
      }
      this.scene.remove(ring);
    });
    this.distortionRings = [];
  }
  
  protected onConfigUpdate(): void {
    // Update shader uniforms based on config
    if (this.eventHorizon) {
      const material = this.eventHorizon.material as THREE.ShaderMaterial;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
    }
    
    if (this.accretionDisk) {
      const material = this.accretionDisk.material as THREE.ShaderMaterial;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
    }
    
    if (this.vortexMesh) {
      const material = this.vortexMesh.material as THREE.ShaderMaterial;
      material.uniforms.intensity.value = this.config.intensity;
      material.uniforms.color.value = new THREE.Color(this.config.color);
    }
    
    this.distortionRings.forEach(ring => {
      const material = ring.material as THREE.ShaderMaterial;
      material.uniforms.color.value = new THREE.Color(this.config.color);
    });
  }
}