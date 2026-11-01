/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Coordinates of Masjid al-Haram, Mecca
export const MECCA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
  timezoneOffsetHours: 3, // UTC+3 (Arabia Standard Time)
};

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTimeItem {
  id: PrayerName;
  nameEn: string;
  nameAr: string;
  timeDate: Date;
  timeString: string; // e.g. "05:12 AM" or "12:18 PM"
  isNext: boolean;
}

export interface NextPrayerInfo {
  nextPrayer: PrayerTimeItem;
  remainingSeconds: number;
  formattedCountdown: string;
  isSoon: boolean; // less than 15 minutes
  allPrayers: PrayerTimeItem[];
}

/**
 * Astronomical calculations for Makkah (Umm al-Qura standard)
 */
export function getMeccaPrayerTimes(referenceDate: Date = new Date()): PrayerTimeItem[] {
  // Convert reference date to Mecca date (UTC + 3)
  const utc = referenceDate.getTime() + referenceDate.getTimezoneOffset() * 60000;
  const meccaNow = new Date(utc + 3600000 * MECCA_COORDS.timezoneOffsetHours);

  const startOfYear = new Date(meccaNow.getFullYear(), 0, 0);
  const diff = meccaNow.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = (MECCA_COORDS.latitude * Math.PI) / 180;

  // Solar noon in Mecca local time (decimal hours)
  const noonHours = 12 + (MECCA_COORDS.timezoneOffsetHours * 60 - MECCA_COORDS.longitude * 4 - eqtime) / 60;

  // Hour angle helper
  const hourAngleForElevation = (elevationDeg: number) => {
    const elRad = (elevationDeg * Math.PI) / 180;
    const cosHA =
      (Math.sin(elRad) - Math.sin(latRad) * Math.sin(decl)) /
      (Math.cos(latRad) * Math.cos(decl));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return Math.PI;
    return Math.acos(cosHA);
  };

  // 1. Sunrise / Sunset (elevation = -0.833°)
  const haSunset = hourAngleForElevation(-0.8333);
  const sunsetHours = noonHours + (haSunset * 180 / Math.PI) / 15;
  const sunriseHours = noonHours - (haSunset * 180 / Math.PI) / 15;

  // 2. Fajr (Umm al-Qura standard: -18.5°)
  const haFajr = hourAngleForElevation(-18.5);
  const fajrHours = noonHours - (haFajr * 180 / Math.PI) / 15;

  // 3. Dhuhr (solar noon + small margin)
  const dhuhrHours = noonHours + 4 / 60;

  // 4. Asr (Shafi'i/Hanbali/Makkah standard: shadow = object length + noon shadow)
  const noonAltitude = Math.PI / 2 - Math.abs(latRad - decl);
  const asrAltitude = Math.atan(1 / (1 + Math.tan(Math.PI / 2 - noonAltitude)));
  const haAsr = hourAngleForElevation((asrAltitude * 180) / Math.PI);
  const asrHours = noonHours + (haAsr * 180 / Math.PI) / 15;

  // 5. Maghrib = sunset
  const maghribHours = sunsetHours + 2 / 60;

  // 6. Isha = Maghrib + 90 minutes (Umm al-Qura standard)
  const ishaHours = maghribHours + 1.5;

  const createDateFromDecimalHours = (decimalHours: number, dayOffset = 0): Date => {
    const d = new Date(referenceDate);
    // Set to local date aligned with decimal hours in Mecca
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    d.setHours(hours, minutes, 0, 0);
    if (dayOffset !== 0) {
      d.setDate(d.getDate() + dayOffset);
    }
    return d;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const fajrDate = createDateFromDecimalHours(fajrHours);
  const sunriseDate = createDateFromDecimalHours(sunriseHours);
  const dhuhrDate = createDateFromDecimalHours(dhuhrHours);
  const asrDate = createDateFromDecimalHours(asrHours);
  const maghribDate = createDateFromDecimalHours(maghribHours);
  const ishaDate = createDateFromDecimalHours(ishaHours);

  return [
    { id: 'fajr', nameEn: 'Fajr', nameAr: 'الفجر', timeDate: fajrDate, timeString: formatTime(fajrDate), isNext: false },
    { id: 'sunrise', nameEn: 'Sunrise', nameAr: 'الشروق', timeDate: sunriseDate, timeString: formatTime(sunriseDate), isNext: false },
    { id: 'dhuhr', nameEn: 'Dhuhr', nameAr: 'الظهر', timeDate: dhuhrDate, timeString: formatTime(dhuhrDate), isNext: false },
    { id: 'asr', nameEn: 'Asr', nameAr: 'العصر', timeDate: asrDate, timeString: formatTime(asrDate), isNext: false },
    { id: 'maghrib', nameEn: 'Maghrib', nameAr: 'المغرب', timeDate: maghribDate, timeString: formatTime(maghribDate), isNext: false },
    { id: 'isha', nameEn: 'Isha', nameAr: 'العشاء', timeDate: ishaDate, timeString: formatTime(ishaDate), isNext: false },
  ];
}

/**
 * Returns the upcoming prayer and real-time countdown
 */
export function getNextPrayerCountdown(now: Date = new Date()): NextPrayerInfo {
  const prayers = getMeccaPrayerTimes(now);
  const nowMs = now.getTime();

  // Exclude sunrise from next prayer calculation (since sunrise is not a mandatory congregational prayer)
  const canonicalPrayers = prayers.filter((p) => p.id !== 'sunrise');

  let nextPrayer = canonicalPrayers.find((p) => p.timeDate.getTime() > nowMs);

  // If all prayers for today have passed (after Isha), next prayer is tomorrow's Fajr
  if (!nextPrayer) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowPrayers = getMeccaPrayerTimes(tomorrow);
    nextPrayer = tomorrowPrayers.find((p) => p.id === 'fajr') || prayers[0];
  }

  // Mark in the full list
  const allWithFlag = prayers.map((p) => ({
    ...p,
    isNext: p.id === nextPrayer?.id,
  }));

  const remainingMs = Math.max(0, nextPrayer.timeDate.getTime() - nowMs);
  const totalSeconds = Math.floor(remainingMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formattedCountdown = '';
  if (hours > 0) {
    formattedCountdown = `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  } else {
    formattedCountdown = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }

  return {
    nextPrayer,
    remainingSeconds: totalSeconds,
    formattedCountdown,
    isSoon: totalSeconds <= 900, // 15 minutes or less
    allPrayers: allWithFlag,
  };
}
