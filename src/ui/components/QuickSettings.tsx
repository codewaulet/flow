/**
 * Quick settings drawer/bottom sheet (mobile-responsive)
 */

import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { colors, spacing, glassmorphism, typography } from '../theme/tokens';
import { isMobile } from '../../utils/device';

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
  const qualityLevel = useAppStore(state => state.qualityLevel);
  
  const config = modeConfig[currentMode];
  const mobile = isMobile();
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    // Close if dragged down more than 100px on mobile
    if (mobile && info.offset.y > 100) {
      setSettingsOpen(false);
    }
  };
  
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
              touchAction: 'none',
            }}
          />
          
          {/* Drawer/Bottom Sheet */}
          <motion.div
            initial={mobile ? { y: '100%' } : { x: '100%' }}
            animate={mobile ? { y: 0 } : { x: 0 }}
            exit={mobile ? { y: '100%' } : { x: '100%' }}
            drag={mobile ? 'y' : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              ...(mobile ? {
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: '85vh',
                borderRadius: '24px 24px 0 0',
              } : {
                right: 0,
                top: 0,
                bottom: 0,
                width: '400px',
                maxWidth: '90vw',
                borderRadius: '0',
              }),
              ...glassmorphism,
              padding: mobile ? spacing[4] : spacing[6],
              paddingBottom: mobile ? spacing[8] : spacing[6], // Extra padding for mobile safe area
              overflowY: 'auto',
              zIndex: 100,
            }}
          >
            {/* Drag Handle (Mobile) */}
            {mobile && (
              <div style={{
                width: '40px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
                margin: '0 auto 1rem',
              }} />
            )}
            
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: spacing[4],
            }}>
              <div>
                <h2 style={{ 
                  fontSize: mobile ? typography.fontSize.xl : typography.fontSize['2xl'], 
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                  marginBottom: spacing[1],
                }}>
                  Settings
                </h2>
                {!mobile && (
                  <div style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.tertiary,
                  }}>
                    Quality: {qualityLevel} • {fps} FPS
                  </div>
                )}
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  width: mobile ? '2rem' : '2.5rem',
                  height: mobile ? '2rem' : '2.5rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: colors.text.primary,
                  fontSize: mobile ? typography.fontSize.lg : typography.fontSize.xl,
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
              <div style={{ marginBottom: mobile ? spacing[5] : spacing[4] }}>
                <label style={{ 
                  display: 'block',
                  fontSize: mobile ? typography.fontSize.base : typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  marginBottom: spacing[2],
                }}>
                  Speed: <span style={{ color: colors.accent.purple[400] }}>{config.speed.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={config.speed}
                  onChange={(e) => updateModeConfig(currentMode, { speed: parseFloat(e.target.value) })}
                  style={{ 
                    width: '100%',
                    height: mobile ? '8px' : '4px', // Larger touch target on mobile
                  }}
                />
              </div>
              
              {/* Intensity */}
              <div style={{ marginBottom: mobile ? spacing[5] : spacing[4] }}>
                <label style={{ 
                  display: 'block',
                  fontSize: mobile ? typography.fontSize.base : typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  marginBottom: spacing[2],
                }}>
                  Intensity: <span style={{ color: colors.accent.purple[400] }}>{(config.intensity * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.intensity}
                  onChange={(e) => updateModeConfig(currentMode, { intensity: parseFloat(e.target.value) })}
                  style={{ 
                    width: '100%',
                    height: mobile ? '8px' : '4px',
                  }}
                />
              </div>
              
              {/* Particle Count - with warning for high values */}
              <div style={{ marginBottom: mobile ? spacing[5] : spacing[4] }}>
                <label style={{ 
                  display: 'block',
                  fontSize: mobile ? typography.fontSize.base : typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  marginBottom: spacing[2],
                }}>
                  Particles: <span style={{ color: colors.accent.purple[400] }}>{config.particleCount}</span>
                  {config.particleCount > 3000 && (
                    <span style={{ 
                      color: colors.text.tertiary, 
                      fontSize: typography.fontSize.xs,
                      marginLeft: spacing[2],
                    }}>
                      (may impact FPS)
                    </span>
                  )}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={Math.min(config.particleCount, 5000)}
                  onChange={(e) => updateModeConfig(currentMode, { particleCount: parseInt(e.target.value) })}
                  style={{ 
                    width: '100%',
                    height: mobile ? '8px' : '4px',
                  }}
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

