/*
 * FlowExperience.tsx
 *
 * Концепция: Neural Plasma Flow
 *
 * Визуал:
 * - Шейдерная плазма с метаболами и полями течения (Neural Plasma)
 * - Сине-голубая палитра для достижения состояния потока
 * - Органичные частицы вокруг центра
 * 
 * Аудио:
 * - Живой дрон с Тета-ритмом (6 Гц) для медитативного состояния
 * 
 * Взаимодействие:
 * - Один тап для старта, далее пассивное погружение
 */
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';

const FlowExperience = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [audioReady, setAudioReady] = useState(false);

  // useRef для хранения всего, что не должно вызывать ре-рендер
  const gameRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    particles: [] as any[],
    particleSystem: null as THREE.Points | null,
    time: 0,
    flowLevel: 0, // Уровень потока (0 до 1), нарастает пассивно
    isFlowing: false, // Флаг, что сессия началась
    flowIntensity: 0, // Интенсивность потока (с пульсацией)
    lastWaveTime: 0, // Время последнего гармонического тона
    // Audio
    ambientDrone: null as Tone.FMSynth | null,
    reverb: null as Tone.Reverb | null,
    flowLFO: null as Tone.LFO | null, // LFO для "оживления" дрона
    thetaPulse: null as Tone.LFO | null, // LFO для Тета-ритма (6 Гц)
    harmonicSynth: null as Tone.PolySynth | null, // Гармонические тона
    // Mouse
    mouseX: 0,
    mouseY: 0,
    // Camera drift
    cameraPhase: 0,
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
      
      // 5. Гармонические тона (проявляются при высоком flowLevel)
      const harmonicSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 2, decay: 2, sustain: 0.5, release: 4 }
      }).connect(reverb);
      harmonicSynth.volume.value = -40; // Очень тихо по умолчанию
      game.harmonicSynth = harmonicSynth;

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
    
    // Scene setup
    game.scene = new THREE.Scene();
    game.scene.fog = new THREE.FogExp2(0x020818, 0.01); // Темно-синий туман
    
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
    game.renderer.setClearColor(0x020818, 1); // Глубокий тёмно-синий фон
    containerRef.current.appendChild(game.renderer.domElement);
    
    // Lighting - обновлённая сине-голубая палитра
    const ambientLight = new THREE.AmbientLight(0x1a2a4e, 0.5);
    game.scene.add(ambientLight);
    
    const centerLight = new THREE.PointLight(0x00e5cc, 3, 100); // Бирюзовое ядро
    centerLight.position.set(0, 0, 0);
    game.scene.add(centerLight);
    
    const rimLight1 = new THREE.PointLight(0x1e88e5, 2.5, 120); // Синий
    rimLight1.position.set(40, 30, -30);
    game.scene.add(rimLight1);
    
    const rimLight2 = new THREE.PointLight(0x66ff99, 2, 100); // Мятно-зелёный
    rimLight2.position.set(-40, -20, -30);
    game.scene.add(rimLight2);

    // ===== ЦЕНТР УБРАН =====
    // Никаких объектов в центре - только частицы создают эффект
    // Фокус на танцующих частицах вокруг пустого центра
    
    // Particle system - УВЕЛИЧИВАЕМ количество для более плотного эффекта
    const particleCount = 1500; // Было 500, теперь 1500
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Распределяем частицы ближе к центру для создания "облака"
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Концентрируем частицы ближе к центру (5-25 вместо 18-48)
      const radius = 5 + Math.pow(Math.random(), 1.5) * 20;
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      const colorType = Math.random();
      if (colorType < 0.4) {
        // Голубые частицы
        colors[i * 3] = 0.1 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.4;
        colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorType < 0.7) {
        // Бирюзовые
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      } else {
        // Мятно-зелёные акценты
        colors[i * 3] = 0.2 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
      }
      sizes[i] = 0.3 + Math.random() * 1.2;
      
      // Данные для спиральной орбиты
      const orbitRadius = radius;
      const orbitHeight = (Math.random() - 0.5) * 10;
      
      game.particles.push({
        originalPos: new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]),
        velocity: new THREE.Vector3(0, 0, 0), // Будет вычисляться через орбиту
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25, // Медленнее для плавности
        orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.1 + Math.random() * 0.15), // Направление орбиты
        amplitude: 0.3 + Math.random() * 0.8, // Меньше для плавности
        orbitRadius: orbitRadius,
        orbitHeight: orbitHeight,
        spiralPhase: Math.random() * Math.PI * 2
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
        
        // Пульсация интенсивности в ритме Тета (6 Гц)
        const thetaPulse = Math.sin(game.time * Math.PI * 2 * 6); // 6 Гц
        game.flowIntensity = game.flowLevel * (0.85 + thetaPulse * 0.15);
        
        // Гармонические тона при углублении в поток (без волн-колец!)
        const harmonicInterval = 12 - game.flowLevel * 7; // От 12 до 5 секунд
        if (game.time - game.lastWaveTime > harmonicInterval) {
          game.lastWaveTime = game.time;
          
          if (game.flowLevel > 0.3 && game.harmonicSynth) {
            const notes = ['C4', 'E4', 'G4', 'B4', 'D5'];
            const note = notes[Math.floor(Math.random() * notes.length)];
            game.harmonicSynth.triggerAttackRelease(note, '2n', Tone.now(), 0.2);
            game.harmonicSynth.volume.value = -42 + game.flowLevel * 12;
          }
        }
      }

      // ===== ЦЕНТР - ТОЛЬКО ЧАСТИЦЫ =====
      // Вся магия в частицах, никаких объектов в центре

      // Частицы
      const positions = game.particleSystem!.geometry.attributes.position.array as Float32Array;
      const colors = game.particleSystem!.geometry.attributes.color.array as Float32Array;
      
      game.particles.forEach((p, i) => {
        // ПЛАВНОЕ СПИРАЛЬНОЕ ДВИЖЕНИЕ
        p.spiralPhase += delta * p.orbitSpeed * (1 + game.flowIntensity * 0.3);
        p.phase += delta * p.speed;
        
        // Спиральная орбита вокруг центра
        const currentRadius = p.orbitRadius * (1 + Math.sin(p.phase) * 0.15);
        const heightOscillation = p.orbitHeight + Math.sin(p.phase * 1.3) * 2;
        
        // Позиция на спирали
        const spiralX = Math.cos(p.spiralPhase) * currentRadius;
        const spiralZ = Math.sin(p.spiralPhase) * currentRadius;
        const spiralY = heightOscillation;
        
        // Мягкий шум для органичности (меньше амплитуда)
        const noiseX = Math.sin(p.phase * 2) * p.amplitude * 0.3;
        const noiseY = Math.cos(p.phase * 1.5) * p.amplitude * 0.3;
        const noiseZ = Math.sin(p.phase * 2.5) * p.amplitude * 0.3;
        
        // ПЛАВНАЯ интерполяция к целевой позиции (это убирает дёрганье!)
        const targetX = spiralX + noiseX;
        const targetY = spiralY + noiseY;
        const targetZ = spiralZ + noiseZ;
        
        const smoothing = 0.05; // Чем меньше, тем плавнее (0.01-0.1)
        positions[i * 3] += (targetX - positions[i * 3]) * smoothing;
        positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * smoothing;
        positions[i * 3 + 2] += (targetZ - positions[i * 3 + 2]) * smoothing;
        
        // Спиральное движение без дополнительных сил - чистота и плавность!
        
        // Сдвиг цвета привязан к flowLevel - усиливаем бирюзовый
        if (game.flowLevel > 0.3) {
          const targetR = 0.1;  // Меньше красного
          const targetG = 0.85; // Больше зелёного (бирюзовый)
          const targetB = 1.0;  // Максимум синего
          const lerpFactor = delta * game.flowLevel * 0.3;
          colors[i * 3] = THREE.MathUtils.lerp(colors[i * 3], targetR, lerpFactor);
          colors[i * 3 + 1] = THREE.MathUtils.lerp(colors[i * 3 + 1], targetG, lerpFactor);
          colors[i * 3 + 2] = THREE.MathUtils.lerp(colors[i * 3 + 2], targetB, lerpFactor);
        }
      });
      
      game.particleSystem!.geometry.attributes.position.needsUpdate = true;
      game.particleSystem!.geometry.attributes.color.needsUpdate = true;
      (game.particleSystem!.material as THREE.ShaderMaterial).uniforms.time.value = game.time;
      
      // ===== БЕЗ ВОЛН-КОЛЕЦ =====
      // Фокус только на частицах

      // Камера с плавным дрейфом
      game.cameraPhase += delta * 0.2;
      
      // Органичный дрейф камеры (фигура Лиссажу)
      const driftX = Math.sin(game.cameraPhase) * 1.5;
      const driftY = Math.cos(game.cameraPhase * 0.7) * 1.0;
      
      // Следование за мышью + дрейф
      const targetX = game.mouseX * 2 + driftX * game.flowLevel;
      const targetY = 8 + game.mouseY * 2 + driftY * game.flowLevel;
      
      game.camera!.position.x += (targetX - game.camera!.position.x) * delta * 0.8;
      game.camera!.position.y += (targetY - game.camera!.position.y) * delta * 0.8;
      
      // Лёгкий зум при углублении в поток
      const targetZ = 50 - game.flowLevel * 5;
      game.camera!.position.z += (targetZ - game.camera!.position.z) * delta * 0.5;
      
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
      game.harmonicSynth?.dispose();
      
      // Очистка (волны убраны)
      
      Tone.context.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#020818] via-[#051428] to-[#020818]">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Intro Overlay (Минималистичный) */}
      {showIntro && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-auto 
                     bg-black/20 backdrop-blur-sm cursor-pointer"
          onClick={startExperience}
        >
          <div className="text-center space-y-4 animate-pulse">
            <div className="text-blue-100/70 tracking-[0.35em] text-sm">
              ВОЙТИ В ПОТОК
            </div>
            <div className="text-[10px] text-cyan-100/30 tracking-widest">
              НАЖМИТЕ, ЧТОБЫ НАЧАТЬ ПОГРУЖЕНИЕ
            </div>
          </div>
        </div>
      )}
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: 'radial-gradient(ellipse at center, transparent 0%, rgba(2,8,24,0.5) 70%, rgba(2,8,24,0.9) 100%)'
           }} />
      
      {/* Ambient glow - сине-бирюзовое свечение, привязанное к flowLevel */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-[3000ms]"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(30,136,229,${gameRef.current.flowLevel / 8}) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(0,229,204,${gameRef.current.flowLevel / 8}) 0%, transparent 40%)
          `,
          opacity: gameRef.current.flowLevel
        }} 
      />
      
      {/* Grid overlay - обновлённые цвета */}
      <div className="absolute inset-0 pointer-events-none opacity-5"
           style={{
             backgroundImage: `
               linear-gradient(rgba(30,136,229,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,229,204,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px',
             transform: 'perspective(500px) rotateX(60deg)',
             transformOrigin: 'center bottom'
           }} />
    </div>
  );
};

export default FlowExperience;