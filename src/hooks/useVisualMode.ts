/**
 * Hook for visual mode management
 */

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { ModeManager } from '../core/visuals/ModeManager';
import { VortexMode } from '../core/visuals/modes/VortexMode';
import { TunnelMode } from '../core/visuals/modes/TunnelMode';
import { StarfieldMode } from '../core/visuals/modes/StarfieldMode';
import { MatrixMode } from '../core/visuals/modes/MatrixMode';
import { ToroidMode } from '../core/visuals/modes/ToroidMode';
import { WeaverMode } from '../core/visuals/modes/WeaverMode';
import { OrbsMode } from '../core/visuals/modes/OrbsMode';
import { useAppStore, VisualMode, CameraView } from '../store/useAppStore';

export const useVisualMode = (
  _canvas: HTMLCanvasElement | null,
  scene: THREE.Scene | null,
  camera: THREE.Camera | null,
  renderer: THREE.WebGLRenderer | null
) => {
  const modeManagerRef = useRef<ModeManager | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const animationFrameRef = useRef<number | null>(null);
  
  const currentMode = useAppStore(state => state.currentMode);
  const isPaused = useAppStore(state => state.isPaused);
  const modeConfig = useAppStore(state => state.modeConfig);
  const cameraView = useAppStore(state => state.cameraView);
  const setCurrentMode = useAppStore(state => state.setCurrentMode);
  const setTransitioning = useAppStore(state => state.setTransitioning);
  
  // Initialize mode manager and register modes
  useEffect(() => {
    if (!scene || !camera || !renderer) return;
    
    const modeManager = new ModeManager(scene, camera, renderer);
    
    // Register all modes
    modeManager.registerMode(new VortexMode(scene, camera, renderer));
    modeManager.registerMode(new TunnelMode(scene, camera, renderer));
    modeManager.registerMode(new ToroidMode(scene, camera, renderer));
    modeManager.registerMode(new WeaverMode(scene, camera, renderer));
    modeManager.registerMode(new StarfieldMode(scene, camera, renderer));
    modeManager.registerMode(new MatrixMode(scene, camera, renderer));
    modeManager.registerMode(new OrbsMode(scene, camera, renderer));
    
    modeManagerRef.current = modeManager;
    
    // Start with initial mode
    modeManager.switchMode(currentMode);
    
    return () => {
      modeManager.dispose();
    };
  }, [scene, camera, renderer]); // Only run once on mount
  
  // Handle mode changes
  useEffect(() => {
    if (modeManagerRef.current) {
      setTransitioning(true);
      modeManagerRef.current.switchMode(currentMode).finally(() => {
        setTransitioning(false);
      });
    }
  }, [currentMode, setTransitioning]);
  
  // Update mode config
  useEffect(() => {
    if (modeManagerRef.current) {
      modeManagerRef.current.updateConfig(modeConfig[currentMode]);
    }
  }, [modeConfig, currentMode]);
  
  // Handle camera view changes and reset camera on mode switch
  useEffect(() => {
    if (!camera || !(camera instanceof THREE.PerspectiveCamera)) return;
    
    const cameraPositions: Record<CameraView, { x: number; y: number; z: number }> = {
      side: { x: 0, y: 0, z: 20 },
      top: { x: 0, y: 20, z: 0 },
      front: { x: 20, y: 0, z: 0 },
      iso: { x: 15, y: 15, z: 15 }
    };
    
    const targetPos = cameraPositions[cameraView];
    const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const startTime = Date.now();
    const duration = 1000;
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      camera.position.x = startPos.x + (targetPos.x - startPos.x) * easeProgress;
      camera.position.y = startPos.y + (targetPos.y - startPos.y) * easeProgress;
      camera.position.z = startPos.z + (targetPos.z - startPos.z) * easeProgress;
      camera.lookAt(0, 0, 0);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
  }, [cameraView, camera, currentMode]);
  
  // Apply quality-based optimizations
  const qualityLevel = useAppStore(state => state.qualityLevel);
  const updateModeConfig = useAppStore(state => state.updateModeConfig);
  
  useEffect(() => {
    if (!modeManagerRef.current) return;
    
    const mode = modeManagerRef.current.getCurrentMode();
    if (!mode) return;
    
    // Adjust particle count based on quality
    const baseConfig = modeConfig[currentMode];
    let adjustedCount = baseConfig.particleCount;
    
    if (qualityLevel === 'low') {
      adjustedCount = Math.max(1000, Math.floor(baseConfig.particleCount * 0.4));
    } else if (qualityLevel === 'medium') {
      adjustedCount = Math.max(1500, Math.floor(baseConfig.particleCount * 0.7));
    }
    
    // Only update if significantly different
    if (Math.abs(adjustedCount - baseConfig.particleCount) > 100) {
      updateModeConfig(currentMode, { particleCount: adjustedCount });
    }
  }, [qualityLevel, currentMode, modeConfig, updateModeConfig]);
  
  // Animation loop
  useEffect(() => {
    if (!modeManagerRef.current || !renderer || !scene || !camera) return;
    
    let isTabVisible = !document.hidden;
    
    // Pause rendering when tab is hidden
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        clockRef.current.getDelta(); // Reset delta to prevent large jump
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Only render if tab is visible and not paused
      if (!isPaused && isTabVisible) {
        const time = clockRef.current.getElapsedTime();
        const delta = Math.min(clockRef.current.getDelta(), 0.1); // Cap delta to prevent huge jumps
        
        modeManagerRef.current?.update(time, delta);
        renderer.render(scene, camera);
      }
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [renderer, scene, camera, isPaused]);
  
  // Handle window resize
  useEffect(() => {
    if (!renderer || !modeManagerRef.current) return;
    
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      modeManagerRef.current?.resize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [renderer]);
  
  const switchMode = useCallback(async (mode: VisualMode) => {
    setCurrentMode(mode);
  }, [setCurrentMode]);
  
  const handleInteraction = useCallback((x: number, y: number, type: 'start' | 'move' | 'end') => {
    modeManagerRef.current?.handleInteraction(x, y, type);
  }, []);
  
  return {
    switchMode,
    handleInteraction,
    modeManager: modeManagerRef.current,
  };
};

