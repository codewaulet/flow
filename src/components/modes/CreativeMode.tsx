import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from "../../stores/useSettingsStore";

interface CreativeModeProps {
  isActive: boolean;
}

const CreativeMode: React.FC<CreativeModeProps> = ({ isActive }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState('#00e5cc');
  const [particleCount, setParticleCount] = useState(100);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<any[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Array<{x: number, y: number, vx: number, vy: number, life: number, color: string}>>([]);
  
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);
  const setFlickerSize = useSettingsStore((state) => state.setFlickerSize);
  const setFlickerAlpha = useSettingsStore((state) => state.setFlickerAlpha);

  const colors = [
    '#00e5cc', '#66ff99', '#1e88e5', '#ff6b6b', 
    '#ffa726', '#9c27b0', '#e91e63', '#00bcd4'
  ];

  useEffect(() => {
    if (isActive) {
      setMode('dynamic');
      setSound('rain');
      setSpeed(1.2);
      setFlickerSize(true);
      setFlickerAlpha(true);
      initParticles();
    }
  }, [isActive, setMode, setSound, setSpeed, setFlickerSize, setFlickerAlpha]);

  const initParticles = () => {
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  };

  const animateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas с эффектом затухания
    ctx.fillStyle = 'rgba(2, 8, 24, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Обновляем и рисуем частицы
    particlesRef.current.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.005;

      // Отскок от границ
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      // Ограничиваем координаты
      particle.x = Math.max(0, Math.min(canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(canvas.height, particle.y));

      // Рисуем частицу
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, brushSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Удаляем мертвые частицы
      if (particle.life <= 0) {
        particlesRef.current.splice(index, 1);
      }
    });

    // Добавляем новые частицы
    if (particlesRef.current.length < particleCount) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    animationRef.current = requestAnimationFrame(animateParticles);
  };

  useEffect(() => {
    if (isActive) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        animateParticles();
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    addParticleAt(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      addParticleAt(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDrawing(true);
    addParticleAt(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDrawing) {
      const touch = e.touches[0];
      addParticleAt(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const addParticleAt = (x: number, y: number) => {
    for (let i = 0; i < 5; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * brushSize * 2,
        y: y + (Math.random() - 0.5) * brushSize * 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        color: brushColor
      });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    particlesRef.current = [];
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `flow-art-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordedFrames([]);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Здесь можно сохранить записанные кадры как GIF
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40"
    >
      {/* Canvas для рисования */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ background: 'transparent' }}
      />

      {/* Панель инструментов */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="flex items-center space-x-4 p-4 rounded-xl backdrop-blur-md"
             style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
          
          {/* Цвета */}
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  brushColor === color ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Размер кисти */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">Размер:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-white text-sm w-6">{brushSize}</span>
          </div>

          {/* Количество частиц */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">Частицы:</span>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-white text-sm w-12">{particleCount}</span>
          </div>

          {/* Кнопки управления */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearCanvas}
              className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              🗑️ Очистить
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveCanvas}
              className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              💾 Сохранить
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-3 py-2 rounded-lg transition-all ${
                isRecording 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isRecording ? '⏹️ Стоп' : '🎬 Запись'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Информационная панель */}
      <motion.div
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50"
      >
        <div className="p-4 rounded-xl backdrop-blur-md"
             style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
          <h3 className="text-white font-bold mb-4">Творческий режим</h3>
          
          <div className="space-y-3 text-sm text-white/80">
            <div>🎨 Рисуйте мышью или пальцем</div>
            <div>🌈 Выберите цвет кисти</div>
            <div>⚡ Настройте размер и количество частиц</div>
            <div>💾 Сохраните свои творения</div>
            <div>🎬 Записывайте анимации</div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGallery(!showGallery)}
            className="mt-4 w-full px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            🖼️ Галерея
          </motion.button>
        </div>
      </motion.div>

      {/* Галерея */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-60 flex items-center justify-center"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-xl font-bold mb-4">Галерея творений</h3>
              <div className="text-white/70 text-center py-8">
                Ваши сохраненные работы появятся здесь
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="w-full mt-4 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreativeMode;
