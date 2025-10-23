import React, { useEffect, useRef, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { FlowMode, SubMode, SoundType } from '../../types';
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
  const baseSpeed = useSettingsStore((state) => state.baseSpeed);
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);
  const openPanel = useSettingsStore((state) => state.openPanel);
  const closePanel = useSettingsStore((state) => state.closePanel);
  const isPanelOpen = useSettingsStore((state) => state.isPanelOpen);
  const applyPreset = useSettingsStore((state) => state.applyPreset);

  const modes: FlowMode[] = ['smooth', 'crawl', 'dynamic'];
  const sounds: SoundType[] = ['theta', 'noise', 'rain', 'ocean'];

  // Показать индикатор жеста
  const showGestureIndicator = (text: string) => {
    setGestureIndicator(text);
    setTimeout(() => setGestureIndicator(null), 1000);
  };

  // Вибрация для мобильных устройств
  const vibrate = (pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], first, last, direction: [dx, dy] }) => {
      if (first) {
        vibrate(5);
      }

      // Свайп с края экрана для открытия настроек
      if (first && mx < 50 && dx > 0) {
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

    onTap: ({ event }) => {
      // Двойной тап для вкл/выкл звука
      if (event.detail === 2) {
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
      }
    },

    onPointerDown: ({ event }) => {
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
    applyPreset(preset);
    setShowQuickPresets(false);
    showGestureIndicator(`Пресет: ${preset}`);
    vibrate([20, 30, 20, 30, 20]);
  };

  return (
    <div ref={containerRef} {...bind()} className="relative w-full h-full touch-none">
      {children}
      
      {/* Индикатор жеста */}
      <AnimatePresence>
        {gestureIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div 
              className="px-6 py-3 rounded-full backdrop-blur-md"
              style={{
                background: 'rgba(0, 229, 204, 0.1)',
                border: '1px solid rgba(0, 229, 204, 0.3)',
                boxShadow: '0 4px 24px rgba(0, 229, 204, 0.2)'
              }}
            >
              <span className="text-white font-medium">{gestureIndicator}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Быстрые пресеты */}
      <AnimatePresence>
        {showQuickPresets && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowQuickPresets(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <h3 className="text-center text-white mb-6 text-lg font-medium">Быстрые настройки</h3>
                <div className="flex gap-4">
                  {[
                    { id: 'chill' as const, emoji: '😌', name: 'Релакс', color: '#00e5cc' },
                    { id: 'focus' as const, emoji: '🎯', name: 'Фокус', color: '#66ff99' },
                    { id: 'energy' as const, emoji: '⚡', name: 'Энергия', color: '#1e88e5' }
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className="group relative"
                    >
                      <div
                        className="w-24 h-24 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center gap-2 transition-all duration-200 group-hover:scale-105 group-active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${preset.color}20, ${preset.color}10)`,
                          border: `1px solid ${preset.color}40`,
                          boxShadow: `0 8px 32px ${preset.color}20`
                        }}
                      >
                        <span className="text-3xl">{preset.emoji}</span>
                        <span className="text-xs text-white/80">{preset.name}</span>
                      </div>
                    </button>
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
