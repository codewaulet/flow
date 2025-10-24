/**
 * Main layout with Three.js canvas and gesture handling
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useVisualMode } from '../hooks/useVisualMode';
import { useGestures } from '../hooks/useGestures';
import { useAppStore } from '../store/useAppStore';
import { HidableUI } from '../ui/components/HidableUI';
import { ModeSelector } from '../ui/components/ModeSelector';
import { AudioControls } from '../ui/components/AudioControls';
import { QuickSettings } from '../ui/components/QuickSettings';

export const Layout: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  const setSettingsOpen = useAppStore(state => state.setSettingsOpen);
  const setUIVisible = useAppStore(state => state.setUIVisible);
  const setCurrentMode = useAppStore(state => state.setCurrentMode);
  const currentMode = useAppStore(state => state.currentMode);
  const togglePause = useAppStore(state => state.togglePause);
  
  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#05050A');
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    return () => {
      renderer.dispose();
    };
  }, []);
  
  // Initialize visual mode system
  const { handleInteraction } = useVisualMode(
    canvasRef.current,
    sceneRef.current,
    cameraRef.current,
    rendererRef.current
  );
  
  // Setup gestures
  const { on } = useGestures(containerRef.current);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Swipe left/right for mode switching
    const modes = ['breathe', 'toroid', 'weaver', 'starfield', 'matrix', 'orbs'];
    const currentIndex = modes.indexOf(currentMode);
    
    const handleSwipeLeft = () => {
      const nextIndex = (currentIndex + 1) % modes.length;
      setCurrentMode(modes[nextIndex] as any);
    };
    
    const handleSwipeRight = () => {
      const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
      setCurrentMode(modes[prevIndex] as any);
    };
    
    const handleSwipeUp = () => {
      setSettingsOpen(true);
    };
    
    const handleSwipeDown = () => {
      setUIVisible(false);
    };
    
    const handleTap = () => {
      setUIVisible(true);
    };
    
    const handleLongPress = () => {
      togglePause();
    };
    
    const handleDrag = (e: any) => {
      handleInteraction(e.x, e.y, 'move');
    };
    
    on('swipeleft', handleSwipeLeft);
    on('swiperight', handleSwipeRight);
    on('swipeup', handleSwipeUp);
    on('swipedown', handleSwipeDown);
    on('tap', handleTap);
    on('longpress', handleLongPress);
    on('drag', handleDrag);
  }, [on, currentMode, setCurrentMode, setSettingsOpen, setUIVisible, togglePause, handleInteraction]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modes = ['breathe', 'toroid', 'weaver', 'starfield', 'matrix', 'orbs'];
      const currentIndex = modes.indexOf(currentMode);
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
          setCurrentMode(modes[prevIndex] as any);
          break;
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % modes.length;
          setCurrentMode(modes[nextIndex] as any);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSettingsOpen(true);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setUIVisible(false);
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          setUIVisible(prev => !prev);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, setCurrentMode, setSettingsOpen, setUIVisible, togglePause]);
  
  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
      
      <HidableUI>
        <AudioControls />
        <ModeSelector />
      </HidableUI>
      
      <QuickSettings />
    </div>
  );
};

