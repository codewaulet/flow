import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface IntroOverlayProps {
  onStart: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto z-30"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      <Card 
        variant="glass"
        className="max-w-md mx-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <CardContent className="p-8 text-center">
          {/* Градиентный фон */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(135deg, #03a9f4, #00bcd4)'
            }}
          />
          
          {/* Иконка */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10 mb-6"
          >
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: 'linear-gradient(135deg, #03a9f4, #00bcd4)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(3, 169, 244, 0.4)'
              }}
            >
              <Sparkles className="w-8 h-8" />
            </div>
          </motion.div>

          {/* Заголовок */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-2 relative z-10"
            style={{ 
              color: '#03a9f4',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}
          >
            Flow Experience
          </motion.h1>

          {/* Подзаголовок */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-text-secondary mb-6 relative z-10"
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
            }}
          >
            Интерактивный опыт потока
          </motion.p>

          {/* Описание */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-text-primary mb-8 leading-relaxed relative z-10"
            style={{ 
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
            }}
          >
            Погрузитесь в мир медитативных визуализаций с частицами, 
            которые реагируют на ваши движения и создают уникальные паттерны.
          </motion.p>

          {/* Особенности */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-4 mb-8 relative z-10"
          >
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Zap className="w-4 h-4 text-primary-500" />
              <span>Интерактивность</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Медитация</span>
            </div>
          </motion.div>

          {/* Кнопка запуска */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative z-10"
          >
            <Button
              onClick={onStart}
              size="lg"
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, #03a9f4, #00bcd4)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(3, 169, 244, 0.4)'
              }}
            >
              <Play className="w-5 h-5 mr-2" />
              Начать погружение
            </Button>
          </motion.div>

          {/* Подсказка */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-text-tertiary mt-4 relative z-10"
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
            }}
          >
            Нажмите в любом месте для быстрого старта
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IntroOverlay;