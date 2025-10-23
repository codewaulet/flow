import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useIsMobile } from '../../hooks/useMediaQuery';
import QuickSettings from './QuickSettings';
import ModeSelector from './ModeSelector';
import SoundControl from './SoundControl';
import SpeedControl from './SpeedControl';
import MeditationMode from '../modes/MeditationMode';
import FocusMode from '../modes/FocusMode';
import CreativeMode from '../modes/CreativeMode';
import AudioReactiveMode from '../modes/AudioReactiveMode';

const SettingsPanel: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<'none' | 'meditation' | 'focus' | 'creative' | 'audio'>('none');
  const { isPanelOpen, closePanel, activeSection, setActiveSection } = useSettingsStore();
  
  // Определяем мобильное устройство через SSR-безопасный хук
  const isMobile = useIsMobile();
  
  // Автозакрытие через 5 секунд неактивности (только мобилка)
  useEffect(() => {
    if (!isPanelOpen || !isMobile) return;
    
    const timer = setTimeout(() => {
      closePanel();
    }, 5000);
    
    const handleInteraction = () => {
      clearTimeout(timer);
    };
    
    panelRef.current?.addEventListener('touchstart', handleInteraction);
    panelRef.current?.addEventListener('click', handleInteraction);
    
    return () => {
      clearTimeout(timer);
      panelRef.current?.removeEventListener('touchstart', handleInteraction);
      panelRef.current?.removeEventListener('click', handleInteraction);
    };
  }, [isPanelOpen, isMobile, closePanel]);

  // Варианты анимации
  const variants = {
    desktop: {
      hidden: { x: '100%', opacity: 0 },
      visible: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 }
    },
    mobile: {
      hidden: { y: '100%', opacity: 0 },
      visible: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 }
    }
  };

  const currentVariants = isMobile ? variants.mobile : variants.desktop;

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <>
          {/* Затемнение фона */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={closePanel}
          />
          
          {/* Панель настроек */}
          <motion.div
            ref={panelRef}
            variants={currentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
            className={`
              fixed z-50 backdrop-blur-xl
              ${isMobile 
                ? 'bottom-0 left-0 right-0 rounded-t-3xl max-h-[70vh]' 
                : 'right-0 top-0 bottom-0 w-80 rounded-l-2xl'
              }
            `}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.05) 0%, rgba(30, 136, 229, 0.05) 100%)',
              borderLeft: isMobile ? 'none' : '1px solid rgba(0, 229, 204, 0.2)',
              borderTop: isMobile ? '1px solid rgba(0, 229, 204, 0.2)' : 'none',
              boxShadow: isMobile 
                ? '0 -4px 24px rgba(0, 229, 204, 0.15)' 
                : '-4px 0 24px rgba(0, 229, 204, 0.15)'
            }}
          >
            {/* Индикатор для свайпа вниз (мобилка) */}
            {isMobile && (
              <div className="w-full flex justify-center py-2">
                <div 
                  className="w-12 h-1 rounded-full"
                  style={{ backgroundColor: 'rgba(0, 229, 204, 0.3)' }}
                />
              </div>
            )}
            
            {/* Заголовок */}
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-medium text-white">Настройки</h2>
              <button
                onClick={closePanel}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <span className="text-white/80">×</span>
              </button>
            </div>
            
            {/* Контент */}
            <div className={`${isMobile ? 'overflow-y-auto' : 'h-full overflow-y-auto'} px-6 pb-6`}>
              {/* Режимы приложения */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3" style={{ color: '#00e5cc' }}>
                  Специальные режимы
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveMode(activeMode === 'meditation' ? 'none' : 'meditation')}
                    className={`p-3 rounded-lg transition-all ${
                      activeMode === 'meditation' 
                        ? 'bg-green-500/20 border-green-500/40' 
                        : 'bg-white/5 border-white/10'
                    } border`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🧘</div>
                      <div className="text-xs text-white/80">Медитация</div>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveMode(activeMode === 'focus' ? 'none' : 'focus')}
                    className={`p-3 rounded-lg transition-all ${
                      activeMode === 'focus' 
                        ? 'bg-red-500/20 border-red-500/40' 
                        : 'bg-white/5 border-white/10'
                    } border`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🍅</div>
                      <div className="text-xs text-white/80">Фокус</div>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveMode(activeMode === 'creative' ? 'none' : 'creative')}
                    className={`p-3 rounded-lg transition-all ${
                      activeMode === 'creative' 
                        ? 'bg-purple-500/20 border-purple-500/40' 
                        : 'bg-white/5 border-white/10'
                    } border`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎨</div>
                      <div className="text-xs text-white/80">Творчество</div>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveMode(activeMode === 'audio' ? 'none' : 'audio')}
                    className={`p-3 rounded-lg transition-all ${
                      activeMode === 'audio' 
                        ? 'bg-orange-500/20 border-orange-500/40' 
                        : 'bg-white/5 border-white/10'
                    } border`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎤</div>
                      <div className="text-xs text-white/80">Аудио</div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Быстрые настройки всегда видны */}
              <QuickSettings />
              
              {/* Секции настроек */}
              <div className="space-y-4 mt-6">
                {/* Режимы */}
                <Section
                  title="Режимы визуализации"
                  isActive={activeSection === 'modes'}
                  onClick={() => setActiveSection(activeSection === 'modes' ? null : 'modes')}
                >
                  <ModeSelector />
                </Section>
                
                {/* Звуки */}
                <Section
                  title="Звуковое сопровождение"
                  isActive={activeSection === 'sounds'}
                  onClick={() => setActiveSection(activeSection === 'sounds' ? null : 'sounds')}
                >
                  <SoundControl />
                </Section>
                
                {/* Производительность */}
                <Section
                  title="Скорость и эффекты"
                  isActive={activeSection === 'performance'}
                  onClick={() => setActiveSection(activeSection === 'performance' ? null : 'performance')}
                >
                  <SpeedControl />
                </Section>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Специальные режимы с уникальными ключами для AnimatePresence */}
      <MeditationMode key="meditation-mode" isActive={activeMode === 'meditation'} />
      <FocusMode key="focus-mode" isActive={activeMode === 'focus'} />
      <CreativeMode key="creative-mode" isActive={activeMode === 'creative'} />
      <AudioReactiveMode key="audio-reactive-mode" isActive={activeMode === 'audio'} />
    </AnimatePresence>
  );
};

// Компонент секции
interface SectionProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, isActive, onClick, children }) => {
  return (
    <div 
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: isActive 
          ? 'rgba(0, 229, 204, 0.08)' 
          : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${isActive ? 'rgba(0, 229, 204, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
      }}
    >
      <button
        onClick={onClick}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-all hover:bg-white/5"
      >
        <span className="text-sm font-medium text-white/90">{title}</span>
        <motion.div
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/60"
        >
          ▼
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPanel;
