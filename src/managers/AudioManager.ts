import * as Tone from 'tone';
import { AudioState, SoundType } from '../types';

export class AudioManager {
  private static instance: AudioManager;
  private audioState: AudioState;
  private isInitialized: boolean = false;

  private constructor() {
    this.audioState = {
      ambientDrone: null,
      reverb: null,
      flowLFO: null,
      thetaPulse: null,
      harmonicSynth: null,
      darkNoise: null,
      rainNoise: null,
      rainLFO: null,
      oceanNoise: null,
      waveLFO: null,
      volumeLFO: null
    };
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Проверяем и возобновляем suspended контекст
      if (Tone.context.state === 'suspended') {
        await Tone.context.resume();
      }
      
      await Tone.start();
      await this.createAudioNodes();
      this.isInitialized = true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      throw error;
    }
  }

  private async createAudioNodes(): Promise<void> {
    // 1. Реверберация
    const reverb = new Tone.Reverb({
      decay: 15,
      wet: 0.7,
    }).toDestination();
    await reverb.generate();
    this.audioState.reverb = reverb;

    // 2. Theta пульсация (6 Гц)
    const thetaPulse = new Tone.LFO('6hz', -20, 0).start();
    this.audioState.thetaPulse = thetaPulse;

    // 3. Основной дрон
    const drone = new Tone.FMSynth({
      harmonicity: 1.2,
      modulationIndex: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 10, decay: 0, sustain: 1, release: 10 },
    }).connect(reverb);
    drone.volume.value = -25;
    thetaPulse.connect(drone.volume);
    drone.triggerAttack('C1');
    this.audioState.ambientDrone = drone;

    // 4. Живой LFO для дрона
    const flowLFO = new Tone.LFO('0.05hz', -15, 15).connect(drone.detune);
    flowLFO.start();
    this.audioState.flowLFO = flowLFO;

    // 5. Гармонические тона
    const harmonicSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 2, decay: 2, sustain: 0.5, release: 4 }
    }).connect(reverb);
    harmonicSynth.volume.value = -40;
    this.audioState.harmonicSynth = harmonicSynth;

    // 6. Dark Noise
    const darkNoise = new Tone.Noise('brown');
    const darkFilter = new Tone.Filter(200, 'lowpass');
    darkNoise.chain(darkFilter, reverb, Tone.Destination);
    darkNoise.volume.value = -30;
    this.audioState.darkNoise = darkNoise;

    // 7. Rain
    const rainNoise = new Tone.Noise('white');
    const rainFilter = new Tone.Filter(800, 'bandpass');
    const rainLFO = new Tone.LFO(0.3, 600, 1000);
    rainLFO.connect(rainFilter.frequency);
    rainLFO.start();
    rainNoise.chain(rainFilter, reverb, Tone.Destination);
    rainNoise.volume.value = -35;
    this.audioState.rainNoise = rainNoise;
    this.audioState.rainLFO = rainLFO;

    // 8. Ocean
    const oceanNoise = new Tone.Noise('brown');
    const oceanFilter = new Tone.Filter(400, 'lowpass');
    const waveLFO = new Tone.LFO(0.08, 200, 500);
    waveLFO.connect(oceanFilter.frequency);
    waveLFO.start();
    const volumeLFO = new Tone.LFO(0.06, -20, -10);
    volumeLFO.connect(oceanNoise.volume);
    volumeLFO.start();
    oceanNoise.chain(oceanFilter, reverb, Tone.Destination);
    oceanNoise.volume.value = -25;
    this.audioState.oceanNoise = oceanNoise;
    this.audioState.waveLFO = waveLFO;
    this.audioState.volumeLFO = volumeLFO;
  }

  public switchSound(soundType: SoundType): void {
    // Останавливаем все звуки
    this.stopAllSounds();

    // Запускаем выбранный звук
    switch (soundType) {
      case 'theta':
        if (this.audioState.ambientDrone) {
          this.audioState.ambientDrone.triggerAttack('C1');
        }
        break;
      case 'noise':
        if (this.audioState.darkNoise) {
          this.audioState.darkNoise.start();
        }
        break;
      case 'rain':
        if (this.audioState.rainNoise) {
          this.audioState.rainNoise.start();
        }
        break;
      case 'ocean':
        if (this.audioState.oceanNoise) {
          this.audioState.oceanNoise.start();
        }
        break;
    }
  }

  private stopAllSounds(): void {
    if (this.audioState.ambientDrone) this.audioState.ambientDrone.triggerRelease();
    if (this.audioState.darkNoise) this.audioState.darkNoise.stop();
    if (this.audioState.rainNoise) this.audioState.rainNoise.stop();
    if (this.audioState.oceanNoise) this.audioState.oceanNoise.stop();
  }

  public updateSoundWithSpeed(currentSpeed: number, soundType: SoundType): void {
    switch (soundType) {
      case 'theta':
        if (this.audioState.thetaPulse) {
          this.audioState.thetaPulse.frequency.value = 6 + (currentSpeed - 1) * 2;
        }
        break;
      case 'rain':
        if (this.audioState.rainLFO) {
          this.audioState.rainLFO.frequency.value = 0.3 * currentSpeed;
        }
        break;
      case 'ocean':
        if (this.audioState.waveLFO) {
          this.audioState.waveLFO.frequency.value = 0.08 * currentSpeed;
        }
        break;
      case 'noise':
        if (this.audioState.darkNoise) {
          this.audioState.darkNoise.volume.value = -30 + (currentSpeed - 1) * 5;
        }
        break;
    }
  }

  public triggerHarmonicTone(flowLevel: number): void {
    if (this.audioState.harmonicSynth && flowLevel > 0.3) {
      const notes = ['C4', 'E4', 'G4', 'B4', 'D5'];
      const note = notes[Math.floor(Math.random() * notes.length)];
      this.audioState.harmonicSynth.triggerAttackRelease(note, '2n', Tone.now(), 0.2);
      this.audioState.harmonicSynth.volume.value = -42 + flowLevel * 12;
    }
  }

  public dispose(): void {
    Object.values(this.audioState).forEach(node => {
      if (node && typeof node.dispose === 'function') {
        node.dispose();
      }
    });
    Tone.context.dispose();
  }

  public getAudioState(): AudioState {
    return this.audioState;
  }
}
