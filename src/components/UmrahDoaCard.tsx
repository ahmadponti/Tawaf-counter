/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Sparkles, ChevronRight, ChevronLeft, Volume2, RotateCcw } from 'lucide-react';
import { UMRAH_DOAS, UmrahDoa } from '../data/umrahDoas';
import { AppLanguage } from '../types/tawaf';
import { feedback } from '../utils/haptics';

interface UmrahDoaCardProps {
  language: AppLanguage;
  hapticsEnabled?: boolean;
}

export const UmrahDoaCard: React.FC<UmrahDoaCardProps> = ({
  language,
  hapticsEnabled = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const isAr = language === 'ar';
  const totalDoas = UMRAH_DOAS.length;
  const currentDoa = UMRAH_DOAS[currentIndex];

  const handleNextDoa = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    feedback.lightTap(hapticsEnabled);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalDoas);
      setAnimating(false);
    }, 120);
  };

  const handlePrevDoa = (e: React.MouseEvent) => {
    e.stopPropagation();
    feedback.lightTap(hapticsEnabled);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + totalDoas) % totalDoas);
      setAnimating(false);
    }, 120);
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="w-full select-none"
    >
      {/* Clickable Card: Clicking anywhere on the card advances to the next du'a */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleNextDoa()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNextDoa();
          }
        }}
        className={`w-full text-start p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.985] bg-stone-50 dark:bg-stone-900/80 hover:bg-stone-100/90 dark:hover:bg-stone-900 border-amber-500/25 dark:border-amber-500/30 ${
          animating ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'
        }`}
        aria-label={
          isAr
            ? `دعاء ${currentIndex + 1} من ${totalDoas}: ${currentDoa.arabic}. اضغط للانتقال للدعاء التالي.`
            : `Umrah Du'a ${currentIndex + 1} of ${totalDoas}. Tap to show next du'a.`
        }
      >
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-stone-200/60 dark:border-stone-800/60">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 truncate">
              {isAr ? currentDoa.occasionAr : currentDoa.occasionEn}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Step Counter */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold tabular-nums">
              {isAr
                ? `دعاء ${currentIndex + 1} / ${totalDoas}`
                : `Doa ${currentIndex + 1} of ${totalDoas}`}
            </span>

            {/* Quick arrow controls */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevDoa}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
                title={isAr ? 'الدعاء السابق' : 'Previous Du\'a'}
                aria-label="Previous Du'a"
              >
                <ChevronLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleNextDoa}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
                title={isAr ? 'الدعاء التالي' : 'Next Du\'a'}
                aria-label="Next Du'a"
              >
                <ChevronRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Arabic Calligraphy Content */}
        <div className="text-center my-1.5">
          <p
            className="text-lg sm:text-xl font-serif text-stone-950 dark:text-amber-50 leading-relaxed font-bold selection:bg-amber-500/30"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            {currentDoa.arabic}
          </p>
        </div>

        {/* Transliteration & Translation (Shown in clean, non-distracting typography) */}
        {!isAr && (
          <div className="mt-1.5 text-center">
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 italic leading-snug">
              {currentDoa.transliteration}
            </p>
            <p className="text-[11px] text-stone-700 dark:text-stone-300 mt-1 leading-snug">
              &ldquo;{currentDoa.translationEn}&rdquo;
            </p>
          </div>
        )}

        {isAr && (
          <div className="mt-1 text-center">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
              {currentDoa.translationAr}
            </p>
          </div>
        )}

        {/* Bottom Tap-to-Next Hint */}
        <div className="mt-2 pt-1 border-t border-stone-200/40 dark:border-stone-800/40 flex items-center justify-center gap-1 text-[10px] text-amber-600/80 dark:text-amber-400/80">
          <span>{isAr ? 'اضغط لعرض الدعاء التالي' : 'Tap to show next du\'a'}</span>
          <ChevronRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </div>
  );
};
