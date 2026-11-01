/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Share2, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { TawafSession, DynamicTypeSize, AppLanguage } from '../types/tawaf';
import { translations } from '../utils/i18n';
import { feedback } from '../utils/haptics';

interface CompletionViewProps {
  session: TawafSession;
  dynamicType: DynamicTypeSize;
  highContrast: boolean;
  hapticsEnabled: boolean;
  language: AppLanguage;
  onResetSession: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  session,
  dynamicType,
  highContrast,
  hapticsEnabled,
  language,
  onResetSession,
}) => {
  const [showLapBreakdown, setShowLapBreakdown] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const t = translations[language];
  const isAr = language === 'ar';

  const totalDuration =
    session.completedAt && session.sessionStartTime
      ? Math.floor((session.completedAt - session.sessionStartTime) / 1000)
      : session.laps.reduce((acc, lap) => acc + lap.durationSeconds, 0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopySummary = () => {
    feedback.lightTap(hapticsEnabled);
    const text = isAr
      ? `تم الطواف: ٧ من ٧ أشواط\nالمدة الإجمالية: ${formatTime(totalDuration)}\nتقبل الله طوافكم وصالح أعمالكم.`
      : `Tawaf Completed: 7 of 7 Circuits\nDuration: ${formatTime(totalDuration)}\nMay Allah accept our worship.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex flex-col h-full px-5 py-6 overflow-y-auto no-scrollbar justify-between"
    >
      {/* Top Graphic & Sacred Greeting */}
      <div className="flex flex-col items-center text-center mt-3">
        {/* Sacred Seal Emblem */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-amber-500 dark:text-amber-400" />
        </div>

        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
          {t.completedTitle}
        </h1>

        {/* Traditional Arabic greeting */}
        <p className="text-2xl font-serif text-amber-600 dark:text-amber-400 mt-2 font-medium" style={{ fontFamily: 'var(--font-arabic)' }}>
          {t.completedGreeting}
        </p>

        <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-sm leading-relaxed">
          {t.completedDesc}
        </p>
      </div>

      {/* Summary Card */}
      <div className="my-5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs">
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-stone-200 dark:border-stone-800 text-center">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              {t.totalDuration}
            </span>
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-50 font-mono tabular-nums mt-0.5 block">
              {formatTime(totalDuration)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              {t.circuitLabel}
            </span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums mt-0.5 block">
              {t.completedLaps}
            </span>
          </div>
        </div>

        {/* Lap Breakdown Accordion */}
        <div className="pt-3">
          <button
            type="button"
            onClick={() => setShowLapBreakdown(!showLapBreakdown)}
            className="w-full flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-300 py-1 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <span>{t.circuitLapTimes}</span>
            {showLapBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showLapBreakdown && (
            <div className="mt-2 space-y-1.5 pt-1 animate-in fade-in">
              {session.laps.map((lap) => (
                <div
                  key={lap.circuitNumber}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white dark:bg-stone-800/60"
                >
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {t.lapTime(lap.circuitNumber)}
                  </span>
                  <span className="text-stone-400 text-[10px] capitalize">
                    {lap.detectionType === 'manual' ? (isAr ? 'يدوي' : 'manual') : lap.detectionType === 'automatic' ? (isAr ? 'تلقائي' : 'automatic') : (isAr ? 'مؤكد' : 'confirmed')}
                  </span>
                  <span className="font-mono tabular-nums text-stone-900 dark:text-stone-100 font-semibold">
                    {formatTime(lap.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sunnah Reminders */}
      <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-start">
        <h2 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span>{t.recommendedActsTitle}</span>
        </h2>
        <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 ps-4 list-disc marker:text-amber-500 leading-relaxed">
          <li>{t.recommendedAct1}</li>
          <li>{t.recommendedAct2}</li>
          <li>{t.recommendedAct3}</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto">
        <button
          type="button"
          onClick={handleCopySummary}
          className="w-full h-12 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
        >
          <Share2 className="w-4 h-4 text-amber-500" />
          <span>{copyFeedback ? t.copiedFeedback : t.copySummaryBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            feedback.lightTap(hapticsEnabled);
            onResetSession();
          }}
          className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all"
        >
          <RotateCcw className={`w-4 h-4 ${isAr ? 'scale-x-[-1]' : ''}`} />
          <span>{t.startNewTawafBtn}</span>
        </button>
      </div>
    </div>
  );
};
