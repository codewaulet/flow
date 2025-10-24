import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { SOUND_TYPES, SOUND_LABELS, SOUND_DESCRIPTIONS } from '../../constants';

const SoundControl: React.FC = () => {
  const sound = useSettingsStore((state) => state.sound);
  const setSound = useSettingsStore((state) => state.setSound);

  const soundOptions = [
    {
      value: SOUND_TYPES.NONE,
      label: SOUND_LABELS[SOUND_TYPES.NONE],
      description: SOUND_DESCRIPTIONS[SOUND_TYPES.NONE],
      icon: '🔇',
      color: '#666666',
    },
    {
      value: SOUND_TYPES.THETA,
      label: SOUND_LABELS[SOUND_TYPES.THETA],
      description: SOUND_DESCRIPTIONS[SOUND_TYPES.THETA],
      icon: '🧘',
      color: '#4caf50',
    },
    {
      value: SOUND_TYPES.WHITE_NOISE,
      label: SOUND_LABELS[SOUND_TYPES.WHITE_NOISE],
      description: SOUND_DESCRIPTIONS[SOUND_TYPES.WHITE_NOISE],
      icon: '🌊',
      color: '#00bcd4',
    },
    {
      value: SOUND_TYPES.RAIN,
      label: SOUND_LABELS[SOUND_TYPES.RAIN],
      description: SOUND_DESCRIPTIONS[SOUND_TYPES.RAIN],
      icon: '🌧️',
      color: '#2196f3',
    },
    {
      value: SOUND_TYPES.OCEAN,
      label: SOUND_LABELS[SOUND_TYPES.OCEAN],
      description: SOUND_DESCRIPTIONS[SOUND_TYPES.OCEAN],
      icon: '🌊',
      color: '#1e88e5',
    }
  ];

  const currentSound = soundOptions.find(s => s.value === sound) || soundOptions[0];

  return (
    <div className="space-y-6">
      {/* Селектор звука */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🎵</span>
            Аудио окружение
          </CardTitle>
          <CardDescription>
            Выберите звуковое сопровождение для вашего опыта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={sound} onValueChange={setSound}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{currentSound.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{currentSound.label}</div>
                    <div className="text-sm text-text-tertiary">{currentSound.description}</div>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {soundOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-text-tertiary">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Визуальные карточки звуков */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🎧</span>
            Быстрый выбор
          </CardTitle>
          <CardDescription>
            Нажмите на карточку для быстрого переключения
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {soundOptions.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSound(option.value)}
                className={`relative p-4 rounded-xl transition-all duration-300 text-center ${
                  sound === option.value
                    ? 'ring-2 ring-opacity-50'
                    : 'hover:bg-glass-light'
                }`}
                style={{
                  background: sound === option.value 
                    ? `linear-gradient(135deg, ${option.color}20, ${option.color}10)`
                    : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${
                    sound === option.value 
                      ? `${option.color}40` 
                      : 'rgba(255, 255, 255, 0.1)'
                  }`,
                  // ringColor: sound === option.value ? option.color : 'transparent'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mx-auto mb-2"
                  style={{
                    backgroundColor: `${option.color}20`,
                    color: option.color
                  }}
                >
                  {option.icon}
                </div>
                <h4 className="text-sm font-medium text-text-primary mb-1">
                  {option.label}
                </h4>
                <p className="text-xs text-text-tertiary">
                  {option.description}
                </p>
                
                {/* Индикатор активности */}
                {sound === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Индикатор текущего звука */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ 
                scale: sound !== SOUND_TYPES.NONE ? [1, 1.1, 1] : 1,
                rotate: sound !== SOUND_TYPES.NONE ? [0, 5, -5, 0] : 0
              }}
              transition={{ duration: 0.5, repeat: sound !== SOUND_TYPES.NONE ? Infinity : 0, repeatDelay: 2 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                backgroundColor: `${currentSound.color}20`,
                color: currentSound.color
              }}
            >
              {currentSound.icon}
            </motion.div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary">
                {currentSound.label}
              </h3>
              <p className="text-sm text-text-tertiary">
                {currentSound.description}
              </p>
            </div>
            
            {sound !== SOUND_TYPES.NONE && (
              <Badge variant="glass" style={{ color: currentSound.color }}>
                Воспроизводится
              </Badge>
            )}
          </div>
          
          {/* Визуальная волна звука */}
          {sound !== SOUND_TYPES.NONE && (
            <div className="flex justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleY: [0.5, 1, 0.5],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                  className="w-1 rounded-full"
                  style={{
                    backgroundColor: currentSound.color,
                    height: '20px'
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SoundControl;