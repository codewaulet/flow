import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from "../../stores/useSettingsStore";

interface AudioReactiveModeProps {
  isActive: boolean;
}

const AudioReactiveMode: React.FC<AudioReactiveModeProps> = ({ isActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const [bpm, setBpm] = useState(0);
  const [isBeatDetected, setIsBeatDetected] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.5);
  
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const microphoneRef = useRef<MediaStreamAudioSourceNode>();
  const animationRef = useRef<number>();
  const beatDetectionRef = useRef<{ lastBeat: number; threshold: number }>({ lastBeat: 0, threshold: 0 });
  
  const setMode = useSettingsStore((state) => state.setMode);
  const setSound = useSettingsStore((state) => state.setSound);
  const setSpeed = useSettingsStore((state) => state.setSpeed);
  const setFlickerSize = useSettingsStore((state) => state.setFlickerSize);
  const setFlickerAlpha = useSettingsStore((state) => state.setFlickerAlpha);

  useEffect(() => {
    if (isActive) {
      setMode('dynamic');
      setSound('noise');
      setSpeed(1.5);
      setFlickerSize(true);
      setFlickerAlpha(true);
    }
  }, [isActive, setMode, setSound, setSpeed, setFlickerSize, setFlickerAlpha]);

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      microphoneRef.current.connect(analyserRef.current);

      setIsListening(true);
      analyzeAudio();
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
    }
  };

  const stopAudioCapture = () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsListening(false);
    setAudioLevel(0);
    setFrequencyData([]);
    setBpm(0);
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDomainArray = new Uint8Array(bufferLength);

    const updateAudioData = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      analyserRef.current!.getByteTimeDomainData(timeDomainArray);

      // Вычисляем общий уровень звука
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioLevel(average / 255);

      // Обновляем данные частот
      setFrequencyData(Array.from(dataArray));

      // Детекция битов
      detectBeat(average);

      // Обновляем скорость частиц в зависимости от уровня звука
      const newSpeed = 0.5 + (average / 255) * 2;
      setSpeed(newSpeed);

      animationRef.current = requestAnimationFrame(updateAudioData);
    };

    updateAudioData();
  };

  const detectBeat = (currentLevel: number) => {
    const now = Date.now();
    const { lastBeat, threshold } = beatDetectionRef.current;
    
    // Динамический порог
    const dynamicThreshold = threshold + (currentLevel - threshold) * 0.1;
    beatDetectionRef.current.threshold = dynamicThreshold;

    if (currentLevel > dynamicThreshold && now - lastBeat > 200) {
      setIsBeatDetected(true);
      beatDetectionRef.current.lastBeat = now;
      
      // Вычисляем BPM
      const timeSinceLastBeat = now - lastBeat;
      if (timeSinceLastBeat > 0) {
        const currentBpm = Math.round(60000 / timeSinceLastBeat);
        if (currentBpm > 60 && currentBpm < 200) {
          setBpm(currentBpm);
        }
      }

      setTimeout(() => setIsBeatDetected(false), 100);
    }
  };

  const getFrequencyColor = (index: number) => {
    const hue = (index / frequencyData.length) * 360;
    const saturation = Math.min(100, frequencyData[index] / 2.55);
    const lightness = 50 + (frequencyData[index] / 5.1);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, 
          rgba(255, 107, 107, ${audioLevel * 0.3}), 
          rgba(30, 136, 229, ${audioLevel * 0.3}))`,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="max-w-4xl mx-4 text-center">
        {/* Заголовок */}
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold mb-8"
          style={{ color: isBeatDetected ? '#ff6b6b' : '#00e5cc' }}
        >
          Аудио-реактивный режим
        </motion.h2>

        {/* Визуализация аудио */}
        <div className="mb-8">
          {/* Уровень звука */}
          <div className="mb-6">
            <div className="text-lg text-white/80 mb-2">Уровень звука</div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, #00e5cc, #66ff99, #ff6b6b)`,
                  width: `${audioLevel * 100}%`
                }}
                animate={{ width: `${audioLevel * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="text-sm text-white/60 mt-1">
              {Math.round(audioLevel * 100)}%
            </div>
          </div>

          {/* Частотный спектр */}
          <div className="mb-6">
            <div className="text-lg text-white/80 mb-2">Частотный спектр</div>
            <div className="flex items-end justify-center h-32 space-x-1">
              {frequencyData.slice(0, 64).map((value, index) => (
                <motion.div
                  key={index}
                  className="w-2 rounded-t"
                  style={{
                    backgroundColor: getFrequencyColor(index),
                    height: `${(value / 255) * 100}%`
                  }}
                  animate={{
                    height: `${(value / 255) * 100}%`,
                    opacity: 0.7 + (value / 255) * 0.3
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
          </div>

          {/* BPM и детекция битов */}
          <div className="flex justify-center items-center space-x-8 mb-6">
            <div className="text-center">
              <motion.div
                animate={{ scale: isBeatDetected ? 1.2 : 1 }}
                className="text-4xl mb-2"
              >
                {isBeatDetected ? '💥' : '🎵'}
              </motion.div>
              <div className="text-lg font-bold" style={{ color: '#66ff99' }}>
                {bpm} BPM
              </div>
              <div className="text-sm text-white/70">Темп</div>
            </div>

            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: audioLevel > 0.3 ? 1.1 : 1,
                  rotate: audioLevel > 0.5 ? 360 : 0
                }}
                transition={{ duration: 0.5 }}
                className="text-4xl mb-2"
              >
                🎤
              </motion.div>
              <div className="text-lg font-bold" style={{ color: '#1e88e5' }}>
                {isListening ? 'Активен' : 'Неактивен'}
              </div>
              <div className="text-sm text-white/70">Микрофон</div>
            </div>
          </div>
        </div>

        {/* Настройки чувствительности */}
        <div className="mb-8">
          <div className="text-lg text-white/80 mb-3">Чувствительность</div>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-white/70">Низкая</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-white/70">Высокая</span>
          </div>
        </div>

        {/* Управление */}
        <div className="flex justify-center space-x-4 mb-8">
          {!isListening ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startAudioCapture}
              className="px-8 py-3 rounded-xl font-medium"
              style={{
                background: 'linear-gradient(135deg, #00e5cc, #66ff99)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(0, 229, 204, 0.4)'
              }}
            >
              🎤 Начать прослушивание
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopAudioCapture}
              className="px-8 py-3 rounded-xl font-medium"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)'
              }}
            >
              ⏹️ Остановить
            </motion.button>
          )}
        </div>

        {/* Информация */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-white/60 max-w-2xl mx-auto"
        >
          <div className="mb-4">
            🎵 <strong>Аудио-реактивность:</strong> Частицы реагируют на звук с микрофона
          </div>
          <div className="mb-4">
            💥 <strong>Детекция битов:</strong> Визуальные эффекты синхронизированы с ритмом
          </div>
          <div className="mb-4">
            🌈 <strong>Частотный анализ:</strong> Разные частоты создают разные цвета
          </div>
          <div>
            ⚡ <strong>Автоматическая настройка:</strong> Скорость частиц адаптируется к громкости
          </div>
        </motion.div>

        {/* Визуальные эффекты */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: getFrequencyColor(i % 64),
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, audioLevel * 2, 0],
                opacity: [0, audioLevel, 0],
                y: [0, -100, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AudioReactiveMode;
