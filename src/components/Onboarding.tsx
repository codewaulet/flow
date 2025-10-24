import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Sparkles, Zap, Heart, Brain } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { STORAGE_KEYS } from '../constants';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  features: string[];
  preview?: React.ReactNode;
}

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Добро пожаловать в Flow',
      subtitle: 'Интерактивный опыт потока',
      description: 'Погрузитесь в мир медитативных визуализаций с частицами, которые реагируют на ваши движения и создают уникальные паттерны.',
      icon: <Sparkles className="w-8 h-8" />,
      color: '#03a9f4',
      gradient: 'linear-gradient(135deg, #03a9f4, #00bcd4)',
      features: ['Интерактивные частицы', 'Медитативные звуки', 'Адаптивные паттерны']
    },
    {
      id: 'interaction',
      title: 'Интуитивное управление',
      subtitle: 'Жесты и клавиатура',
      description: 'Управляйте потоком с помощью жестов на мобильных устройствах или клавиш на компьютере. Долгий тап или пробел для ускорения.',
      icon: <Zap className="w-8 h-8" />,
      color: '#4caf50',
      gradient: 'linear-gradient(135deg, #4caf50, #66ff99)',
      features: ['Жесты на мобильных', 'Клавиатурные сочетания', 'Тройной тап для настроек']
    },
    {
      id: 'modes',
      title: 'Разнообразные режимы',
      subtitle: 'Для каждого настроения',
      description: 'Выберите из множества режимов: медитативный поток, динамичные паттерны или эпические эффекты в стиле "Звёздных войн".',
      icon: <Brain className="w-8 h-8" />,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0, #e91e63)',
      features: ['Медитативные режимы', 'Динамичные паттерны', 'Эпические эффекты']
    },
    {
      id: 'personalization',
      title: 'Персонализация',
      subtitle: 'Настройте под себя',
      description: 'Адаптируйте опыт под свои предпочтения: скорость, звуки, эффекты и производительность. Создайте идеальную атмосферу для концентрации или релаксации.',
      icon: <Heart className="w-8 h-8" />,
      color: '#ff9800',
      gradient: 'linear-gradient(135deg, #ff9800, #ff5722)',
      features: ['Настройка скорости', 'Выбор звуков', 'Управление эффектами']
    }
  ];

  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (!hasCompleted) {
      setIsVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      {/* Кнопка закрытия */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={skipOnboarding}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-glass-medium border border-glass-strong flex items-center justify-center text-text-primary hover:bg-glass-strong transition-all duration-300"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Основной контент */}
      <div className="relative z-10 max-w-2xl w-full mx-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Card 
            variant="glass" 
            className="overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <CardContent className="p-8">
              {/* Градиентный фон */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: currentStepData.gradient
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
                className="text-center mb-6 relative z-10"
              >
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: currentStepData.gradient,
                    color: 'white',
                    boxShadow: `0 8px 32px ${currentStepData.color}40`
                  }}
                >
                  {currentStepData.icon}
                </div>
              </motion.div>

              {/* Заголовок */}
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-2 text-center relative z-10"
                style={{ 
                  color: currentStepData.color,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
                }}
              >
                {currentStepData.title}
              </motion.h1>

              {/* Подзаголовок */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-text-secondary mb-4 text-center relative z-10 font-medium"
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                }}
              >
                {currentStepData.subtitle}
              </motion.h2>

              {/* Описание */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-text-primary leading-relaxed mb-6 relative z-10 text-base text-center"
                style={{ 
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
                }}
              >
                {currentStepData.description}
              </motion.div>

              {/* Особенности */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-2 mb-8 relative z-10"
              >
                {currentStepData.features.map((feature, index) => (
                  <Badge 
                    key={index}
                    variant="glass"
                    style={{ color: currentStepData.color }}
                    className="text-xs"
                  >
                    {feature}
                  </Badge>
                ))}
              </motion.div>

              {/* Индикатор прогресса */}
              <div className="flex justify-center space-x-2 mb-8 relative z-10">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === currentStep ? 'w-8' : 'w-2'
                    }`}
                    style={{
                      backgroundColor: index === currentStep 
                        ? currentStepData.color 
                        : 'rgba(255, 255, 255, 0.3)',
                      boxShadow: index === currentStep 
                        ? `0 0 20px ${currentStepData.color}40` 
                        : 'none'
                    }}
                  />
                ))}
              </div>

              {/* Навигация */}
              <div className="flex justify-between items-center relative z-10">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={skipOnboarding}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    Пропустить
                  </Button>

                  <Button
                    onClick={nextStep}
                    style={{
                      background: currentStepData.gradient,
                      color: 'white',
                      boxShadow: `0 8px 32px ${currentStepData.color}40`
                    }}
                    className="flex items-center gap-2"
                  >
                    {currentStep === steps.length - 1 ? 'Начать' : 'Далее'}
                    {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Onboarding;