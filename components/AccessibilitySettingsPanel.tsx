import React from 'react';
import { useAccessibilitySettings, ColorBlindMode } from '../hooks/useAccessibilitySettings';
import { useSound } from '../hooks/useSound';

interface AccessibilitySettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilitySettingsPanel: React.FC<AccessibilitySettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    setColorBlindMode,
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargeText,
    toggleEnhancedFocus,
    resetSettings,
    getColorBlindModeDescription,
    getActiveSettingsCount
  } = useAccessibilitySettings();

  const playSound = useSound();

  if (!isOpen) return null;

  const handleClose = () => {
    playSound('click');
    onClose();
  };

  const handleColorBlindModeChange = (mode: ColorBlindMode) => {
    playSound('click');
    setColorBlindMode(mode);
  };

  const handleToggle = (action: () => void) => {
    playSound('click');
    action();
  };

  const handleReset = () => {
    playSound('click');
    resetSettings();
  };

  const colorBlindModes: { value: ColorBlindMode; label: string; description: string }[] = [
    { value: 'none', label: 'Normal', description: 'Default color scheme' },
    { value: 'protanopia', label: 'Protanopia', description: 'For red-blind users' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'For green-blind users' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'For blue-blind users' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <div className="pixelated-border bg-amber-900 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-amber-200">♿ Accessibility</h2>
          {getActiveSettingsCount() > 0 && (
            <span className="px-2 py-1 bg-blue-600 text-white text-sm rounded-full">
              {getActiveSettingsCount()} active
            </span>
          )}
        </div>

        {/* Color Blind Modes */}
        <div className="mb-6">
          <h3 className="text-lg text-amber-100 mb-3 font-semibold">🎨 Color Vision</h3>
          <div className="space-y-2">
            {colorBlindModes.map((mode) => (
              <label
                key={mode.value}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-amber-700/50 hover:border-amber-600/70 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="colorblind-mode"
                  value={mode.value}
                  checked={settings.colorBlindMode === mode.value}
                  onChange={() => handleColorBlindModeChange(mode.value)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-amber-100">{mode.label}</div>
                  <div className="text-xs text-amber-300/70">{mode.description}</div>
                </div>
                {settings.colorBlindMode === mode.value && (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Visual Settings */}
        <div className="mb-6">
          <h3 className="text-lg text-amber-100 mb-3 font-semibold">👁️ Visual Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-amber-700/50 hover:border-amber-600/70 cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-amber-100">High Contrast</div>
                <div className="text-xs text-amber-300/70">Increased contrast for better visibility</div>
              </div>
              <button
                onClick={() => handleToggle(toggleHighContrast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.highContrast ? 'bg-amber-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-amber-700/50 hover:border-amber-600/70 cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-amber-100">Large Text</div>
                <div className="text-xs text-amber-300/70">20% larger text size</div>
              </div>
              <button
                onClick={() => handleToggle(toggleLargeText)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.largeText ? 'bg-amber-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.largeText ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Motion Settings */}
        <div className="mb-6">
          <h3 className="text-lg text-amber-100 mb-3 font-semibold">🎭 Motion Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-amber-700/50 hover:border-amber-600/70 cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-amber-100">Reduced Motion</div>
                <div className="text-xs text-amber-300/70">Minimize animations for sensitive users</div>
              </div>
              <button
                onClick={() => handleToggle(toggleReducedMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-amber-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Navigation Settings */}
        <div className="mb-6">
          <h3 className="text-lg text-amber-100 mb-3 font-semibold">⌨️ Navigation</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg border-2 border-amber-700/50 hover:border-amber-600/70 cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-amber-100">Enhanced Focus</div>
                <div className="text-xs text-amber-300/70">More visible keyboard focus indicators</div>
              </div>
              <button
                onClick={() => handleToggle(toggleEnhancedFocus)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enhancedFocus ? 'bg-amber-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enhancedFocus ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-6 p-4 bg-amber-800/30 rounded-lg border border-amber-700/50">
          <h4 className="text-sm font-semibold text-amber-200 mb-2">Current Settings:</h4>
          <div className="text-xs text-amber-300/80 space-y-1">
            <div>• Color Mode: {getColorBlindModeDescription()}</div>
            <div>• High Contrast: {settings.highContrast ? 'On' : 'Off'}</div>
            <div>• Large Text: {settings.largeText ? 'On' : 'Off'}</div>
            <div>• Reduced Motion: {settings.reducedMotion ? 'On' : 'Off'}</div>
            <div>• Enhanced Focus: {settings.enhancedFocus ? 'On' : 'Off'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-amber-500 text-amber-950 hover:bg-amber-400 active:bg-amber-600 transform hover:-translate-y-[1px] active:translate-y-[1px] transition-transform font-bold border-4 border-amber-700 pixel-button pixel-shadow"
            >
              Apply & Close
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-red-50 hover:bg-red-500 active:bg-red-700 transform hover:-translate-y-[1px] active:translate-y-[1px] transition-transform font-bold border-4 border-red-800 pixel-button pixel-shadow"
            >
              🔄 Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettingsPanel;