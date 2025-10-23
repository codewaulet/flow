import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useIsMobile } from '../hooks/useMediaQuery';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isMobile = useIsMobile();

  const steps = [
    {
      title: 'Добро пожаловать в Flow',
      subtitle: 'Погружение в состояние потока',
      description: 'Flow — это состояние полной концентрации и погружения в деятельность. Научно доказано, что это состояние повышает продуктивность, креативность и общее благополучие.',
      icon: '🌊',
      color: '#00e5cc'
    },
    {
      title: 'Управление жестами',
      subtitle: isMobile ? 'Свайпы и касания' : 'Клавиатура и мышь',
      description: isMobile 
        ? 'Свайп вправо — открыть настройки\nСвайп вверх/вниз — смена режимов\nПинч — изменение скорости\nДвойной тап — звук вкл/выкл'
        : 'Пробел — ускорение\nСтрелки — смена режимов\nКолесо мыши — скорость\nКлик по краю — настройки',
      icon: isMobile ? '👆' : '🖱️',
      color: '#66ff99'
    },
    {
      title: 'Режимы визуализации',
      subtitle: 'Выберите свой поток',
      description: 'Smooth Flow — медитативное течение\nStar Wars Crawl — эпическая прокрутка\nDynamic Patterns — активные паттерны\nКаждый режим создает уникальную атмосферу',
      icon: '🌀',
      color: '#1e88e5'
    },
    {
      title: 'Звуковое сопровождение',
      subtitle: 'Биноуральные ритмы',
      description: 'Тета-волны для медитации\nБелый шум для концентрации\nДождь для релаксации\nОкеан для глубокого погружения',
      icon: '🎵',
      color: '#00b4d8'
    },
    {
      title: 'Готовы начать?',
      subtitle: 'Погрузитесь в поток',
      description: 'Настройте параметры под себя и начните свое путешествие в состояние потока. Помните: лучшие идеи приходят в моменты полной концентрации.',
      icon: '✨',
      color: '#ff6b6b'
    }
  ];

  const currentStepData = steps[currentStep];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #020818 0%, #051428 50%, #020818 100%)'
      }}
    >
      {/* Фоновые частицы */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: currentStepData.color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Основной контент */}
      <div className="relative z-10 max-w-md mx-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Иконка */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl mb-6"
          >
            {currentStepData.icon}
          </motion.div>

          {/* Заголовок */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-2"
            style={{ color: currentStepData.color }}
          >
            {currentStepData.title}
          </motion.h1>

          {/* Подзаголовок */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/80 mb-6"
          >
            {currentStepData.subtitle}
          </motion.h2>

          {/* Описание */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 leading-relaxed mb-8 whitespace-pre-line"
          >
            {currentStepData.description}
          </motion.div>

          {/* Индикатор прогресса */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'w-8' : ''
                }`}
                style={{
                  backgroundColor: index === currentStep 
                    ? currentStepData.color 
                    : 'rgba(255, 255, 255, 0.3)'
                }}
              />
            ))}
          </div>

          {/* Кнопки */}
          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-white/10'
              }`}
              style={{ color: currentStep === 0 ? '#666' : 'white' }}
            >
              Назад
            </motion.button>

            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={skipOnboarding}
                className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                Пропустить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                className="px-8 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: `linear-gradient(135deg, ${currentStepData.color}, ${currentStepData.color}80)`,
                  color: 'white',
                  boxShadow: `0 4px 20px ${currentStepData.color}40`
                }}
              >
                {currentStep === steps.length - 1 ? 'Начать' : 'Далее'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-20"
           style={{ 
             background: `radial-gradient(circle, ${currentStepData.color}, transparent)`,
             filter: 'blur(20px)'
           }} />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full opacity-20"
           style={{ 
             background: `radial-gradient(circle, ${currentStepData.color}, transparent)`,
             filter: 'blur(30px)'
           }} />
    </motion.div>
  );
};

export default Onboarding;
