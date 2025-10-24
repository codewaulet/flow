/**
 * Mode selector with indicator dots
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore, VisualMode } from '../../store/useAppStore';
import { colors, spacing, glassmorphism } from '../theme/tokens';
import { isMobile } from '../../utils/device';

const modes: { id: VisualMode; name: string; icon: string }[] = [
  { id: 'breathe', name: 'Черная дыра', icon: '🕳️' },
  { id: 'toroid', name: 'Тороид', icon: '⭕' },
  { id: 'weaver', name: 'Паутина', icon: '🕸️' },
  { id: 'starfield', name: 'Звездное поле', icon: '✨' },
  { id: 'matrix', name: 'Матрица', icon: '💚' },
  { id: 'orbs', name: 'Ползание', icon: '⭐' },
];

export const ModeSelector: React.FC = () => {
  const currentMode = useAppStore(state => state.currentMode);
  const setCurrentMode = useAppStore(state => state.setCurrentMode);
  const isTransitioning = useAppStore(state => state.isTransitioning);
  const mobile = isMobile();
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: mobile ? spacing[6] : spacing[8],
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: mobile ? spacing[2] : spacing[3],
        alignItems: 'center',
        padding: spacing[2],
        ...glassmorphism,
        borderRadius: '50px',
        zIndex: 50,
      }}
    >
      {modes.map((mode) => (
        <motion.button
          key={mode.id}
          onClick={() => !isTransitioning && setCurrentMode(mode.id)}
          disabled={isTransitioning}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: currentMode === mode.id ? (mobile ? '2.5rem' : '3rem') : (mobile ? '0.6rem' : '0.75rem'),
            height: mobile ? '0.6rem' : '0.75rem',
            borderRadius: '0.375rem',
            background: currentMode === mode.id 
              ? colors.accent.purple[400]
              : 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            cursor: isTransitioning ? 'wait' : 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            minWidth: mobile ? '0.6rem' : '0.75rem', // Prevent collapse
          }}
          title={mode.name}
        >
          {currentMode === mode.id && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                background: 'linear-gradient(90deg, #a78bfa, #ec4899)',
              }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

