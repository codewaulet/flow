import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';

const QuickSettings: React.FC = () => {
  const flickerSize = useSettingsStore((state) => state.flickerSize);
  const flickerAlpha = useSettingsStore((state) => state.flickerAlpha);
  const showTrails = useSettingsStore((state) => state.showTrails);
  const particleCount = useSettingsStore((state) => state.particleCount);
  const setFlickerSize = useSettingsStore((state) => state.setFlickerSize);
  const setFlickerAlpha = useSettingsStore((state) => state.setFlickerAlpha);
  const setShowTrails = useSettingsStore((state) => state.setShowTrails);
  const setParticleCount = useSettingsStore((state) => state.setParticleCount);

  const toggles = [
    {
      id: 'flicker-size',
      label: 'Мерцание размера',
      icon: '✨',
      enabled: flickerSize,
      toggle: () => setFlickerSize(!flickerSize),
      color: '#00e5cc'
    },
    {
      id: 'flicker-alpha',
      label: 'Мерцание яркости',
      icon: '💫',
      enabled: flickerAlpha,
      toggle: () => setFlickerAlpha(!flickerAlpha),
      color: '#66ff99'
    },
    {
      id: 'trails',
      label: 'Следы частиц',
      icon: '🌠',
      enabled: showTrails,
      toggle: () => setShowTrails(!showTrails),
      color: '#1e88e5'
    }
  ];

  const performancePresets = [
    { value: 500, emoji: '🐢', label: 'Эко' },
    { value: 1000, emoji: '⚡', label: 'Баланс' },
    { value: 1500, emoji: '🚀', label: 'Макс' }
  ];

  return (
    <div className="space-y-4">
      {/* Быстрые переключатели */}
      <div className="grid grid-cols-3 gap-2">
        {toggles.map((toggle) => (
          <motion.button
            key={toggle.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggle.toggle}
            className="relative p-3 rounded-xl transition-all duration-200"
            style={{
              background: toggle.enabled 
                ? `linear-gradient(135deg, ${toggle.color}20, ${toggle.color}10)`
                : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${toggle.enabled ? toggle.color + '40' : 'rgba(255, 255, 255, 0.1)'}`,
              boxShadow: toggle.enabled ? `0 4px 16px ${toggle.color}20` : 'none'
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{toggle.icon}</span>
              <span className="text-xs text-white/70 text-center leading-tight">
                {toggle.label}
              </span>
            </div>
            
            {/* Индикатор активности */}
            {toggle.enabled && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: toggle.color }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Быстрая настройка производительности */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">Производительность</span>
          <span className="text-xs font-medium" style={{ color: '#00e5cc' }}>
            {particleCount} частиц
          </span>
        </div>
        
        <div className="flex gap-2">
          {performancePresets.map((preset) => (
            <motion.button
              key={preset.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setParticleCount(preset.value)}
              className={`
                flex-1 py-2 px-3 rounded-lg transition-all duration-200
                flex items-center justify-center gap-2
              `}
              style={{
                background: particleCount === preset.value 
                  ? 'linear-gradient(135deg, #00e5cc20, #00e5cc10)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${
                  particleCount === preset.value 
                    ? 'rgba(0, 229, 204, 0.4)' 
                    : 'rgba(255, 255, 255, 0.1)'
                }`
              }}
            >
              <span className="text-lg">{preset.emoji}</span>
              <span className="text-xs text-white/80">{preset.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Визуальный индикатор активных эффектов */}
      <div className="flex items-center justify-center gap-2 py-2">
        {[flickerSize, flickerAlpha, showTrails].map((active, index) => (
          <motion.div
            key={index}
            animate={{
              scale: active ? [1, 1.2, 1] : 1,
              opacity: active ? 1 : 0.3
            }}
            transition={{
              duration: 2,
              repeat: active ? Infinity : 0,
              delay: index * 0.2
            }}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: index === 0 ? '#00e5cc' : index === 1 ? '#66ff99' : '#1e88e5'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickSettings;
