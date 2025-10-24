import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FLOW_MODES, FLOW_MODE_LABELS, FLOW_MODE_DESCRIPTIONS, FLOW_MODE_ICONS, SUB_MODES, SUB_MODE_LABELS, SUB_MODE_ICONS } from '../../constants';

const ModeSelector: React.FC = () => {
  const mode = useSettingsStore((state) => state.mode);
  const subMode = useSettingsStore((state) => state.subMode);
  const setMode = useSettingsStore((state) => state.setMode);
  const setSubMode = useSettingsStore((state) => state.setSubMode);

  const modeColors = {
    [FLOW_MODES.SMOOTH]: '#03a9f4',
    [FLOW_MODES.CRAWL]: '#ff9800',
    [FLOW_MODES.DYNAMIC]: '#9c27b0',
  };

  const subModeColors = {
    [SUB_MODES.SPIRAL]: '#4caf50',
    [SUB_MODES.WAVES]: '#00bcd4',
    [SUB_MODES.VORTEX]: '#e91e63',
  };

  return (
    <div className="space-y-6">
      {/* Основные режимы */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🌊</span>
            Основные режимы
          </CardTitle>
          <CardDescription>
            Выберите основной стиль визуализации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {Object.values(FLOW_MODES).map((modeValue, index) => (
              <motion.button
                key={modeValue}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode(modeValue)}
                className={`relative p-4 rounded-xl transition-all duration-300 text-left ${
                  mode === modeValue
                    ? 'ring-2 ring-opacity-50'
                    : 'hover:bg-glass-light'
                }`}
                style={{
                  background: mode === modeValue 
                    ? `linear-gradient(135deg, ${modeColors[modeValue]}20, ${modeColors[modeValue]}10)`
                    : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${
                    mode === modeValue 
                      ? `${modeColors[modeValue]}40` 
                      : 'rgba(255, 255, 255, 0.1)'
                  }`,
                  ringColor: mode === modeValue ? modeColors[modeValue] : 'transparent'
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: `${modeColors[modeValue]}20`,
                      color: modeColors[modeValue]
                    }}
                  >
                    {FLOW_MODE_ICONS[modeValue]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-text-primary">
                        {FLOW_MODE_LABELS[modeValue]}
                      </h3>
                      {mode === modeValue && (
                        <Badge variant="glass" style={{ color: modeColors[modeValue] }}>
                          Активен
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">
                      {FLOW_MODE_DESCRIPTIONS[modeValue]}
                    </p>
                  </div>
                </div>
                
                {/* Индикатор активности */}
                {mode === modeValue && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-3 h-3 rounded-full"
                    style={{ backgroundColor: modeColors[modeValue] }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Подрежимы */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🌀</span>
            Подрежимы
          </CardTitle>
          <CardDescription>
            Дополнительные паттерны для выбранного режима
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(SUB_MODES).map((subModeValue, index) => (
              <motion.button
                key={subModeValue}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSubMode(subModeValue)}
                className={`relative p-4 rounded-xl transition-all duration-300 text-center ${
                  subMode === subModeValue
                    ? 'ring-2 ring-opacity-50'
                    : 'hover:bg-glass-light'
                }`}
                style={{
                  background: subMode === subModeValue 
                    ? `linear-gradient(135deg, ${subModeColors[subModeValue]}20, ${subModeColors[subModeValue]}10)`
                    : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${
                    subMode === subModeValue 
                      ? `${subModeColors[subModeValue]}40` 
                      : 'rgba(255, 255, 255, 0.1)'
                  }`,
                  ringColor: subMode === subModeValue ? subModeColors[subModeValue] : 'transparent'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mx-auto mb-2"
                  style={{
                    backgroundColor: `${subModeColors[subModeValue]}20`,
                    color: subModeColors[subModeValue]
                  }}
                >
                  {SUB_MODE_ICONS[subModeValue]}
                </div>
                <h4 className="text-sm font-medium text-text-primary mb-1">
                  {SUB_MODE_LABELS[subModeValue]}
                </h4>
                
                {/* Индикатор активности */}
                {subMode === subModeValue && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: subModeColors[subModeValue] }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Предварительный просмотр */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">👁️</span>
            Предварительный просмотр
          </CardTitle>
          <CardDescription>
            Текущая комбинация режимов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-glass-light">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
              style={{
                background: `linear-gradient(135deg, ${modeColors[mode]}20, ${subModeColors[subMode]}20)`,
                color: modeColors[mode]
              }}
            >
              {FLOW_MODE_ICONS[mode]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-text-primary">
                  {FLOW_MODE_LABELS[mode]}
                </h3>
                <span className="text-text-tertiary">+</span>
                <h4 className="text-base font-medium text-text-secondary">
                  {SUB_MODE_LABELS[subMode]}
                </h4>
              </div>
              <p className="text-sm text-text-tertiary">
                {FLOW_MODE_DESCRIPTIONS[mode]} с эффектом {SUB_MODE_LABELS[subMode].toLowerCase()}
              </p>
            </div>
            <div className="flex gap-1">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0
                }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: modeColors[mode] }}
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5
                }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: subModeColors[subMode] }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeSelector;