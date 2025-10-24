import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from "../../stores/useSettingsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Slider } from '../ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/Select';
import { Music, Play, Pause, RotateCcw, Volume2, Mic, Headphones } from 'lucide-react';

interface AudioReactiveModeProps {
  isActive: boolean;
}

const AudioReactiveMode: React.FC<AudioReactiveModeProps> = ({ isActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const [sensitivity, setSensitivity] = useState(0.7);
  const [reactiveMode, setReactiveMode] = useState<'bass' | 'treble' | 'full'>('full');
  const [visualizationType, setVisualizationType] = useState<'bars' | 'circle' | 'wave'>('bars');
  
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const microphoneRef = useRef<MediaStreamAudioSourceNode>();
  const animationRef = useRef<number>();
  
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);

  const reactiveModes = {
    bass: { name: 'Низкие частоты', color: '#f44336', description: 'Реакция на басы и ритм' },
    treble: { name: 'Высокие частоты', color: '#2196f3', description: 'Реакция на мелодию и гармонию' },
    full: { name: 'Полный спектр', color: '#4caf50', description: 'Реакция на весь звуковой диапазон' }
  };

  const visualizationTypes = {
    bars: { name: 'Столбцы', icon: '📊', description: 'Классические частотные столбцы' },
    circle: { name: 'Круг', icon: '⭕', description: 'Круговая визуализация' },
    wave: { name: 'Волна', icon: '🌊', description: 'Волновая форма' }
  };

  const currentReactiveMode = reactiveModes[reactiveMode];
  const currentVisualization = visualizationTypes[visualizationType];

  useEffect(() => {
    if (isListening) {
      startAudioAnalysis();
    } else {
      stopAudioAnalysis();
    }
    
    return () => {
      stopAudioAnalysis();
    };
  }, [isListening]);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const analyze = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Вычисляем общий уровень звука
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
          
          // Обновляем частотные данные
          setFrequencyData(Array.from(dataArray));
          
          // Адаптируем скорость частиц на основе звука
          const speedMultiplier = 1 + (average / 255) * 2;
          setSpeed(speedMultiplier);
          
          animationRef.current = requestAnimationFrame(analyze);
        }
      };
      
      analyze();
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setAudioLevel(0);
    setFrequencyData([]);
  };

  const resetAudio = () => {
    stopAudioAnalysis();
    setAudioLevel(0);
    setFrequencyData([]);
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Основная карточка аудио-реактивности */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-blue-500" />
            Аудио-реактивный режим
          </CardTitle>
          <CardDescription>
            Визуализация реагирует на звук из микрофона или музыку
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Индикатор аудио */}
            <motion.div
              animate={{
                scale: isListening ? [1, 1 + audioLevel * 0.3, 1] : 1,
                opacity: isListening ? 1 : 0.6
              }}
              transition={{ duration: 0.1 }}
              className="relative mx-auto w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${currentReactiveMode.color}20, ${currentReactiveMode.color}10)`,
                border: `3px solid ${currentReactiveMode.color}`
              }}
            >
              <motion.div
                animate={{
                  scale: isListening ? [1, 1 + audioLevel * 0.2, 1] : 1,
                  rotate: isListening ? [0, 360] : 0
                }}
                transition={{ 
                  duration: isListening ? 2 : 0.5,
                  repeat: isListening ? Infinity : 0,
                  ease: "linear"
                }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${currentReactiveMode.color}, ${currentReactiveMode.color}cc)`,
                  color: 'white'
                }}
              >
                <Volume2 className="w-8 h-8" />
              </motion.div>
            </motion.div>

            {/* Уровень звука */}
            <div className="space-y-2">
              <motion.h3
                className="text-2xl font-bold"
                style={{ color: currentReactiveMode.color }}
              >
                {Math.round(audioLevel * 100)}%
              </motion.h3>
              <p className="text-text-secondary">
                {currentReactiveMode.name}
              </p>
            </div>

            {/* Визуализация частот */}
            <div className="flex justify-center items-end gap-1 h-16">
              {frequencyData.slice(0, 32).map((value, index) => (
                <motion.div
                  key={index}
                  animate={{
                    height: `${(value / 255) * 100}%`,
                    opacity: isListening ? 1 : 0.3
                  }}
                  transition={{ duration: 0.1 }}
                  className="w-2 bg-gradient-to-t from-transparent to-current"
                  style={{ 
                    background: `linear-gradient(to top, transparent, ${currentReactiveMode.color})`,
                    minHeight: '4px'
                  }}
                />
              ))}
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {Math.round(audioLevel * 100)}%
                </div>
                <div className="text-sm text-text-tertiary">Уровень</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {frequencyData.length}
                </div>
                <div className="text-sm text-text-tertiary">Частот</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {Math.round(sensitivity * 100)}%
                </div>
                <div className="text-sm text-text-tertiary">Чувствительность</div>
              </div>
            </div>

            {/* Управление */}
            <div className="flex gap-3 justify-center">
              {!isListening ? (
                <Button
                  onClick={() => setIsListening(true)}
                  className="flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${currentReactiveMode.color}, ${currentReactiveMode.color}cc)`,
                    color: 'white'
                  }}
                >
                  <Mic className="w-4 h-4" />
                  Слушать
                </Button>
              ) : (
                <Button
                  onClick={() => setIsListening(false)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Остановить
                </Button>
              )}
              
              <Button
                onClick={resetAudio}
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
        {/* Режим реактивности */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Music className="w-4 h-4" />
              Режим реактивности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={reactiveMode} onValueChange={(value: any) => setReactiveMode(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="glass" style={{ color: currentReactiveMode.color }}>
                    {currentReactiveMode.name}
                  </Badge>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reactiveModes).map(([key, mode]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{mode.name}</div>
                      <div className="text-xs text-text-tertiary">{mode.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Тип визуализации */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Тип визуализации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={visualizationType} onValueChange={(value: any) => setVisualizationType(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentVisualization.icon}</span>
                  <span className="text-sm">{currentVisualization.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(visualizationTypes).map(([key, viz]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{viz.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{viz.name}</div>
                        <div className="text-xs text-text-tertiary">{viz.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Чувствительность */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Чувствительность микрофона
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            min={0.1}
            max={1.0}
            step={0.1}
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            label="Чувствительность"
            unit=""
            description={`${Math.round(sensitivity * 100)}% - ${sensitivity < 0.3 ? 'Низкая' : sensitivity < 0.7 ? 'Средняя' : 'Высокая'}`}
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
                setMode('dynamic');
                setSound('white_noise');
                setReactiveMode('bass');
                setVisualizationType('bars');
                setSensitivity(0.8);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Music className="w-5 h-5 text-red-500" />
              <span className="text-sm">Басы</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMode('smooth');
                setSound('theta');
                setReactiveMode('treble');
                setVisualizationType('circle');
                setSensitivity(0.6);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Volume2 className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Мелодия</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setMode('dynamic');
                setSound('rain');
                setReactiveMode('full');
                setVisualizationType('wave');
                setSensitivity(0.5);
              }}
              className="flex flex-col items-center gap-2 p-4"
            >
              <Headphones className="w-5 h-5 text-green-500" />
              <span className="text-sm">Полный</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AudioReactiveMode;