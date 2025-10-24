import React, { useState, useMemo } from 'react';
import GestureController from './components/settings/GestureController';
import SettingsPanel from './components/settings/SettingsPanel';
import SettingsToggle from './components/settings/SettingsToggle';
import IntroOverlay from './components/IntroOverlay';
import Onboarding from './components/Onboarding';
import DecorativeElements from './components/DecorativeElements';
import { useFlowExperience } from './hooks/useFlowExperience';
import { useThreeJS } from './hooks/useThreeJS';
import { useParticleSettings } from './hooks/useParticleSettings';
import { useAnimation } from './hooks/useAnimation';
import { useEventHandlers } from './hooks/useEventHandlers';
import { useSettingsStore } from './stores/useSettingsStore';

const FlowExperience: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const {
    showIntro, currentSpeed, targetSpeed,
    containerRef, gameRef, particleSystemRef,
    startExperience,
    handleAccelerationStart, handleAccelerationEnd,
    updateSoundWithSpeed, triggerHarmonicTone, setCurrentSpeed
  } = useFlowExperience();

  // Получаем настройки из Zustand store отдельными селекторами
  const mode = useSettingsStore((state) => state.mode);
  const subMode = useSettingsStore((state) => state.subMode);
  const baseSpeed = useSettingsStore((state) => state.baseSpeed);
  const sound = useSettingsStore((state) => state.sound);
  const flickerSize = useSettingsStore((state) => state.flickerSize);
  const flickerAlpha = useSettingsStore((state) => state.flickerAlpha);
  const showTrails = useSettingsStore((state) => state.showTrails);
  const particleCount = useSettingsStore((state) => state.particleCount);
  const panelMode = useSettingsStore((state) => state.panelMode);

  const settings = useMemo(() => ({
    mode,
    subMode,
    baseSpeed,
    sound,
    flickerSize,
    flickerAlpha,
    showTrails,
    particleCount,
    panelMode
  }), [mode, subMode, baseSpeed, sound, flickerSize, flickerAlpha, showTrails, particleCount, panelMode]);

  useThreeJS({ containerRef, gameRef, particleSystemRef });
  useParticleSettings({ particleSystemRef });
  
  useAnimation({
    gameRef, particleSystemRef, settings, currentSpeed, targetSpeed,
    setCurrentSpeed, updateSoundWithSpeed, triggerHarmonicTone
  });

  useEventHandlers({
    containerRef, gameRef,
    onStart: startExperience,
    onAccelerationStart: handleAccelerationStart,
    onAccelerationEnd: handleAccelerationEnd,
    onToggleUI: () => {} // Управление UI теперь через Zustand
  });

  return (
    <GestureController
      onAccelerationStart={handleAccelerationStart}
      onAccelerationEnd={handleAccelerationEnd}
    >
      <div className="relative w-full h-screen overflow-hidden" 
           style={{
             background: 'linear-gradient(135deg, #020818 0%, #051428 50%, #020818 100%)'
           }}>
        <div ref={containerRef} className="absolute inset-0" />
        
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
        {!showOnboarding && showIntro && <IntroOverlay onStart={startExperience} />}
        
        <SettingsPanel />
        <SettingsToggle />
        
        <DecorativeElements showIntro={showIntro} />
      </div>
    </GestureController>
  );
};

export default FlowExperience;