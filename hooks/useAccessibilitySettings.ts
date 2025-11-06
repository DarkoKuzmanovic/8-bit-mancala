import { useState, useEffect } from 'react';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AccessibilitySettings {
  colorBlindMode: ColorBlindMode;
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  enhancedFocus: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  colorBlindMode: 'none',
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  enhancedFocus: false,
};

const SETTINGS_KEY = 'mancala_accessibility_settings';

export const useAccessibilitySettings = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }, [settings]);

  // Apply settings to the document body
  useEffect(() => {
    const body = document.body;

    // Remove all accessibility classes
    body.className = body.className.replace(/\b(colorblind-\w+|high-contrast|reduced-motion|large-text|enhanced-focus)\b/g, '').trim();

    // Remove color blind mode classes
    body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');

    // Apply color blind mode
    if (settings.colorBlindMode !== 'none') {
      body.classList.add(`colorblind-${settings.colorBlindMode}`);
    }

    // Apply other accessibility settings
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    }

    if (settings.reducedMotion) {
      body.classList.add('reduced-motion');
    }

    if (settings.largeText) {
      body.classList.add('large-text');
    }

    if (settings.enhancedFocus) {
      body.classList.add('enhanced-focus');
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const setColorBlindMode = (mode: ColorBlindMode) => {
    updateSetting('colorBlindMode', mode);
  };

  const toggleHighContrast = () => {
    updateSetting('highContrast', !settings.highContrast);
  };

  const toggleReducedMotion = () => {
    updateSetting('reducedMotion', !settings.reducedMotion);
  };

  const toggleLargeText = () => {
    updateSetting('largeText', !settings.largeText);
  };

  const toggleEnhancedFocus = () => {
    updateSetting('enhancedFocus', !settings.enhancedFocus);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Get human-readable descriptions
  const getColorBlindModeDescription = () => {
    switch (settings.colorBlindMode) {
      case 'protanopia':
        return 'Protanopia (Red-Blind) - Blue/Green color scheme';
      case 'deuteranopia':
        return 'Deuteranopia (Green-Blind) - Purple/Cyan color scheme';
      case 'tritanopia':
        return 'Tritanopia (Blue-Blind) - Orange/Yellow color scheme';
      default:
        return 'Normal color vision';
    }
  };

  const getActiveSettingsCount = () => {
    return Object.values(settings).filter(Boolean).length;
  };

  return {
    settings,
    setColorBlindMode,
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargeText,
    toggleEnhancedFocus,
    resetSettings,
    getColorBlindModeDescription,
    getActiveSettingsCount,
  };
};