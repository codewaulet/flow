import React from 'react';
import { SoundSelectorProps } from '../types';

const SoundSelector: React.FC<SoundSelectorProps> = ({
  sound,
  onSoundChange
}) => {
  const sounds = [
    {
      id: 'theta',
      name: 'Theta Rhythm',
      icon: '🧠',
      description: 'Мозговые волны 6 Гц',
      color: 'from-indigo-500 to-purple-500',
      waveform: '∿∿∿∿∿'
    },
    {
      id: 'noise',
      name: 'Dark Noise',
      icon: '🌫️',
      description: 'Темный шум для фокуса',
      color: 'from-gray-600 to-gray-800',
      waveform: '▓▓▓▓▓▓▓'
    },
    {
      id: 'rain',
      name: 'Rain',
      icon: '🌧️',
      description: 'Успокаивающий дождь',
      color: 'from-blue-400 to-blue-600',
      waveform: '·······'
    },
    {
      id: 'ocean',
      name: 'Ocean',
      icon: '🌊',
      description: 'Океанские волны',
      color: 'from-cyan-400 to-blue-500',
      waveform: '≈≈≈≈≈≈≈'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Выберите звук</h3>
      
      <div className="space-y-3">
        {sounds.map((soundItem) => (
          <button
            key={soundItem.id}
            onClick={() => onSoundChange(soundItem.id as any)}
            className={`w-full p-4 rounded-xl transition-all duration-300 text-left group ${
              sound === soundItem.id
                ? 'bg-gradient-to-r ' + soundItem.color + ' text-white shadow-lg transform scale-105'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{soundItem.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{soundItem.name}</div>
                <div className="text-sm opacity-75">{soundItem.description}</div>
                <div className="text-xs font-mono mt-1 opacity-60">{soundItem.waveform}</div>
              </div>
              {sound === soundItem.id && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="text-xs">ON</div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Визуализация звука */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Громкость</span>
          <span className="text-xs text-gray-400">-20dB</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-3/4"></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Тихо</span>
          <span>Громко</span>
        </div>
      </div>
    </div>
  );
};

export default SoundSelector;
