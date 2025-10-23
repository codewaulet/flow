import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { FlowMode, SubMode } from '../../types';

const ModeSelector: React.FC = () => {
  const mode = useSettingsStore((state) => state.mode);
  const subMode = useSettingsStore((state) => state.subMode);
  const setMode = useSettingsStore((state) => state.setMode);
  const setSubMode = useSettingsStore((state) => state.setSubMode);

  const modes: { id: FlowMode; emoji: string; name: string; description: string; color: string }[] = [
    {
      id: 'smooth',
      emoji: '🌊',
      name: 'Плавный поток',
      description: 'Медитативное течение',
      color: '#00e5cc'
    },
    {
      id: 'crawl',
      emoji: '⭐',
      name: 'Звёздные войны',
      description: 'Эпическая прокрутка',
      color: '#66ff99'
    },
    {
      id: 'dynamic',
      emoji: '🌀',
      name: 'Динамика',
      description: 'Активные паттерны',
      color: '#1e88e5'
    }
  ];

  const subModes: { id: SubMode; emoji: string; name: string }[] = [
    { id: 'spiral', emoji: '🌀', name: 'Спираль' },
    { id: 'waves', emoji: '🌊', name: 'Волны' },
    { id: 'vortex', emoji: '🌪️', name: 'Вихрь' }
  ];

  return (
    <div className="space-y-4">
      {/* Основные режимы */}
      <div className="space-y-2">
        {modes.map((modeItem) => {
          const isActive = mode === modeItem.id;
          
          return (
            <motion.button
              key={modeItem.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode(modeItem.id)}
              className="w-full p-3 rounded-xl transition-all duration-200 text-left"
              style={{
                background: isActive 
                  ? `linear-gradient(135deg, ${modeItem.color}15, ${modeItem.color}05)`
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isActive ? modeItem.color + '30' : 'rgba(255, 255, 255, 0.08)'}`,
                boxShadow: isActive ? `0 4px 16px ${modeItem.color}15` : 'none'
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{modeItem.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: isActive ? modeItem.color : 'white' }}
                    >
                      {modeItem.name}
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: modeItem.color }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-white/50">{modeItem.description}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Подрежимы для динамического режима */}
      {mode === 'dynamic' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <span className="text-xs text-white/50 block mb-2">Выберите паттерн:</span>
          <div className="grid grid-cols-3 gap-2">
            {subModes.map((subModeItem) => {
              const isActive = subMode === subModeItem.id;
              
              return (
                <motion.button
                  key={subModeItem.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSubMode(subModeItem.id)}
                  className="p-3 rounded-lg transition-all duration-200"
                  style={{
                    background: isActive 
                      ? 'linear-gradient(135deg, #1e88e515, #1e88e505)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isActive ? '#1e88e530' : 'rgba(255, 255, 255, 0.08)'}`,
                    boxShadow: isActive ? '0 2px 12px #1e88e515' : 'none'
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">{subModeItem.emoji}</span>
                    <span className="text-xs text-white/70">{subModeItem.name}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ModeSelector;
