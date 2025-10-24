/**
 * Unified gesture handling system for touch and mouse
 */

import { 
  GestureType, 
  GestureEvent, 
  TouchPoint, 
  GestureCallback, 
  GestureConfig 
} from './types';
import { vibrate } from '../../utils/helpers';

export class GestureHandler {
  private element: HTMLElement;
  private config: GestureConfig;
  private callbacks: Map<GestureType, Set<GestureCallback>>;
  
  private touches: Map<number, TouchPoint> = new Map();
  private tapTimeout: NodeJS.Timeout | null = null;
  private longPressTimeout: NodeJS.Timeout | null = null;
  
  private isDragging: boolean = false;
  private lastPinchDistance: number = 0;
  
  constructor(element: HTMLElement, config: Partial<GestureConfig> = {}) {
    this.element = element;
    this.config = {
      swipeThreshold: 50,
      longPressDelay: 500,
      tapMaxDuration: 300,
      pinchThreshold: 10,
      enableHaptic: true,
      ...config,
    };
    this.callbacks = new Map();
    
    this.setupEventListeners();
  }
  
  /**
   * Register a callback for a specific gesture
   */
  public on(type: GestureType, callback: GestureCallback): void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }
    this.callbacks.get(type)!.add(callback);
  }
  
  /**
   * Unregister a callback
   */
  public off(type: GestureType, callback: GestureCallback): void {
    this.callbacks.get(type)?.delete(callback);
  }
  
  /**
   * Emit a gesture event to all registered callbacks
   */
  private emit(event: GestureEvent): void {
    const callbacks = this.callbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(cb => cb(event));
    }
    
    // Haptic feedback for certain gestures
    if (this.config.enableHaptic) {
      this.triggerHaptic(event.type);
    }
  }
  
  /**
   * Trigger haptic feedback based on gesture type
   */
  private triggerHaptic(type: GestureType): void {
    switch (type) {
      case 'tap':
        vibrate(20);
        break;
      case 'longpress':
        vibrate([20, 50, 20]);
        break;
      case 'swipeleft':
      case 'swiperight':
        vibrate(30);
        break;
      case 'swipeup':
      case 'swipedown':
        vibrate(50);
        break;
    }
  }
  
  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel);
    
    // Mouse events
    this.element.addEventListener('mousedown', this.handleMouseDown);
    this.element.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mouseup', this.handleMouseUp);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
    
    // Prevent context menu on long press
    this.element.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  /**
   * Touch start handler
   */
  private handleTouchStart = (e: TouchEvent): void => {
    const now = Date.now();
    
    Array.from(e.touches).forEach(touch => {
      this.touches.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        timestamp: now,
      });
    });
    
    // Single touch - could be tap or long press
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      
      // Start long press timer
      this.longPressTimeout = setTimeout(() => {
        this.emit({
          type: 'longpress',
          x: touch.clientX,
          y: touch.clientY,
          target: e.target,
        });
      }, this.config.longPressDelay);
    }
    
    // Two touches - could be pinch
    if (e.touches.length === 2) {
      this.lastPinchDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
      this.clearTimers();
    }
  };
  
  /**
   * Touch move handler
   */
  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const stored = this.touches.get(touch.identifier);
      
      if (stored) {
        const deltaX = touch.clientX - stored.x;
        const deltaY = touch.clientY - stored.y;
        const velocity = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        
        // Update stored position
        stored.x = touch.clientX;
        stored.y = touch.clientY;
        
        // Cancel long press if moved too much
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          this.clearTimers();
        }
        
        // Emit drag event
        this.emit({
          type: 'drag',
          x: touch.clientX,
          y: touch.clientY,
          deltaX,
          deltaY,
          velocity,
          target: e.target,
        });
        
        this.isDragging = true;
      }
    } else if (e.touches.length === 2) {
      // Pinch gesture
      const distance = this.getTouchDistance(e.touches[0], e.touches[1]);
      const delta = distance - this.lastPinchDistance;
      
      if (Math.abs(delta) > this.config.pinchThreshold) {
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        this.emit({
          type: 'pinch',
          x: centerX,
          y: centerY,
          scale: distance / this.lastPinchDistance,
          target: e.target,
        });
        
        this.lastPinchDistance = distance;
      }
    }
    
    e.preventDefault();
  };
  
  /**
   * Touch end handler
   */
  private handleTouchEnd = (e: TouchEvent): void => {
    const now = Date.now();
    
    Array.from(e.changedTouches).forEach(touch => {
      const stored = this.touches.get(touch.identifier);
      
      if (stored) {
        const deltaX = touch.clientX - stored.startX;
        const deltaY = touch.clientY - stored.startY;
        const duration = now - stored.timestamp;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        
        // Check for swipe
        if (distance > this.config.swipeThreshold && !this.isDragging) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);
          
          if (absX > absY) {
            // Horizontal swipe
            this.emit({
              type: deltaX > 0 ? 'swiperight' : 'swipeleft',
              x: touch.clientX,
              y: touch.clientY,
              deltaX,
              deltaY,
              velocity: distance / duration,
              target: e.target,
            });
          } else {
            // Vertical swipe
            this.emit({
              type: deltaY > 0 ? 'swipedown' : 'swipeup',
              x: touch.clientX,
              y: touch.clientY,
              deltaX,
              deltaY,
              velocity: distance / duration,
              target: e.target,
            });
          }
        } else if (duration < this.config.tapMaxDuration && distance < 10) {
          // Tap detected
          this.emit({
            type: 'tap',
            x: touch.clientX,
            y: touch.clientY,
            target: e.target,
          });
        }
        
        this.touches.delete(touch.identifier);
      }
    });
    
    this.clearTimers();
    this.isDragging = false;
  };
  
  /**
   * Touch cancel handler
   */
  private handleTouchCancel = (): void => {
    this.touches.clear();
    this.clearTimers();
    this.isDragging = false;
  };
  
  /**
   * Mouse down handler
   */
  private handleMouseDown = (e: MouseEvent): void => {
    const now = Date.now();
    
    this.touches.set(0, {
      id: 0,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      timestamp: now,
    });
    
    // Start long press timer
    this.longPressTimeout = setTimeout(() => {
      this.emit({
        type: 'longpress',
        x: e.clientX,
        y: e.clientY,
        target: e.target,
      });
    }, this.config.longPressDelay);
  };
  
  /**
   * Mouse move handler
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (e.buttons !== 1) return; // Only track left button
    
    const stored = this.touches.get(0);
    if (stored) {
      const deltaX = e.clientX - stored.x;
      const deltaY = e.clientY - stored.y;
      const velocity = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      
      stored.x = e.clientX;
      stored.y = e.clientY;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        this.clearTimers();
      }
      
      this.emit({
        type: 'drag',
        x: e.clientX,
        y: e.clientY,
        deltaX,
        deltaY,
        velocity,
        target: e.target,
      });
      
      this.isDragging = true;
    }
  };
  
  /**
   * Mouse up handler
   */
  private handleMouseUp = (e: MouseEvent): void => {
    const stored = this.touches.get(0);
    
    if (stored) {
      const deltaX = e.clientX - stored.startX;
      const deltaY = e.clientY - stored.startY;
      const duration = Date.now() - stored.timestamp;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      
      // Check for swipe
      if (distance > this.config.swipeThreshold && !this.isDragging) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY) {
          this.emit({
            type: deltaX > 0 ? 'swiperight' : 'swipeleft',
            x: e.clientX,
            y: e.clientY,
            deltaX,
            deltaY,
            velocity: distance / duration,
            target: e.target,
          });
        } else {
          this.emit({
            type: deltaY > 0 ? 'swipedown' : 'swipeup',
            x: e.clientX,
            y: e.clientY,
            deltaX,
            deltaY,
            velocity: distance / duration,
            target: e.target,
          });
        }
      } else if (duration < this.config.tapMaxDuration && distance < 10) {
        this.emit({
          type: 'tap',
          x: e.clientX,
          y: e.clientY,
          target: e.target,
        });
      }
      
      this.touches.delete(0);
    }
    
    this.clearTimers();
    this.isDragging = false;
  };
  
  /**
   * Mouse leave handler
   */
  private handleMouseLeave = (): void => {
    this.touches.clear();
    this.clearTimers();
    this.isDragging = false;
  };
  
  /**
   * Calculate distance between two touches
   */
  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.tapTimeout) {
      clearTimeout(this.tapTimeout);
      this.tapTimeout = null;
    }
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }
  
  /**
   * Update configuration
   */
  public updateConfig(config: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Clean up event listeners
   */
  public destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseup', this.handleMouseUp);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    
    this.clearTimers();
    this.callbacks.clear();
    this.touches.clear();
  }
}

