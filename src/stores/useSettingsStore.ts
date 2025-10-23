import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import { FlowSettings, FlowMode, SubMode, SoundType } from '../types';

interface SettingsState extends FlowSettings {
  // UI состояние
  isPanelOpen: boolean;
  activeSection: 'modes' | 'sounds' | 'performance' | null;
  
  // Действия
  setMode: (mode: FlowMode) => void;
  setSubMode: (subMode: SubMode) => void;
  setSound: (sound: SoundType) => void;
  setSpeed: (speed: number) => void;
  setFlickerSize: (enabled: boolean) => void;
  setFlickerAlpha: (enabled: boolean) => void;
  setShowTrails: (enabled: boolean) => void;
  setParticleCount: (count: number) => void;
  
  // UI действия
  openPanel: () => void;
  closePanel: () => void;
  setActiveSection: (section: 'modes' | 'sounds' | 'performance' | null) => void;
  togglePanel: () => void;
  
  // Пресеты
  applyPreset: (preset: 'chill' | 'focus' | 'energy') => void;
  resetToDefaults: () => void;
}

const defaultSettings: FlowSettings = {
  mode: 'smooth',
  subMode: 'spiral',
  baseSpeed: 1.0,
  sound: 'theta',
  flickerSize: false,
  flickerAlpha: false,
  showTrails: false,
  particleCount: 1000,
  panelMode: 'slide'
};

const presets = {
  chill: {
    mode: 'smooth' as FlowMode,
    subMode: 'waves' as SubMode,
    baseSpeed: 0.5,
    sound: 'ocean' as SoundType,
    flickerSize: false,
    flickerAlpha: true,
    showTrails: true,
    particleCount: 800
  },
  focus: {
    mode: 'smooth' as FlowMode,
    subMode: 'spiral' as SubMode,
    baseSpeed: 0.8,
    sound: 'theta' as SoundType,
    flickerSize: false,
    flickerAlpha: false,
    showTrails: false,
    particleCount: 1000
  },
  energy: {
    mode: 'dynamic' as FlowMode,
    subMode: 'vortex' as SubMode,
    baseSpeed: 1.5,
    sound: 'noise' as SoundType,
    flickerSize: true,
    flickerAlpha: true,
    showTrails: true,
    particleCount: 1500
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Начальные настройки
      ...defaultSettings,
      
      // UI состояние
      isPanelOpen: false,
      activeSection: null,
      
      // Действия настроек
      setMode: (mode) => set({ mode }),
      setSubMode: (subMode) => set({ subMode }),
      setSound: (sound) => set({ sound }),
      setSpeed: (speed) => set({ baseSpeed: speed }),
      setFlickerSize: (enabled) => set({ flickerSize: enabled }),
      setFlickerAlpha: (enabled) => set({ flickerAlpha: enabled }),
      setShowTrails: (enabled) => set({ showTrails: enabled }),
      setParticleCount: (count) => set({ particleCount: count }),
      
      // UI действия
      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => set({ isPanelOpen: false, activeSection: null }),
      setActiveSection: (section) => set({ activeSection: section }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      
      // Пресеты
      applyPreset: (preset) => set((state) => ({
        ...state,
        ...presets[preset]
      })),
      
      resetToDefaults: () => set((state) => ({
        ...state,
        ...defaultSettings
      }))
    }),
    {
      name: 'flow-settings',
      partialize: (state) => ({
        mode: state.mode,
        subMode: state.subMode,
        baseSpeed: state.baseSpeed,
        sound: state.sound,
        flickerSize: state.flickerSize,
        flickerAlpha: state.flickerAlpha,
        showTrails: state.showTrails,
        particleCount: state.particleCount
      })
    }
  )
);

// Хук для быстрого доступа к настройкам с shallow compare
export const useSettings = () => {
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
  
  // Используем shallow compare для предотвращения лишних ре-рендеров
  return useMemo(() => settings, [
    settings.mode,
    settings.subMode,
    settings.baseSpeed,
    settings.sound,
    settings.flickerSize,
    settings.flickerAlpha,
    settings.showTrails,
    settings.particleCount,
    settings.panelMode
  ]);
};
