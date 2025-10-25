/**
 * Vortex Shader - Creates spiral vortex animation with flowing motion
 * Features: Spiral distortion, color gradients, time-based animation
 */

export const VortexShader = {
  vertexShader: `
    uniform float time;
    uniform float intensity;
    uniform float spiralSpeed;
    uniform float radius;
    
    varying vec3 vPosition;
    varying vec2 vUv;
    varying float vDistance;
    varying float vSpiralPhase;
    varying float vFlowPhase;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      // Calculate distance from center
      vec2 center = vec2(0.0, 0.0);
      vDistance = length(position.xy - center);
      
      // Spiral phase based on angle and time
      float angle = atan(position.y, position.x);
      vSpiralPhase = angle + time * spiralSpeed;
      vFlowPhase = time * 2.0 + vDistance * 0.3;
      
      // Create smooth spiral distortion
      float spiralRadius = radius * (1.0 - vDistance / 15.0);
      float spiralOffset = sin(vSpiralPhase * 2.0) * intensity * 0.3;
      
      // Apply spiral distortion to position
      vec3 distortedPosition = position;
      distortedPosition.xy += normalize(position.xy) * spiralOffset;
      
      // Add flowing motion with smooth waves
      float flowPhase = vFlowPhase;
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
    uniform vec3 outerColor;
    uniform vec3 innerColor;
    uniform float opacity;
    
    varying vec3 vPosition;
    varying vec2 vUv;
    varying float vDistance;
    varying float vSpiralPhase;
    varying float vFlowPhase;
    
    void main() {
      // Distance-based color interpolation (realistic temperature gradient)
      float normalizedDistance = clamp(vDistance / 15.0, 0.0, 1.0);
      
      // Create smooth spiral color variation
      float spiralColor = sin(vSpiralPhase * 1.5) * 0.2 + 0.8;
      
      // Interpolate between outer and inner colors (hotter toward center)
      vec3 baseColor = mix(innerColor, outerColor, normalizedDistance);
      
      // Add spiral variation
      baseColor *= spiralColor;
      
      // Add time-based pulsing (like real accretion)
      float pulse = sin(time * 2.0 + vDistance * 0.3) * 0.15 + 0.85;
      baseColor *= pulse;
      
      // Distance-based opacity with realistic falloff
      float distanceOpacity = 1.0 - smoothstep(0.0, 15.0, vDistance);
      
      // Add inner glow effect (hotter material)
      float innerGlow = 1.0 - smoothstep(0.0, 2.0, vDistance);
      baseColor += innerGlow * innerColor * 0.3;
      
      // Add relativistic effects near center
      float relativisticEffect = 1.0 - smoothstep(0.0, 1.0, vDistance);
      baseColor += relativisticEffect * vec3(1.0, 0.8, 0.4) * 0.2;
      
      gl_FragColor = vec4(baseColor, opacity * distanceOpacity);
    }
  `,
  
  uniforms: {
    time: { value: 0.0 },
    intensity: { value: 1.0 },
    spiralSpeed: { value: 1.0 },
    radius: { value: 8.0 },
    outerColor: { value: { r: 0.1, g: 0.3, b: 0.8 } },
    innerColor: { value: { r: 1.0, g: 0.7, b: 0.3 } },
    opacity: { value: 0.9 }
  }
};
