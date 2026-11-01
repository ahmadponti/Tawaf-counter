/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TawafSession,
  AppSettings,
  SensorState,
  CountMode,
  UncertaintyPrompt,
  CircuitLap,
} from './types/tawaf';
import { defaultSession, defaultSettings, storage } from './utils/storage';
import { TawafCircuitDetector } from './services/tawafDetector';
import { wakeLockManager } from './utils/wakeLock';
import { feedback } from './utils/haptics';
import { IOSDeviceFrame } from './components/iOSDeviceFrame';
import { SetupCalibrationView } from './components/SetupCalibrationView';
import { MainCounterView } from './components/MainCounterView';
import { CompletionView } from './components/CompletionView';
import { SettingsModal } from './components/SettingsModal';
import { MatafSimulator } from './components/MatafSimulator';
import { SwiftExportModal } from './components/SwiftExportModal';
import { PrayerCountdownBanner } from './components/PrayerCountdownBanner';

export default function App() {
  // Session & Settings state with on-device persistence
  const [session, setSession] = useState<TawafSession>(() => {
    return storage.loadSession() || defaultSession;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    return storage.loadSettings();
  });

  // Sensor state
  const [sensorState, setSensorState] = useState<SensorState>({
    hasLocationPermission: null,
    hasOrientationPermission: null,
    currentHeading: null,
    coords: null,
    cumulativeAngle: 0,
    estimatedDistance: 0,
    confidenceScore: 0,
    isSimulating: false,
    simulationStep: 0,
  });

  // Modals & Sheets
  const [uncertaintyPrompt, setUncertaintyPrompt] = useState<UncertaintyPrompt | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSwiftModalOpen, setIsSwiftModalOpen] = useState(false);

  // Detector engine reference
  const detectorRef = useRef<TawafCircuitDetector>(new TawafCircuitDetector());
  const geoWatchId = useRef<number | null>(null);

  // Keep screen awake during active Tawaf
  useEffect(() => {
    if (session.status === 'active' && settings.keepScreenAwake) {
      wakeLockManager.request().catch(() => {});
    } else {
      wakeLockManager.release().catch(() => {});
    }

    return () => {
      wakeLockManager.release().catch(() => {});
    };
  }, [session.status, settings.keepScreenAwake]);

  // Sync settings to storage & dark class
  useEffect(() => {
    storage.saveSettings(settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Sync session to storage
  useEffect(() => {
    storage.saveSession(session);
  }, [session]);

  // Real-world sensor tracking: Geolocation and DeviceOrientation
  useEffect(() => {
    if (session.status !== 'active' || session.mode !== 'auto_manual') {
      if (geoWatchId.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(geoWatchId.current);
        geoWatchId.current = null;
      }
      return;
    }

    // Geolocation listener
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      geoWatchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };

          setSensorState((prev) => ({
            ...prev,
            hasLocationPermission: true,
            coords,
          }));

          // Run detector
          const evaluation = detectorRef.current.update(coords, sensorState.currentHeading);
          handleEvaluationResult(evaluation);
        },
        () => {
          setSensorState((prev) => ({ ...prev, hasLocationPermission: false }));
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 }
      );
    }

    // Compass / Orientation listener
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const heading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading || e.alpha;
      if (heading !== undefined && heading !== null) {
        const rounded = Math.round(heading);
        setSensorState((prev) => ({
          ...prev,
          currentHeading: rounded,
          hasOrientationPermission: true,
        }));
        const evaluation = detectorRef.current.update(sensorState.coords, rounded);
        handleEvaluationResult(evaluation);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      if (geoWatchId.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(geoWatchId.current);
        geoWatchId.current = null;
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [session.status, session.mode, sensorState.currentHeading, sensorState.coords]);

  const handleEvaluationResult = (result: {
    isCompleted: boolean;
    isUncertain: boolean;
    confidence: number;
    reason?: string;
    cumulativeAngle: number;
    estimatedDistance: number;
  }) => {
    setSensorState((prev) => ({
      ...prev,
      cumulativeAngle: result.cumulativeAngle,
      estimatedDistance: result.estimatedDistance,
      confidenceScore: result.confidence,
    }));

    if (result.isCompleted) {
      // Automatic count increment
      handleIncrementCircuit('automatic');
    } else if (result.isUncertain && !uncertaintyPrompt) {
      // Uncertainty check required: Ask for simple confirmation
      setUncertaintyPrompt({
        candidateCircuit: session.currentCircuit,
        reason: result.reason || 'Movement near Hajar al-Aswad detected',
        timestamp: Date.now(),
      });
      feedback.lightTap(settings.hapticsEnabled);
    }
  };

  // Start Tawaf session
  const handleStartTawaf = (
    mode: CountMode,
    heading: number | null,
    coords: { latitude: number; longitude: number } | null
  ) => {
    const now = Date.now();
    detectorRef.current.startNewCircuit(heading, coords);

    setSession({
      id: `session_${now}`,
      status: 'active',
      currentCircuit: 1,
      laps: [],
      circuitStartTime: now,
      sessionStartTime: now,
      completedAt: null,
      mode,
      isCalibrated: heading !== null || coords !== null,
      calibrationHeading: heading,
      calibrationCoords: coords,
    });

    setSensorState({
      hasLocationPermission: coords !== null,
      hasOrientationPermission: heading !== null,
      currentHeading: heading,
      coords,
      cumulativeAngle: 0,
      estimatedDistance: 0,
      confidenceScore: 0,
      isSimulating: false,
      simulationStep: 0,
    });
  };

  // Increment circuit (manual or automatic)
  const handleIncrementCircuit = useCallback(
    (detectionType: 'manual' | 'automatic' | 'confirmed' = 'manual') => {
      const now = Date.now();
      const lapDuration = Math.max(
        1,
        Math.floor((now - session.circuitStartTime) / 1000)
      );

      const newLap: CircuitLap = {
        circuitNumber: session.currentCircuit,
        startTime: session.circuitStartTime,
        endTime: now,
        durationSeconds: lapDuration,
        detectionType,
      };

      const updatedLaps = [...session.laps, newLap];

      // Check if finished 7 circuits
      if (session.currentCircuit >= 7) {
        feedback.completion(settings.hapticsEnabled);
        if (settings.soundEnabled) {
          feedback.playGentleTone(true);
        }
        setSession((prev) => ({
          ...prev,
          status: 'completed',
          currentCircuit: 7,
          laps: updatedLaps,
          completedAt: now,
        }));
      } else {
        feedback.circuitCounted(settings.hapticsEnabled);
        if (settings.soundEnabled) {
          feedback.playGentleTone(true);
        }
        detectorRef.current.startNewCircuit(
          sensorState.currentHeading,
          sensorState.coords
        );

        setSession((prev) => ({
          ...prev,
          currentCircuit: prev.currentCircuit + 1,
          laps: updatedLaps,
          circuitStartTime: now,
        }));

        setSensorState((prev) => ({
          ...prev,
          cumulativeAngle: 0,
          estimatedDistance: 0,
          confidenceScore: 0,
        }));
      }

      setUncertaintyPrompt(null);
    },
    [session, sensorState, settings]
  );

  // Undo last lap
  const handleUndoCircuit = () => {
    if (session.currentCircuit <= 1) return;

    const updatedLaps = session.laps.slice(0, -1);
    const now = Date.now();

    detectorRef.current.startNewCircuit(
      sensorState.currentHeading,
      sensorState.coords
    );

    setSession((prev) => ({
      ...prev,
      currentCircuit: Math.max(1, prev.currentCircuit - 1),
      laps: updatedLaps,
      circuitStartTime: now,
    }));

    setSensorState((prev) => ({
      ...prev,
      cumulativeAngle: 0,
      estimatedDistance: 0,
    }));

    setUncertaintyPrompt(null);
  };

  // Reset Tawaf
  const handleResetSession = () => {
    storage.clearSession();
    detectorRef.current.startNewCircuit();
    setSession(defaultSession);
    setUncertaintyPrompt(null);
    setSensorState({
      hasLocationPermission: null,
      hasOrientationPermission: null,
      currentHeading: null,
      coords: null,
      cumulativeAngle: 0,
      estimatedDistance: 0,
      confidenceScore: 0,
      isSimulating: false,
      simulationStep: 0,
    });
  };

  // Toggle counting mode
  const handleToggleMode = () => {
    setSession((prev) => ({
      ...prev,
      mode: prev.mode === 'auto_manual' ? 'manual_only' : 'auto_manual',
    }));
  };

  // Toggle language (English <-> Arabic)
  const handleToggleLanguage = () => {
    setSettings((prev) => ({
      ...prev,
      language: prev.language === 'ar' ? 'en' : 'ar',
    }));
  };

  // Toggle theme directly (Light <-> Dark)
  const handleToggleTheme = () => {
    setSettings((prev) => {
      const nextDark = !prev.darkMode;
      return {
        ...prev,
        darkMode: nextDark,
        themePreference: nextDark ? 'dark' : 'light',
      };
    });
  };

  // Listen for system theme changes if themePreference is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (settings.themePreference === 'system') {
        setSettings((prev) => ({ ...prev, darkMode: e.matches }));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.themePreference]);

  // Simulator actions
  const handleSimulateStep = (angleDelta: number, distanceDelta: number) => {
    const result = detectorRef.current.advanceSimulation(angleDelta, distanceDelta);
    handleEvaluationResult(result);
  };

  const handleSimulateFullLap = () => {
    handleIncrementCircuit('automatic');
  };

  const handleTriggerUncertainty = () => {
    setUncertaintyPrompt({
      candidateCircuit: session.currentCircuit,
      reason: settings.language === 'ar'
        ? 'تم رصد حركة بمحاذاة خط الحجر الأسود. احتمال إتمام الشوط.'
        : 'Pilgrim detected near Hajar al-Aswad line. Possible circuit completion.',
      timestamp: Date.now(),
    });
    feedback.lightTap(settings.hapticsEnabled);
  };

  return (
    <IOSDeviceFrame
      darkMode={settings.darkMode}
      language={settings.language}
      onOpenSwiftSource={() => setIsSwiftModalOpen(true)}
    >
      {/* Top Prayer Countdown Banner */}
      <PrayerCountdownBanner
        language={settings.language}
        highContrast={settings.highContrast}
      />

      {/* Screen Router */}
      {session.status === 'setup' && (
        <SetupCalibrationView
          language={settings.language}
          darkMode={settings.darkMode}
          dynamicType={settings.dynamicType}
          highContrast={settings.highContrast}
          onStartTawaf={handleStartTawaf}
          onToggleLanguage={handleToggleLanguage}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {session.status === 'active' && (
        <MainCounterView
          session={session}
          sensorState={sensorState}
          uncertaintyPrompt={uncertaintyPrompt}
          dynamicType={settings.dynamicType}
          highContrast={settings.highContrast}
          hapticsEnabled={settings.hapticsEnabled}
          soundEnabled={settings.soundEnabled}
          language={settings.language}
          darkMode={settings.darkMode}
          onIncrementCircuit={handleIncrementCircuit}
          onUndoCircuit={handleUndoCircuit}
          onResetSession={handleResetSession}
          onToggleMode={handleToggleMode}
          onToggleLanguage={handleToggleLanguage}
          onToggleTheme={handleToggleTheme}
          onConfirmUncertainty={() => handleIncrementCircuit('confirmed')}
          onDismissUncertainty={() => setUncertaintyPrompt(null)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />
      )}

      {session.status === 'completed' && (
        <CompletionView
          session={session}
          dynamicType={settings.dynamicType}
          highContrast={settings.highContrast}
          hapticsEnabled={settings.hapticsEnabled}
          language={settings.language}
          onResetSession={handleResetSession}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onOpenSwiftSource={() => setIsSwiftModalOpen(true)}
      />

      {/* Mataf Simulator Modal */}
      <MatafSimulator
        isOpen={isSimulatorOpen}
        language={settings.language}
        onClose={() => setIsSimulatorOpen(false)}
        cumulativeAngle={sensorState.cumulativeAngle}
        estimatedDistance={sensorState.estimatedDistance}
        currentCircuit={session.currentCircuit}
        onSimulateStep={handleSimulateStep}
        onTriggerUncertainty={handleTriggerUncertainty}
        onSimulateFullLap={handleSimulateFullLap}
      />

      {/* Swift Project Code Export Modal */}
      <SwiftExportModal
        isOpen={isSwiftModalOpen}
        onClose={() => setIsSwiftModalOpen(false)}
      />
    </IOSDeviceFrame>
  );
}
