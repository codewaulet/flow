/**
 * Enhanced audio engine with multiple presets and FFT analysis
 */

import * as Tone from 'tone';
import { AudioPreset, AudioAnalysis, AudioEngineConfig } from './types';

export class AudioEngine {
  private static instance: AudioEngine;
  private isInitialized: boolean = false;
  private currentPreset: AudioPreset = 'none';
  private volume: number = 0.7;
  
  // Audio nodes
  private masterGain: Tone.Gain | null = null;
  private analyser: Tone.Analyser | null = null;
  private reverb: Tone.Reverb | null = null;
  
  // Preset players
  private oceanNoise: Tone.Noise | null = null;
  private oceanFilter: Tone.Filter | null = null;
  private waveLFO: Tone.LFO | null = null;
  private volumeLFO: Tone.LFO | null = null;
  
  private rainNoise: Tone.Noise | null = null;
  private rainFilter: Tone.Filter | null = null;
  private rainLFO: Tone.LFO | null = null;
  
  private thetaDrone: Tone.FMSynth | null = null;
  private thetaPulse: Tone.LFO | null = null;
  private flowLFO: Tone.LFO | null = null;
  
  private ambientSynth: Tone.PolySynth | null = null;
  private ambientNoise: Tone.Noise | null = null;
  
  private forestNoise: Tone.Noise | null = null;
  private forestFilter: Tone.Filter | null = null;
  private birdLFO: Tone.LFO | null = null;
  
  private config: AudioEngineConfig = {
    enableFFT: true,
    fftSize: 256,
    smoothingTimeConstant: 0.8,
  };
  
  private constructor() {}
  
  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }
  
  /**
   * Initialize audio context and create all audio nodes
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await Tone.start();
      await this.createAudioGraph();
      this.isInitialized = true;
      console.log('AudioEngine initialized');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Create the audio processing graph
   */
  private async createAudioGraph(): Promise<void> {
    // Master gain control
    this.masterGain = new Tone.Gain(this.volume).toDestination();
    
    // Analyser for FFT
    if (this.config.enableFFT) {
      this.analyser = new Tone.Analyser('fft', this.config.fftSize);
      this.masterGain.connect(this.analyser);
    }
    
    // Shared reverb
    this.reverb = new Tone.Reverb({
      decay: 15,
      wet: 0.7,
    });
    await this.reverb.generate();
    this.reverb.connect(this.masterGain);
    
    // Create all presets
    await this.createOceanPreset();
    await this.createRainPreset();
    await this.createThetaPreset();
    await this.createAmbientPreset();
    await this.createForestPreset();
  }
  
  /**
   * Ocean waves preset
   */
  private async createOceanPreset(): Promise<void> {
    this.oceanNoise = new Tone.Noise('brown');
    this.oceanFilter = new Tone.Filter(400, 'lowpass');
    
    // Simulate wave motion with LFO
    this.waveLFO = new Tone.LFO(0.08, 200, 500);
    this.waveLFO.connect(this.oceanFilter.frequency);
    this.waveLFO.start();
    
    // Volume variation for wave intensity
    this.volumeLFO = new Tone.LFO(0.06, -20, -10);
    this.volumeLFO.connect(this.oceanNoise.volume);
    this.volumeLFO.start();
    
    this.oceanNoise.chain(this.oceanFilter, this.reverb!);
    this.oceanNoise.volume.value = -25;
  }
  
  /**
   * Rain preset
   */
  private async createRainPreset(): Promise<void> {
    this.rainNoise = new Tone.Noise('white');
    this.rainFilter = new Tone.Filter(800, 'bandpass');
    
    // Vary the rain intensity
    this.rainLFO = new Tone.LFO(0.3, 600, 1000);
    this.rainLFO.connect(this.rainFilter.frequency);
    this.rainLFO.start();
    
    this.rainNoise.chain(this.rainFilter, this.reverb!);
    this.rainNoise.volume.value = -35;
  }
  
  /**
   * Theta wave binaural beats (6-8Hz)
   */
  private async createThetaPreset(): Promise<void> {
    // Theta pulsation (6 Hz)
    this.thetaPulse = new Tone.LFO('6hz', -20, 0);
    this.thetaPulse.start();
    
    // Deep drone
    this.thetaDrone = new Tone.FMSynth({
      harmonicity: 1.2,
      modulationIndex: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 10, decay: 0, sustain: 1, release: 10 },
    });
    this.thetaDrone.connect(this.reverb!);
    this.thetaDrone.volume.value = -25;
    this.thetaPulse.connect(this.thetaDrone.volume);
    
    // Gentle frequency modulation
    this.flowLFO = new Tone.LFO('0.05hz', -15, 15);
    this.flowLFO.connect(this.thetaDrone.detune);
    this.flowLFO.start();
  }
  
  /**
   * Ambient soundscape
   */
  private async createAmbientPreset(): Promise<void> {
    // Ambient pads
    this.ambientSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 2, decay: 2, sustain: 0.5, release: 4 }
    });
    this.ambientSynth.connect(this.reverb!);
    this.ambientSynth.volume.value = -40;
    
    // Subtle noise bed
    this.ambientNoise = new Tone.Noise('brown');
    const ambientFilter = new Tone.Filter(300, 'lowpass');
    this.ambientNoise.chain(ambientFilter, this.reverb!);
    this.ambientNoise.volume.value = -35;
  }
  
  /**
   * Forest ambience
   */
  private async createForestPreset(): Promise<void> {
    this.forestNoise = new Tone.Noise('pink');
    this.forestFilter = new Tone.Filter(2000, 'highpass');
    
    // Simulate bird chirps with varying filter
    this.birdLFO = new Tone.LFO(0.5, 1500, 3000);
    this.birdLFO.connect(this.forestFilter.frequency);
    this.birdLFO.start();
    
    this.forestNoise.chain(this.forestFilter, this.reverb!);
    this.forestNoise.volume.value = -30;
  }
  
  /**
   * Switch to a different preset
   */
  public async switchPreset(preset: AudioPreset): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Stop current preset
    this.stopCurrentPreset();
    
    // Start new preset
    this.currentPreset = preset;
    
    switch (preset) {
      case 'ocean':
        this.oceanNoise?.start();
        break;
      case 'rain':
        this.rainNoise?.start();
        break;
      case 'theta':
        this.thetaDrone?.triggerAttack('C1');
        break;
      case 'ambient':
        this.ambientNoise?.start();
        this.triggerAmbientChord();
        break;
      case 'forest':
        this.forestNoise?.start();
        break;
      case 'none':
        // All stopped
        break;
    }
  }
  
  /**
   * Stop the currently playing preset
   */
  private stopCurrentPreset(): void {
    this.oceanNoise?.stop();
    this.rainNoise?.stop();
    this.thetaDrone?.triggerRelease();
    this.ambientNoise?.stop();
    this.ambientSynth?.releaseAll();
    this.forestNoise?.stop();
  }
  
  /**
   * Trigger ambient harmonic tones
   */
  private triggerAmbientChord(): void {
    if (!this.ambientSynth) return;
    
    const chords = [
      ['C3', 'E3', 'G3'],
      ['A2', 'C3', 'E3'],
      ['F2', 'A2', 'C3'],
      ['G2', 'B2', 'D3'],
    ];
    
    const chord = chords[Math.floor(Math.random() * chords.length)];
    this.ambientSynth.triggerAttackRelease(chord, '8n', Tone.now(), 0.3);
    
    // Schedule next chord
    setTimeout(() => {
      if (this.currentPreset === 'ambient') {
        this.triggerAmbientChord();
      }
    }, Math.random() * 5000 + 3000); // 3-8 seconds
  }
  
  /**
   * Set master volume (0-1)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.rampTo(this.volume, 0.5);
    }
  }
  
  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.volume;
  }
  
  /**
   * Get FFT analysis data
   */
  public getAnalysis(): AudioAnalysis | null {
    if (!this.analyser) return null;
    
    const fft = this.analyser.getValue() as Float32Array;
    const waveform = new Float32Array(fft.length);
    
    // Calculate energy bands
    const bass = this.getAverageEnergy(fft, 0, 8);
    const mid = this.getAverageEnergy(fft, 8, 32);
    const treble = this.getAverageEnergy(fft, 32, fft.length);
    const energy = (bass + mid + treble) / 3;
    
    return {
      fft,
      waveform,
      energy,
      bass,
      mid,
      treble,
    };
  }
  
  /**
   * Calculate average energy in a frequency range
   */
  private getAverageEnergy(fft: Float32Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end && i < fft.length; i++) {
      // Convert dB to linear
      const db = fft[i];
      const linear = Math.pow(10, db / 20);
      sum += linear;
    }
    return sum / (end - start);
  }
  
  /**
   * Get current preset
   */
  public getCurrentPreset(): AudioPreset {
    return this.currentPreset;
  }
  
  /**
   * Check if audio is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Clean up all audio resources
   */
  public dispose(): void {
    this.stopCurrentPreset();
    
    // Dispose all nodes
    [
      this.oceanNoise, this.oceanFilter, this.waveLFO, this.volumeLFO,
      this.rainNoise, this.rainFilter, this.rainLFO,
      this.thetaDrone, this.thetaPulse, this.flowLFO,
      this.ambientSynth, this.ambientNoise,
      this.forestNoise, this.forestFilter, this.birdLFO,
      this.analyser, this.reverb, this.masterGain,
    ].forEach(node => {
      if (node && typeof node.dispose === 'function') {
        node.dispose();
      }
    });
    
    this.isInitialized = false;
  }
}

