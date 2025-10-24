/**
 * Quick settings drawer
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { colors, spacing, glassmorphism, typography } from '../theme/tokens';

export const QuickSettings: React.FC = () => {
  const settingsOpen = useAppStore(state => state.settingsOpen);
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  const currentMode = useAppStore(state => state.currentMode);
  const modeConfig = useAppStore(state => state.modeConfig);
  const updateModeConfig = useAppStore(state => state.updateModeConfig);
  const audioVolume = useAppStore(state => state.audioVolume);
  const setAudioVolume = useAppStore(state => state.setAudioVolume);
  const hapticEnabled = useAppStore(state => state.hapticEnabled);
  const setHapticEnabled = useAppStore(state => state.setHapticEnabled);
  const showFPS = useAppStore(state => state.showFPS);
  const toggleFPS = useAppStore(state => state.toggleFPS);
  const fps = useAppStore(state => state.fps);
  
  const config = modeConfig[currentMode];
  
  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              zIndex: 90,
            }}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '400px',
              maxWidth: '90vw',
              ...glassmorphism,
              borderRadius: '0',
              padding: spacing[6],
              overflowY: 'auto',
              zIndex: 100,
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: spacing[6],
            }}>
              <h2 style={{ 
                fontSize: typography.fontSize['2xl'], 
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
              }}>
                Settings
              </h2>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: colors.text.primary,
                  fontSize: typography.fontSize.xl,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
            
            {/* Mode Settings */}
            <div style={{ marginBottom: spacing[6] }}>
              <h3 style={{ 
                fontSize: typography.fontSize.lg, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.accent.purple[400],
                marginBottom: spacing[4],
              }}>
                {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Mode
              </h3>
              
              {/* Speed */}
              <div style={{ marginBottom: spacing[4] }}>
                <label style={{ 
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                }}>
                  Speed: {config.speed.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={config.speed}
                  onChange={(e) => updateModeConfig(currentMode, { speed: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
              
              {/* Intensity */}
              <div style={{ marginBottom: spacing[4] }}>
                <label style={{ 
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                }}>
                  Intensity: {(config.intensity * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.intensity}
                  onChange={(e) => updateModeConfig(currentMode, { intensity: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
              
              {/* Particle Count */}
              <div style={{ marginBottom: spacing[4] }}>
                <label style={{ 
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                }}>
                  Particle Count: {config.particleCount}
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={config.particleCount}
                  onChange={(e) => updateModeConfig(currentMode, { particleCount: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            {/* Audio Settings */}
            <div style={{ marginBottom: spacing[6] }}>
              <h3 style={{ 
                fontSize: typography.fontSize.lg, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.accent.purple[400],
                marginBottom: spacing[4],
              }}>
                Audio
              </h3>
              
              <div style={{ marginBottom: spacing[4] }}>
                <label style={{ 
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                }}>
                  Volume: {(audioVolume * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            {/* General Settings */}
            <div style={{ marginBottom: spacing[6] }}>
              <h3 style={{ 
                fontSize: typography.fontSize.lg, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.accent.purple[400],
                marginBottom: spacing[4],
              }}>
                General
              </h3>
              
              {/* Haptic Feedback */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: spacing[4],
              }}>
                <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                  Haptic Feedback
                </span>
                <button
                  onClick={() => setHapticEnabled(!hapticEnabled)}
                  style={{
                    width: '3rem',
                    height: '1.5rem',
                    borderRadius: '1rem',
                    background: hapticEnabled ? colors.accent.purple[400] : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: hapticEnabled ? 'calc(100% - 22px)' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'all 0.2s ease',
                  }} />
                </button>
              </div>
              
              {/* Show FPS */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: spacing[4],
              }}>
                <span style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                  Show FPS {showFPS && `(${fps})`}
                </span>
                <button
                  onClick={toggleFPS}
                  style={{
                    width: '3rem',
                    height: '1.5rem',
                    borderRadius: '1rem',
                    background: showFPS ? colors.accent.purple[400] : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: showFPS ? 'calc(100% - 22px)' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'all 0.2s ease',
                  }} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

