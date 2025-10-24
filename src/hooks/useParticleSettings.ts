import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { ParticleSystem } from '../managers/ParticleSystem';

interface UseParticleSettingsProps {
  particleSystemRef: React.MutableRefObject<ParticleSystem | null>;
}

export const useParticleSettings = ({ particleSystemRef }: UseParticleSettingsProps) => {
  const mode = useSettingsStore((state) => state.mode);
  const speed = useSettingsStore((state) => state.speed);
  const sound = useSettingsStore((state) => state.sound);
  const showTrails = useSettingsStore((state) => state.showTrails);
  const particleCount = useSettingsStore((state) => state.particleCount);
  const particleSize = useSettingsStore((state) => state.particleSize);
  const particleSpeed = useSettingsStore((state) => state.particleSpeed);
  const colorScheme = useSettingsStore((state) => state.colorScheme);

  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.updateSettings({
        mode: mode as any,
        subMode: 'spiral' as any,
        speed,
        sound: sound as any,
        showTrails,
        particleCount,
        particleSize,
        particleSpeed,
        colorScheme
      });
    }
  }, [mode, speed, sound, showTrails, particleCount, particleSize, particleSpeed, colorScheme, particleSystemRef]);
};
