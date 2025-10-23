import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';

const SpeedControl: React.FC = () => {
  const baseSpeed = useSettingsStore((state) => state.baseSpeed);
  const setSpeed = useSettingsStore((state) => state.setSpeed);
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion values для слайдера
  const x = useMotionValue(0);
  const progress = useTransform(x, [-100, 100], [0.1, 3.0]);
  
  // Конвертируем скорость в позицию
  const speedToPosition = (speed: number) => {
    return ((speed - 0.1) / 2.9) * 200 - 100;
  };

  // Обновляем позицию при изменении скорости
  React.useEffect(() => {
    x.set(speedToPosition(baseSpeed));
  }, [baseSpeed]);

  const handleDrag = () => {
    const unsubscribe = progress.onChange((value) => {
      setSpeed(Math.round(value * 10) / 10);
    });
    return unsubscribe;
  };

  const getSpeedEmoji = (speed: number) => {
    if (speed < 0.5) return '🐌';
    if (speed < 1.0) return '🚶';
    if (speed < 1.5) return '🏃';
    if (speed < 2.0) return '🚴';
    return '🚀';
  };

  const getSpeedColor = (speed: number) => {
    if (speed < 1.0) return '#00e5cc';
    if (speed < 2.0) return '#66ff99';
    return '#1e88e5';
  };

  return (
    <div className="space-y-4">
      {/* Визуальный индикатор скорости */}
      <div className="flex items-center justify-center py-4">
        <motion.div
          animate={{
            scale: isDragging ? 1.2 : 1,
            rotate: baseSpeed * 30
          }}
          className="relative w-32 h-32"
        >
          {/* Фоновый круг */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${getSpeedColor(baseSpeed)}20, transparent)`,
              filter: 'blur(20px)'
            }}
          />
          
          {/* Основной круг */}
          <div 
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${getSpeedColor(baseSpeed)}10, transparent)`,
              border: `2px solid ${getSpeedColor(baseSpeed)}40`
            }}
          >
            <div className="text-center">
              <motion.div
                key={getSpeedEmoji(baseSpeed)}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl mb-1"
              >
                {getSpeedEmoji(baseSpeed)}
              </motion.div>
              <div 
                className="text-2xl font-bold"
                style={{ color: getSpeedColor(baseSpeed) }}
              >
                {baseSpeed.toFixed(1)}x
              </div>
            </div>
          </div>
          
          {/* Частицы вокруг */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const radius = 50;
            const particleX = Math.cos(angle) * radius;
            const particleY = Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  backgroundColor: getSpeedColor(baseSpeed),
                  transform: `translate(calc(-50% + ${particleX}px), calc(-50% + ${particleY}px))`
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 2 / baseSpeed,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Слайдер */}
      <div className="relative h-12 flex items-center">
        {/* Трек */}
        <div 
          className="absolute inset-x-0 h-1 rounded-full"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          {/* Заполнение */}
          <motion.div
            className="absolute left-0 h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${getSpeedColor(baseSpeed)}, ${getSpeedColor(baseSpeed)}80)`,
              width: `${((baseSpeed - 0.1) / 2.9) * 100}%`
            }}
          />
        </div>
        
        {/* Ползунок */}
        <motion.div
          drag="x"
          dragBounds={{ left: -100, right: 100 }}
          dragElastic={0}
          dragMomentum={false}
          style={{ x }}
          onDragStart={() => {
            setIsDragging(true);
            handleDrag();
          }}
          onDragEnd={() => setIsDragging(false)}
          className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${getSpeedColor(baseSpeed)}, ${getSpeedColor(baseSpeed)}80)`,
              boxShadow: `0 0 20px ${getSpeedColor(baseSpeed)}60`
            }}
          />
        </motion.div>
      </div>

      {/* Метки */}
      <div className="flex justify-between text-xs text-white/50 px-2">
        <span>0.1x</span>
        <span>1.0x</span>
        <span>3.0x</span>
      </div>

      {/* Быстрые пресеты скорости */}
      <div className="grid grid-cols-4 gap-2">
        {[0.5, 1.0, 1.5, 2.0].map((speed) => (
          <motion.button
            key={speed}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSpeed(speed)}
            className="py-2 rounded-lg transition-all duration-200"
            style={{
              background: baseSpeed === speed 
                ? `linear-gradient(135deg, ${getSpeedColor(speed)}20, ${getSpeedColor(speed)}10)`
                : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${
                baseSpeed === speed 
                  ? getSpeedColor(speed) + '40'
                  : 'rgba(255, 255, 255, 0.1)'
              }`
            }}
          >
            <span className="text-xs text-white/80">{speed}x</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SpeedControl;
