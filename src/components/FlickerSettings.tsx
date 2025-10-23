import React from 'react';
import { FlickerSettingsProps } from '../types';

const FlickerSettings: React.FC<FlickerSettingsProps> = ({
  flickerSize,
  flickerAlpha,
  onFlickerChange
}) => {
  const settings = [
    {
      key: 'flickerSize' as const,
      label: 'Мерцание размера',
      description: 'Частицы пульсируют по размеру',
      icon: '📏',
      enabled: flickerSize
    },
    {
      key: 'flickerAlpha' as const,
      label: 'Мерцание прозрачности',
      description: 'Частицы мерцают по прозрачности',
      icon: '✨',
      enabled: flickerAlpha
    }
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-white">Эффекты мерцания</h4>
      
      <div className="space-y-3">
        {settings.map((setting) => (
          <div
            key={setting.key}
            className={`p-3 rounded-lg transition-all border ${
              setting.enabled
                ? 'bg-blue-500/20 border-blue-500/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={setting.enabled}
                onChange={(e) => onFlickerChange(setting.key, e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-lg">{setting.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{setting.label}</div>
                <div className="text-xs text-gray-400">{setting.description}</div>
              </div>
              {setting.enabled && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </label>
          </div>
        ))}
      </div>

      {/* Предпросмотр эффектов */}
      <div className="pt-3 border-t border-white/10">
        <div className="text-xs text-gray-400 mb-2">Предпросмотр:</div>
        <div className="flex space-x-2">
          <div className={`w-3 h-3 rounded-full ${flickerSize ? 'animate-pulse bg-blue-400' : 'bg-blue-400'}`}></div>
          <div className={`w-3 h-3 rounded-full ${flickerAlpha ? 'animate-pulse bg-blue-400' : 'bg-blue-400'}`}></div>
          <div className={`w-3 h-3 rounded-full ${flickerSize && flickerAlpha ? 'animate-pulse bg-blue-400' : 'bg-blue-400'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default FlickerSettings;
