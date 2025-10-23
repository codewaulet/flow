import React, { useState } from 'react';
import { ControlPanelProps } from '../types';
import ModeSelector from './ModeSelector';
import SoundSelector from './SoundSelector';
import FlickerSettings from './FlickerSettings';
import SpeedSettings from './SpeedSettings';
import PerformanceSettings from './PerformanceSettings';

const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  onSettingsChange,
  onSaveSettings,
  showUI,
  onToggleUI
}) => {
  const [activeTab, setActiveTab] = useState<'modes' | 'sounds' | 'settings'>('modes');

  if (!showUI) return null;

  return (
    <div className="fixed top-1/2 right-2 sm:right-4 transform -translate-y-1/2 z-30 max-w-sm w-full mx-2 sm:mx-0">
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 w-full">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Flow Control</h2>
          <button
            onClick={onToggleUI}
            className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-colors flex items-center justify-center text-red-400 hover:text-red-300"
            title="Закрыть панель"
          >
            ✕
          </button>
        </div>

        {/* Табы */}
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('modes')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'modes'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Режимы
          </button>
          <button
            onClick={() => setActiveTab('sounds')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'sounds'
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Звуки
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Настройки
          </button>
        </div>

        {/* Контент табов */}
        <div className="min-h-64">
          {activeTab === 'modes' && (
            <ModeSelector
              mode={settings.mode}
              subMode={settings.subMode}
              onModeChange={(mode) => onSettingsChange({ mode })}
              onSubModeChange={(subMode) => onSettingsChange({ subMode })}
            />
          )}
          
          {activeTab === 'sounds' && (
            <SoundSelector
              sound={settings.sound}
              onSoundChange={(sound) => onSettingsChange({ sound })}
            />
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <FlickerSettings
                flickerSize={settings.flickerSize}
                flickerAlpha={settings.flickerAlpha}
                onFlickerChange={(key, value) => onSettingsChange({ [key]: value })}
              />
              <SpeedSettings
                baseSpeed={settings.baseSpeed}
                onSpeedChange={(speed) => onSettingsChange({ baseSpeed: speed })}
                onSave={onSaveSettings}
              />
              <PerformanceSettings
                particleCount={settings.particleCount}
                onParticleCountChange={(count) => onSettingsChange({ particleCount: count })}
              />
              <div className="pt-4 border-t border-white/10">
                <label className="flex items-center space-x-3 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showTrails}
                    onChange={(e) => onSettingsChange({ showTrails: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-white">Показывать trail линии</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
