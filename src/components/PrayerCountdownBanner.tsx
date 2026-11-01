/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, BellRing, Sparkles, X, MapPin } from 'lucide-react';
import { AppLanguage } from '../types/tawaf';
import { getNextPrayerCountdown, NextPrayerInfo } from '../utils/prayerTimes';
import { feedback } from '../utils/haptics';

interface PrayerCountdownBannerProps {
  language: AppLanguage;
  highContrast?: boolean;
}

export const PrayerCountdownBanner: React.FC<PrayerCountdownBannerProps> = ({
  language,
  highContrast = false,
}) => {
  const [prayerInfo, setPrayerInfo] = useState<NextPrayerInfo>(() => getNextPrayerCountdown());
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const isAr = language === 'ar';

  useEffect(() => {
    // Tick every second for accurate countdown
    const interval = setInterval(() => {
      setPrayerInfo(getNextPrayerCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { nextPrayer, remainingSeconds, isSoon, allPrayers } = prayerInfo;

  // Format countdown string
  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    if (isAr) {
      if (h > 0) {
        return `خلال ${h} س و${m.toString().padStart(2, '0')} د`;
      }
      return `خلال ${m} د و${s.toString().padStart(2, '0')} ث`;
    }

    if (h > 0) {
      return `in ${h}h ${m.toString().padStart(2, '0')}m`;
    }
    return `in ${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const prayerName = isAr ? nextPrayer.nameAr : nextPrayer.nameEn;

  return (
    <>
      {/* Top Banner Strip */}
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="w-full px-4 pt-1 pb-1 shrink-0 z-10"
      >
        <button
          type="button"
          onClick={() => {
            feedback.lightTap();
            setShowScheduleModal(true);
          }}
          className={`w-full py-1.5 px-3 rounded-full flex items-center justify-between transition-all duration-300 text-xs font-medium border shadow-2xs ${
            isSoon
              ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500/50 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/30'
              : 'bg-stone-100/90 dark:bg-stone-900/80 hover:bg-stone-200/80 dark:hover:bg-stone-800/80 border-stone-200/80 dark:border-stone-800/80 text-stone-700 dark:text-stone-300'
          }`}
          aria-label={
            isAr
              ? `الصلاة القادمة: صلاة ${prayerName} ${formatCountdown(remainingSeconds)}. اضغط لعرض جدول أوقات الصلاة بمكة.`
              : `Next prayer: ${prayerName} ${formatCountdown(remainingSeconds)}. Tap to view full Mecca prayer schedule.`
          }
        >
          {/* Left: Indicator & Name */}
          <div className="flex items-center gap-1.5 truncate">
            {isSoon ? (
              <BellRing className="w-3.5 h-3.5 text-amber-500 animate-bounce shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {isAr ? 'الصلاة القادمة:' : 'Next Prayer:'}
            </span>
            <span className="font-bold text-stone-900 dark:text-stone-100">
              {prayerName}
            </span>
          </div>

          {/* Right: Live Ticking Countdown Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400 text-xs">
              {formatCountdown(remainingSeconds)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 opacity-70" />
          </div>
        </button>
      </div>

      {/* Mecca Prayer Schedule Modal / Sheet */}
      {showScheduleModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="prayer-schedule-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
        >
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            className="w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            {/* iOS Sheet Grab Bar */}
            <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto -mt-1 mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 id="prayer-schedule-title" className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'مواقيت الصلاة في مكة المكرمة' : 'Makkah Prayer Times'}</span>
                </h3>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  {isAr ? 'تقويم أم القرى (المسجد الحرام)' : 'Umm al-Qura (Masjid al-Haram)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                aria-label="Close prayer schedule"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prayers List */}
            <div className="space-y-1.5 my-4">
              {allPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all ${
                    prayer.isNext
                      ? 'bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {prayer.isNext && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    )}
                    <span className="text-xs">
                      {isAr ? prayer.nameAr : prayer.nameEn}
                    </span>
                    {prayer.isNext && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold">
                        {isAr ? 'القادمة' : 'Next'}
                      </span>
                    )}
                  </div>
                  <span className="font-mono tabular-nums text-xs">
                    {prayer.timeString}
                  </span>
                </div>
              ))}
            </div>

            {/* Advisory Notice for Pilgrims */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              <strong className="text-stone-800 dark:text-stone-200 font-semibold block mb-0.5">
                {isAr ? 'تنبيه أداء الطواف:' : 'Tawaf Advisory:'}
              </strong>
              {isAr
                ? 'يتوقف الطواف في صحن المطاف عند إقامة الصلاة المكتوبة وتصطف الصفوف حول الكعبة المشرفة. إذا اقترب وقت الأذان، خطط لإتمام أشواطك أو الانضمام للصفوف.'
                : 'Tawaf around the Kaaba halts when congregational prayer rows form in the Mataf. Keep an eye on the countdown so you can complete your current circuit or join the prayer lines peacefully.'}
            </div>

            <button
              type="button"
              onClick={() => setShowScheduleModal(false)}
              className="w-full h-10 mt-4 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-900 font-bold text-xs transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
