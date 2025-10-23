import { useState, useRef, useEffect, useCallback } from 'react';
import { FlowSettings, GameState } from '../types';
import { SettingsManager } from '../managers/SettingsManager';
import { AudioManager } from '../managers/AudioManager';
import { ParticleSystem } from '../managers/ParticleSystem';

export const useFlowExperience = () => {
  const settingsManager = SettingsManager.getInstance();
  const audioManager = AudioManager.getInstance();
  
  const [settings, setSettings] = useState<FlowSettings>(settingsManager.getSettings());
  const [showIntro, setShowIntro] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const [showUI, setShowUI] = useState(true);
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

  // Обновляем настройки
  const updateSettings = useCallback((newSettings: Partial<FlowSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    settingsManager.updateSettings(updatedSettings);
    
    // Обновляем систему частиц если нужно
    if (particleSystemRef.current) {
      particleSystemRef.current.updateSettings(updatedSettings);
    }
  }, [settings, settingsManager]);

  // Сохраняем настройки
  const saveSettings = useCallback(() => {
    settingsManager.saveSettings();
  }, [settingsManager]);

  // Переключаем звук
  const switchSound = useCallback((soundType: FlowSettings['sound']) => {
    if (audioReady) {
      audioManager.switchSound(soundType);
    }
  }, [audioReady, audioManager]);

  // Обработчики ускорения
  const handleAccelerationStart = useCallback(() => {
    setTargetSpeed(3.0);
  }, []);

  const handleAccelerationEnd = useCallback(() => {
    setTargetSpeed(settings.baseSpeed);
  }, [settings.baseSpeed]);

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

  // Переключение UI
  const toggleUI = useCallback(() => {
    setShowUI(prev => !prev);
  }, []);

  // Обновляем звук в зависимости от скорости
  const updateSoundWithSpeed = useCallback(() => {
    audioManager.updateSoundWithSpeed(currentSpeed, settings.sound);
  }, [currentSpeed, settings.sound, audioManager]);

  // Запускаем гармонические тона
  const triggerHarmonicTone = useCallback(() => {
    audioManager.triggerHarmonicTone(gameRef.current.flowLevel);
  }, [audioManager]);

  // Переключаем звук при смене настроек
  useEffect(() => {
    if (audioReady) {
      switchSound(settings.sound);
    }
  }, [settings.sound, audioReady, switchSound]);

  return {
    settings,
    showIntro,
    audioReady,
    showUI,
    currentSpeed,
    targetSpeed,
    gameRef,
    particleSystemRef,
    containerRef,
    updateSettings,
    saveSettings,
    switchSound,
    handleAccelerationStart,
    handleAccelerationEnd,
    startExperience,
    toggleUI,
    updateSoundWithSpeed,
    triggerHarmonicTone,
    setCurrentSpeed,
    setTargetSpeed
  };
};
