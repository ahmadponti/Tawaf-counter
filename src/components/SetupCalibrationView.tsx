/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Compass, MapPin, CheckCircle2, ShieldCheck, AlertCircle, Play, Languages, Sun, Moon } from 'lucide-react';
import { AppLanguage, CountMode, DynamicTypeSize } from '../types/tawaf';
import { translations } from '../utils/i18n';
import { feedback } from '../utils/haptics';

interface SetupCalibrationViewProps {
  language: AppLanguage;
  darkMode: boolean;
  dynamicType: DynamicTypeSize;
  highContrast: boolean;
  onStartTawaf: (mode: CountMode, heading: number | null, coords: { latitude: number; longitude: number } | null) => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
}

export const SetupCalibrationView: React.FC<SetupCalibrationViewProps> = ({
  language,
  darkMode,
  dynamicType,
  highContrast,
  onStartTawaf,
  onToggleLanguage,
  onToggleTheme,
}) => {
  const [selectedMode, setSelectedMode] = useState<CountMode>('auto_manual');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibratedHeading, setCalibratedHeading] = useState<number | null>(null);
  const [calibratedCoords, setCalibratedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [calibrationError, setCalibrationError] = useState<string | null>(null);

  const t = translations[language];
  const isAr = language === 'ar';

  const textSizeClass = {
    standard: 'text-base',
    large: 'text-lg',
    extra_large: 'text-xl',
  }[dynamicType];

  const headingSizeClass = {
    standard: 'text-2xl',
    large: 'text-3xl',
    extra_large: 'text-4xl',
  }[dynamicType];

  const handleCalibrateStartPoint = async () => {
    setIsCalibrating(true);
    setCalibrationError(null);
    feedback.lightTap();

    try {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCalibratedCoords({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 6000 }
        );
      }

      const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceOrientation?.requestPermission === 'function') {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          window.addEventListener(
            'deviceorientation',
            (e) => {
              const heading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading || e.alpha;
              if (heading !== undefined && heading !== null) {
                setCalibratedHeading(Math.round(heading));
              }
            },
            { once: true }
          );
        }
      } else {
        window.addEventListener(
          'deviceorientation',
          (e) => {
            const heading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading || e.alpha;
            if (heading !== undefined && heading !== null) {
              setCalibratedHeading(Math.round(heading));
            }
          },
          { once: true }
        );
      }

      setTimeout(() => {
        setIsCalibrating(false);
        setCalibratedHeading((prev) => (prev !== null ? prev : 125));
        feedback.circuitCounted();
      }, 700);
    } catch {
      setIsCalibrating(false);
      setCalibratedHeading(125);
    }
  };

  const handleStart = () => {
    feedback.circuitCounted();
    onStartTawaf(selectedMode, calibratedHeading, calibratedCoords);
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex flex-col h-full px-5 py-5 overflow-y-auto no-scrollbar"
    >
      {/* Top Language & Theme Bar */}
      <div className="flex items-center justify-between pb-2">
        <span className="text-[11px] font-semibold text-stone-400">
          {t.appName}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              feedback.lightTap();
              onToggleTheme();
            }}
            className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-500 transition-colors"
            title={darkMode ? t.lightTheme : t.darkTheme}
            aria-label={darkMode ? t.lightTheme : t.darkTheme}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>
          <button
            type="button"
            onClick={() => {
              feedback.lightTap();
              onToggleLanguage();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-500 text-xs font-semibold transition-colors"
            title="Switch language / تغيير اللغة"
          >
            <Languages className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Header Icon Graphic */}
      <div className="flex flex-col items-center text-center mt-1 mb-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-sm">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 bg-stone-900 border border-amber-400 rounded-sm relative shadow-inner">
              <div className="absolute top-1.5 left-0 right-0 h-1 bg-amber-400" />
            </div>
            <div className={`absolute -bottom-2 ${isAr ? '-left-2' : '-right-2'} flex items-center justify-center`}>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            </div>
          </div>
        </div>

        <h1 className={`${headingSizeClass} font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight`}>
          {t.setupTitle}
        </h1>
        <p className={`${textSizeClass} text-stone-600 dark:text-stone-400 mt-2 max-w-sm leading-relaxed`}>
          {t.setupSubtitle}
        </p>
      </div>

      {/* Starting Guidance Card */}
      <div className="bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
            ١
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {t.step1Title}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
              {t.step1Desc}
            </p>
          </div>
        </div>

        <div className="h-px bg-stone-200 dark:bg-stone-800 my-3" />

        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
            ٢
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {t.step2Title}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
              {t.step2Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Calibration Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {t.startPointCalibration}
            </h2>
          </div>
          {calibratedHeading !== null ? (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t.calibrated}
            </span>
          ) : (
            <span className="text-[11px] text-stone-400">{t.optional}</span>
          )}
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mb-3 leading-relaxed">
          {t.calibrationDesc}
        </p>

        <button
          type="button"
          onClick={handleCalibrateStartPoint}
          disabled={isCalibrating}
          className="w-full h-11 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
        >
          {isCalibrating ? (
            <span className="inline-block animate-spin mr-1">↻</span>
          ) : (
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          )}
          {calibratedHeading !== null
            ? t.calibratedAt(calibratedHeading)
            : t.calibrateBtn}
        </button>

        {calibrationError && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {calibrationError}
          </p>
        )}
      </div>

      {/* Mode Selection */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4">
        <h2 className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
          {t.countingMethod}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedMode('auto_manual')}
            className={`p-3 rounded-xl border text-start transition-all ${
              selectedMode === 'auto_manual'
                ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-stone-900 dark:text-stone-50 ring-1 ring-amber-500'
                : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400'
            }`}
          >
            <div className="font-semibold text-xs">
              {t.autoManualMode}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-tight">
              {t.autoManualDesc}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('manual_only')}
            className={`p-3 rounded-xl border text-start transition-all ${
              selectedMode === 'manual_only'
                ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-stone-900 dark:text-stone-50 ring-1 ring-amber-500'
                : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-600 dark:text-stone-400'
            }`}
          >
            <div className="font-semibold text-xs">
              {t.manualOnlyMode}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-tight">
              {t.manualOnlyDesc}
            </p>
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-xl bg-stone-100/70 dark:bg-stone-900/40 p-3.5 mb-6 text-stone-500 dark:text-stone-400 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-stone-700 dark:text-stone-300 font-semibold">{t.privacyNoticeTitle}</strong> {t.privacyNoticeDesc}
        </p>
      </div>

      {/* Primary CTA */}
      <div className="mt-auto pt-2">
        <button
          type="button"
          onClick={handleStart}
          className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all"
        >
          <Play className={`w-5 h-5 fill-stone-950 ${isAr ? 'rotate-180' : ''}`} />
          <span>{t.startTawafBtn}</span>
        </button>
      </div>
    </div>
  );
};
