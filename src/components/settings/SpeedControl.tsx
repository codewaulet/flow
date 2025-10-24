import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Badge } from '../ui/Badge';
import { Gauge, Zap, Turtle, Rabbit } from 'lucide-react';

const SpeedControl: React.FC = () => {
  const baseSpeed = useSettingsStore((state) => state.baseSpeed);
  const setSpeed = useSettingsStore((state) => state.setSpeed);

  const speedPresets = [
    { value: 0.5, label: 'Медленно', icon: Turtle, color: '#4caf50', description: 'Медитативный темп' },
    { value: 1.0, label: 'Нормально', icon: Gauge, color: '#03a9f4', description: 'Сбалансированная скорость' },
    { value: 1.5, label: 'Быстро', icon: Zap, color: '#ff9800', description: 'Динамичный поток' },
    { value: 2.0, label: 'Максимум', icon: Rabbit, color: '#f44336', description: 'Экстремальная скорость' }
  ];

  const currentPreset = speedPresets.find(preset => preset.value === baseSpeed) || speedPresets[1];

  const getSpeedColor = (speed: number) => {
    if (speed <= 0.5) return '#4caf50';
    if (speed <= 1.0) return '#03a9f4';
    if (speed <= 1.5) return '#ff9800';
    return '#f44336';
  };

  const getSpeedLabel = (speed: number) => {
    if (speed <= 0.5) return 'Медленно';
    if (speed <= 1.0) return 'Нормально';
    if (speed <= 1.5) return 'Быстро';
    return 'Максимум';
  };

  return (
    <div className="space-y-6">
      {/* Основной слайдер скорости */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            Скорость потока
          </CardTitle>
          <CardDescription>
            Настройте интенсивность движения частиц
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Slider
              min={0.1}
              max={3.0}
              step={0.1}
              value={baseSpeed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              label="Скорость"
              unit="x"
              description={`Текущая скорость: ${getSpeedLabel(baseSpeed)}`}
            />
            
            {/* Визуальный индикатор скорости */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-glass-light">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${getSpeedColor(baseSpeed)}20`,
                  color: getSpeedColor(baseSpeed)
                }}
              >
                <currentPreset.icon className="w-6 h-6" />
              </motion.div>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary">
                  {getSpeedLabel(baseSpeed)}
                </h3>
                <p className="text-sm text-text-tertiary">
                  {baseSpeed}x скорость
                </p>
              </div>
              
              <Badge variant="glass" style={{ color: getSpeedColor(baseSpeed) }}>
                {baseSpeed.toFixed(1)}x
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Быстрые пресеты */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            Быстрые пресеты
          </CardTitle>
          <CardDescription>
            Выберите готовую настройку скорости
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {speedPresets.map((preset, index) => (
              <motion.button
                key={preset.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSpeed(preset.value)}
                className={`relative p-4 rounded-xl transition-all duration-300 text-center ${
                  baseSpeed === preset.value
                    ? 'ring-2 ring-opacity-50'
                    : 'hover:bg-glass-light'
                }`}
                style={{
                  background: baseSpeed === preset.value 
                    ? `linear-gradient(135deg, ${preset.color}20, ${preset.color}10)`
                    : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${
                    baseSpeed === preset.value 
                      ? `${preset.color}40` 
                      : 'rgba(255, 255, 255, 0.1)'
                  }`,
                  // ringColor: baseSpeed === preset.value ? preset.color : 'transparent'
                }}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{
                    backgroundColor: `${preset.color}20`,
                    color: preset.color
                  }}
                >
                  <preset.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-medium text-text-primary mb-1">
                  {preset.label}
                </h4>
                <p className="text-xs text-text-tertiary mb-2">
                  {preset.description}
                </p>
                <Badge variant="glass" style={{ color: preset.color }}>
                  {preset.value}x
                </Badge>
                
                {/* Индикатор активности */}
                {baseSpeed === preset.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: preset.color }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Индикатор производительности */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-primary">Производительность</span>
            <Badge 
              variant="glass" 
              style={{ 
                color: baseSpeed > 2.0 ? '#f44336' : baseSpeed > 1.5 ? '#ff9800' : '#4caf50'
              }}
            >
              {baseSpeed > 2.0 ? 'Высокая нагрузка' : baseSpeed > 1.5 ? 'Средняя нагрузка' : 'Низкая нагрузка'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-tertiary">
              <span>Скорость рендеринга</span>
              <span>{Math.round(baseSpeed * 60)} FPS</span>
            </div>
            <div className="w-full bg-glass-light rounded-full h-2">
              <motion.div
                className="h-2 rounded-full"
                style={{
                  backgroundColor: getSpeedColor(baseSpeed),
                  width: `${(baseSpeed / 3.0) * 100}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(baseSpeed / 3.0) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          {baseSpeed > 2.0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2 rounded-lg bg-warning/10 border border-warning/20"
            >
              <p className="text-xs text-warning">
                ⚠️ Высокая скорость может снизить производительность на слабых устройствах
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeedControl;