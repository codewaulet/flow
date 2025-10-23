import { FlowSettings } from '../types';

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: FlowSettings;

  private constructor() {
    this.settings = this.getDefaultSettings();
    this.loadSettings();
  }

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  private getDefaultSettings(): FlowSettings {
    return {
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
  }

  public getSettings(): FlowSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<FlowSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public loadSettings(): void {
    try {
      // Загружаем из localStorage
      const saved = localStorage.getItem('flowSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsedSettings };
      }

      // Загружаем URL параметры
      const params = new URLSearchParams(window.location.search);
      if (params.has('mode')) {
        const mode = params.get('mode') as FlowSettings['mode'];
        if (['smooth', 'crawl', 'dynamic'].includes(mode)) {
          this.settings.mode = mode;
        }
      }
      if (params.has('sound')) {
        const sound = params.get('sound') as FlowSettings['sound'];
        if (['theta', 'noise', 'rain', 'ocean'].includes(sound)) {
          this.settings.sound = sound;
        }
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  public saveSettings(): void {
    try {
      localStorage.setItem('flowSettings', JSON.stringify(this.settings));

      // Обновляем URL параметры
      const url = new URL(window.location.href);
      url.searchParams.set('mode', this.settings.mode);
      url.searchParams.set('sound', this.settings.sound);
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  public resetToDefaults(): void {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
  }
}
