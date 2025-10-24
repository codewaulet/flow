/**
 * Gesture system types
 */

export type GestureType = 
  | 'tap'
  | 'longpress'
  | 'swipeleft'
  | 'swiperight'
  | 'swipeup'
  | 'swipedown'
  | 'pinch'
  | 'drag';

export interface GestureEvent {
  type: GestureType;
  x: number;
  y: number;
  deltaX?: number;
  deltaY?: number;
  scale?: number;
  velocity?: number;
  target?: EventTarget | null;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  timestamp: number;
}

export type GestureCallback = (event: GestureEvent) => void;

export interface GestureConfig {
  swipeThreshold: number;
  longPressDelay: number;
  tapMaxDuration: number;
  pinchThreshold: number;
  enableHaptic: boolean;
}

