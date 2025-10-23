import React from 'react';
import ControlPanel from './components/ControlPanel';
import IntroOverlay from './components/IntroOverlay';
import DecorativeElements from './components/DecorativeElements';
import { useFlowExperience } from './hooks/useFlowExperience';
import { useThreeJS } from './hooks/useThreeJS';
import { useAnimation } from './hooks/useAnimation';
import { useEventHandlers } from './hooks/useEventHandlers';

const FlowExperience: React.FC = () => {
  const {
    settings, showIntro, showUI, currentSpeed, targetSpeed,
    containerRef, gameRef, particleSystemRef,
    updateSettings, saveSettings, startExperience, toggleUI,
    handleAccelerationStart, handleAccelerationEnd,
    updateSoundWithSpeed, triggerHarmonicTone, setCurrentSpeed
  } = useFlowExperience();

  useThreeJS({ containerRef, gameRef, particleSystemRef, settings });
  
  useAnimation({
    gameRef, particleSystemRef, settings, currentSpeed, targetSpeed,
    setCurrentSpeed, updateSoundWithSpeed, triggerHarmonicTone
  });

  useEventHandlers({
    containerRef, gameRef,
    onStart: startExperience,
    onAccelerationStart: handleAccelerationStart,
    onAccelerationEnd: handleAccelerationEnd,
    onToggleUI: toggleUI
  });

  return (
    <div className="relative w-full h-screen overflow-hidden" 
         style={{
           background: 'linear-gradient(135deg, #020818 0%, #051428 50%, #020818 100%)'
         }}>
      <div ref={containerRef} className="absolute inset-0" />
      
      {showIntro && <IntroOverlay onStart={startExperience} />}
      
      <ControlPanel
        settings={settings}
        onSettingsChange={updateSettings}
        onSaveSettings={saveSettings}
        showUI={showUI}
        onToggleUI={toggleUI}
      />
      
      <DecorativeElements showIntro={showIntro} />
    </div>
  );
};

export default FlowExperience;