/**
 * Hook for performance monitoring
 */

import { useEffect, useRef } from 'react';
import { PerformanceMonitor } from '../core/performance/PerformanceMonitor';
import { useAppStore } from '../store/useAppStore';

export const usePerformance = () => {
  const monitorRef = useRef<PerformanceMonitor>(new PerformanceMonitor());
  const updateFPS = useAppStore(state => state.updateFPS);
  const setQualityLevel = useAppStore(state => state.setQualityLevel);
  
  useEffect(() => {
    const monitor = monitorRef.current;
    
    // Register quality change callback
    monitor.onQualityLevelChange((level) => {
      setQualityLevel(level);
      console.log(`Quality level adjusted to: ${level}`);
    });
    
    // Update loop
    let animationId: number;
    let frameCount = 0;
    
    const update = () => {
      monitor.update();
      
      // Update FPS in store every 30 frames
      frameCount++;
      if (frameCount >= 30) {
        const metrics = monitor.getMetrics();
        updateFPS(metrics.fps);
        frameCount = 0;
      }
      
      animationId = requestAnimationFrame(update);
    };
    
    update();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [updateFPS, setQualityLevel]);
  
  return {
    monitor: monitorRef.current,
    getMetrics: () => monitorRef.current.getMetrics(),
  };
};

