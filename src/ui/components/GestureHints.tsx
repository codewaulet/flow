/**
 * Gesture hints shown for first 30 seconds
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, spacing, glassmorphism, typography } from '../theme/tokens';
import { isMobile } from '../../utils/device';

const hints = {
  mobile: [
    { icon: '👆', text: 'Нажмите для показа/скрытия элементов управления' },
    { icon: '↔️', text: 'Свайп влево/вправо для смены режимов' },
    { icon: '↕️', text: 'Свайп вверх для настроек' },
  ],
  desktop: [
    { icon: '←→', text: 'Стрелки для смены режимов' },
    { icon: '⌨️', text: 'Нажмите H для переключения UI' },
    { icon: '␣', text: 'Пробел для паузы' },
  ],
};

export const GestureHints: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const mobile = isMobile();
  const hintList = mobile ? hints.mobile : hints.desktop;
  
  useEffect(() => {
    // Check if user has seen hints before
    const hasSeenHints = localStorage.getItem('flow-hints-seen');
    
    if (!hasSeenHints) {
      setVisible(true);
      
      // Mark as seen
      localStorage.setItem('flow-hints-seen', 'true');
      
      // Hide after 20 seconds
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 20000);
      
      // Rotate hints every 4 seconds
      const rotateTimer = setInterval(() => {
        setCurrentHint(prev => (prev + 1) % hintList.length);
      }, 4000);
      
      return () => {
        clearTimeout(hideTimer);
        clearInterval(rotateTimer);
      };
    }
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

