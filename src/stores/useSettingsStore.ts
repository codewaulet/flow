import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Типы для настроек
export type Mode = 'smooth' | 'dynamic' | 'crawl' | 'chaos';
export type Sound = 'none' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'white_noise' | 'rain' | 'ocean' | 'forest';
export type Speed = number;
export type ParticleCount = number;
export type ParticleSize = number;
export type ParticleSpeed = number;
export type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink';

// Интерфейсы для слайсов
export interface UISlice {
  isSettingsOpen: boolean;
  isOnboardingComplete: boolean;
  currentStep: number;
  showIntro: boolean;
  isFullscreen: boolean;
  showFPS: boolean;
  showDebugInfo: boolean;
}

export interface AudioSlice {
  sound: Sound;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  currentTrack: string | null;
  playlist: string[];
  shuffle: boolean;
  repeat: boolean;
}

export interface VisualSlice {
  mode: Mode;
  speed: Speed;
  particleCount: ParticleCount;
  particleSize: ParticleSize;
  particleSpeed: ParticleSpeed;
  colorScheme: ColorScheme;
  showParticles: boolean;
  showTrails: boolean;
  showConnections: boolean;
  showGrid: boolean;
  showBackground: boolean;
}

export interface PerformanceSlice {
  targetFPS: number;
  adaptiveQuality: boolean;
  lowPowerMode: boolean;
  maxParticles: number;
  enableGPU: boolean;
  enableWebGL: boolean;
  enableWorkers: boolean;
}

export interface GestureSlice {
  enableGestures: boolean;
  gestureSensitivity: number;
  enableSwipe: boolean;
  enablePinch: boolean;
  enableRotate: boolean;
  enableTap: boolean;
  enableLongPress: boolean;
  lastGesture: string | null;
  gestureHistory: string[];
}

// Действия для каждого слайса
export interface UIActions {
  setSettingsOpen: (open: boolean) => void;
  openPanel: () => void;
  closePanel: () => void;
  get isPanelOpen(): boolean;
  setOnboardingComplete: (complete: boolean) => void;
  setCurrentStep: (step: number) => void;
  setShowIntro: (show: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setShowFPS: (show: boolean) => void;
  setShowDebugInfo: (show: boolean) => void;
  resetUI: () => void;
}

export interface AudioActions {
  setSound: (sound: Sound) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTrack: (track: string | null) => void;
  setPlaylist: (playlist: string[]) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: boolean) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  resetAudio: () => void;
}

export interface VisualActions {
  setMode: (mode: Mode) => void;
  setSpeed: (speed: Speed) => void;
  setParticleCount: (count: ParticleCount) => void;
  setParticleSize: (size: ParticleSize) => void;
  setParticleSpeed: (speed: ParticleSpeed) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setShowParticles: (show: boolean) => void;
  setShowTrails: (show: boolean) => void;
  setShowConnections: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowBackground: (show: boolean) => void;
  resetVisual: () => void;
}

export interface PerformanceActions {
  setTargetFPS: (fps: number) => void;
  setAdaptiveQuality: (adaptive: boolean) => void;
  setLowPowerMode: (lowPower: boolean) => void;
  setMaxParticles: (max: number) => void;
  setEnableGPU: (enable: boolean) => void;
  setEnableWebGL: (enable: boolean) => void;
  setEnableWorkers: (enable: boolean) => void;
  resetPerformance: () => void;
}

export interface GestureActions {
  setEnableGestures: (enable: boolean) => void;
  setGestureSensitivity: (sensitivity: number) => void;
  setEnableSwipe: (enable: boolean) => void;
  setEnablePinch: (enable: boolean) => void;
  setEnableRotate: (enable: boolean) => void;
  setEnableTap: (enable: boolean) => void;
  setEnableLongPress: (enable: boolean) => void;
  setLastGesture: (gesture: string | null) => void;
  addGestureToHistory: (gesture: string) => void;
  clearGestureHistory: () => void;
  resetGestures: () => void;
}

// Общий интерфейс стора
export interface SettingsStore extends 
  UISlice, AudioSlice, VisualSlice, PerformanceSlice, GestureSlice,
  UIActions, AudioActions, VisualActions, PerformanceActions, GestureActions {
  // Глобальные действия
  resetAll: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => void;
}

// Начальные значения
const initialUI: UISlice = {
  isSettingsOpen: false,
  isOnboardingComplete: false,
  currentStep: 0,
  showIntro: true,
  isFullscreen: false,
  showFPS: false,
  showDebugInfo: false
};

const initialAudio: AudioSlice = {
  sound: 'none',
  volume: 0.7,
  isMuted: false,
  isPlaying: false,
  currentTrack: null,
  playlist: [],
  shuffle: false,
  repeat: false
};

const initialVisual: VisualSlice = {
  mode: 'smooth',
  speed: 1.0,
  particleCount: 100,
  particleSize: 2,
  particleSpeed: 1.0,
  colorScheme: 'blue',
  showParticles: true,
  showTrails: true,
  showConnections: true,
  showGrid: false,
  showBackground: true
};

const initialPerformance: PerformanceSlice = {
  targetFPS: 60,
  adaptiveQuality: true,
  lowPowerMode: false,
  maxParticles: 500,
  enableGPU: true,
  enableWebGL: true,
  enableWorkers: true
};

const initialGestures: GestureSlice = {
  enableGestures: true,
  gestureSensitivity: 0.7,
  enableSwipe: true,
  enablePinch: true,
  enableRotate: true,
  enableTap: true,
  enableLongPress: true,
  lastGesture: null,
  gestureHistory: []
};

// Селекторы для производительности
export const selectUI = (state: SettingsStore) => ({
  isSettingsOpen: state.isSettingsOpen,
  isOnboardingComplete: state.isOnboardingComplete,
  currentStep: state.currentStep,
  showIntro: state.showIntro,
  isFullscreen: state.isFullscreen,
  showFPS: state.showFPS,
  showDebugInfo: state.showDebugInfo
});

export const selectAudio = (state: SettingsStore) => ({
  sound: state.sound,
  volume: state.volume,
  isMuted: state.isMuted,
  isPlaying: state.isPlaying,
  currentTrack: state.currentTrack,
  playlist: state.playlist,
  shuffle: state.shuffle,
  repeat: state.repeat
});

export const selectVisual = (state: SettingsStore) => ({
  mode: state.mode,
  speed: state.speed,
  particleCount: state.particleCount,
  particleSize: state.particleSize,
  particleSpeed: state.particleSpeed,
  colorScheme: state.colorScheme,
  showParticles: state.showParticles,
  showTrails: state.showTrails,
  showConnections: state.showConnections,
  showGrid: state.showGrid,
  showBackground: state.showBackground
});

export const selectPerformance = (state: SettingsStore) => ({
  targetFPS: state.targetFPS,
  adaptiveQuality: state.adaptiveQuality,
  lowPowerMode: state.lowPowerMode,
  maxParticles: state.maxParticles,
  enableGPU: state.enableGPU,
  enableWebGL: state.enableWebGL,
  enableWorkers: state.enableWorkers
});

export const selectGestures = (state: SettingsStore) => ({
  enableGestures: state.enableGestures,
  gestureSensitivity: state.gestureSensitivity,
  enableSwipe: state.enableSwipe,
  enablePinch: state.enablePinch,
  enableRotate: state.enableRotate,
  enableTap: state.enableTap,
  enableLongPress: state.enableLongPress,
  lastGesture: state.lastGesture,
  gestureHistory: state.gestureHistory
});

// Создание стора
export const useSettingsStore = create<SettingsStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Начальные значения
        ...initialUI,
        ...initialAudio,
        ...initialVisual,
        ...initialPerformance,
        ...initialGestures,

        // UI Actions
        setSettingsOpen: (open: boolean) => set((state) => {
          state.isSettingsOpen = open;
        }),
        openPanel: () => set((state) => {
          state.isSettingsOpen = true;
        }),
        closePanel: () => set((state) => {
          state.isSettingsOpen = false;
        }),
        get isPanelOpen() {
          return get().isSettingsOpen;
        },
        setOnboardingComplete: (complete: boolean) => set((state) => {
          state.isOnboardingComplete = complete;
        }),
        setCurrentStep: (step: number) => set((state) => {
          state.currentStep = step;
        }),
        setShowIntro: (show: boolean) => set((state) => {
          state.showIntro = show;
        }),
        setFullscreen: (fullscreen: boolean) => set((state) => {
          state.isFullscreen = fullscreen;
        }),
        setShowFPS: (show: boolean) => set((state) => {
          state.showFPS = show;
        }),
        setShowDebugInfo: (show: boolean) => set((state) => {
          state.showDebugInfo = show;
        }),
        resetUI: () => set((state) => {
          Object.assign(state, initialUI);
        }),

        // Audio Actions
        setSound: (sound: Sound) => set((state) => {
          state.sound = sound;
        }),
        setVolume: (volume: number) => set((state) => {
          state.volume = Math.max(0, Math.min(1, volume));
        }),
        setMuted: (muted: boolean) => set((state) => {
          state.isMuted = muted;
        }),
        setPlaying: (playing: boolean) => set((state) => {
          state.isPlaying = playing;
        }),
        setCurrentTrack: (track: string | null) => set((state) => {
          state.currentTrack = track;
        }),
        setPlaylist: (playlist: string[]) => set((state) => {
          state.playlist = playlist;
        }),
        setShuffle: (shuffle: boolean) => set((state) => {
          state.shuffle = shuffle;
        }),
        setRepeat: (repeat: boolean) => set((state) => {
          state.repeat = repeat;
        }),
        nextTrack: () => set((state) => {
          if (state.playlist.length > 0) {
            const currentIndex = state.playlist.indexOf(state.currentTrack || '');
            const nextIndex = (currentIndex + 1) % state.playlist.length;
            state.currentTrack = state.playlist[nextIndex];
          }
        }),
        previousTrack: () => set((state) => {
          if (state.playlist.length > 0) {
            const currentIndex = state.playlist.indexOf(state.currentTrack || '');
            const prevIndex = currentIndex <= 0 ? state.playlist.length - 1 : currentIndex - 1;
            state.currentTrack = state.playlist[prevIndex];
          }
        }),
        resetAudio: () => set((state) => {
          Object.assign(state, initialAudio);
        }),

        // Visual Actions
        setMode: (mode: Mode) => set((state) => {
          state.mode = mode;
        }),
        setSpeed: (speed: Speed) => set((state) => {
          state.speed = Math.max(0.1, Math.min(5.0, speed));
        }),
        setParticleCount: (count: ParticleCount) => set((state) => {
          state.particleCount = Math.max(10, Math.min(1000, count));
        }),
        setParticleSize: (size: ParticleSize) => set((state) => {
          state.particleSize = Math.max(1, Math.min(10, size));
        }),
        setParticleSpeed: (speed: ParticleSpeed) => set((state) => {
          state.particleSpeed = Math.max(0.1, Math.min(3.0, speed));
        }),
        setColorScheme: (scheme: ColorScheme) => set((state) => {
          state.colorScheme = scheme;
        }),
        setShowParticles: (show: boolean) => set((state) => {
          state.showParticles = show;
        }),
        setShowTrails: (show: boolean) => set((state) => {
          state.showTrails = show;
        }),
        setShowConnections: (show: boolean) => set((state) => {
          state.showConnections = show;
        }),
        setShowGrid: (show: boolean) => set((state) => {
          state.showGrid = show;
        }),
        setShowBackground: (show: boolean) => set((state) => {
          state.showBackground = show;
        }),
        resetVisual: () => set((state) => {
          Object.assign(state, initialVisual);
        }),

        // Performance Actions
        setTargetFPS: (fps: number) => set((state) => {
          state.targetFPS = Math.max(30, Math.min(120, fps));
        }),
        setAdaptiveQuality: (adaptive: boolean) => set((state) => {
          state.adaptiveQuality = adaptive;
        }),
        setLowPowerMode: (lowPower: boolean) => set((state) => {
          state.lowPowerMode = lowPower;
        }),
        setMaxParticles: (max: number) => set((state) => {
          state.maxParticles = Math.max(100, Math.min(2000, max));
        }),
        setEnableGPU: (enable: boolean) => set((state) => {
          state.enableGPU = enable;
        }),
        setEnableWebGL: (enable: boolean) => set((state) => {
          state.enableWebGL = enable;
        }),
        setEnableWorkers: (enable: boolean) => set((state) => {
          state.enableWorkers = enable;
        }),
        resetPerformance: () => set((state) => {
          Object.assign(state, initialPerformance);
        }),

        // Gesture Actions
        setEnableGestures: (enable: boolean) => set((state) => {
          state.enableGestures = enable;
        }),
        setGestureSensitivity: (sensitivity: number) => set((state) => {
          state.gestureSensitivity = Math.max(0.1, Math.min(1.0, sensitivity));
        }),
        setEnableSwipe: (enable: boolean) => set((state) => {
          state.enableSwipe = enable;
        }),
        setEnablePinch: (enable: boolean) => set((state) => {
          state.enablePinch = enable;
        }),
        setEnableRotate: (enable: boolean) => set((state) => {
          state.enableRotate = enable;
        }),
        setEnableTap: (enable: boolean) => set((state) => {
          state.enableTap = enable;
        }),
        setEnableLongPress: (enable: boolean) => set((state) => {
          state.enableLongPress = enable;
        }),
        setLastGesture: (gesture: string | null) => set((state) => {
          state.lastGesture = gesture;
        }),
        addGestureToHistory: (gesture: string) => set((state) => {
          state.gestureHistory = [...state.gestureHistory.slice(-9), gesture];
        }),
        clearGestureHistory: () => set((state) => {
          state.gestureHistory = [];
        }),
        resetGestures: () => set((state) => {
          Object.assign(state, initialGestures);
        }),

        // Глобальные действия
        resetAll: () => set((state) => {
          Object.assign(state, {
            ...initialUI,
            ...initialAudio,
            ...initialVisual,
            ...initialPerformance,
            ...initialGestures
          });
        }),
        exportSettings: () => {
          const state = get();
          return JSON.stringify({
            ui: selectUI(state),
            audio: selectAudio(state),
            visual: selectVisual(state),
            performance: selectPerformance(state),
            gestures: selectGestures(state)
          });
        },
        importSettings: (settings: string) => set((state) => {
          try {
            const imported = JSON.parse(settings);
            if (imported.ui) Object.assign(state, imported.ui);
            if (imported.audio) Object.assign(state, imported.audio);
            if (imported.visual) Object.assign(state, imported.visual);
            if (imported.performance) Object.assign(state, imported.performance);
            if (imported.gestures) Object.assign(state, imported.gestures);
          } catch (error) {
            console.error('Ошибка импорта настроек:', error);
          }
        })
      }))
    ),
    { name: 'settings-store' }
  )
);