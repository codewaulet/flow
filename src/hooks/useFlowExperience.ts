import { useState, useRef, useEffect, useCallback } from 'react';
import { GameState } from '../types';
import { AudioManager } from '../managers/AudioManager';
import { ParticleSystem } from '../managers/ParticleSystem';
import { useSettingsStore } from '../stores/useSettingsStore';

export const useFlowExperience = () => {
  const audioManager = AudioManager.getInstance();
  
  // Получаем настройки и методы из Zustand с атомарными селекторами
  const speed = useSettingsStore((state) => state.speed);
  const sound = useSettingsStore((state) => state.sound);
  
  const [showIntro, setShowIntro] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  const [targetSpeed, setTargetSpeed] = useState(1.0);
  
  const gameRef = useRef<GameState>({
    scene: null,
    camera: null,
    renderer: null,
    particles: [],
    particleSystem: null,
    trailSystem: null,
    time: 0,
    flowLevel: 0,
    isFlowing: false,
    flowIntensity: 0,
    lastWaveTime: 0,
    mouseX: 0,
    mouseY: 0,
    cameraPhase: 0
  });
  
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Переключаем звук
  const switchSound = useCallback((soundType: string) => {
    if (audioReady) {
      audioManager.switchSound(soundType as any);
    }
  }, [audioReady, audioManager]);

  // Обработчики ускорения
  const handleAccelerationStart = useCallback(() => {
    setTargetSpeed(3.0);
  }, []);

  const handleAccelerationEnd = useCallback(() => {
    setTargetSpeed(speed);
  }, [speed]);

  // Инициализация аудио
  const initAudio = useCallback(async () => {
    if (audioReady) return;
    try {
      await audioManager.initialize();
      setAudioReady(true);
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }, [audioReady, audioManager]);

  // Старт опыта
  const startExperience = useCallback(async () => {
    const game = gameRef.current;
    if (game.isFlowing) return;

    game.isFlowing = true;
    setShowIntro(false);
    await initAudio();
  }, [initAudio]);

  // Обновляем звук в зависимости от скорости
  const updateSoundWithSpeed = useCallback(() => {
    audioManager.updateSoundWithSpeed(currentSpeed, sound as any);
  }, [currentSpeed, sound, audioManager]);

  // Запускаем гармонические тона
  const triggerHarmonicTone = useCallback(() => {
    audioManager.triggerHarmonicTone(gameRef.current.flowLevel);
  }, [audioManager]);

  // Переключаем звук при смене настроек
  useEffect(() => {
    if (audioReady) {
      switchSound(sound);
    }
  }, [sound, audioReady, switchSound]);

  return {
    showIntro,
    audioReady,
    currentSpeed,
    targetSpeed,
    gameRef,
    particleSystemRef,
    containerRef,
    switchSound,
    handleAccelerationStart,
    handleAccelerationEnd,
    startExperience,
    updateSoundWithSpeed,
    triggerHarmonicTone,
    setCurrentSpeed,
    setTargetSpeed
  };
};
