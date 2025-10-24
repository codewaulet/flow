/**
 * Base class for all visual modes
 */

import * as THREE from 'three';

export interface ModeConfig {
  speed: number;
  intensity: number;
  particleCount: number;
  color: string;
}

export interface ModeMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultConfig: ModeConfig;
}

export abstract class BaseMode {
  protected scene: THREE.Scene;
  protected camera: THREE.Camera;
  protected renderer: THREE.WebGLRenderer;
  protected config: ModeConfig;
  protected metadata: ModeMetadata;
  protected isActive: boolean = false;
  protected animationId: number | null = null;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    metadata: ModeMetadata
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.metadata = metadata;
    this.config = { ...metadata.defaultConfig };
  }

  /**
   * Initialize the mode (create geometries, materials, etc.)
   */
  abstract init(): Promise<void>;

  /**
   * Update loop called every frame
   * @param time - Elapsed time in seconds
   * @param deltaTime - Time since last frame in seconds
   */
  abstract update(time: number, deltaTime: number): void;

  /**
   * Clean up resources (geometries, materials, etc.)
   */
  abstract destroy(): void;

  /**
   * Handle window resize
   */
  resize(width: number, height: number): void {
    // Default implementation - modes can override
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Handle user interaction
   */
  handleInteraction(x: number, y: number, type: 'start' | 'move' | 'end'): void {
    // Default implementation - modes can override
  }

  /**
   * Start the mode
   */
  async start(): Promise<void> {
    if (this.isActive) return;
    await this.init();
    this.isActive = true;
  }

  /**
   * Stop the mode
   */
  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Pause/resume the mode
   */
  setPaused(paused: boolean): void {
    // Modes can override for specific pause behavior
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ModeConfig>): void {
    this.config = { ...this.config, ...config };
    this.onConfigUpdate();
  }

  /**
   * Called when config is updated
   */
  protected onConfigUpdate(): void {
    // Modes can override to react to config changes
  }

  /**
   * Get current configuration
   */
  getConfig(): ModeConfig {
    return { ...this.config };
  }

  /**
   * Get metadata
   */
  getMetadata(): ModeMetadata {
    return this.metadata;
  }

  /**
   * Check if mode is active
   */
  isRunning(): boolean {
    return this.isActive;
  }
}

