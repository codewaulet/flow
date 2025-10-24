import { useState, useEffect, useCallback } from 'react';

export interface GestureState {
  isDetecting: boolean;
  currentGesture: string | null;
  confidence: number;
  lastGesture: string | null;
  gestureHistory: string[];
}

export interface GestureConfig {
  sensitivity: number;
  enableSwipe: boolean;
  enablePinch: boolean;
  enableRotate: boolean;
  enableTap: boolean;
  enableLongPress: boolean;
}

const defaultConfig: GestureConfig = {
  sensitivity: 0.7,
  enableSwipe: true,
  enablePinch: true,
  enableRotate: true,
  enableTap: true,
  enableLongPress: true
};

export const useGestures = (config: Partial<GestureConfig> = {}) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isDetecting: false,
    currentGesture: null,
    confidence: 0,
    lastGesture: null,
    gestureHistory: []
  });

  const finalConfig = { ...defaultConfig, ...config };

  const startGestureDetection = useCallback(() => {
    setGestureState(prev => ({ ...prev, isDetecting: true }));
  }, []);

  const stopGestureDetection = useCallback(() => {
    setGestureState(prev => ({ 
      ...prev, 
      isDetecting: false,
      currentGesture: null,
      confidence: 0
    }));
  }, []);

  const detectGesture = useCallback((gesture: string, confidence: number) => {
    if (confidence >= finalConfig.sensitivity) {
      setGestureState(prev => ({
        ...prev,
        currentGesture: gesture,
        confidence,
        lastGesture: gesture,
        gestureHistory: [...prev.gestureHistory.slice(-9), gesture]
      }));
    }
  }, [finalConfig.sensitivity]);

  const clearGestureHistory = useCallback(() => {
    setGestureState(prev => ({
      ...prev,
      gestureHistory: [],
      lastGesture: null
    }));
  }, []);

  // Симуляция жестов для демонстрации
  useEffect(() => {
    if (!gestureState.isDetecting) return;

    const gestureTypes = ['swipe-left', 'swipe-right', 'swipe-up', 'swipe-down', 'pinch', 'rotate', 'tap', 'long-press'];
    
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% шанс на жест
        const randomGesture = gestureTypes[Math.floor(Math.random() * gestureTypes.length)];
        const confidence = Math.random() * 0.5 + 0.5; // 0.5-1.0
        detectGesture(randomGesture, confidence);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gestureState.isDetecting, detectGesture]);

  return {
    gestureState,
    startGestureDetection,
    stopGestureDetection,
    detectGesture,
    clearGestureHistory,
    config: finalConfig
  };
};