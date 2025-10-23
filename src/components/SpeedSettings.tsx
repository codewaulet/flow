import React from 'react';
import { SpeedSettingsProps } from '../types';

const SpeedSettings: React.FC<SpeedSettingsProps> = ({
  baseSpeed,
  onSpeedChange,
  onSave
}) => {
  const speedPresets = [
    { value: 0.5, label: 'Медленно', icon: '🐌' },
    { value: 1.0, label: 'Нормально', icon: '🚶' },
    { value: 1.5, label: 'Быстро', icon: '🏃' },
    { value: 2.0, label: 'Очень быстро', icon: '🚀' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Базовая скорость</h4>
        <span className="text-lg font-bold text-blue-400">{baseSpeed.toFixed(1)}x</span>
      </div>
      
      {/* Слайдер */}
      <div className="space-y-2">
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={baseSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((baseSpeed - 0.5) / 2.5) * 100}%, rgba(255,255,255,0.1) ${((baseSpeed - 0.5) / 2.5) * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0.5x</span>
          <span>3.0x</span>
        </div>
      </div>

      {/* Быстрые пресеты */}
      <div className="grid grid-cols-2 gap-2">
        {speedPresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onSpeedChange(preset.value)}
            className={`p-2 rounded-lg transition-all text-center ${
              Math.abs(baseSpeed - preset.value) < 0.1
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <div className="text-sm mb-1">{preset.icon}</div>
            <div className="text-xs">{preset.label}</div>
          </button>
        ))}
      </div>

      {/* Кнопка сохранения */}
      <button
        onClick={onSave}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
      >
        💾 Сохранить настройки
      </button>
    </div>
  );
};

export default SpeedSettings;
