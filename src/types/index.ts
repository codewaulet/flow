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
  panelMode: 'slide' | 'center';
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
