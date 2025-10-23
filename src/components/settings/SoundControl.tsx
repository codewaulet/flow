import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { SoundType } from '../../types';

const SoundControl: React.FC = () => {
  const sound = useSettingsStore((state) => state.sound);
  const setSound = useSettingsStore((state) => state.setSound);
  const visualizerRef = useRef<HTMLCanvasElement>(null);

  const sounds: { id: SoundType; emoji: string; name: string; color: string; frequency: number }[] = [
    { id: 'theta', emoji: '🧘', name: 'Тета-волны', color: '#00e5cc', frequency: 6 },
    { id: 'noise', emoji: '🌌', name: 'Белый шум', color: '#66ff99', frequency: 20 },
    { id: 'rain', emoji: '🌧️', name: 'Дождь', color: '#1e88e5', frequency: 15 },
    { id: 'ocean', emoji: '🌊', name: 'Океан', color: '#00b4d8', frequency: 8 }
  ];

  const currentSound = sounds.find(s => s.id === sound);

  // Визуализация звука
  useEffect(() => {
    if (!visualizerRef.current || !currentSound) return;

    const canvas = visualizerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем волну
      ctx.beginPath();
      ctx.strokeStyle = currentSound.color + '80';
      ctx.lineWidth = 2;
      
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin((x * 0.02) + time) * 10 * Math.sin(time * currentSound.frequency * 0.01);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      time += 0.05;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [currentSound]);

  return (
    <div className="space-y-4">
      {/* Круговой селектор */}
      <div className="relative w-full aspect-square max-w-[200px] mx-auto">
        {/* Визуализация */}
        <canvas
          ref={visualizerRef}
          width={200}
          height={200}
          className="absolute inset-0 w-full h-full opacity-30"
        />
        
        {/* Центральный индикатор */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            key={sound}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${currentSound?.color}20, transparent)`,
              border: `2px solid ${currentSound?.color}40`
            }}
          >
            <span className="text-4xl">{currentSound?.emoji}</span>
          </motion.div>
        </div>
        
        {/* Звуки по кругу */}
        {sounds.map((soundItem, index) => {
          const angle = (index * 360) / sounds.length - 90;
          const isActive = sound === soundItem.id;
          const radius = 80;
          
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;
          
          return (
            <motion.button
              key={soundItem.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSound(soundItem.id)}
              className="absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                background: isActive 
                  ? `linear-gradient(135deg, ${soundItem.color}30, ${soundItem.color}10)`
                  : 'rgba(255, 255, 255, 0.05)',
                border: `2px solid ${isActive ? soundItem.color : 'rgba(255, 255, 255, 0.2)'}`,
                boxShadow: isActive ? `0 0 20px ${soundItem.color}40` : 'none'
              }}
            >
              <span className="text-xl">{soundItem.emoji}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Название текущего звука */}
      <div className="text-center">
        <motion.div
          key={sound}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm font-medium"
          style={{ color: currentSound?.color }}
        >
          {currentSound?.name}
        </motion.div>
        <div className="text-xs text-white/50 mt-1">
          Нажмите на иконку для смены
        </div>
      </div>

      {/* Индикатор громкости */}
      <div className="flex items-center justify-center gap-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: sound !== 'theta' ? [4, 12, 4] : 4,
              opacity: sound !== 'theta' ? 1 : 0.3
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1
            }}
            className="w-1 bg-white/60 rounded-full"
            style={{ 
              backgroundColor: currentSound?.color,
              minHeight: 4
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SoundControl;
