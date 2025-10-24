/**
 * Hook for audio management
 */

import { useEffect, useRef, useCallback } from 'react';
import { AudioEngine } from '../core/audio/AudioEngine';
import { useAppStore } from '../store/useAppStore';
import { AudioPreset } from '../core/audio/types';

export const useAudio = () => {
  const audioEngineRef = useRef<AudioEngine>(AudioEngine.getInstance());
  const audioPreset = useAppStore(state => state.audioPreset);
  const audioVolume = useAppStore(state => state.audioVolume);
  const audioMuted = useAppStore(state => state.audioMuted);
  const setAudioPreset = useAppStore(state => state.setAudioPreset);
  const setAudioVolume = useAppStore(state => state.setAudioVolume);
  
  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (!audioEngineRef.current.isReady()) {
          await audioEngineRef.current.initialize();
        }
      } catch (error) {
        console.warn('Audio initialization deferred:', error);
      }
    };
    
    // Initialize on first interaction
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);
  
  // Handle preset changes
  useEffect(() => {
    if (audioEngineRef.current.isReady()) {
      audioEngineRef.current.switchPreset(audioPreset);
    }
  }, [audioPreset]);
  
  // Handle volume changes
  useEffect(() => {
    if (audioEngineRef.current.isReady()) {
      audioEngineRef.current.setVolume(audioMuted ? 0 : audioVolume);
    }
  }, [audioVolume, audioMuted]);
  
  const switchPreset = useCallback(async (preset: AudioPreset) => {
    try {
      if (!audioEngineRef.current.isReady()) {
        await audioEngineRef.current.initialize();
      }
      await audioEngineRef.current.switchPreset(preset);
      setAudioPreset(preset);
    } catch (error) {
      console.error('Failed to switch audio preset:', error);
    }
  }, [setAudioPreset]);
  
  const changeVolume = useCallback((volume: number) => {
    setAudioVolume(volume);
  }, [setAudioVolume]);
  
  const getAnalysis = useCallback(() => {
    return audioEngineRef.current.getAnalysis();
  }, []);
  
  return {
    switchPreset,
    changeVolume,
    getAnalysis,
    audioEngine: audioEngineRef.current,
  };
};

