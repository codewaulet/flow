import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from "../../stores/useSettingsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Slider } from '../ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/Select';
import { Target, Play, Pause, RotateCcw, Timer, Brain, Coffee } from 'lucide-react';

interface FocusModeProps {
  isActive: boolean;
}

const FocusMode: React.FC<FocusModeProps> = ({ isActive }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionType, setSessionType] = useState<'pomodoro' | 'deep' | 'sprint'>('pomodoro');
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  
  const sessionRef = useRef<NodeJS.Timeout>();
  
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);

  const sessionTypes = {
    pomodoro: { name: 'Помодоро', work: 25, break: 5, color: '#f44336' },
    deep: { name: 'Глубокий фокус', work: 90, break: 15, color: '#2196f3' },
    sprint: { name: 'Спринт', work: 15, break: 3, color: '#4caf50' }
  };

  const currentSession = sessionTypes[sessionType];

  useEffect(() => {
    if (isSessionActive) {
      startSession();
    } else {
      stopSession();
    }

    return () => {
      stopSession();
    };
  }, [isSessionActive, sessionType]);

  const startSession = () => {
    setWorkDuration(currentSession.work);
    setBreakDuration(currentSession.break);
    setSessionTime(0);
    setCurrentPhase('work');
    
    sessionRef.current = setInterval(() => {
      setSessionTime(prev => {
        const newTime = prev + 1;
        const currentDuration = currentPhase === 'work' ? workDuration : breakDuration;
        
        if (newTime >= currentDuration * 60) {
    if (currentPhase === 'work') {
            setCurrentPhase('break');
            setSessionTime(0);
            setCompletedSessions(prev => prev + 1);
    } else {
      setCurrentPhase('work');
            setSessionTime(0);
          }
        }
        
        return newTime;
      });
    }, 1000);
  };

  const stopSession = () => {
    if (sessionRef.current) {
      clearInterval(sessionRef.current);
    }
  };

  const resetSession = () => {
    stopSession();
    setSessionTime(0);
    setCurrentPhase('work');
    setCompletedSessions(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const currentDuration = currentPhase === 'work' ? workDuration : breakDuration;
    return (sessionTime / (currentDuration * 60)) * 100;
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Основная карточка фокуса */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Режим фокуса
          </CardTitle>
          <CardDescription>
            Структурированные сессии для максимальной продуктивности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Индикатор сессии */}
            <motion.div
              animate={{
                scale: isSessionActive ? [1, 1.05, 1] : 1,
                opacity: isSessionActive ? 1 : 0.6
              }}
              transition={{ duration: 2, repeat: isSessionActive ? Infinity : 0 }}
              className="relative mx-auto w-32 h-32 rounded-full flex items-center justify-center"
      style={{
                background: `linear-gradient(135deg, ${currentSession.color}20, ${currentSession.color}10)`,
                border: `3px solid ${currentSession.color}`
              }}
            >
              <motion.div
                animate={{
                  rotate: isSessionActive ? 360 : 0
                }}
                transition={{ duration: 20, repeat: isSessionActive ? Infinity : 0, ease: "linear" }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentSession.color}, ${currentSession.color}cc)`,
                  color: 'white'
                }}
              >
                <Brain className="w-8 h-8" />
              </motion.div>
              </motion.div>
              
            {/* Текущая фаза */}
            <div className="space-y-2">
              <motion.h3
                key={currentPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold"
                style={{ color: currentSession.color }}
              >
                {currentPhase === 'work' ? 'Работа' : 'Перерыв'}
              </motion.h3>
              <p className="text-text-secondary">
                {currentSession.name}
              </p>
            </div>

            {/* Прогресс */}
            <div className="space-y-4">
              <div className="text-4xl font-bold text-text-primary">
                {formatTime(sessionTime)}
              </div>
              
              <div className="w-full bg-glass-light rounded-full h-3">
                <motion.div
                  className="h-3 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${currentSession.color}, ${currentSession.color}cc)`,
                    width: `${getProgress()}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="text-sm text-text-tertiary">
                {Math.round(getProgress())}% завершено
          </div>
        </div>

        {/* Статистика */}
            <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {completedSessions}
            </div>
                <div className="text-sm text-text-tertiary">Сессий</div>
          </div>
          <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {currentPhase === 'work' ? workDuration : breakDuration}
            </div>
                <div className="text-sm text-text-tertiary">Минут</div>
          </div>
          <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {Math.floor(completedSessions * workDuration / 60)}ч
            </div>
                <div className="text-sm text-text-tertiary">Всего</div>
          </div>
        </div>

        {/* Управление */}
            <div className="flex gap-3 justify-center">
              {!isSessionActive ? (
                <Button
                  onClick={() => setIsSessionActive(true)}
                  className="flex items-center gap-2"
              style={{
                    background: `linear-gradient(135deg, ${currentSession.color}, ${currentSession.color}cc)`,
                    color: 'white'
                  }}
                >
                  <Play className="w-4 h-4" />
                  Начать
                </Button>
              ) : (
                <Button
                  onClick={() => setIsSessionActive(false)}
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
        {/* Тип сессии */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Тип сессии
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="glass" style={{ color: currentSession.color }}>
                    {currentSession.name}
                  </Badge>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sessionTypes).map(([key, session]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{session.name}</div>
                      <div className="text-xs text-text-tertiary">
                        {session.work}м / {session.break}м
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Настройки времени */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              Настройки времени
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider
                min={15}
                max={60}
                step={5}
                value={workDuration}
                onChange={(e) => setWorkDuration(parseInt(e.target.value))}
                label="Работа"
                unit=" мин"
                description={`${workDuration} минут работы`}
              />
              
              <Slider
                min={3}
                max={20}
                step={1}
                value={breakDuration}
                onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                label="Перерыв"
                unit=" мин"
                description={`${breakDuration} минут перерыва`}
              />
            </div>
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
                setMode('dynamic');
                setSound('white_noise');
                setSpeed(1.2);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Target className="w-5 h-5 text-red-500" />
              <span className="text-sm">Фокус</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMode('smooth');
                setSound('theta');
                setSpeed(0.8);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Brain className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Креатив</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMode('crawl');
                setSound('rain');
                setSpeed(1.0);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Coffee className="w-5 h-5 text-green-500" />
              <span className="text-sm">Спринт</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FocusMode;