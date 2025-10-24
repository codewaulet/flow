/**
 * Splash screen with onboarding
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { colors, typography, transitions } from '../theme/tokens';

const onboardingSteps = [
  {
    icon: '👆',
    title: 'Gesture Controls',
    description: 'Swipe left/right to change modes. Tap to show/hide controls.',
  },
  {
    icon: '🎨',
    title: 'Interactive',
    description: 'Touch and move to interact with the visualization.',
  },
  {
    icon: '🎵',
    title: 'Ambient Sounds',
    description: 'Choose from ocean, rain, theta waves, and more to enhance your focus.',
  },
];

export const Splash: React.FC = () => {
  const [step, setStep] = useState(0);
  const splashDismissed = useAppStore(state => state.splashDismissed);
  const dismissSplash = useAppStore(state => state.dismissSplash);
  const startSession = useAppStore(state => state.startSession);
  
  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      dismissSplash();
      startSession();
    }
  };
  
  if (splashDismissed) return null;
  
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #1a0033 0%, #000 50%, #1a0033 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '500px' }}>
        <AnimatePresence mode="wait">
          {step === -1 ? (
            // Initial splash
            <motion.div
              key="splash"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  fontSize: '4rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #a78bfa, #ec4899, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '1.5rem',
                }}
              >
                FLOW
              </motion.div>
              <p style={{ color: colors.text.secondary, fontSize: typography.fontSize.lg, marginBottom: '2.5rem' }}>
                Enter a state of deep focus
              </p>
              <button
                onClick={() => setStep(0)}
                style={{
                  padding: '1rem 3rem',
                  background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  boxShadow: '0 10px 40px rgba(167, 139, 250, 0.3)',
                  transition: transitions.base,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Begin
              </button>
            </motion.div>
          ) : (
            // Onboarding steps
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>
                {onboardingSteps[step].icon}
              </div>
              <h2 style={{ 
                fontSize: typography.fontSize['3xl'], 
                fontWeight: typography.fontWeight.bold, 
                marginBottom: '1rem',
                color: colors.text.primary,
              }}>
                {onboardingSteps[step].title}
              </h2>
              <p style={{ 
                fontSize: typography.fontSize.base, 
                color: colors.text.secondary, 
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}>
                {onboardingSteps[step].description}
              </p>
              
              {/* Dots */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                {onboardingSteps.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === step ? '1.5rem' : '0.5rem',
                      height: '0.5rem',
                      borderRadius: '0.25rem',
                      background: i === step ? colors.accent.purple[400] : 'rgba(255, 255, 255, 0.3)',
                      transition: transitions.base,
                    }}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                style={{
                  padding: '0.875rem 2.5rem',
                  background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  width: '100%',
                  transition: transitions.base,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {step === onboardingSteps.length - 1 ? 'Start Flow' : 'Next'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

