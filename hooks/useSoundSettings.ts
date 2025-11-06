import { useState, useEffect, useCallback } from 'react';

export type SoundType = 'pickup' | 'drop' | 'capture' | 'win' | 'turn' | 'click' | 'menuNavigate' | 'gameStart' | 'invalidMove' | 'captureBonus';

export interface SoundSettings {
  masterVolume: number;
  isMuted: boolean;
  individualVolumes: Record<SoundType, number>;
  enabledSounds: Record<SoundType, boolean>;
}

const DEFAULT_SETTINGS: SoundSettings = {
  masterVolume: 0.5,
  isMuted: false,
  individualVolumes: {
    pickup: 0.8,
    drop: 0.7,
    capture: 1.0,
    win: 0.9,
    turn: 0.6,
    click: 0.5,
    menuNavigate: 0.4,
    gameStart: 0.7,
    invalidMove: 0.6,
    captureBonus: 1.0,
  },
  enabledSounds: {
    pickup: true,
    drop: true,
    capture: true,
    win: true,
    turn: true,
    click: true,
    menuNavigate: true,
    gameStart: true,
    invalidMove: true,
    captureBonus: true,
  },
};

const STORAGE_KEY = 'mancala-sound-settings';

export const useSoundSettings = () => {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const saveSettings = useCallback((newSettings: SoundSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Could not save sound settings:', error);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<SoundSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setMasterVolume = useCallback((volume: number) => {
    updateSettings({ masterVolume: Math.max(0, Math.min(1, volume)) });
  }, [updateSettings]);

  const setMuted = useCallback((isMuted: boolean) => {
    updateSettings({ isMuted });
  }, [updateSettings]);

  const toggleMute = useCallback(() => {
    updateSettings({ isMuted: !settings.isMuted });
  }, [settings.isMuted, updateSettings]);

  const setIndividualVolume = useCallback((soundType: SoundType, volume: number) => {
    updateSettings({
      individualVolumes: {
        ...settings.individualVolumes,
        [soundType]: Math.max(0, Math.min(1, volume)),
      },
    });
  }, [settings.individualVolumes, updateSettings]);

  const setSoundEnabled = useCallback((soundType: SoundType, enabled: boolean) => {
    updateSettings({
      enabledSounds: {
        ...settings.enabledSounds,
        [soundType]: enabled,
      },
    });
  }, [settings.enabledSounds, updateSettings]);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  const getEffectiveVolume = useCallback((soundType: SoundType): number => {
    if (settings.isMuted) return 0;
    if (!settings.enabledSounds[soundType]) return 0;
    return settings.masterVolume * settings.individualVolumes[soundType];
  }, [settings]);

  // Load settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Could not load sound settings:', error);
    }
  }, [setSettings]);

  return {
    settings,
    setMasterVolume,
    setMuted,
    toggleMute,
    setIndividualVolume,
    setSoundEnabled,
    resetToDefaults,
    getEffectiveVolume,
    updateSettings,
  };
};