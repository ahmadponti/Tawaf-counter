/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, TawafSession } from '../types/tawaf';

const SESSION_KEY = 'tawaf_active_session_v1';
const SETTINGS_KEY = 'tawaf_settings_v1';

export const defaultSettings: AppSettings = {
  language: 'en',
  themePreference: 'dark',
  darkMode: true, // Calm deep aesthetic with gold accents
  hapticsEnabled: true,
  soundEnabled: false, // Default OFF as required
  keepScreenAwake: true, // Default ON as required
  dynamicType: 'standard',
  highContrast: false,
};

export const defaultSession: TawafSession = {
  id: '',
  status: 'setup',
  currentCircuit: 1,
  laps: [],
  circuitStartTime: Date.now(),
  sessionStartTime: null,
  completedAt: null,
  mode: 'auto_manual',
  isCalibrated: false,
  calibrationHeading: null,
  calibrationCoords: null,
};

export const storage = {
  saveSession(session: TawafSession): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Storage quota or private mode
    }
  },

  loadSession(): TawafSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as TawafSession;
      return parsed;
    } catch {
      return null;
    }
  },

  clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  },

  saveSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  },

  loadSettings(): AppSettings {
    if (typeof window === 'undefined') return defaultSettings;
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return defaultSettings;
      return { ...defaultSettings, ...JSON.parse(data) };
    } catch {
      return defaultSettings;
    }
  },
};
