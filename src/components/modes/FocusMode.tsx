import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from "../../stores/useSettingsStore";

interface FocusModeProps {
  isActive: boolean;
}

const FocusMode: React.FC<FocusModeProps> = ({ isActive }) => {
  const [currentPhase, setCurrentPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 минут работы
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);
  const setFlickerSize = useSettingsStore((state) => state.setFlickerSize);
  const setFlickerAlpha = useSettingsStore((state) => state.setFlickerAlpha);

  const phases = {
    work: { duration: 25 * 60, color: '#ff6b6b', emoji: '🍅', name: 'Работа' },
    shortBreak: { duration: 5 * 60, color: '#66ff99', emoji: '☕', name: 'Перерыв' },
    longBreak: { duration: 15 * 60, color: '#1e88e5', emoji: '🌴', name: 'Длинный перерыв' }
  };

  const currentPhaseData = phases[currentPhase];

  useEffect(() => {
    if (isActive) {
      setMode('smooth');
      setSound('noise');
      setSpeed(0.8);
      setFlickerSize(false);
      setFlickerAlpha(false);
    }
  }, [isActive, setMode, setSound, setSpeed, setFlickerSize, setFlickerAlpha]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handlePhaseComplete = () => {
    setIsRunning(false);
    
    if (currentPhase === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      
      // Каждые 4 помидора - длинный перерыв
      if ((completedPomodoros + 1) % 4 === 0) {
        setCurrentPhase('longBreak');
      } else {
        setCurrentPhase('shortBreak');
      }
    } else {
      setCurrentPhase('work');
    }
    
    setTimeLeft(phases[currentPhase === 'work' ? 'shortBreak' : 'work'].duration);
    setTotalSessions(prev => prev + 1);
    
    // Уведомление
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        `Помидор завершен!`,
        { body: `Время для ${currentPhase === 'work' ? 'перерыва' : 'работы'}` }
      );
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(currentPhaseData.duration);
  };

  const skipPhase = () => {
    handlePhaseComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentPhaseData.duration - timeLeft) / currentPhaseData.duration) * 100;

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(30, 136, 229, 0.1))',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="max-w-md mx-4 text-center">
        {/* Заголовок */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold mb-8"
          style={{ color: currentPhaseData.color }}
        >
          Режим фокусировки
        </motion.h2>

        {/* Таймер */}
        <div className="relative mb-8">
          {/* Круг прогресса */}
          <div className="relative w-64 h-64 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Фоновый круг */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Прогресс */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke={currentPhaseData.color}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            
            {/* Центральный контент */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={currentPhase}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl mb-2"
              >
                {currentPhaseData.emoji}
              </motion.div>
              
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: currentPhaseData.color }}
              >
                {formatTime(timeLeft)}
              </div>
              
              <div className="text-lg text-white/70">
                {currentPhaseData.name}
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#ff6b6b' }}>
              {completedPomodoros}
            </div>
            <div className="text-sm text-white/70">Помидоров</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#66ff99' }}>
              {totalSessions}
            </div>
            <div className="text-sm text-white/70">Сессий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#1e88e5' }}>
              {Math.floor(completedPomodoros * 25 / 60)}ч
            </div>
            <div className="text-sm text-white/70">Время</div>
          </div>
        </div>

        {/* Управление */}
        <div className="flex justify-center space-x-4 mb-8">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startTimer}
              className="px-8 py-3 rounded-xl font-medium"
              style={{
                background: `linear-gradient(135deg, ${currentPhaseData.color}, ${currentPhaseData.color}80)`,
                color: 'white',
                boxShadow: `0 4px 20px ${currentPhaseData.color}40`
              }}
            >
              ▶️ Начать
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={pauseTimer}
              className="px-8 py-3 rounded-xl font-medium"
              style={{
                background: 'linear-gradient(135deg, #ffa726, #ffb74d)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255, 167, 38, 0.4)'
              }}
            >
              ⏸️ Пауза
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="px-6 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            🔄 Сброс
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={skipPhase}
            className="px-6 py-3 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            ⏭️ Пропустить
          </motion.button>
        </div>

        {/* Индикатор следующей фазы */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-white/60"
        >
          Следующая фаза: {
            currentPhase === 'work' 
              ? (completedPomodoros + 1) % 4 === 0 ? 'Длинный перерыв (15 мин)' : 'Короткий перерыв (5 мин)'
              : 'Работа (25 мин)'
          }
        </motion.div>

        {/* Советы по продуктивности */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-lg bg-white/5"
        >
          <div className="text-sm text-white/70">
            💡 <strong>Совет:</strong> {
              currentPhase === 'work' 
                ? 'Сосредоточьтесь на одной задаче. Избегайте отвлечений.'
                : 'Отдохните! Встаньте, потянитесь или сделайте несколько глубоких вдохов.'
            }
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FocusMode;
