import React from 'react';
import { ModeSelectorProps } from '../types';

const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  subMode,
  onModeChange,
  onSubModeChange
}) => {
  const modes = [
    {
      id: 'smooth',
      name: 'Smooth Flow',
      icon: '🌊',
      description: 'Плавное течение частиц',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'crawl',
      name: 'Star Wars Crawl',
      icon: '⭐',
      description: 'Классический эффект прокрутки',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'dynamic',
      name: 'Dynamic Patterns',
      icon: '🌀',
      description: 'Динамические паттерны',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const subModes = [
    { id: 'spiral', name: 'Spiral', icon: '🌀' },
    { id: 'waves', name: 'Waves', icon: '🌊' },
    { id: 'vortex', name: 'Vortex', icon: '🌪️' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Выберите режим</h3>
      
      <div className="space-y-3">
        {modes.map((modeItem) => (
          <button
            key={modeItem.id}
            onClick={() => onModeChange(modeItem.id as any)}
            className={`w-full p-4 rounded-xl transition-all duration-300 text-left ${
              mode === modeItem.id
                ? 'bg-gradient-to-r ' + modeItem.color + ' text-white shadow-lg transform scale-105'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{modeItem.icon}</span>
              <div>
                <div className="font-medium">{modeItem.name}</div>
                <div className="text-sm opacity-75">{modeItem.description}</div>
              </div>
              {mode === modeItem.id && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {mode === 'dynamic' && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Подрежимы</h4>
          <div className="grid grid-cols-3 gap-2">
            {subModes.map((subModeItem) => (
              <button
                key={subModeItem.id}
                onClick={() => onSubModeChange(subModeItem.id as any)}
                className={`p-3 rounded-lg transition-all text-center ${
                  subMode === subModeItem.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <div className="text-lg mb-1">{subModeItem.icon}</div>
                <div className="text-xs">{subModeItem.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelector;
