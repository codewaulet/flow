import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameState, FlowSettings } from '../types';
import { ParticleSystem } from '../managers/ParticleSystem';

interface UseAnimationProps {
  gameRef: React.MutableRefObject<GameState>;
  particleSystemRef: React.MutableRefObject<ParticleSystem | null>;
  settings: FlowSettings;
  currentSpeed: number;
  targetSpeed: number;
  setCurrentSpeed: (speed: number) => void;
  updateSoundWithSpeed: () => void;
  triggerHarmonicTone: () => void;
}

export const useAnimation = ({
  gameRef,
  particleSystemRef,
  settings,
  currentSpeed,
  targetSpeed,
  setCurrentSpeed,
  updateSoundWithSpeed,
  triggerHarmonicTone
}: UseAnimationProps) => {
  const animationIdRef = useRef<number>();

  useEffect(() => {
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      
      const game = gameRef.current;
      game.time += delta;

      // Если сессия идет, пассивно увеличиваем "уровень потока"
      if (game.isFlowing) {
        game.flowLevel = Math.min(game.flowLevel + delta * 0.006, 1);
        
        // Пульсация интенсивности в ритме Тета (6 Гц)
        const thetaPulse = Math.sin(game.time * Math.PI * 2 * 6);
        game.flowIntensity = game.flowLevel * (0.85 + thetaPulse * 0.15);
        
        // Плавное изменение скорости
        const lerpSpeed = delta / 1.5;
        const newSpeed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, lerpSpeed);
        setCurrentSpeed(newSpeed);
        
        // Обновляем звук в зависимости от скорости
        updateSoundWithSpeed();
        
        // Гармонические тона при углублении в поток
        const harmonicInterval = 15 - game.flowLevel * 8;
        if (game.time - game.lastWaveTime > harmonicInterval) {
          game.lastWaveTime = game.time;
          triggerHarmonicTone();
        }
      }

      // Обновляем частицы
      if (particleSystemRef.current) {
        particleSystemRef.current.updateParticles(delta, game.time, game.flowLevel, currentSpeed);
        particleSystemRef.current.updateTrails();
      }

      // Камера с минимальным дрейфом
      game.cameraPhase += delta * 0.1;
      
      const driftX = Math.sin(game.cameraPhase) * 0.5;
      const driftY = Math.cos(game.cameraPhase * 0.5) * 0.3;
      
      if (game.camera) {
        const targetX = game.mouseX * 1 + driftX * game.flowLevel * 0.3;
        const targetY = 8 + game.mouseY * 1 + driftY * game.flowLevel * 0.3;
        
        game.camera.position.x += (targetX - game.camera.position.x) * delta * 0.4;
        game.camera.position.y += (targetY - game.camera.position.y) * delta * 0.4;
        
        const targetZ = 35 - game.flowLevel * 3;
        game.camera.position.z += (targetZ - game.camera.position.z) * delta * 0.3;
        
        game.camera.lookAt(0, -5, 0);
      }

      // Рендеринг
      if (game.renderer && game.scene && game.camera) {
        game.renderer.render(game.scene, game.camera);
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [
    gameRef,
    particleSystemRef,
    currentSpeed,
    targetSpeed,
    setCurrentSpeed,
    updateSoundWithSpeed,
    triggerHarmonicTone
  ]);
};
