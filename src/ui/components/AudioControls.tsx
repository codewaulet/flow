/**
 * Audio preset selector
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useAudio } from '../../hooks/useAudio';
import { AudioPreset } from '../../core/audio/types';
import { colors, spacing, glassmorphism, typography } from '../theme/tokens';
import { isMobile } from '../../utils/device';

const presets: { id: AudioPreset; label: string; icon: string }[] = [
  { id: 'ocean', label: 'Ocean', icon: '🌊' },
  { id: 'rain', label: 'Rain', icon: '🌧️' },
  { id: 'theta', label: 'Theta', icon: '🧘' },
  { id: 'ambient', label: 'Ambient', icon: '🎵' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
];

export const AudioControls: React.FC = () => {
  const audioPreset = useAppStore(state => state.audioPreset);
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  const { switchPreset } = useAudio();
  const mobile = isMobile();
  
  return (
    <div
      style={{
        position: 'fixed',
        top: spacing[5],
        right: spacing[5],
        display: 'flex',
        gap: spacing[2],
        alignItems: 'center',
        flexWrap: mobile ? 'wrap' : 'nowrap',
        maxWidth: mobile ? 'calc(100vw - 2.5rem)' : 'auto',
        padding: spacing[2],
        ...glassmorphism,
        borderRadius: mobile ? '16px' : '50px',
        zIndex: 98,
        pointerEvents: 'auto',
      }}
    >
      {presets.map((preset) => (
        <motion.button
          key={preset.id}
          onClick={() => switchPreset(preset.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: mobile ? `${spacing[2]} ${spacing[3]}` : `${spacing[2]} ${spacing[4]}`,
            borderRadius: '50px',
            background: audioPreset === preset.id 
              ? 'rgba(167, 139, 250, 0.3)' 
              : 'transparent',
            border: audioPreset === preset.id
              ? `2px solid ${colors.accent.purple[400]}`
              : '2px solid transparent',
            color: colors.text.primary,
            fontSize: mobile ? typography.fontSize.xs : typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
          }}
        >
          <span>{preset.icon}</span>
          {!mobile && <span>{preset.label}</span>}
        </motion.button>
      ))}
      
      {/* Settings Gear Icon */}
      <motion.button
        onClick={() => setSettingsOpen(true)}
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: mobile ? '2.5rem' : '2.75rem',
          height: mobile ? '2.5rem' : '2.75rem',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          color: colors.text.primary,
          fontSize: typography.fontSize.lg,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Settings"
      >
        ⚙️
      </motion.button>
    </div>
  );
};

