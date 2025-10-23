import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from "../../stores/useSettingsStore";

interface MeditationModeProps {
  isActive: boolean;
}

const MeditationMode: React.FC<MeditationModeProps> = ({ isActive }) => {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [breathPattern, setBreathPattern] = useState<'4-4-4-4' | '4-7-8' | 'box'>('4-4-4-4');
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const sessionRef = useRef<NodeJS.Timeout>();
  
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);

  const patterns = {
    '4-4-4-4': { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, pause: 0 },
    'box': { inhale: 4, hold: 4, exhale: 4, pause: 4 }
  };

  const currentPattern = patterns[breathPattern];

  useEffect(() => {
    if (isActive) {
      setMode('smooth');
      setSound('theta');
      setSpeed(0.5);
    }
  }, [isActive, setMode, setSound, setSpeed]);

  useEffect(() => {
    if (isSessionActive) {
      sessionRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionRef.current) {
        clearInterval(sessionRef.current);
      }
    }

    return () => {
      if (sessionRef.current) {
        clearInterval(sessionRef.current);
      }
    };
  }, [isSessionActive]);

  const startBreathingCycle = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let phaseIndex = 0;
    const phases: Array<keyof typeof currentPattern> = ['inhale', 'hold', 'exhale', 'pause'];
    
    const cyclePhase = () => {
      const currentPhase = phases[phaseIndex];
      setBreathPhase(currentPhase);
      
      const duration = currentPattern[currentPhase] * 1000;
      
      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        
        if (currentPhase === 'exhale') {
          setBreathCount(prev => prev + 1);
        }
        
        if (phaseIndex === 0) {
          // Новый цикл
          cyclePhase();
        } else {
          cyclePhase();
        }
      }, duration);
    };

    cyclePhase();
  };

  const startSession = () => {
    setIsSessionActive(true);
    setBreathCount(0);
    setSessionTime(0);
    startBreathingCycle();
  };

  const stopSession = () => {
    setIsSessionActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.1), rgba(30, 136, 229, 0.1))',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="max-w-md mx-4 text-center">
        {/* Заголовок */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold mb-8"
          style={{ color: '#00e5cc' }}
        >
          Режим медитации
        </motion.h2>

        {/* Визуализация дыхания */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              scale: breathPhase === 'inhale' ? [1, 1.3] : 
                     breathPhase === 'hold' ? 1.3 :
                     breathPhase === 'exhale' ? [1.3, 1] : 1,
              opacity: breathPhase === 'pause' ? [1, 0.7, 1] : 1
            }}
            transition={{
              duration: currentPattern[breathPhase],
              ease: breathPhase === 'inhale' ? 'easeOut' : 
                    breathPhase === 'exhale' ? 'easeIn' : 'linear',
              repeat: breathPhase === 'pause' ? Infinity : 0
            }}
            className="w-48 h-48 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${
                breathPhase === 'inhale' ? '#00e5cc' :
                breathPhase === 'hold' ? '#66ff99' :
                breathPhase === 'exhale' ? '#1e88e5' : '#00b4d8'
              }20, transparent)`,
              border: `3px solid ${
                breathPhase === 'inhale' ? '#00e5cc' :
                breathPhase === 'hold' ? '#66ff99' :
                breathPhase === 'exhale' ? '#1e88e5' : '#00b4d8'
              }40`
            }}
          >
            <motion.div
              animate={{
                scale: breathPhase === 'inhale' ? [0.8, 1.2] : 
                       breathPhase === 'hold' ? 1.2 :
                       breathPhase === 'exhale' ? [1.2, 0.8] : 0.8
              }}
              transition={{
                duration: currentPattern[breathPhase],
                ease: breathPhase === 'inhale' ? 'easeOut' : 
                      breathPhase === 'exhale' ? 'easeIn' : 'linear'
              }}
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${
                  breathPhase === 'inhale' ? '#00e5cc' :
                  breathPhase === 'hold' ? '#66ff99' :
                  breathPhase === 'exhale' ? '#1e88e5' : '#00b4d8'
                }, ${
                  breathPhase === 'inhale' ? '#00e5cc80' :
                  breathPhase === 'hold' ? '#66ff9980' :
                  breathPhase === 'exhale' ? '#1e88e580' : '#00b4d880'
                })`,
                boxShadow: `0 0 40px ${
                  breathPhase === 'inhale' ? '#00e5cc' :
                  breathPhase === 'hold' ? '#66ff99' :
                  breathPhase === 'exhale' ? '#1e88e5' : '#00b4d8'
                }40`
              }}
            >
              <span className="text-4xl">
                {breathPhase === 'inhale' ? '🌬️' :
                 breathPhase === 'hold' ? '⏸️' :
                 breathPhase === 'exhale' ? '💨' : '🧘'}
              </span>
            </motion.div>
          </motion.div>

          {/* Индикатор фазы */}
          <motion.div
            key={breathPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div 
              className="text-lg font-medium"
              style={{ 
                color: breathPhase === 'inhale' ? '#00e5cc' :
                       breathPhase === 'hold' ? '#66ff99' :
                       breathPhase === 'exhale' ? '#1e88e5' : '#00b4d8'
              }}
            >
              {breathPhase === 'inhale' ? 'Вдох' :
               breathPhase === 'hold' ? 'Задержка' :
               breathPhase === 'exhale' ? 'Выдох' : 'Пауза'}
            </div>
          </motion.div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#00e5cc' }}>
              {breathCount}
            </div>
            <div className="text-sm text-white/70">Циклов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#66ff99' }}>
              {formatTime(sessionTime)}
            </div>
            <div className="text-sm text-white/70">Время</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#1e88e5' }}>
              {breathPattern}
            </div>
            <div className="text-sm text-white/70">Паттерн</div>
          </div>
        </div>

        {/* Паттерны дыхания */}
        <div className="mb-8">
          <div className="text-sm text-white/70 mb-3">Паттерн дыхания:</div>
          <div className="flex justify-center space-x-2">
            {Object.keys(patterns).map((pattern) => (
              <button
                key={pattern}
                onClick={() => setBreathPattern(pattern as keyof typeof patterns)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  breathPattern === pattern
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>

        {/* Управление */}
        <div className="flex justify-center space-x-4">
          {!isSessionActive ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              className="px-8 py-3 rounded-xl font-medium"
              style={{
                background: 'linear-gradient(135deg, #00e5cc, #66ff99)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0, 229, 204, 0.4)'
              }}
            >
              Начать медитацию
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopSession}
              className="px-8 py-3 rounded-xl font-medium"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)'
              }}
            >
              Завершить
            </motion.button>
          )}
        </div>

        {/* Инструкции */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-white/60"
        >
          Следуйте за визуальным индикатором дыхания.<br />
          Дышите медленно и глубоко, синхронизируя с анимацией.
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MeditationMode;
