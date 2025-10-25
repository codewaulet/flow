/**
 * Accretion Disk Shader - Rotating disk with heat effects and UV animation
 * Features: UV rotation, heat map colors, glow effects, flowing motion
 */

export const AccretionDiskShader = {
  vertexShader: `
    uniform float time;
    uniform float rotationSpeed;
    uniform float intensity;
    
    varying vec2 vUv;
    varying float vRadius;
    varying float vAngle;
    varying float vDistance;
    
    void main() {
      vUv = uv;
      
      // Calculate radius and angle for heat mapping
      vec2 center = vec2(0.5, 0.5);
      vRadius = length(uv - center);
      vAngle = atan(uv.y - center.y, uv.x - center.x);
      vDistance = length(position.xy);
      
      // Add subtle height variation for 3D effect
      vec3 pos = position;
      float heightVariation = sin(vAngle * 6.0 + time * rotationSpeed) * intensity * 0.05;
      pos.z += heightVariation;
      
      // Add gravitational warping
      float warpFactor = 1.0 / (1.0 + vDistance * 0.05);
      pos.xy *= warpFactor;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  
  fragmentShader: `
    uniform float time;
    uniform float rotationSpeed;
    uniform float intensity;
    uniform float innerRadius;
    uniform float outerRadius;
    uniform vec3 hotColor;
    uniform vec3 coolColor;
    uniform float opacity;
    
    varying vec2 vUv;
    varying float vRadius;
    varying float vAngle;
    varying float vDistance;
    
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
      vec3 baseColor = mix(hotColor, coolColor, normalizedDistance);
      
      // Add spiral pattern (like real accretion disk)
      float spiralPattern = sin(vAngle * 8.0 + time * rotationSpeed * 1.5) * 0.2 + 0.8;
      baseColor *= spiralPattern;
      
      // Add flowing motion effect
      float flowEffect = sin(distance * 15.0 - time * rotationSpeed * 2.0) * 0.15 + 0.85;
      baseColor *= flowEffect;
      
      // Add inner glow (hotter material)
      float innerGlow = 1.0 - smoothstep(0.0, innerRadius * 0.3, distance);
      baseColor += innerGlow * hotColor * 0.4;
      
      // Add outer edge glow
      float outerGlow = smoothstep(outerRadius * 0.85, outerRadius, distance);
      baseColor += outerGlow * coolColor * 0.2;
      
      // Add relativistic effects near center
      float relativisticEffect = 1.0 - smoothstep(0.0, innerRadius * 0.5, distance);
      baseColor += relativisticEffect * vec3(1.0, 0.9, 0.6) * 0.3;
      
      // Distance-based opacity with realistic falloff
      float distanceOpacity = 1.0 - smoothstep(outerRadius * 0.9, outerRadius, distance);
      
      // Add time-based pulsing (accretion variability)
      float pulse = sin(time * 1.5) * 0.1 + 0.9;
      
      gl_FragColor = vec4(baseColor, opacity * distanceOpacity * pulse);
    }
  `,
  
  uniforms: {
    time: { value: 0.0 },
    rotationSpeed: { value: 1.0 },
    intensity: { value: 1.0 },
    innerRadius: { value: 0.1 },
    outerRadius: { value: 0.8 },
    hotColor: { value: { r: 1.0, g: 0.5, b: 0.2 } },
    coolColor: { value: { r: 0.6, g: 0.2, b: 0.8 } },
    opacity: { value: 0.7 }
  }
};
