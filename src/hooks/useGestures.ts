/**
 * Hook for gesture handling
 */

import { useEffect, useRef } from 'react';
import { GestureHandler } from '../core/gestures/GestureHandler';
import { GestureCallback, GestureType } from '../core/gestures/types';
import { useAppStore } from '../store/useAppStore';

export const useGestures = (element: HTMLElement | null) => {
  const gestureHandlerRef = useRef<GestureHandler | null>(null);
  const hapticEnabled = useAppStore(state => state.hapticEnabled);
  
  useEffect(() => {
    if (!element) return;
    
    gestureHandlerRef.current = new GestureHandler(element, {
      enableHaptic: hapticEnabled,
    });
    
    return () => {
      gestureHandlerRef.current?.destroy();
    };
  }, [element, hapticEnabled]);
  
  const on = (type: GestureType, callback: GestureCallback) => {
    gestureHandlerRef.current?.on(type, callback);
  };
  
  const off = (type: GestureType, callback: GestureCallback) => {
    gestureHandlerRef.current?.off(type, callback);
  };
  
  return { on, off };
};

