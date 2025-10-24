import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Card, CardContent } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import { PERFORMANCE_PRESETS } from '../../constants';

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
      color: '#03a9f4',
    },
    {
      id: 'flicker-alpha',
      label: 'Мерцание яркости',
      icon: '💫',
      enabled: flickerAlpha,
      toggle: () => setFlickerAlpha(!flickerAlpha),
      color: '#4caf50',
    },
    {
      id: 'trails',
      label: 'Следы частиц',
      icon: '🌠',
      enabled: showTrails,
      toggle: () => setShowTrails(!showTrails),
      color: '#9c27b0',
    }
  ];

  const currentPreset = Object.values(PERFORMANCE_PRESETS).find(
    preset => preset.value === particleCount
  ) || PERFORMANCE_PRESETS.BALANCED;

  return (
    <div className="space-y-4">
      {/* Переключатели эффектов */}
      <div className="grid grid-cols-1 gap-3">
        {toggles.map((toggle, index) => (
          <motion.div
            key={toggle.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              variant="glass" 
              className={`p-4 transition-all duration-300 ${
                toggle.enabled ? 'ring-2 ring-opacity-50' : ''
              }`}
              style={{
                ringColor: toggle.enabled ? toggle.color : 'transparent'
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{
                        backgroundColor: `${toggle.color}20`,
                        color: toggle.color
                      }}
                    >
                      {toggle.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {toggle.label}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {toggle.enabled ? 'Включено' : 'Выключено'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={toggle.enabled}
                    onCheckedChange={toggle.toggle}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Производительность */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{
                backgroundColor: `${currentPreset.color}20`,
                color: currentPreset.color
              }}
            >
              {currentPreset.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Производительность
              </p>
              <p className="text-xs text-text-tertiary">
                {particleCount} частиц
              </p>
            </div>
          </div>
          <Badge 
            variant="glass"
            style={{ color: currentPreset.color }}
          >
            {currentPreset.label}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {Object.values(PERFORMANCE_PRESETS).map((preset) => (
            <motion.button
              key={preset.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setParticleCount(preset.value)}
              className={`p-3 rounded-lg transition-all duration-300 text-center ${
                particleCount === preset.value
                  ? 'bg-glass-strong border border-glass-medium'
                  : 'bg-glass-light hover:bg-glass-medium'
              }`}
            >
              <div className="text-lg mb-1">{preset.icon}</div>
              <div className="text-xs font-medium text-text-primary">
                {preset.label}
              </div>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Индикатор активных эффектов */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-text-tertiary">Активные эффекты:</span>
          <div className="flex gap-2">
            {[flickerSize, flickerAlpha, showTrails].map((active, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    scale: active ? [1, 1.3, 1] : 1,
                    opacity: active ? 1 : 0.4
                  }}
                  transition={{
                    duration: 2,
                    repeat: active ? Infinity : 0,
                    delay: index * 0.2
                  }}
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: toggles[index].color
                  }}
                />
                {active && (
                  <motion.div
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.6, 0, 0.6]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: toggles[index].color
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuickSettings;
