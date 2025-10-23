import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { ParticleSystem } from '../managers/ParticleSystem';

interface UseParticleSettingsProps {
  particleSystemRef: React.MutableRefObject<ParticleSystem | null>;
}

export const useParticleSettings = ({ particleSystemRef }: UseParticleSettingsProps) => {
  const settings = useSettingsStore((state) => ({
    mode: state.mode,
    subMode: state.subMode,
    baseSpeed: state.baseSpeed,
    sound: state.sound,
    flickerSize: state.flickerSize,
    flickerAlpha: state.flickerAlpha,
    showTrails: state.showTrails,
    particleCount: state.particleCount,
    panelMode: state.panelMode
  }));

  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.updateSettings(settings);
    }
  }, [settings, particleSystemRef]);
};
