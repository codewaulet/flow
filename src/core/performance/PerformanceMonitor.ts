/**
 * Performance monitoring and adaptive quality management
 */

export interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  frameTime: number;
  memory?: number;
}

export type QualityLevel = 'low' | 'medium' | 'high';

export class PerformanceMonitor {
  private fps: number = 60;
  private frameTime: number = 0;
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private maxFrames: number = 60; // Keep last 60 frames for averaging
  
  private qualityLevel: QualityLevel = 'high';
  private onQualityChange?: (level: QualityLevel) => void;
  
  private fpsThresholds = {
    low: 35,
    medium: 50,
    high: 57,
  };
  
  /**
   * Update performance metrics
   */
  public update(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.frameTime = delta;
    this.fps = 1000 / delta;
    this.lastTime = now;
    
    // Store frame time
    this.frames.push(this.fps);
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
    
    // Check if quality adjustment is needed
    this.checkQualityAdjustment();
  }
  
  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    const avgFps = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    const minFps = Math.min(...this.frames);
    const maxFps = Math.max(...this.frames);
    
    let memory: number | undefined;
    if ('memory' in performance && (performance as any).memory) {
      memory = (performance as any).memory.usedJSHeapSize / 1048576; // MB
    }
    
    return {
      fps: Math.round(this.fps),
      avgFps: Math.round(avgFps),
      minFps: Math.round(minFps),
      maxFps: Math.round(maxFps),
      frameTime: Math.round(this.frameTime * 100) / 100,
      memory,
    };
  }
  
  /**
   * Get current quality level
   */
  public getQualityLevel(): QualityLevel {
    return this.qualityLevel;
  }
  
  /**
   * Set quality level manually
   */
  public setQualityLevel(level: QualityLevel): void {
    if (this.qualityLevel !== level) {
      this.qualityLevel = level;
      this.onQualityChange?.(level);
    }
  }
  
  /**
   * Register callback for quality changes
   */
  public onQualityLevelChange(callback: (level: QualityLevel) => void): void {
    this.onQualityChange = callback;
  }
  
  /**
   * Check if quality adjustment is needed based on FPS
   */
  private checkQualityAdjustment(): void {
    if (this.frames.length < 20) return; // Reduced samples needed for faster response
    
    const avgFps = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    const minFps = Math.min(...this.frames.slice(-20));
    
    // Aggressive downgrade for very low FPS
    if (minFps < 20 || avgFps < this.fpsThresholds.low) {
      if (this.qualityLevel !== 'low') {
        this.setQualityLevel('low');
      }
    } else if (avgFps < this.fpsThresholds.medium && this.qualityLevel === 'high') {
      this.setQualityLevel('medium');
    }
    // Upgrade quality only if FPS is consistently good
    else if (avgFps > this.fpsThresholds.high && minFps > this.fpsThresholds.medium) {
      if (this.qualityLevel === 'low') {
        this.setQualityLevel('medium');
      } else if (avgFps > 58 && this.qualityLevel === 'medium') {
        const minRecent = Math.min(...this.frames.slice(-60)); // Check longer history
        if (minRecent > this.fpsThresholds.high) {
          this.setQualityLevel('high');
        }
      }
    }
  }
  
  /**
   * Reset performance tracking
   */
  public reset(): void {
    this.frames = [];
    this.fps = 60;
    this.frameTime = 0;
    this.lastTime = performance.now();
  }
}

