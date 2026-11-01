/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Radio,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Clock,
  Compass,
  AlertTriangle,
  Check,
  X,
  Smartphone,
  Languages,
  Sun,
  Moon,
} from 'lucide-react';
import {
  TawafSession,
  DynamicTypeSize,
  SensorState,
  UncertaintyPrompt,
  AppLanguage,
} from '../types/tawaf';
import { translations } from '../utils/i18n';
import { CircuitProgressRing } from './CircuitProgressRing';
import { UmrahDoaCard } from './UmrahDoaCard';
import { feedback } from '../utils/haptics';

interface MainCounterViewProps {
  session: TawafSession;
  sensorState: SensorState;
  uncertaintyPrompt: UncertaintyPrompt | null;
  dynamicType: DynamicTypeSize;
  highContrast: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  language: AppLanguage;
  darkMode: boolean;
  onIncrementCircuit: (detectionType?: 'manual' | 'automatic' | 'confirmed') => void;
  onUndoCircuit: () => void;
  onResetSession: () => void;
  onToggleMode: () => void;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  onConfirmUncertainty: () => void;
  onDismissUncertainty: () => void;
  onOpenSettings: () => void;
  onOpenSimulator: () => void;
}

export const MainCounterView: React.FC<MainCounterViewProps> = ({
  session,
  sensorState,
  uncertaintyPrompt,
  dynamicType,
  highContrast,
  hapticsEnabled,
  soundEnabled,
  language,
  darkMode,
  onIncrementCircuit,
  onUndoCircuit,
  onResetSession,
  onToggleMode,
  onToggleLanguage,
  onToggleTheme,
  onConfirmUncertainty,
  onDismissUncertainty,
  onOpenSettings,
  onOpenSimulator,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentLapSeconds, setCurrentLapSeconds] = useState(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLapDetails, setShowLapDetails] = useState(false);

  const t = translations[language];
  const isAr = language === 'ar';

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (session.sessionStartTime) {
        setElapsedSeconds(Math.floor((now - session.sessionStartTime) / 1000));
      }
      if (session.circuitStartTime) {
        setCurrentLapSeconds(Math.floor((now - session.circuitStartTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.sessionStartTime, session.circuitStartTime]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleIncrement = () => {
    feedback.lightTap(hapticsEnabled);
    feedback.circuitCounted(hapticsEnabled);
    if (soundEnabled) {
      feedback.playGentleTone(true);
    }
    onIncrementCircuit('manual');
  };

  const handleUndo = () => {
    feedback.lightTap(hapticsEnabled);
    onUndoCircuit();
  };

  const dynamicScale = {
    standard: {
      circuitNum: 'text-7xl',
      primaryBtn: 'h-20 text-2xl',
      btnSub: 'text-xs',
      kicker: 'text-xs',
    },
    large: {
      circuitNum: 'text-8xl',
      primaryBtn: 'h-22 text-2xl',
      btnSub: 'text-sm',
      kicker: 'text-sm',
    },
    extra_large: {
      circuitNum: 'text-9xl',
      primaryBtn: 'h-24 text-3xl',
      btnSub: 'text-base',
      kicker: 'text-base',
    },
  }[dynamicType];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex flex-col h-full justify-between px-4 sm:px-6 py-4 overflow-hidden relative"
    >
      {/* Top Bar (One Row, HIG Compliant) */}
      <header className="flex items-center justify-between gap-2 z-10 shrink-0">
        {/* Left Zone: Reset Control */}
        <button
          type="button"
          onClick={() => {
            feedback.lightTap(hapticsEnabled);
            setShowResetConfirm(true);
          }}
          className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-sm font-medium py-2 px-2.5 rounded-lg active:bg-stone-100 dark:active:bg-stone-800/60 transition-colors flex items-center gap-1.5"
          aria-label={t.resetBtn}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.resetBtn}</span>
        </button>

        {/* Center Zone: Mode Toggle Button */}
        <button
          type="button"
          onClick={() => {
            feedback.lightTap(hapticsEnabled);
            onToggleMode();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            session.mode === 'auto_manual'
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/40'
              : 'bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
          }`}
          aria-label={`Counting mode is ${session.mode === 'auto_manual' ? t.autoManualBadge : t.manualOnlyBadge}`}
        >
          {session.mode === 'auto_manual' ? (
            <>
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{t.autoManualBadge}</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.manualOnlyBadge}</span>
            </>
          )}
        </button>

        {/* Right Zone: Controls (Theme, Language, Simulator, Settings) */}
        <div className="flex items-center gap-1">
          {/* Quick Theme Toggle (Sun/Moon) */}
          <button
            type="button"
            onClick={() => {
              feedback.lightTap(hapticsEnabled);
              onToggleTheme();
            }}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 active:bg-stone-100 dark:active:bg-stone-800/60 transition-colors"
            title={darkMode ? t.lightTheme : t.darkTheme}
            aria-label={darkMode ? t.lightTheme : t.darkTheme}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>

          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={() => {
              feedback.lightTap(hapticsEnabled);
              onToggleLanguage();
            }}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 active:bg-stone-100 dark:active:bg-stone-800/60 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Switch Language / تغيير اللغة"
            aria-label="Switch Language"
          >
            <Languages className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">{isAr ? 'EN' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSimulator}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 active:bg-stone-100 dark:active:bg-stone-800/60 transition-colors"
            title={t.simulatorTitle}
            aria-label={t.simulatorTitle}
          >
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 active:bg-stone-100 dark:active:bg-stone-800/60 transition-colors"
            title={t.settingsTitle}
            aria-label={t.settingsTitle}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Uncertainty Confirmation Banner */}
      {uncertaintyPrompt && (
        <div
          role="alert"
          className="my-2 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="text-start">
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {t.uncertaintyTitle(session.currentCircuit)}
              </p>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-tight">
                {t.uncertaintyDesc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onConfirmUncertainty}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.confirmBtn}</span>
            </button>
            <button
              type="button"
              onClick={onDismissUncertainty}
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              aria-label={t.dismissBtn}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Center Display */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto py-1">
        <div className="relative">
          <CircuitProgressRing
            currentCircuit={session.currentCircuit}
            totalCircuits={7}
            size={225}
            strokeWidth={13}
            highContrast={highContrast}
            language={language}
          />
        </div>

        {/* Lap & Total Time Information */}
        <div className="mt-2.5 flex items-center gap-3.5 text-xs font-medium text-stone-500 dark:text-stone-400 tabular-nums">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.totalTime}: {formatTime(elapsedSeconds)}</span>
          </div>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
          <span>{t.lapTime(session.currentCircuit)}: {formatTime(currentLapSeconds)}</span>
        </div>

        {/* Auto Estimation Progress Indicator */}
        {session.mode === 'auto_manual' && (
          <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-400 dark:text-stone-500">
            <span>{t.circuitAngle(Math.min(360, Math.round(sensorState.cumulativeAngle)))}</span>
            {sensorState.estimatedDistance > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>~{Math.round(sensorState.estimatedDistance)}m</span>
              </>
            )}
          </div>
        )}

        {/* Lap Details Accordion Toggle */}
        {session.laps.length > 0 && (
          <button
            type="button"
            onClick={() => setShowLapDetails(!showLapDetails)}
            className="mt-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-[11px] flex items-center gap-1 py-0.5 px-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800/40 transition-colors"
          >
            <span>{t.lapsLogged(session.laps.length)}</span>
            {showLapDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Lap History Dropdown */}
        {showLapDetails && session.laps.length > 0 && (
          <div className="w-full max-w-xs mt-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 max-h-24 overflow-y-auto no-scrollbar shadow-xs animate-in fade-in">
            {session.laps.map((lap) => (
              <div
                key={lap.circuitNumber}
                className="flex items-center justify-between py-1 px-2 text-xs text-stone-600 dark:text-stone-300 border-b last:border-b-0 border-stone-200/60 dark:border-stone-800/60"
              >
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {t.lapTime(lap.circuitNumber)}
                </span>
                <span className="text-stone-400 text-[10px] capitalize">
                  {lap.detectionType === 'manual' ? (isAr ? 'يدوي' : 'manual') : lap.detectionType === 'automatic' ? (isAr ? 'تلقائي' : 'automatic') : (isAr ? 'مؤكد' : 'confirmed')}
                </span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {formatTime(lap.durationSeconds)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action Area: Umrah Doas & Giant One-Hand Controls */}
      <footer className="w-full flex flex-col gap-2.5 pb-2 pt-1 z-10 shrink-0">
        {/* Umrah Doas Card (Clicking card advances to next doa) */}
        <UmrahDoaCard language={language} hapticsEnabled={hapticsEnabled} />

        <button
          type="button"
          onClick={handleIncrement}
          className={`w-full ${dynamicScale.primaryBtn} rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-extrabold flex flex-col items-center justify-center shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-transform select-none touch-manipulation`}
          aria-label={
            session.currentCircuit >= 7
              ? t.finishCircuit7Btn
              : t.completeCircuitBtn(session.currentCircuit)
          }
        >
          <div className="flex items-center gap-2">
            <span>
              {session.currentCircuit >= 7
                ? t.finishCircuit7Btn
                : t.completeCircuitBtn(session.currentCircuit)}
            </span>
          </div>
          <span className={`${dynamicScale.btnSub} font-medium text-stone-900/80`}>
            {session.currentCircuit >= 7
              ? t.finishCircuitHint
              : t.completeCircuitHint}
          </span>
        </button>

        {/* Secondary Bar: Undo Lap */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleUndo}
            disabled={session.currentCircuit <= 1}
            className={`flex-1 h-12 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900/80 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              session.currentCircuit <= 1 ? 'opacity-35 cursor-not-allowed' : 'active:scale-[0.99]'
            }`}
            aria-label={t.undoLastLapBtn}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isAr ? 'scale-x-[-1]' : ''}`} />
            <span>{t.undoLastLapBtn}</span>
          </button>
        </div>
      </footer>

      {/* Reset Confirmation Sheet / Modal */}
      {showResetConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 id="reset-modal-title" className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {t.resetModalTitle}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              {t.resetModalDesc(session.currentCircuit)}
            </p>

            <div className="flex flex-col gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => {
                  feedback.lightTap(hapticsEnabled);
                  setShowResetConfirm(false);
                  onResetSession();
                }}
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors active:scale-[0.99]"
              >
                {t.confirmResetBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  feedback.lightTap(hapticsEnabled);
                  setShowResetConfirm(false);
                }}
                className="w-full h-12 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-sm transition-colors"
              >
                {t.cancelResetBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
