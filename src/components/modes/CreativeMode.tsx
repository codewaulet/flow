import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from "../../stores/useSettingsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Slider } from '../ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/Select';
import { Palette, Play, Pause, RotateCcw, Sparkles, Brush, Wand2 } from 'lucide-react';

interface CreativeModeProps {
  isActive: boolean;
}

const CreativeMode: React.FC<CreativeModeProps> = ({ isActive }) => {
  const [isActiveSession, setIsActiveSession] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [creativeStyle, setCreativeStyle] = useState<'flow' | 'chaos' | 'minimal'>('flow');
  const [colorPalette, setColorPalette] = useState<'warm' | 'cool' | 'rainbow' | 'monochrome'>('warm');
  const [intensity, setIntensity] = useState(0.7);
  const [inspirationCount, setInspirationCount] = useState(0);
  
  const sessionRef = useRef<NodeJS.Timeout>();
  
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);

  const creativeStyles = {
    flow: { name: 'Поток', color: '#4caf50', description: 'Плавные, медитативные движения' },
    chaos: { name: 'Хаос', color: '#f44336', description: 'Динамичные, энергичные паттерны' },
    minimal: { name: 'Минимализм', color: '#9c27b0', description: 'Чистые, простые формы' }
  };

  const colorPalettes = {
    warm: { name: 'Теплые', colors: ['#ff6b6b', '#ffa726', '#ffeb3b'], description: 'Красные, оранжевые, желтые' },
    cool: { name: 'Холодные', colors: ['#2196f3', '#00bcd4', '#4caf50'], description: 'Синие, голубые, зеленые' },
    rainbow: { name: 'Радуга', colors: ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0'], description: 'Все цвета спектра' },
    monochrome: { name: 'Монохром', colors: ['#ffffff', '#e0e0e0', '#9e9e9e', '#424242'], description: 'Оттенки серого' }
  };

  const currentStyle = creativeStyles[creativeStyle];
  const currentPalette = colorPalettes[colorPalette];

  useEffect(() => {
    if (isActiveSession) {
      startCreativeSession();
    } else {
      stopCreativeSession();
    }

    return () => {
      stopCreativeSession();
    };
  }, [isActiveSession, creativeStyle, intensity]);

  const startCreativeSession = () => {
    setSessionTime(0);
    
    sessionRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
      
      // Случайные вдохновения
      if (Math.random() < 0.1) {
        setInspirationCount(prev => prev + 1);
      }
    }, 1000);
  };

  const stopCreativeSession = () => {
    if (sessionRef.current) {
      clearInterval(sessionRef.current);
    }
  };

  const resetSession = () => {
    stopCreativeSession();
    setSessionTime(0);
    setInspirationCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Основная карточка творчества */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            Творческий режим
          </CardTitle>
          <CardDescription>
            Визуальные эксперименты для вдохновения и креативности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Индикатор творчества */}
            <motion.div
              animate={{
                scale: isActiveSession ? [1, 1.1, 1] : 1,
                opacity: isActiveSession ? 1 : 0.6
              }}
              transition={{ duration: 2, repeat: isActiveSession ? Infinity : 0 }}
              className="relative mx-auto w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentStyle.color}20, ${currentStyle.color}10)`,
                border: `3px solid ${currentStyle.color}`
              }}
            >
      <motion.div
                animate={{
                  rotate: isActiveSession ? 360 : 0,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: isActiveSession ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentStyle.color}, ${currentStyle.color}cc)`,
                  color: 'white'
                }}
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
            </motion.div>

            {/* Текущий стиль */}
            <div className="space-y-2">
              <motion.h3
                key={creativeStyle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold"
                style={{ color: currentStyle.color }}
              >
                {currentStyle.name}
              </motion.h3>
              <p className="text-text-secondary">
                {currentStyle.description}
              </p>
            </div>

            {/* Цветовая палитра */}
            <div className="flex justify-center gap-2">
              {currentPalette.colors.map((color, index) => (
                <motion.div
                  key={index}
                  animate={{
                    scale: isActiveSession ? [1, 1.2, 1] : 1,
                    opacity: isActiveSession ? 1 : 0.6
                  }}
                  transition={{ 
                    duration: 1, 
                    delay: index * 0.1,
                    repeat: isActiveSession ? Infinity : 0
                  }}
                  className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

            {/* Статистика */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {formatTime(sessionTime)}
                </div>
                <div className="text-sm text-text-tertiary">Время</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {inspirationCount}
                </div>
                <div className="text-sm text-text-tertiary">Идей</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {Math.round(intensity * 100)}%
                </div>
                <div className="text-sm text-text-tertiary">Интенсивность</div>
              </div>
          </div>

            {/* Управление */}
            <div className="flex gap-3 justify-center">
              {!isActiveSession ? (
                <Button
                  onClick={() => setIsActiveSession(true)}
                  className="flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${currentStyle.color}, ${currentStyle.color}cc)`,
                    color: 'white'
                  }}
                >
                  <Play className="w-4 h-4" />
                  Начать
                </Button>
              ) : (
                <Button
                  onClick={() => setIsActiveSession(false)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Пауза
                </Button>
              )}
              
              <Button
                onClick={resetSession}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Сброс
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Стиль творчества */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brush className="w-4 h-4" />
              Стиль творчества
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={creativeStyle} onValueChange={(value: any) => setCreativeStyle(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="glass" style={{ color: currentStyle.color }}>
                    {currentStyle.name}
                  </Badge>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(creativeStyles).map(([key, style]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{style.name}</div>
                      <div className="text-xs text-text-tertiary">{style.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Цветовая палитра */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Цветовая палитра
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={colorPalette} onValueChange={(value: any) => setColorPalette(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {currentPalette.colors.slice(0, 3).map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm">{currentPalette.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(colorPalettes).map(([key, palette]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {palette.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{palette.name}</div>
                        <div className="text-xs text-text-tertiary">{palette.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Интенсивность */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Интенсивность творчества
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            min={0.1}
            max={1.0}
            step={0.1}
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            label="Интенсивность"
            unit=""
            description={`${Math.round(intensity * 100)}% - ${intensity < 0.3 ? 'Спокойно' : intensity < 0.7 ? 'Умеренно' : 'Энергично'}`}
          />
        </CardContent>
      </Card>

      {/* Быстрые настройки */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">Быстрые настройки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setMode('smooth');
                setSound('theta');
                setSpeed(0.6);
                setCreativeStyle('flow');
                setColorPalette('warm');
                setIntensity(0.5);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Brush className="w-5 h-5 text-green-500" />
              <span className="text-sm">Поток</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMode('dynamic');
                setSound('white_noise');
                setSpeed(1.5);
                setCreativeStyle('chaos');
                setColorPalette('rainbow');
                setIntensity(0.9);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Sparkles className="w-5 h-5 text-red-500" />
              <span className="text-sm">Хаос</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMode('smooth');
                setSound('ocean');
                setSpeed(0.3);
                setCreativeStyle('minimal');
                setColorPalette('monochrome');
                setIntensity(0.2);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Palette className="w-5 h-5 text-purple-500" />
              <span className="text-sm">Минимал</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreativeMode;