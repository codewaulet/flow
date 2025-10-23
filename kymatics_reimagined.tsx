import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';

const KYMATICS = () => {
  const containerRef = useRef(null);
  const [resonance, setResonance] = useState(0);
  const [harmony, setHarmony] = useState(0);
  const [pulseCount, setPulseCount] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const [combo, setCombo] = useState(0);
  const [lastPulseTime, setLastPulseTime] = useState(0);
  
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    centerCore: null,
    fluidRings: [],
    particles: [],
    waves: [],
    connections: [],
    time: 0,
    resonanceLevel: 0,
    harmonyLevel: 0,
    audioSynths: [],
    ambientDrone: null,
    reverb: null,
    mouseX: 0,
    mouseY: 0,
    targetCameraZ: 50,
    pulses: [],
    comboMultiplier: 1
  });

  // Audio initialization
  const initAudio = async () => {
    if (audioReady) return;
    
    try {
      await Tone.start();
      const game = gameRef.current;
      
      const reverb = new Tone.Reverb({
        decay: 10,
        wet: 0.6
      }).toDestination();
      await reverb.generate();
      game.reverb = reverb;
      
      // Deep ambient drone
      const drone = new Tone.FMSynth({
        harmonicity: 1.5,
        modulationIndex: 2.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 5, decay: 0, sustain: 1, release: 5 }
      }).connect(reverb);
      drone.volume.value = -26;
      drone.triggerAttack('C1');
      game.ambientDrone = drone;
      
      // Harmonic synths
      for (let i = 0; i < 8; i++) {
        const synth = new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.8, decay: 1.2, sustain: 0.5, release: 3 }
        }).connect(reverb);
        synth.volume.value = -30;
        game.audioSynths.push(synth);
      }
      
      setAudioReady(true);
    } catch (err) {
      console.error('Audio init failed:', err);
    }
  };

  // Three.js setup
  useEffect(() => {
    if (!containerRef.current) return;
    
    const game = gameRef.current;
    
    // Scene
    game.scene = new THREE.Scene();
    game.scene.fog = new THREE.FogExp2(0x050510, 0.01);
    
    // Camera
    game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    game.camera.position.z = 50;
    game.camera.position.y = 8;
    
    // Renderer
    game.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    game.renderer.setClearColor(0x050510, 1);
    containerRef.current.appendChild(game.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.4);
    game.scene.add(ambientLight);
    
    const centerLight = new THREE.PointLight(0xff9955, 3, 100);
    centerLight.position.set(0, 0, 0);
    game.scene.add(centerLight);
    
    const rimLight1 = new THREE.PointLight(0x5599ff, 2, 120);
    rimLight1.position.set(40, 30, -30);
    game.scene.add(rimLight1);
    
    const rimLight2 = new THREE.PointLight(0xff5599, 1.5, 100);
    rimLight2.position.set(-40, -20, -30);
    game.scene.add(rimLight2);
    
    // Center Core - fluid crystal
    const coreGroup = new THREE.Group();
    game.centerCore = coreGroup;
    game.scene.add(coreGroup);
    
    // Inner crystalline core
    const innerGeom = new THREE.OctahedronGeometry(2.5, 2);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffaa66,
      emissive: 0xff7733,
      emissiveIntensity: 1.2,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });
    const innerCore = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerCore);
    coreGroup.userData.innerCore = innerCore;
    
    // Fluid rotating rings
    for (let i = 0; i < 5; i++) {
      const radius = 4 + i * 1.8;
      const thickness = 0.12 - i * 0.015;
      
      const ringGeom = new THREE.TorusGeometry(radius, thickness, 16, 100);
      const hue = 0.05 + i * 0.12;
      const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(hue, 0.8, 0.6),
        emissive: new THREE.Color().setHSL(hue, 0.9, 0.4),
        emissiveIntensity: 0.5,
        metalness: 0.6,
        roughness: 0.3,
        transparent: true,
        opacity: 0.7 - i * 0.1
      });
      
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
      ring.rotation.y = Math.random() * Math.PI;
      
      ring.userData = {
        baseRotationSpeed: (i % 2 === 0 ? 1 : -1) * (0.3 + i * 0.1),
        tiltPhase: Math.random() * Math.PI * 2,
        tiltSpeed: 0.2 + Math.random() * 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
        originalRadius: radius,
        index: i
      };
      
      coreGroup.add(ring);
      game.fluidRings.push(ring);
    }
    
    // Particle system - energy field
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 18 + Math.random() * 30;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      const colorType = Math.random();
      if (colorType < 0.3) {
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.2;
      } else if (colorType < 0.6) {
        colors[i * 3] = 0.3 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
      } else {
        colors[i * 3] = 0.95 + Math.random() * 0.05;
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.2;
      }
      
      sizes[i] = 0.5 + Math.random() * 1.5;
      
      game.particles.push({
        originalPos: new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        ),
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
        orbitSpeed: (Math.random() - 0.5) * 0.2,
        amplitude: 0.5 + Math.random() * 1.5
      });
    }
    
    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          float dist = length(position);
          float pulse = sin(time * 3.0 + dist * 0.15) * 0.4 + 0.6;
          
          gl_PointSize = size * pulse * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          vAlpha = smoothstep(50.0, 12.0, dist) * 0.85;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float intensity = smoothstep(0.5, 0.0, dist);
          float glow = pow(intensity, 0.4);
          
          vec3 finalColor = vColor * (0.8 + glow * 0.7);
          float alpha = intensity * vAlpha;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    game.scene.add(particleSystem);
    game.particleSystem = particleSystem;
    
    // Animation loop
    let lastTime = Date.now();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const now = Date.now();
      const delta = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      game.time += delta;
      
      // Inner core - smooth rotation and subtle pulsing
      const innerCore = game.centerCore.userData.innerCore;
      if (innerCore) {
        innerCore.rotation.y += delta * 0.4;
        innerCore.rotation.x += delta * 0.15;
        
        const corePulse = 1 + Math.sin(game.time * 2) * 0.06 + Math.sin(game.time * 3.2) * 0.04;
        innerCore.scale.setScalar(corePulse * (1 + game.resonanceLevel * 0.15));
        
        innerCore.material.emissiveIntensity = 1.2 + Math.sin(game.time * 1.5) * 0.3 + game.resonanceLevel * 0.5;
      }
      
      // Fluid rings - complex organic motion
      game.fluidRings.forEach((ring, idx) => {
        const userData = ring.userData;
        
        // Dynamic rotation
        ring.rotation.z += delta * userData.baseRotationSpeed * (1 + game.resonanceLevel * 0.5);
        
        // Fluid tilting
        userData.tiltPhase += delta * userData.tiltSpeed;
        const tiltX = Math.sin(userData.tiltPhase) * 0.6;
        const tiltY = Math.cos(userData.tiltPhase * 0.7) * 0.4;
        ring.rotation.x = Math.PI / 2 + tiltX;
        ring.rotation.y = tiltY;
        
        // Pulsing scale
        userData.pulsePhase += delta * (1.2 + idx * 0.2);
        const pulse = Math.sin(userData.pulsePhase) * 0.12 + 0.88;
        const resonancePulse = 1 + game.resonanceLevel * 0.2;
        ring.scale.setScalar(pulse * resonancePulse);
        
        // Opacity and emission based on harmony
        const baseOpacity = 0.7 - idx * 0.1;
        ring.material.opacity = baseOpacity + game.harmonyLevel * 0.3;
        ring.material.emissiveIntensity = 0.5 + game.harmonyLevel * 0.6 + Math.sin(game.time * 2 + idx) * 0.2;
      });
      
      // Main core group subtle motion
      game.centerCore.rotation.y += delta * 0.05;
      game.centerCore.position.y = Math.sin(game.time * 0.5) * 0.5;
      
      // Particles - organic flow
      const positions = game.particleSystem.geometry.attributes.position.array;
      const colors = game.particleSystem.geometry.attributes.color.array;
      
      game.particles.forEach((p, i) => {
        p.phase += delta * p.speed;
        
        const noiseX = Math.sin(p.phase * 2 + game.time * 0.5) * p.amplitude;
        const noiseY = Math.cos(p.phase * 1.5 + game.time * 0.6) * p.amplitude;
        const noiseZ = Math.sin(p.phase * 2.5 + game.time * 0.4) * p.amplitude;
        
        p.velocity.x += (Math.random() - 0.5) * 0.015;
        p.velocity.y += (Math.random() - 0.5) * 0.015;
        p.velocity.z += (Math.random() - 0.5) * 0.015;
        
        p.velocity.multiplyScalar(0.97);
        
        const px = positions[i * 3];
        const py = positions[i * 3 + 1];
        const pz = positions[i * 3 + 2];
        
        positions[i * 3] += p.velocity.x + noiseX * delta;
        positions[i * 3 + 1] += p.velocity.y + noiseY * delta;
        positions[i * 3 + 2] += p.velocity.z + noiseZ * delta;
        
        // Orbital attraction
        const toCenter = new THREE.Vector3(-px, -py, -pz);
        const dist = toCenter.length();
        toCenter.normalize().multiplyScalar(0.01 * (1 + game.resonanceLevel * 0.5));
        
        positions[i * 3] += toCenter.x;
        positions[i * 3 + 1] += toCenter.y;
        positions[i * 3 + 2] += toCenter.z;
        
        // Keep in bounds
        if (dist > 48) {
          positions[i * 3] *= 0.95;
          positions[i * 3 + 1] *= 0.95;
          positions[i * 3 + 2] *= 0.95;
        }
        
        // Color shifts with harmony
        if (game.harmonyLevel > 0.3) {
          const targetR = 0.5;
          const targetG = 0.7;
          const targetB = 1.0;
          colors[i * 3] = THREE.MathUtils.lerp(colors[i * 3], targetR, delta * game.harmonyLevel * 0.3);
          colors[i * 3 + 1] = THREE.MathUtils.lerp(colors[i * 3 + 1], targetG, delta * game.harmonyLevel * 0.3);
          colors[i * 3 + 2] = THREE.MathUtils.lerp(colors[i * 3 + 2], targetB, delta * game.harmonyLevel * 0.3);
        }
      });
      
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      game.particleSystem.material.uniforms.time.value = game.time;
      
      // Waves
      game.waves.forEach((wave, idx) => {
        wave.scale.x += delta * 4;
        wave.scale.y += delta * 4;
        wave.scale.z += delta * 4;
        wave.material.opacity -= delta * 0.6;
        wave.rotation.z += delta * 0.5;
        
        if (wave.material.opacity <= 0) {
          game.scene.remove(wave);
          game.waves.splice(idx, 1);
        }
      });
      
      // Connections
      game.connections.forEach((conn, idx) => {
        conn.material.opacity -= delta * 0.4;
        
        if (conn.material.opacity <= 0) {
          game.scene.remove(conn);
          game.connections.splice(idx, 1);
        }
      });
      
      // Camera smooth follow
      game.camera.position.x += (game.mouseX * 4 - game.camera.position.x) * delta * 1.2;
      game.camera.position.y += (8 + game.mouseY * 3 - game.camera.position.y) * delta * 1.2;
      game.camera.position.z += (game.targetCameraZ - game.camera.position.z) * delta * 2;
      game.camera.lookAt(0, 0, 0);
      
      // Decay resonance and harmony
      game.resonanceLevel *= 0.995;
      game.harmonyLevel *= 0.992;
      setResonance(game.resonanceLevel * 100);
      setHarmony(game.harmonyLevel * 100);
      
      game.renderer.render(game.scene, game.camera);
    };
    
    animate();
    
    // Mouse movement
    const handleMouseMove = (e) => {
      game.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      game.mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Resize
    const handleResize = () => {
      game.camera.aspect = window.innerWidth / window.innerHeight;
      game.camera.updateProjectionMatrix();
      game.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (game.renderer && containerRef.current) {
        containerRef.current.removeChild(game.renderer.domElement);
        game.renderer.dispose();
      }
    };
  }, []);

  // Create pulse
  const createPulse = async () => {
    if (!audioReady) await initAudio();
    
    setShowIntro(false);
    const game = gameRef.current;
    const now = Date.now();
    
    // Combo system
    const timeSinceLastPulse = now - lastPulseTime;
    if (timeSinceLastPulse < 1000) {
      setCombo(prev => prev + 1);
      game.comboMultiplier = Math.min(1 + combo * 0.15, 3);
    } else {
      setCombo(1);
      game.comboMultiplier = 1;
    }
    setLastPulseTime(now);
    
    setPulseCount(prev => prev + 1);
    
    // Increase resonance and harmony
    const pulseStrength = 0.15 * game.comboMultiplier;
    game.resonanceLevel = Math.min(game.resonanceLevel + pulseStrength, 1);
    game.harmonyLevel = Math.min(game.harmonyLevel + pulseStrength * 0.8, 1);
    
    // Visual waves
    const waveCount = Math.floor(2 + combo * 0.5);
    for (let i = 0; i < waveCount; i++) {
      setTimeout(() => {
        const ringGeom = new THREE.TorusGeometry(3 + i * 2, 0.2, 16, 64);
        const hue = 0.05 + i * 0.1 + combo * 0.05;
        const ringMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(hue, 0.9, 0.6),
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        
        game.scene.add(ring);
        game.waves.push(ring);
        
        // Sphere wave
        if (i % 2 === 0) {
          const sphereGeom = new THREE.SphereGeometry(2 + i * 1.5, 32, 32);
          const sphereMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(hue + 0.15, 0.8, 0.5),
            transparent: true,
            opacity: 0.25,
            wireframe: true
          });
          const sphere = new THREE.Mesh(sphereGeom, sphereMat);
          
          game.scene.add(sphere);
          game.waves.push(sphere);
        }
      }, i * 100);
    }
    
    // Create connections
    if (combo > 3 && Math.random() > 0.5) {
      for (let i = 0; i < 5; i++) {
        const theta = (i / 5) * Math.PI * 2;
        const radius = 15 + Math.random() * 10;
        const target = new THREE.Vector3(
          Math.cos(theta) * radius,
          (Math.random() - 0.5) * 10,
          Math.sin(theta) * radius
        );
        
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          target
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(0.15 + combo * 0.05, 0.9, 0.6),
          transparent: true,
          opacity: 0.6
        });
        const line = new THREE.Line(lineGeom, lineMat);
        game.scene.add(line);
        game.connections.push(line);
      }
    }
    
    // Audio
    playPulseSound(game.resonanceLevel, combo);
    
    // Camera zoom
    game.targetCameraZ = 50 - combo * 2;
  };

  // Play pulse sound
  const playPulseSound = (intensity, comboLevel) => {
    const game = gameRef.current;
    
    const scales = [
      ['C3'],
      ['C3', 'E3'],
      ['C3', 'E3', 'G3'],
      ['C3', 'E3', 'G3', 'B3'],
      ['C3', 'E3', 'G3', 'B3', 'D4'],
      ['C3', 'E3', 'G3', 'B3', 'D4', 'F#4']
    ];
    
    const scaleIdx = Math.min(comboLevel - 1, scales.length - 1);
    const notes = scales[scaleIdx];
    
    notes.forEach((note, i) => {
      if (game.audioSynths[i]) {
        setTimeout(() => {
          game.audioSynths[i].triggerAttackRelease(note, '0.5n', Tone.now(), intensity * 0.8);
        }, i * 60);
      }
    });
  };

  // Keyboard and touch
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        createPulse();
      }
    };
    
    const handleClick = () => {
      createPulse();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [audioReady, combo, lastPulseTime]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#050510] via-[#0a0820] to-[#050510]">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Title */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
          <div 
            className="text-8xl font-thin tracking-[0.7em] mb-2"
            style={{ 
              background: 'linear-gradient(180deg, rgba(255,170,102,0.9) 0%, rgba(85,153,255,0.5) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Georgia, serif',
              filter: 'drop-shadow(0 0 30px rgba(255,170,102,0.3))'
            }}
          >
            KYMATICS
          </div>
          <div className="text-xs tracking-[0.6em] text-orange-200/30">
            RESONANCE PULSE MEDITATION
          </div>
        </div>
        
        {/* Stats */}
        <div className="absolute top-8 right-8 text-right space-y-6">
          {combo > 1 && (
            <div className="mb-4">
              <div className="text-5xl font-light text-cyan-300/80 animate-pulse">
                ×{combo}
              </div>
              <div className="text-[9px] tracking-widest text-cyan-300/40">
                COMBO
              </div>
            </div>
          )}
          
          <div>
            <div className="text-3xl font-light text-orange-300/70">
              {pulseCount}
            </div>
            <div className="text-[9px] tracking-widest text-orange-300/30">
              PULSES
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-light text-blue-300/60">
              {Math.floor(resonance)}%
            </div>
            <div className="text-[9px] tracking-widest text-blue-300/25">
              RESONANCE
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-light text-purple-300/60">
              {Math.floor(harmony)}%
            </div>
            <div className="text-[9px] tracking-widest text-purple-300/25">
              HARMONY
            </div>
          </div>
        </div>
        
        {/* Intro */}
        {showIntro && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/30 backdrop-blur-sm">
            <div className="max-w-2xl px-8 text-center space-y-8">
              <div className="space-y-4 text-orange-100/50 text-sm leading-relaxed">
                <p className="text-lg font-light">
                  Создавайте резонансные импульсы
                </p>
                <p>
                  Каждый клик или нажатие пробела отправляет волну энергии в центр
                </p>
                <p>
                  Быстрые последовательные импульсы создают резонансное комбо
                </p>
                <p>
                  Чем выше комбо, тем мощнее гармонические эффекты
                </p>
              </div>
              
              <button
                onClick={createPulse}
                className="group relative px-14 py-5 border border-orange-200/20 rounded-sm
                         hover:border-orange-200/60 transition-all duration-500 backdrop-blur-md"
              >
                <div className="text-orange-100/70 tracking-[0.35em] text-sm group-hover:text-orange-100/95 transition-colors">
                  НАЧАТЬ ПУЛЬСАЦИЮ
                </div>
                <div className="text-[10px] text-orange-100/30 mt-2 tracking-widest">
                  КЛИК ИЛИ ПРОБЕЛ
                </div>
              </button>
              
              <div className="text-xs text-blue-300/30 space-y-2 mt-8">
                <p>→ Ритмичные импульсы создают комбо-множитель</p>
                <p>→ Высокие комбо усиливают визуальные и звуковые эффекты</p>
                <p>→ Найдите свой ритм между хаосом и гармонией</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Combo notification */}
        {combo > 5 && combo % 5 === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center
                        animate-pulse pointer-events-none">
            <div className="text-4xl tracking-wider text-cyan-300/80 mb-2"
                 style={{ fontFamily: 'Georgia, serif' }}>
              Резонансный поток
            </div>
            <div className="text-sm text-cyan-300/50 tracking-widest">
              ×{combo} КОМБО АКТИВНО
            </div>
          </div>
        )}
        
        {/* Resonance bars */}
        {!showIntro && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[500px] space-y-4">
            {/* Resonance */}
            <div>
              <div className="flex items-center justify-between mb-2 text-[9px] tracking-widest">
                <span className="text-orange-200/30">РЕЗОНАНС</span>
                <span className="text-orange-300/60">{Math.floor(resonance)}%</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${resonance}%`,
                    background: 'linear-gradient(90deg, rgba(255,170,102,0.5), rgba(255,140,60,0.9))',
                    boxShadow: `0 0 20px rgba(255,140,60,${resonance / 200})`
                  }}
                />
              </div>
            </div>
            
            {/* Harmony */}
            <div>
              <div className="flex items-center justify-between mb-2 text-[9px] tracking-widest">
                <span className="text-blue-200/30">ГАРМОНИЯ</span>
                <span className="text-blue-300/60">{Math.floor(harmony)}%</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${harmony}%`,
                    background: 'linear-gradient(90deg, rgba(85,153,255,0.5), rgba(102,204,255,0.9))',
                    boxShadow: `0 0 20px rgba(102,204,255,${harmony / 200})`
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Hint */}
        {!showIntro && pulseCount < 3 && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center
                        text-orange-100/30 text-sm animate-pulse">
            Кликайте или нажимайте пробел для создания импульсов
          </div>
        )}
        
        {/* Combo hint */}
        {!showIntro && pulseCount >= 3 && pulseCount < 8 && combo < 3 && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center
                        text-cyan-100/40 text-sm animate-pulse">
            Попробуйте создать ритмичную последовательность для комбо
          </div>
        )}
      </div>
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,5,16,0.5) 70%, rgba(5,5,16,0.9) 100%)'
           }} />
      
      {/* Ambient glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255,140,60,${resonance / 1000}) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(85,153,255,${harmony / 1000}) 0%, transparent 40%)
          `,
          opacity: Math.max(resonance, harmony) / 100
        }} 
      />
      
      {/* Grid overlay for depth */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
           style={{
             backgroundImage: `
               linear-gradient(rgba(255,170,102,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(85,153,255,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px',
             transform: 'perspective(500px) rotateX(60deg)',
             transformOrigin: 'center bottom'
           }} />
    </div>
  );
};

export default KYMATICS;