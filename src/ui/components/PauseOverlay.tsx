/**
 * Pause overlay indicator
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../theme/tokens';

export const PauseOverlay: React.FC = () => {
  const isPaused = useAppStore(state => state.isPaused);
  
  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: 95,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              fontSize: '5rem',
              color: colors.text.primary,
              opacity: 0.8,
              textShadow: '0 0 30px rgba(167, 139, 250, 0.8)',
            }}
          >
            ⏸
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

