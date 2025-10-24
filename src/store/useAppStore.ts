/**
 * Global application state store using Zustand
 */

import { create } from 'zustand';
import { AudioPreset } from '../core/audio/types';

export type VisualMode = 'breathe' | 'toroid' | 'weaver' | 'starfield' | 'matrix' | 'orbs';

export interface ModeConfig {
  speed: number;
  intensity: number;
  particleCount: number;
  color: string;
}

export interface AppState {
  // Visual state
  currentMode: VisualMode;
  modeConfig: Record<VisualMode, ModeConfig>;
  isPaused: boolean;
  isTransitioning: boolean;
  
  // Audio state
  audioPreset: AudioPreset;
  audioVolume: number;
  audioMuted: boolean;
  
  // UI state
  uiVisible: boolean;
  settingsOpen: boolean;
  splashDismissed: boolean;
  
  // Performance
  qualityLevel: 'low' | 'medium' | 'high';
  fps: number;
  
  // Session
  sessionStartTime: number | null;
  sessionDuration: number; // in seconds
  timerActive: boolean;
  timerDuration: number; // in seconds
  
  // Settings
  hapticEnabled: boolean;
  showFPS: boolean;
  
  // Actions
  setCurrentMode: (mode: VisualMode) => void;
  updateModeConfig: (mode: VisualMode, config: Partial<ModeConfig>) => void;
  togglePause: () => void;
  setTransitioning: (isTransitioning: boolean) => void;
  
  setAudioPreset: (preset: AudioPreset) => void;
  setAudioVolume: (volume: number) => void;
  toggleAudioMute: () => void;
  
  setUIVisible: (visible: boolean) => void;
  toggleUI: () => void;
  setSettingsOpen: (open: boolean) => void;
  dismissSplash: () => void;
  
  setQualityLevel: (level: 'low' | 'medium' | 'high') => void;
  updateFPS: (fps: number) => void;
  
  startSession: () => void;
  endSession: () => void;
  updateSessionDuration: (duration: number) => void;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
  
  setHapticEnabled: (enabled: boolean) => void;
  toggleFPS: () => void;
}

// Default mode configurations
const defaultModeConfigs: Record<VisualMode, ModeConfig> = {
  breathe: {
    speed: 8.0,
    intensity: 0.7,
    particleCount: 6,
    color: '#a78bfa',
  },
  toroid: {
    speed: 0.5,
    intensity: 0.8,
    particleCount: 5000,
    color: '#a78bfa',
  },
  weaver: {
    speed: 0.8,
    intensity: 0.5,
    particleCount: 3000,
    color: '#a78bfa',
  },
  starfield: {
    speed: 0.5,
    intensity: 1.0,
    particleCount: 5000,
    color: '#ffffff',
  },
  matrix: {
    speed: 1.0,
    intensity: 1.0,
    particleCount: 100,
    color: '#00ff00',
  },
  orbs: {
    speed: 0.5,
    intensity: 0.7,
    particleCount: 200,
    color: '#a78bfa',
  },
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentMode: 'breathe',
  modeConfig: defaultModeConfigs,
  isPaused: false,
  isTransitioning: false,
  
  audioPreset: 'none',
  audioVolume: 0.7,
  audioMuted: false,
  
  uiVisible: true,
  settingsOpen: false,
  splashDismissed: false,
  
  qualityLevel: 'high',
  fps: 60,
  
  sessionStartTime: null,
  sessionDuration: 0,
  timerActive: false,
  timerDuration: 0,
  
  hapticEnabled: true,
  showFPS: false,
  
  // Actions
  setCurrentMode: (mode) => set({ currentMode: mode }),
  
  updateModeConfig: (mode, config) => set((state) => ({
    modeConfig: {
      ...state.modeConfig,
      [mode]: {
        ...state.modeConfig[mode],
        ...config,
      },
    },
  })),
  
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  
  setAudioPreset: (preset) => set({ audioPreset: preset }),
  
  setAudioVolume: (volume) => set({ audioVolume: Math.max(0, Math.min(1, volume)) }),
  
  toggleAudioMute: () => set((state) => ({ audioMuted: !state.audioMuted })),
  
  setUIVisible: (visible) => set({ uiVisible: visible }),
  
  toggleUI: () => set((state) => ({ uiVisible: !state.uiVisible })),
  
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  
  dismissSplash: () => set({ splashDismissed: true }),
  
  setQualityLevel: (level) => set({ qualityLevel: level }),
  
  updateFPS: (fps) => set({ fps }),
  
  startSession: () => set({
    sessionStartTime: Date.now(),
    sessionDuration: 0,
  }),
  
  endSession: () => set({
    sessionStartTime: null,
    sessionDuration: 0,
  }),
  
  updateSessionDuration: (duration) => set({ sessionDuration: duration }),
  
  startTimer: (duration) => set({
    timerActive: true,
    timerDuration: duration,
  }),
  
  stopTimer: () => set({
    timerActive: false,
    timerDuration: 0,
  }),
  
  setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
  
  toggleFPS: () => set((state) => ({ showFPS: !state.showFPS })),
}));

