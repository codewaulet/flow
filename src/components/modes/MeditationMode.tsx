import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from "../../stores/useSettingsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Slider } from '../ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/Select';
import { Heart, Play, Pause, RotateCcw, Timer, Wind } from 'lucide-react';

interface MeditationModeProps {
  isActive: boolean;
}

const MeditationMode: React.FC<MeditationModeProps> = ({ isActive }) => {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [breathPattern, setBreathPattern] = useState<'4-4-4-4' | '4-7-8' | 'box'>('4-4-4-4');
  const [sessionDuration, setSessionDuration] = useState(10);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const sessionRef = useRef<NodeJS.Timeout>();
  
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);

  const patterns = {
    '4-4-4-4': { inhale: 4, hold: 4, exhale: 4, pause: 4, name: 'Квадратное дыхание' },
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, pause: 0, name: '4-7-8 техника' },
    'box': { inhale: 4, hold: 4, exhale: 4, pause: 4, name: 'Бокс дыхание' }
  };

  const currentPattern = patterns[breathPattern];

  const phaseColors = {
    inhale: '#4caf50',
    hold: '#ff9800', 
    exhale: '#2196f3',
    pause: '#9c27b0'
  };

  const phaseLabels = {
    inhale: 'Вдох',
    hold: 'Задержка',
    exhale: 'Выдох',
    pause: 'Пауза'
  };

  useEffect(() => {
    if (isSessionActive) {
      startBreathingCycle();
    } else {
      stopBreathingCycle();
    }
    
    return () => {
      stopBreathingCycle();
    };
  }, [isSessionActive, breathPattern]);

  const startBreathingCycle = () => {
    let phaseIndex = 0;
    const phases: Array<'inhale' | 'hold' | 'exhale' | 'pause'> = ['inhale', 'hold', 'exhale', 'pause'];
    
    const cycle = () => {
      const currentPhase = phases[phaseIndex];
      setBreathPhase(currentPhase);
      
      const duration = currentPattern[currentPhase] * 1000;
      
      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        if (isSessionActive) {
          if (phaseIndex === 0) {
            setBreathCount(prev => prev + 1);
          }
          cycle();
        }
      }, duration);
    };
    
    cycle();
  };

  const stopBreathingCycle = () => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSessionTime(0);
    
    sessionRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  const stopSession = () => {
    setIsSessionActive(false);
    if (sessionRef.current) {
      clearInterval(sessionRef.current);
    }
  };

  const resetSession = () => {
    stopSession();
    setBreathCount(0);
    setSessionTime(0);
    setBreathPhase('inhale');
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
      {/* Основная карточка медитации */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Медитативный режим
          </CardTitle>
          <CardDescription>
            Управляемое дыхание для глубокой релаксации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Индикатор дыхания */}
            <motion.div
              animate={{
                scale: breathPhase === 'inhale' ? [1, 1.2, 1] : 1,
                opacity: isSessionActive ? 1 : 0.6
              }}
              transition={{ duration: 2, repeat: isSessionActive ? Infinity : 0 }}
              className="relative mx-auto w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${phaseColors[breathPhase]}20, ${phaseColors[breathPhase]}10)`,
                border: `3px solid ${phaseColors[breathPhase]}`
              }}
            >
              <motion.div
                animate={{
                  scale: breathPhase === 'inhale' ? [1, 1.1, 1] : 1,
                  rotate: breathPhase === 'hold' ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 1, repeat: isSessionActive ? Infinity : 0 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${phaseColors[breathPhase]}, ${phaseColors[breathPhase]}cc)`,
                  color: 'white'
                }}
              >
                <Wind className="w-8 h-8" />
              </motion.div>
            </motion.div>

            {/* Текущая фаза */}
            <div className="space-y-2">
              <motion.h3
                key={breathPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold"
                style={{ color: phaseColors[breathPhase] }}
              >
                {phaseLabels[breathPhase]}
              </motion.h3>
              <p className="text-text-secondary">
                {currentPattern.name}
              </p>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {breathCount}
                </div>
                <div className="text-sm text-text-tertiary">Циклов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {formatTime(sessionTime)}
                </div>
                <div className="text-sm text-text-tertiary">Время</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {currentPattern[breathPhase]}
                </div>
                <div className="text-sm text-text-tertiary">Секунд</div>
              </div>
            </div>

            {/* Управление */}
            <div className="flex gap-3 justify-center">
              {!isSessionActive ? (
                <Button
                  onClick={startSession}
                  className="flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #4caf50, #66ff99)',
                    color: 'white'
                  }}
                >
                  <Play className="w-4 h-4" />
                  Начать
                </Button>
              ) : (
                <Button
                  onClick={stopSession}
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
        {/* Паттерн дыхания */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Паттерн дыхания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={breathPattern} onValueChange={(value: any) => setBreathPattern(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="glass" style={{ color: phaseColors[breathPhase] }}>
                    {currentPattern.name}
                  </Badge>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(patterns).map(([key, pattern]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{pattern.name}</div>
                      <div className="text-xs text-text-tertiary">
                        {pattern.inhale}-{pattern.hold}-{pattern.exhale}-{pattern.pause}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Длительность сессии */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Длительность сессии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              min={5}
              max={60}
              step={5}
              value={sessionDuration}
              onChange={(e) => setSessionDuration(parseInt(e.target.value))}
              label="Минуты"
              unit=" мин"
              description={`${sessionDuration} минут медитации`}
            />
          </CardContent>
        </Card>
      </div>

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
                setSpeed(0.5);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm">Медитация</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMode('smooth');
                setSound('rain');
                setSpeed(0.8);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Wind className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Релакс</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMode('smooth');
                setSound('ocean');
                setSpeed(0.3);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Timer className="w-5 h-5 text-green-500" />
              <span className="text-sm">Сон</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MeditationMode;