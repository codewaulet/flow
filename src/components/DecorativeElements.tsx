import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Zap, Hand, Smartphone } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useIsMobile } from '../hooks/useMediaQuery';

interface DecorativeElementsProps {
  showIntro: boolean;
}

interface Hint {
  id: string;
  x: number;
  y: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}

const DecorativeElements: React.FC<DecorativeElementsProps> = ({ showIntro }) => {
  const [hints, setHints] = useState<Hint[]>([]);
  const [showFAB, setShowFAB] = useState(false);
  const { openPanel } = useSettingsStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (showIntro) {
      setHints([]);
      setShowFAB(false);
      return;
    }

    if (isMobile) {
      const mobileHints: Hint[] = [
        {
          id: 'tap-control',
          x: 20,
          y: 20,
          icon: <Hand className="w-4 h-4" />,
          title: 'Тапните',
          description: 'для управления',
          color: '#03a9f4',
          delay: 1000
        },
        {
          id: 'long-press',
          x: 80,
          y: 80,
          icon: <Zap className="w-4 h-4" />,
          title: 'Долгий тап',
          description: 'для ускорения',
          color: '#4caf50',
          delay: 2000
        }
      ];
      
      setHints(mobileHints);
      
      // Показываем FAB через 3 секунды
      const fabTimer = setTimeout(() => {
        setShowFAB(true);
      }, 3000);
      
      // Убираем подсказки через 8 секунд
      const hintsTimer = setTimeout(() => {
        setHints([]);
      }, 8000);
      
      return () => {
        clearTimeout(fabTimer);
        clearTimeout(hintsTimer);
      };
    } else {
      // Для десктопа показываем FAB сразу
      setShowFAB(true);
    }
  }, [showIntro, isMobile]);

  return (
    <>
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(2,8,24,0.5) 70%, rgba(2,8,24,0.9) 100%)'
        }} 
      />
      
      {/* Ambient glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-[3000ms]"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(30,136,229,0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(0,229,204,0.1) 0%, transparent 40%)
          `,
          opacity: 0.5
        }} 
      />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(30,136,229,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,204,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center bottom'
        }} 
      />

      {/* Современные подсказки */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <AnimatePresence>
          {hints.map((hint) => (
            <motion.div
              key={hint.id}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -20 }}
              transition={{ 
                duration: 0.6, 
                delay: hint.delay / 1000,
                ease: 'easeOut'
              }}
              className="absolute"
              style={{
                left: `${hint.x}%`,
                top: `${hint.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div 
                className="bg-glass-medium backdrop-blur-xl rounded-xl p-3 border border-glass-strong shadow-glass"
                style={{
                  background: `linear-gradient(135deg, ${hint.color}20, ${hint.color}10)`,
                  borderColor: `${hint.color}40`
                }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${hint.color}20`,
                      color: hint.color
                    }}
                  >
                    {hint.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {hint.title}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {hint.description}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Floating Action Button для настроек */}
        <AnimatePresence>
          {showFAB && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute bottom-6 right-6 pointer-events-auto"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Button
                  onClick={openPanel}
                  size="lg"
                  className="w-14 h-14 rounded-full shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #03a9f4, #00bcd4)',
                    boxShadow: '0 8px 32px rgba(3, 169, 244, 0.4)'
                  }}
                >
                  <Settings className="w-6 h-6" />
                </Button>
                
                {/* Пульсирующий эффект */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #03a9f4, #00bcd4)',
                    zIndex: -1
                  }}
                />
                
                {/* Бейдж с подсказкой */}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-2 -left-20"
                >
                  <Badge 
                    variant="glass"
                    className="text-xs px-3 py-1"
                  >
                    Настройки
                  </Badge>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Индикатор устройства */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute top-6 left-6 pointer-events-auto"
        >
          <Badge 
            variant="glass"
            className="flex items-center gap-2 text-xs"
          >
            <Smartphone className="w-3 h-3" />
            {isMobile ? 'Мобильное устройство' : 'Десктоп'}
          </Badge>
        </motion.div>
      </div>
    </>
  );
};

export default DecorativeElements;