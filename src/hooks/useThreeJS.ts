import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameState, FlowSettings } from '../types';
import { ParticleSystem } from '../managers/ParticleSystem';

interface UseThreeJSProps {
  containerRef: React.RefObject<HTMLDivElement>;
  gameRef: React.MutableRefObject<GameState>;
  particleSystemRef: React.MutableRefObject<ParticleSystem | null>;
  settings: FlowSettings;
}

export const useThreeJS = ({
  containerRef,
  gameRef,
  particleSystemRef
}: Omit<UseThreeJSProps, 'settings'>) => {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    const game = gameRef.current;
    
    // Scene setup
    game.scene = new THREE.Scene();
    game.scene.fog = new THREE.FogExp2(0x020818, 0.01);
    
    // Camera
    game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    game.camera.position.set(0, 8, 35);
    game.camera.lookAt(0, -5, 0);
    
    // Renderer
    game.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    game.renderer.setClearColor(0x020818, 1);
    containerRef.current.appendChild(game.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2a4e, 0.5);
    game.scene.add(ambientLight);
    
    const centerLight = new THREE.PointLight(0x00e5cc, 3, 100);
    centerLight.position.set(0, 0, 0);
    game.scene.add(centerLight);
    
    const rimLight1 = new THREE.PointLight(0x1e88e5, 2.5, 120);
    rimLight1.position.set(40, 30, -30);
    game.scene.add(rimLight1);
    
    const rimLight2 = new THREE.PointLight(0x66ff99, 2, 100);
    rimLight2.position.set(-40, -20, -30);
    game.scene.add(rimLight2);

    // Создаем систему частиц с дефолтными настройками
    particleSystemRef.current = new ParticleSystem(game.scene, {
      mode: 'smooth',
      subMode: 'spiral',
      baseSpeed: 1.0,
      sound: 'theta',
      flickerSize: false,
      flickerAlpha: false,
      showTrails: false,
      particleCount: 1000,
      panelMode: 'slide'
    });

    isInitializedRef.current = true;

    return () => {
      // Очистка
      if (game.renderer && containerRef.current) {
        containerRef.current.removeChild(game.renderer.domElement);
        game.renderer.dispose();
      }
      
      if (particleSystemRef.current) {
        particleSystemRef.current.dispose();
      }
      
      // Очистка сцены
      if (game.scene) {
        game.scene.clear();
      }
      
      isInitializedRef.current = false;
    };
  }, [containerRef, gameRef, particleSystemRef]);
};
