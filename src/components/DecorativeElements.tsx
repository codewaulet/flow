import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Hand, Smartphone } from 'lucide-react';
import { Badge } from './ui/Badge';
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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (showIntro) {
      setHints([]);
      return;
    }

    if (isMobile) {
      const mobileHints: Hint[] = [
        {
          id: 'swipe-settings',
          x: 20,
          y: 20,
          icon: <Hand className="w-4 h-4" />,
          title: 'Свайп слева направо',
          description: 'для настроек',
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
      
      // Убираем подсказки через 8 секунд
      const hintsTimer = setTimeout(() => {
        setHints([]);
      }, 8000);
      
      return () => {
        clearTimeout(hintsTimer);
      };
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

        {/* Убрали FAB кнопку настроек */}

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