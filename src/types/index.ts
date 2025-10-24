import * as THREE from 'three';

// Типы для режимов и настроек Flow Experience
export type FlowMode = 'smooth' | 'crawl' | 'dynamic' | 'chaos';
export type SubMode = 'spiral' | 'waves' | 'vortex';
export type SoundType = 'none' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'white_noise' | 'rain' | 'ocean' | 'forest';
export type SpecialMode = 'meditation' | 'focus' | 'creative' | 'audio';
export type Theme = 'light' | 'dark' | 'system';

export interface FlowSettings {
  mode: FlowMode;
  subMode?: SubMode;
  speed: number;
  sound: SoundType;
  showTrails: boolean;
  particleCount: number;
  particleSize: number;
  particleSpeed: number;
  colorScheme: string;
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

// Типы для жестов
export type GestureType = 'swipe' | 'pinch' | 'tap' | 'longPress';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface GestureEvent {
  type: GestureType;
  direction?: SwipeDirection;
  velocity?: number;
  scale?: number;
  position?: { x: number; y: number };
}

// UI типы
export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  unit?: string;
  label: string;
  description?: string;
}

// Onboarding типы
export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  preview?: React.ReactNode;
}

// Performance типы
export interface PerformanceMetrics {
  fps: number;
  particleCount: number;
  memoryUsage: number;
  renderTime: number;
}

// Theme типы
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
  };
  isDark: boolean;
}
