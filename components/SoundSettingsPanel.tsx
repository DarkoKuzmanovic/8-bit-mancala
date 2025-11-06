import React, { useState } from 'react';
import { useSoundSettings, type SoundType } from '../hooks/useSoundSettings';
import { useSound } from '../hooks/useSound';

interface SoundSettingsPanelProps {
  onClose: () => void;
  isOpen: boolean;
}

const SOUND_LABELS: Record<SoundType, string> = {
  pickup: '🎯 Pickup',
  drop: '⬇️ Drop',
  capture: '⚡ Capture',
  captureBonus: '✨ Bonus Capture',
  win: '🏆 Victory',
  turn: '🔄 Turn Change',
  click: '🖱️ Click',
  menuNavigate: '📱 Menu Navigate',
  gameStart: '🎮 Game Start',
  invalidMove: '❌ Invalid Move',
};

const SoundSettingsPanel: React.FC<SoundSettingsPanelProps> = ({ onClose, isOpen }) => {
  const {
    settings,
    setMasterVolume,
    toggleMute,
    setIndividualVolume,
    setSoundEnabled,
    resetToDefaults,
  } = useSoundSettings();

  const playSound = useSound();
  const [isResetting, setIsResetting] = useState(false);

  const handleVolumeChange = (type: SoundType, value: number) => {
    setIndividualVolume(type, value);
    playSound(type);
  };

  const handleSoundToggle = (type: SoundType, enabled: boolean) => {
    setSoundEnabled(type, enabled);
    if (enabled) {
      playSound(type);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    resetToDefaults();
    // Brief delay to allow settings to reset
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleTestSound = (type: SoundType) => {
    playSound(type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="board-surface pixel-shadow max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-orange-200 font-bold">🔊 Sound Settings</h2>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-orange-200 text-2xl font-bold pixel-shadow px-2 py-1 border-2 border-amber-700 hover:border-orange-600 bg-amber-800/50 hover:bg-orange-700/50"
          >
            ✕
          </button>
        </div>

        {/* Master Volume and Mute */}
        <div className="mb-6 p-4 bg-amber-900/30 rounded-lg border border-amber-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-amber-100 font-semibold">
                {settings.isMuted ? '🔇 Muted' : '🔊 Volume'}
              </span>
              <button
                onClick={toggleMute}
                className={`px-3 py-1 rounded font-bold transition-colors pixel-shadow ${
                  settings.isMuted
                    ? 'bg-red-600 text-white hover:bg-red-700 border-2 border-red-800'
                    : 'bg-green-600 text-white hover:bg-green-700 border-2 border-green-800'
                }`}
              >
                {settings.isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-3 py-1 text-xs bg-amber-600 text-amber-50 hover:bg-amber-700 font-bold pixel-shadow border-2 border-amber-800 disabled:opacity-50"
            >
              Reset All
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-200 text-sm">Master</span>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.masterVolume * 100}
              onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
              className="flex-1 h-2 bg-amber-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${settings.masterVolume * 100}%, #451a03 ${settings.masterVolume * 100}%, #451a03 100%)`
              }}
            />
            <span className="text-amber-200 text-sm font-mono min-w-[3rem] text-right">
              {Math.round(settings.masterVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Individual Sound Controls */}
        <div className="space-y-3">
          <h3 className="text-amber-200 font-semibold mb-3">Individual Sounds</h3>

          {(Object.entries(SOUND_LABELS) as [SoundType, string][]).map(([type, label]) => (
            <div key={type} className="p-3 bg-amber-950/30 rounded-lg border border-amber-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSoundToggle(type, !settings.enabledSounds[type])}
                    className={`px-2 py-1 text-xs font-bold rounded pixel-shadow ${
                      settings.enabledSounds[type]
                        ? 'bg-green-600 text-white border-2 border-green-800'
                        : 'bg-gray-600 text-gray-200 border-2 border-gray-800'
                    }`}
                  >
                    {settings.enabledSounds[type] ? 'ON' : 'OFF'}
                  </button>
                  <span className="text-amber-100">{label}</span>
                </div>
                <button
                  onClick={() => handleTestSound(type)}
                  disabled={!settings.enabledSounds[type] || settings.isMuted}
                  className="px-2 py-1 text-xs bg-orange-600 text-white hover:bg-orange-700 font-bold pixel-shadow border-2 border-orange-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎵 Test
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.individualVolumes[type] * 100}
                  onChange={(e) => handleVolumeChange(type, Number(e.target.value) / 100)}
                  disabled={!settings.enabledSounds[type] || settings.isMuted}
                  className="flex-1 h-1 bg-amber-800 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${settings.individualVolumes[type] * 100}%, #451a03 ${settings.individualVolumes[type] * 100}%, #451a03 100%)`
                  }}
                />
                <span className="text-amber-200 text-xs font-mono min-w-[2.5rem] text-right">
                  {Math.round(settings.individualVolumes[type] * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-3 bg-amber-800/20 rounded-lg border border-amber-700/50">
          <p className="text-amber-200 text-xs">
            💡 <strong>Tip:</strong> Adjust individual sound volumes to create your perfect audio experience. Settings are automatically saved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SoundSettingsPanel;