/**
 * Custom shader for beautiful circular particles
 */

export const CircleParticleShader = {
  vertexShader: `
    attribute float size;
    attribute vec3 customColor;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      vColor = customColor;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      
      // Calculate distance from center for fade effect
      float distance = length(position);
      vAlpha = 1.0 - smoothstep(0.0, 15.0, distance);
      
      // Ensure minimum visible size
      gl_PointSize = max(2.0, size * (300.0 / -mvPosition.z));
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Create circular particle
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      // Smooth circle with soft edges
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      
      // Add inner glow
      float innerGlow = 1.0 - smoothstep(0.0, 0.2, dist);
      
      // Combine colors with increased brightness
      vec3 finalColor = vColor + innerGlow * 0.5;
      
      gl_FragColor = vec4(finalColor, alpha * vAlpha);
    }
  `
};
