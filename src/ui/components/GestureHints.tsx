/**
 * Gesture hints shown for first 30 seconds
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, spacing, glassmorphism, typography } from '../theme/tokens';
import { isMobile } from '../../utils/device';

const hints = {
  mobile: [
    { icon: '👆', text: 'Tap to show/hide controls' },
    { icon: '↔️', text: 'Swipe left/right to switch modes' },
    { icon: '↕️', text: 'Swipe up for settings' },
  ],
  desktop: [
    { icon: '←→', text: 'Arrow keys to switch modes' },
    { icon: '⌨️', text: 'Press H to toggle UI' },
    { icon: '␣', text: 'Space to pause' },
  ],
};

export const GestureHints: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [currentHint, setCurrentHint] = useState(0);
  const mobile = isMobile();
  const hintList = mobile ? hints.mobile : hints.desktop;
  
  useEffect(() => {
    // Hide after 30 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 30000);
    
    // Rotate hints every 4 seconds
    const rotateTimer = setInterval(() => {
      setCurrentHint(prev => (prev + 1) % hintList.length);
    }, 4000);
    
    return () => {
      clearTimeout(hideTimer);
      clearInterval(rotateTimer);
    };
  }, [hintList.length]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: mobile ? 'auto' : spacing[20],
            bottom: mobile ? spacing[20] : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            ...glassmorphism,
            padding: `${spacing[3]} ${spacing[5]}`,
            borderRadius: '50px',
            zIndex: 60,
            pointerEvents: 'none',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHint}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3],
                fontSize: mobile ? typography.fontSize.sm : typography.fontSize.base,
                color: colors.text.secondary,
              }}
            >
              <span style={{ fontSize: typography.fontSize.xl }}>
                {hintList[currentHint].icon}
              </span>
              <span>{hintList[currentHint].text}</span>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

