/**
 * Audio system types
 */

export type AudioPreset = 'ocean' | 'rain' | 'theta' | 'ambient' | 'forest' | 'none';

export interface AudioState {
  isInitialized: boolean;
  currentPreset: AudioPreset;
  volume: number;
  isMuted: boolean;
}

export interface AudioAnalysis {
  fft: Float32Array;
  waveform: Float32Array;
  energy: number;
  bass: number;
  mid: number;
  treble: number;
}

export interface AudioEngineConfig {
  enableFFT: boolean;
  fftSize: number;
  smoothingTimeConstant: number;
}

