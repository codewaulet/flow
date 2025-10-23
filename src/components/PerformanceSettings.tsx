import React from 'react';
import { PerformanceSettingsProps } from '../types';

const PerformanceSettings: React.FC<PerformanceSettingsProps> = ({
  particleCount,
  onParticleCountChange
}) => {
  const presets = [
    { value: 500, label: 'Низкая', icon: '📱', description: 'Для слабых устройств' },
    { value: 1000, label: 'Средняя', icon: '💻', description: 'Оптимальный баланс' },
    { value: 1500, label: 'Высокая', icon: '🖥️', description: 'Для мощных ПК' },
    { value: 2000, label: 'Максимальная', icon: '🚀', description: 'Максимум эффектов' }
  ];

  const getPerformanceLevel = (count: number) => {
    if (count <= 500) return { level: 'Низкая', color: 'text-green-400' };
    if (count <= 1000) return { level: 'Средняя', color: 'text-yellow-400' };
    if (count <= 1500) return { level: 'Высокая', color: 'text-orange-400' };
    return { level: 'Максимальная', color: 'text-red-400' };
  };

  const performance = getPerformanceLevel(particleCount);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Количество частиц</h4>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-400">{particleCount}</div>
          <div className={`text-xs ${performance.color}`}>{performance.level}</div>
        </div>
      </div>
      
      {/* Слайдер */}
      <div className="space-y-2">
        <input
          type="range"
          min="500"
          max="2000"
          step="100"
          value={particleCount}
          onChange={(e) => onParticleCountChange(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${((particleCount - 500) / 1500) * 100}%, rgba(255,255,255,0.1) ${((particleCount - 500) / 1500) * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>500</span>
          <span>2000</span>
        </div>
      </div>

      {/* Пресеты производительности */}
      <div className="space-y-2">
        <h5 className="text-xs text-gray-300">Быстрые настройки:</h5>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onParticleCountChange(preset.value)}
              className={`p-3 rounded-lg transition-all text-left ${
                particleCount === preset.value
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{preset.icon}</span>
                <div>
                  <div className="text-xs font-medium">{preset.label}</div>
                  <div className="text-xs opacity-75">{preset.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Индикатор производительности */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Производительность</span>
          <span>FPS: ~60</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (particleCount / 2000) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceSettings;
