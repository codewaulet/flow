/**
 * Audio preset selector
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useAudio } from '../../hooks/useAudio';
import { AudioPreset } from '../../core/audio/types';
import { colors, spacing, glassmorphism, typography } from '../theme/tokens';

const presets: { id: AudioPreset; label: string; icon: string }[] = [
  { id: 'ocean', label: 'Ocean', icon: '🌊' },
  { id: 'rain', label: 'Rain', icon: '🌧️' },
  { id: 'theta', label: 'Theta', icon: '🧘' },
  { id: 'ambient', label: 'Ambient', icon: '🎵' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
];

export const AudioControls: React.FC = () => {
  const audioPreset = useAppStore(state => state.audioPreset);
  const { switchPreset } = useAudio();
  
  return (
    <div
      style={{
        position: 'fixed',
        top: spacing[5],
        right: spacing[5],
        display: 'flex',
        gap: spacing[2],
        padding: spacing[2],
        ...glassmorphism,
        borderRadius: '50px',
        zIndex: 50,
      }}
    >
      {presets.map((preset) => (
        <motion.button
          key={preset.id}
          onClick={() => switchPreset(preset.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            borderRadius: '50px',
            background: audioPreset === preset.id 
              ? 'rgba(167, 139, 250, 0.3)' 
              : 'transparent',
            border: audioPreset === preset.id
              ? `2px solid ${colors.accent.purple[400]}`
              : '2px solid transparent',
            color: colors.text.primary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <span>{preset.icon}</span>
          <span>{preset.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

