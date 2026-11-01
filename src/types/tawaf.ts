/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CountMode = 'auto_manual' | 'manual_only';

export type DynamicTypeSize = 'standard' | 'large' | 'extra_large';

export interface CircuitLap {
  circuitNumber: number; // 1 to 7
  startTime: number;
  endTime: number;
  durationSeconds: number;
  detectionType: 'manual' | 'automatic' | 'confirmed';
}

export interface TawafSession {
  id: string;
  status: 'setup' | 'calibrating' | 'active' | 'completed';
  currentCircuit: number; // 1 to 7 while in progress; reaches 7 on completion
  laps: CircuitLap[];
  circuitStartTime: number;
  sessionStartTime: number | null;
  completedAt: number | null;
  mode: CountMode;
  isCalibrated: boolean;
  calibrationHeading: number | null;
  calibrationCoords: { latitude: number; longitude: number } | null;
}

export type AppLanguage = 'en' | 'ar';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  language: AppLanguage;
  themePreference: ThemePreference;
  darkMode: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  keepScreenAwake: boolean;
  dynamicType: DynamicTypeSize;
  highContrast: boolean;
}

export interface SensorState {
  hasLocationPermission: boolean | null;
  hasOrientationPermission: boolean | null;
  currentHeading: number | null;
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
  cumulativeAngle: number; // Degrees rotated counter-clockwise in current circuit
  estimatedDistance: number; // Meters walked in current circuit
  confidenceScore: number; // 0 to 1
  isSimulating: boolean;
  simulationStep: number;
}

export interface UncertaintyPrompt {
  candidateCircuit: number;
  reason: string;
  timestamp: number;
}
