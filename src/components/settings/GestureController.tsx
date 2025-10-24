import React, { useEffect, useRef, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { FlowMode } from '../../types';
import { Sound } from '../../stores/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';

interface GestureControllerProps {
  children: React.ReactNode;
  onAccelerationStart?: () => void;
  onAccelerationEnd?: () => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ 
  children,
  onAccelerationStart,
  onAccelerationEnd 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showQuickPresets, setShowQuickPresets] = useState(false);
  const [gestureIndicator, setGestureIndicator] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  
  const mode = useSettingsStore((state) => state.mode);
  const sound = useSettingsStore((state) => state.sound);
  // const baseSpeed = useSettingsStore((state) => state.baseSpeed);
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);
  const openPanel = useSettingsStore((state) => state.openPanel);
  const closePanel = useSettingsStore((state) => state.closePanel);
  const isPanelOpen = useSettingsStore((state) => state.isPanelOpen);
  // const applyPreset = useSettingsStore((state) => state.applyPreset);

  const modes: FlowMode[] = ['smooth', 'crawl', 'dynamic'];
  const sounds: Sound[] = ['theta', 'alpha', 'beta', 'gamma', 'white_noise', 'rain', 'ocean', 'forest'];

  // Показать индикатор жеста с новым дизайном
  const showGestureIndicator = (text: string) => {
    setGestureIndicator(text);
    setTimeout(() => setGestureIndicator(null), 1500);
  };

  // Вибрация для мобильных устройств
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], first, last, direction: [dx, dy], initial: [ix, iy] }) => {
      if (first) {
        vibrate(5);
        // Инициализируем аудио при первом пользовательском взаимодействии
        import('../../managers/AudioManager').then(({ AudioManager }) => {
          AudioManager.getInstance().initializeOnUserInteraction();
        });
      }

      // Свайп с левого края экрана для открытия настроек
      if (first && ix < 50 && dx > 0) {
        openPanel();
        showGestureIndicator('Настройки →');
        vibrate(20);
        return;
      }

      // Свайп влево для закрытия настроек
      if (isPanelOpen && dx < -0.5 && Math.abs(vx) > 0.5) {
        closePanel();
        showGestureIndicator('← Закрыто');
        vibrate(15);
        return;
      }

      // Свайп вверх/вниз для смены режима (только если панель закрыта)
      if (!isPanelOpen && last && Math.abs(vy) > 0.5 && Math.abs(my) > 50) {
        const currentIndex = modes.indexOf(mode);
        if (dy < 0 && my < -50) { // Свайп вверх
          const nextIndex = (currentIndex + 1) % modes.length;
          setMode(modes[nextIndex]);
          showGestureIndicator(`Режим: ${modes[nextIndex]}`);
          vibrate([10, 50, 10]);
        } else if (dy > 0 && my > 50) { // Свайп вниз
          const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
          setMode(modes[prevIndex]);
          showGestureIndicator(`Режим: ${modes[prevIndex]}`);
          vibrate([10, 50, 10]);
        }
      }
    },

    onPinch: ({ offset: [scale], first, last }) => {
      if (first) {
        vibrate(5);
      }

      // Пинч для изменения скорости
      const newSpeed = Math.max(0.1, Math.min(3.0, scale));
      setSpeed(newSpeed);
      
      if (last) {
        showGestureIndicator(`Скорость: ${newSpeed.toFixed(1)}x`);
        vibrate(20);
      }
    },

    onPointerDown: () => {
      // Долгое нажатие для быстрых пресетов
      longPressTimer.current = setTimeout(() => {
        setShowQuickPresets(true);
        vibrate([30, 50, 30]);
      }, 500);
    },

    onPointerUp: () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }
  }, {
    drag: {
      filterTaps: true,
      threshold: 10
    },
    pinch: {
      scaleBounds: { min: 0.1, max: 3 },
      rubberband: true
    }
  });

  // Ускорение при удержании пробела (десктоп)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        onAccelerationStart?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onAccelerationEnd?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onAccelerationStart, onAccelerationEnd]);

  // Выбор пресета
  const handlePresetSelect = (preset: 'chill' | 'focus' | 'energy') => {
    // Применяем пресет через отдельные методы
    switch (preset) {
      case 'chill':
        setMode('smooth');
        setSound('theta');
        setSpeed(0.5);
        break;
      case 'focus':
        setMode('crawl');
        setSound('white_noise');
        setSpeed(1.0);
        break;
      case 'energy':
        setMode('dynamic');
        setSound('ocean');
        setSpeed(1.5);
        break;
    }
    setShowQuickPresets(false);
    showGestureIndicator(`Пресет: ${preset}`);
    vibrate([20, 30, 20, 30, 20]);
  };

  // Обработчик двойного клика для управления звуком
  const handleDoubleClick = () => {
    const currentIndex = sounds.indexOf(sound);
    const isMuted = sound === 'theta' && currentIndex === 0;
    
    if (isMuted) {
      setSound(sounds[sounds.length - 1]);
      showGestureIndicator('Звук включён');
    } else {
      setSound('theta');
      showGestureIndicator('Звук выключен');
    }
    vibrate([20, 50, 20]);
  };

  return (
    <div ref={containerRef} {...bind()} onDoubleClick={handleDoubleClick} className="relative w-full h-full touch-none">
      {children}
      
      {/* Новый индикатор жеста в стиле Apple */}
      <AnimatePresence>
        {gestureIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div 
              className="px-8 py-4 rounded-2xl backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#00e5cc' }}
                />
                <span className="text-white font-medium text-sm">{gestureIndicator}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Новые быстрые пресеты в стиле Apple */}
      <AnimatePresence>
        {showQuickPresets && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowQuickPresets(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h3 className="text-white text-xl font-semibold mb-2">Быстрые настройки</h3>
                  <p className="text-white/60 text-sm">Выберите настроение</p>
                </motion.div>
                <div className="flex gap-6">
                  {[
                    { id: 'chill' as const, emoji: '😌', name: 'Релакс', color: '#00e5cc', desc: 'Спокойно' },
                    { id: 'focus' as const, emoji: '🎯', name: 'Фокус', color: '#66ff99', desc: 'Концентрация' },
                    { id: 'energy' as const, emoji: '⚡', name: 'Энергия', color: '#1e88e5', desc: 'Активно' }
                  ].map((preset, index) => (
                    <motion.button
                      key={preset.id}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      onClick={() => handlePresetSelect(preset.id)}
                      className="group relative"
                    >
                      <div
                        className="w-28 h-32 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group-hover:scale-105 group-active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${preset.color}15, ${preset.color}05)`,
                          border: `1px solid ${preset.color}30`,
                          boxShadow: `0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px ${preset.color}20`
                        }}
                      >
                        <motion.span 
                          className="text-4xl"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {preset.emoji}
                        </motion.span>
                        <div className="text-center">
                          <span className="text-sm font-medium text-white block">{preset.name}</span>
                          <span className="text-xs text-white/60">{preset.desc}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestureController;
