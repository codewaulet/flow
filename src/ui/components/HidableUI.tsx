/**
 * Auto-hiding UI container
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

interface HidableUIProps {
  children: React.ReactNode;
  hideDelay?: number; // milliseconds before hiding
}

export const HidableUI: React.FC<HidableUIProps> = ({ children, hideDelay = 3000 }) => {
  const uiVisible = useAppStore(state => state.uiVisible);
  const setUIVisible = useAppStore(state => state.setUIVisible);
  const isPaused = useAppStore(state => state.isPaused);
  const settingsOpen = useAppStore(state => state.settingsOpen);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Auto-hide timer
  useEffect(() => {
    // Don't auto-hide if paused or settings open
    if (isPaused || settingsOpen || !uiVisible || isHovered) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }
    
    // Set timer to hide UI
    timeoutRef.current = setTimeout(() => {
      setUIVisible(false);
    }, hideDelay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [uiVisible, isPaused, settingsOpen, hideDelay, setUIVisible, isHovered]);
  
  // Show UI on any interaction
  useEffect(() => {
    const showUI = () => {
      if (!uiVisible && !settingsOpen) {
        setUIVisible(true);
      }
    };
    
    window.addEventListener('mousemove', showUI);
    window.addEventListener('touchstart', showUI);
    window.addEventListener('keydown', showUI);
    
    return () => {
      window.removeEventListener('mousemove', showUI);
      window.removeEventListener('touchstart', showUI);
      window.removeEventListener('keydown', showUI);
    };
  }, [uiVisible, settingsOpen, setUIVisible]);
  
  return (
    <AnimatePresence>
      {uiVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            pointerEvents: uiVisible ? 'auto' : 'none',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

