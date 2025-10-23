/*
 * FlowExperience.tsx
 *
 * Концепция: Чистое Погружение (Pure Immersion)
 *
 * Убраны:
 * - Вся игровая механика (комбо, очки, клики)
 * - Весь текстовый UI (статистика, бары, заголовки)
 * - Резкие звуки (заменены на живой, модулируемый дрон)
 * - Взрывные визуальные эффекты (заменены на плавную, пассивную эволюцию)
 *
 * Добавлено:
 * - Взаимодействие "один тап для старта"
 * - Звуковой движок, нацеленный на Тета-волны (6 Гц)
 * - Пассивный "уровень потока", который медленно нарастает со временем
 * - Вся анимация привязана к плавному времени и уровню потока
 */
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';

// Тактильный модуль (для мобильных устройств)
// import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const FlowExperience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [audioReady, setAudioReady] = useState(false);

  // useRef для хранения всего, что не должно вызывать ре-рендер
  const gameRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    centerCore: null as THREE.Group | null,
    fluidRings: [] as THREE.Mesh[],
    particles: [] as any[],
    particleSystem: null as THREE.Points | null,
    time: 0,
    flowLevel: 0, // Уровень потока (0 до 1), нарастает пассивно
    isFlowing: false, // Флаг, что сессия началась
    // Audio
    ambientDrone: null as Tone.FMSynth | null,
    reverb: null as Tone.Reverb | null,
    flowLFO: null as Tone.LFO | null, // LFO для "оживления" дрона
    thetaPulse: null as Tone.LFO | null, // LFO для Тета-ритма (6 Гц)
    // Mouse
    mouseX: 0,
    mouseY: 0,
  });

  // 1. Инициализация аудио (ключевое изменение)
  const initAudio = async () => {
    if (audioReady) return;
    try {
      await Tone.start();
      const game = gameRef.current;

      // 1. Реверберация для объема
      const reverb = new Tone.Reverb({
        decay: 15,
        wet: 0.7,
      }).toDestination();
      await reverb.generate();
      game.reverb = reverb;

      // 2. Пульсация (Изохронный тон)
      // Создаем LFO (Low-Frequency Oscillator) на 6 Гц (Тета-диапазон)
      // Он будет модулировать громкость дрона от -20dB до 0dB
      const thetaPulse = new Tone.LFO('6hz', -20, 0).start();
      game.thetaPulse = thetaPulse;

      // 3. Основной Дрон (Якорь)
      const drone = new Tone.FMSynth({
        harmonicity: 1.2,
        modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 10, decay: 0, sustain: 1, release: 10 },
      }).connect(reverb);
      drone.volume.value = -25; // Тихий базовый уровень
      
      // Подключаем LFO к громкости дрона
      // Это создает ритмичную пульсацию 6 раз в секунду
      game.thetaPulse.connect(drone.volume);
      
      drone.triggerAttack('C1'); // Очень низкая, басовая нота
      game.ambientDrone = drone;

      // 4. "Живой" LFO
      // Этот LFO очень медленно меняет "окраску" (detune) дрона
      // чтобы звук не был монотонным, а "дышал"
      const flowLFO = new Tone.LFO('0.05hz', -15, 15).connect(drone.detune);
      flowLFO.start();
      game.flowLFO = flowLFO;
      
      // 5. Тактильная обратная связь (если это React Native)
      // const hapticOptions = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };
      // const pattern = Array(60).fill([true, 16.66]).flat(); // ~6Hz pattern
      // ReactNativeHapticFeedback.trigger("impactHeavy", hapticOptions); // (Нужна более сложная логика для цикла)

      setAudioReady(true);
    } catch (err) {
      console.error('Audio init failed:', err);
    }
  };

  // 2. Функция старта (вместо createPulse)
  const startExperience = async () => {
    const game = gameRef.current;
    if (game.isFlowing) return; // Защита от повторных нажатий

    game.isFlowing = true;
    setShowIntro(false);
    await initAudio();
  };

  // 3. Настройка Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const game = gameRef.current;
    
    // --- (Весь код настройки сцены, камеры, рендерера и света остается таким же, как у вас) ---
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
    
    // Lighting (без изменений)
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

    // Center Core (без изменений в геометрии)
    const coreGroup = new THREE.Group();
    game.centerCore = coreGroup;
    game.scene.add(coreGroup);
    
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
    
    // Fluid rotating rings (без изменений в геометрии)
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
    
    // Particle system (без изменений в геометрии)
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // (Логика заполнения particles и positions/colors/sizes - без изменений)
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
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3),
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
    
    // (Шейдеры частиц - без изменений)
    const particleMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float size; attribute vec3 color; varying vec3 vColor;
        varying float vAlpha; uniform float time;
        void main() {
          vColor = color; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = length(position);
          float pulse = sin(time * 3.0 + dist * 0.15) * 0.4 + 0.6;
          gl_PointSize = size * pulse * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vAlpha = smoothstep(50.0, 12.0, dist) * 0.85;
        }
      `,
      fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5); float dist = length(center);
          if (dist > 0.5) discard;
          float intensity = smoothstep(0.5, 0.0, dist); float glow = pow(intensity, 0.4);
          vec3 finalColor = vColor * (0.8 + glow * 0.7); float alpha = intensity * vAlpha;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    
    game.particleSystem = new THREE.Points(particleGeom, particleMat);
    game.scene.add(game.particleSystem);
    
    // 4. Главный цикл анимации (ключевое изменение)
    let lastTime = Date.now();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const now = Date.now();
      const delta = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      game.time += delta;

      // Если сессия идет, пассивно увеличиваем "уровень потока"
      // (очень медленно, ~166 секунд до максимума)
      if (game.isFlowing) {
        game.flowLevel = Math.min(game.flowLevel + delta * 0.006, 1);
      }

      // Внутреннее ядро
      const innerCore = game.centerCore?.userData.innerCore;
      if (innerCore) {
        innerCore.rotation.y += delta * 0.4;
        innerCore.rotation.x += delta * 0.15;
        
        // Пульсация привязана к плавному времени и уровню потока
        const corePulse = 1 + Math.sin(game.time * 2) * 0.06 + Math.sin(game.time * 3.2) * 0.04;
        innerCore.scale.setScalar(corePulse * (1 + game.flowLevel * 0.15));
        innerCore.material.emissiveIntensity = 1.2 + Math.sin(game.time * 1.5) * 0.3 + game.flowLevel * 0.5;
      }

      // Кольца
      game.fluidRings.forEach((ring, idx) => {
        const userData = ring.userData;
        ring.rotation.z += delta * userData.baseRotationSpeed * (1 + game.flowLevel * 0.5);
        
        userData.tiltPhase += delta * userData.tiltSpeed;
        const tiltX = Math.sin(userData.tiltPhase) * 0.6;
        const tiltY = Math.cos(userData.tiltPhase * 0.7) * 0.4;
        ring.rotation.x = Math.PI / 2 + tiltX;
        ring.rotation.y = tiltY;
        
        userData.pulsePhase += delta * (1.2 + idx * 0.2);
        const pulse = Math.sin(userData.pulsePhase) * 0.12 + 0.88;
        const flowPulse = 1 + game.flowLevel * 0.2;
        ring.scale.setScalar(pulse * flowPulse);
        
        // Прозрачность и э
        const baseOpacity = 0.7 - idx * 0.1;
        ring.material.opacity = baseOpacity + game.flowLevel * 0.3;
        ring.material.emissiveIntensity = 0.5 + game.flowLevel * 0.6 + Math.sin(game.time * 2 + idx) * 0.2;
      });

      // Вращение всей группы ядра
      game.centerCore!.rotation.y += delta * 0.05;
      game.centerCore!.position.y = Math.sin(game.time * 0.5) * 0.5;

      // Частицы
      const positions = game.particleSystem!.geometry.attributes.position.array as Float32Array;
      const colors = game.particleSystem!.geometry.attributes.color.array as Float32Array;
      
      game.particles.forEach((p, i) => {
        // (Логика шума и движения частиц - без изменений)
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
        
        // Притяжение к центру (мягче)
        const toCenter = new THREE.Vector3(-px, -py, -pz);
        const dist = toCenter.length();
        toCenter.normalize().multiplyScalar(0.01 * (1 + game.flowLevel * 0.5)); // Привязано к flowLevel
        positions[i * 3] += toCenter.x;
        positions[i * 3 + 1] += toCenter.y;
        positions[i * 3 + 2] += toCenter.z;
        
        if (dist > 48) {
          positions[i * 3] *= 0.95;
          positions[i * 3 + 1] *= 0.95;
          positions[i * 3 + 2] *= 0.95;
        }
        
        // Сдвиг цвета привязан к flowLevel, а не harmonyLevel
        if (game.flowLevel > 0.3) {
          const targetR = 0.5, targetG = 0.7, targetB = 1.0;
          const lerpFactor = delta * game.flowLevel * 0.3;
          colors[i * 3] = THREE.MathUtils.lerp(colors[i * 3], targetR, lerpFactor);
          colors[i * 3 + 1] = THREE.MathUtils.lerp(colors[i * 3 + 1], targetG, lerpFactor);
          colors[i * 3 + 2] = THREE.MathUtils.lerp(colors[i * 3 + 2], targetB, lerpFactor);
        }
      });
      
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      (game.particleSystem!.material as THREE.ShaderMaterial).uniforms.time.value = game.time;
      
      // !! УБРАНЫ ВСПЫШКИ (waves) И ЛИНИИ (connections) !!
      // Они создавались в createPulse и были слишком резкими.

      // Камера
      // Чуть менее резкое следование за мышью
      game.camera!.position.x += (game.mouseX * 2 - game.camera!.position.x) * delta * 1.0;
      game.camera!.position.y += (8 + game.mouseY * 2 - game.camera!.position.y) * delta * 1.0;
      // !! УБРАН ЗУМ КАМЕРЫ !!
      game.camera!.lookAt(0, 0, 0);
      
      // !! УБРАНО ЗАТУХАНИЕ resonance/harmony !!
      
      game.renderer!.render(game.scene!, game.camera!);
    };
    
    animate();

    // 5. Обработчики событий
    const handleMouseMove = (e: MouseEvent) => {
      game.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      game.mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      game.camera!.aspect = window.innerWidth / window.innerHeight;
      game.camera!.updateProjectionMatrix();
      game.renderer!.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Только эти обработчики нужны для старта
    const handleStart = (e: Event) => {
      e.preventDefault();
      startExperience();
    };
    window.addEventListener('keydown', handleStart);
    window.addEventListener('click', handleStart);
    window.addEventListener('touchstart', handleStart);

    return () => {
      // Очистка
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleStart);
      window.removeEventListener('click', handleStart);
      window.removeEventListener('touchstart', handleStart);
      
      if (game.renderer && containerRef.current) {
        containerRef.current.removeChild(game.renderer.domElement);
        game.renderer.dispose();
      }
      // Остановка аудио
      game.ambientDrone?.dispose();
      game.reverb?.dispose();
      game.flowLFO?.dispose();
      game.thetaPulse?.dispose();
      Tone.context.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#050510] via-[#0a0820] to-[#050510]">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* !! ВЕСЬ UI (OVERLAY) УДАЛЕН !!
        - Нет заголовка
        - Нет статистики (комбо, очки, резонанс, гармония)
        - Нет баров прогресса
        - Нет подсказок
      */}
      
      {/* Intro Overlay (Минималистичный) */}
      {showIntro && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-auto 
                     bg-black/20 backdrop-blur-sm cursor-pointer"
          onClick={startExperience} // Позволяет кликнуть в любом месте
        >
          <div className="text-center space-y-4 animate-pulse">
            <div className="text-orange-100/70 tracking-[0.35em] text-sm">
              ВОЙТИ В ПОТОК
            </div>
            <div className="text-[10px] text-orange-100/30 tracking-widest">
              НАЖМИТЕ, ЧТОБЫ НАЧАТЬ ПОГРУЖЕНИЕ
            </div>
          </div>
        </div>
      )}
      
      {/* Эффекты (Виньетка, свечение, сетка) - можно оставить для атмосферы */}
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5,5,16,0.5) 70%, rgba(5,5,16,0.9) 100%)'
           }} />
      
      {/* Ambient glow - теперь привязан к flowLevel */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-[3000ms]"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255,140,60,${gameRef.current.flowLevel / 10}) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(85,153,255,${gameRef.current.flowLevel / 10}) 0%, transparent 40%)
          `,
          opacity: gameRef.current.flowLevel
        }} 
      />
      
      {/* Grid overlay (можно убрать, если хотите *абсолютный* минимализм) */}
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

export default FlowExperience;