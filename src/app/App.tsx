/**
 * Root application component
 */

import React, { useEffect } from 'react';
import { Layout } from './Layout';
import { Splash } from '../ui/components/Splash';
import { useAudio } from '../hooks/useAudio';
import { usePerformance } from '../hooks/usePerformance';
import { useAppStore } from '../store/useAppStore';

export const App: React.FC = () => {
  // Initialize audio system
  useAudio();
  
  // Initialize performance monitoring
  usePerformance();
  
  const showFPS = useAppStore(state => state.showFPS);
  const fps = useAppStore(state => state.fps);
  
  // Prevent default touch behaviors
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };
    
    document.addEventListener('gesturestart', preventDefault);
    document.addEventListener('gesturechange', preventDefault);
    document.addEventListener('gestureend', preventDefault);
    
    return () => {
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
      document.removeEventListener('gestureend', preventDefault);
    };
  }, []);
  
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Splash />
      <Layout />
      
      {/* FPS Counter */}
      {showFPS && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            padding: '0.5rem 1rem',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '0.5rem',
            color: fps < 30 ? '#ff4444' : fps < 50 ? '#ffaa00' : '#00ff00',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            zIndex: 999,
            pointerEvents: 'none',
          }}
        >
          {fps} FPS
        </div>
      )}
    </div>
  );
};

