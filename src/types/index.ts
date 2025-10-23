import * as THREE from 'three';

// Типы для режимов и настроек Flow Experience
export type FlowMode = 'smooth' | 'crawl' | 'dynamic';
export type SubMode = 'spiral' | 'waves' | 'vortex';
export type SoundType = 'theta' | 'noise' | 'rain' | 'ocean';

export interface FlowSettings {
  mode: FlowMode;
  subMode: SubMode;
  baseSpeed: number;
  sound: SoundType;
  flickerSize: boolean;
  flickerAlpha: boolean;
  showTrails: boolean;
  particleCount: number;
}

export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  trail: THREE.Vector3[];
  life: number;
  alpha: number;
  color: THREE.Color;
}

export interface GameState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  particles: Particle[];
  particleSystem: THREE.Points | null;
  trailSystem: THREE.LineSegments | null;
  time: number;
  flowLevel: number;
  isFlowing: boolean;
  flowIntensity: number;
  lastWaveTime: number;
  mouseX: number;
  mouseY: number;
  cameraPhase: number;
}

export interface AudioState {
  ambientDrone: any | null;
  reverb: any | null;
  flowLFO: any | null;
  thetaPulse: any | null;
  harmonicSynth: any | null;
  darkNoise: any | null;
  rainNoise: any | null;
  rainLFO: any | null;
  oceanNoise: any | null;
  waveLFO: any | null;
  volumeLFO: any | null;
}

export interface ControlPanelProps {
  settings: FlowSettings;
  onSettingsChange: (settings: Partial<FlowSettings>) => void;
  onSaveSettings: () => void;
  showUI: boolean;
  onToggleUI: () => void;
}

export interface ModeSelectorProps {
  mode: FlowMode;
  subMode: SubMode;
  onModeChange: (mode: FlowMode) => void;
  onSubModeChange: (subMode: SubMode) => void;
}

export interface SoundSelectorProps {
  sound: SoundType;
  onSoundChange: (sound: SoundType) => void;
}

export interface FlickerSettingsProps {
  flickerSize: boolean;
  flickerAlpha: boolean;
  onFlickerChange: (key: 'flickerSize' | 'flickerAlpha', value: boolean) => void;
}

export interface SpeedSettingsProps {
  baseSpeed: number;
  onSpeedChange: (speed: number) => void;
  onSave: () => void;
}

export interface PerformanceSettingsProps {
  particleCount: number;
  onParticleCountChange: (count: number) => void;
}
