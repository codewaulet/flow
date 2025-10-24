/**
 * Manages visual mode lifecycle and transitions
 */

import * as THREE from 'three';
import { BaseMode } from './BaseMode';

export class ModeManager {
  private modes: Map<string, BaseMode> = new Map();
  private currentMode: BaseMode | null = null;
  private scene: THREE.Scene;
  private isTransitioning: boolean = false;
  
  constructor(scene: THREE.Scene, _camera: THREE.Camera, _renderer: THREE.WebGLRenderer) {
    this.scene = scene;
  }
  
  /**
   * Register a mode
   */
  public registerMode(mode: BaseMode): void {
    const id = mode.getMetadata().id;
    this.modes.set(id, mode);
  }
  
  /**
   * Switch to a different mode with smooth transition
   */
  public async switchMode(modeId: string): Promise<void> {
    if (this.isTransitioning) {
      return; // Silently ignore if already transitioning
    }
    
    const newMode = this.modes.get(modeId);
    if (!newMode) {
      console.error(`Mode ${modeId} not found`);
      return;
    }
    
    if (this.currentMode === newMode) {
      return; // Already on this mode
    }
    
    this.isTransitioning = true;
    
    try {
      // Fade out current mode
      if (this.currentMode) {
        await this.fadeOut();
        this.currentMode.stop();
        this.currentMode.destroy();
        this.clearScene();
      }
      
      // Start new mode
      await newMode.start();
      this.currentMode = newMode;
      
      // Fade in new mode
      await this.fadeIn();
      
    } catch (error) {
      console.error('Mode switch error:', error);
    } finally {
      this.isTransitioning = false;
    }
  }
  
  /**
   * Get the currently active mode
   */
  public getCurrentMode(): BaseMode | null {
    return this.currentMode;
  }
  
  /**
   * Get all registered modes
   */
  public getAllModes(): BaseMode[] {
    return Array.from(this.modes.values());
  }
  
  /**
   * Update the current mode
   */
  public update(time: number, deltaTime: number): void {
    if (this.currentMode && this.currentMode.isRunning()) {
      this.currentMode.update(time, deltaTime);
    }
  }
  
  /**
   * Handle window resize
   */
  public resize(width: number, height: number): void {
    if (this.currentMode) {
      this.currentMode.resize(width, height);
    }
  }
  
  /**
   * Handle user interaction
   */
  public handleInteraction(x: number, y: number, type: 'start' | 'move' | 'end'): void {
    if (this.currentMode) {
      this.currentMode.handleInteraction(x, y, type);
    }
  }
  
  /**
   * Pause/resume current mode
   */
  public setPaused(paused: boolean): void {
    if (this.currentMode) {
      this.currentMode.setPaused(paused);
    }
  }
  
  /**
   * Update current mode config
   */
  public updateConfig(config: any): void {
    if (this.currentMode) {
      this.currentMode.updateConfig(config);
    }
  }
  
  /**
   * Clear the scene of all objects
   */
  private clearScene(): void {
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      this.scene.remove(object);
      
      // Dispose geometries and materials
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material?.dispose();
        }
      } else if (object instanceof THREE.Points) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material?.dispose();
        }
      }
    }
  }
  
  /**
   * Fade out transition effect
   */
  private async fadeOut(): Promise<void> {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = 400; // ms
      
      const fadeStep = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const opacity = 1 - progress;
        
        // Apply opacity to all objects in scene
        this.scene.traverse((object) => {
          if (object instanceof THREE.Points || object instanceof THREE.Mesh) {
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(mat => {
                  if ('opacity' in mat) mat.opacity = opacity;
                });
              } else if ('opacity' in object.material) {
                object.material.opacity = opacity;
              }
            }
          }
        });
        
        if (progress < 1) {
          requestAnimationFrame(fadeStep);
        } else {
          resolve();
        }
      };
      fadeStep();
    });
  }
  
  /**
   * Fade in transition effect
   */
  private async fadeIn(): Promise<void> {
    return new Promise(resolve => {
      const startTime = performance.now();
      const duration = 600; // ms
      
      const fadeStep = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const opacity = progress;
        
        // Apply opacity to all objects in scene
        this.scene.traverse((object) => {
          if (object instanceof THREE.Points || object instanceof THREE.Mesh) {
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(mat => {
                  if ('opacity' in mat) mat.opacity = opacity * (mat.userData.originalOpacity || 1);
                });
              } else if ('opacity' in object.material) {
                const originalOpacity = object.material.userData.originalOpacity || object.material.opacity;
                object.material.userData.originalOpacity = originalOpacity;
                object.material.opacity = opacity * originalOpacity;
              }
            }
          }
        });
        
        if (progress < 1) {
          requestAnimationFrame(fadeStep);
        } else {
          resolve();
        }
      };
      fadeStep();
    });
  }
  
  /**
   * Clean up all modes
   */
  public dispose(): void {
    if (this.currentMode) {
      this.currentMode.stop();
      this.currentMode.destroy();
    }
    
    this.modes.forEach(mode => {
      if (mode.isRunning()) {
        mode.stop();
      }
      mode.destroy();
    });
    
    this.modes.clear();
    this.clearScene();
  }
}

