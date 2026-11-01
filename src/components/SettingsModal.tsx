/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Languages,
} from 'lucide-react';
import { AppSettings, DynamicTypeSize, AppLanguage, ThemePreference } from '../types/tawaf';
import { translations } from '../utils/i18n';
import { feedback } from '../utils/haptics';

interface SettingsModalProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSwiftSource: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onOpenSwiftSource,
}) => {
  if (!isOpen) return null;

  const t = translations[settings.language];
  const isAr = settings.language === 'ar';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
    >
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* iOS Drag Handle */}
        <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto -mt-2 mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <h2 id="settings-title" className="text-lg font-bold text-stone-900 dark:text-stone-50">
            {t.settingsTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 py-4">
          {/* Section: Language Switcher */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.languageSelect}</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  feedback.lightTap(settings.hapticsEnabled);
                  onUpdateSettings({ language: 'en' });
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  settings.language === 'en'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => {
                  feedback.lightTap(settings.hapticsEnabled);
                  onUpdateSettings({ language: 'ar' });
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold font-serif transition-all ${
                  settings.language === 'ar'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                }`}
                style={{ fontFamily: 'var(--font-arabic)' }}
              >
                العربية (Arabic)
              </button>
            </div>
          </div>

          {/* Section: Screen & Battery */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              {t.displayAndSession}
            </h3>

            {/* Screen Wake Lock */}
            <div className="flex items-center justify-between py-2.5">
              <div className="pe-4">
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100 block">
                  {t.keepScreenAwake}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                  {t.keepScreenAwakeDesc}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.keepScreenAwake}
                onClick={() => {
                  feedback.lightTap(settings.hapticsEnabled);
                  onUpdateSettings({ keepScreenAwake: !settings.keepScreenAwake });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.keepScreenAwake ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.keepScreenAwake
                      ? (isAr ? '-translate-x-5' : 'translate-x-5')
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Appearance (Light / Dark / System) */}
            <div className="py-2.5 border-t border-stone-100 dark:border-stone-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100 block">
                  {t.appearance}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {settings.darkMode ? t.darkTheme : t.lightTheme}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    feedback.lightTap(settings.hapticsEnabled);
                    onUpdateSettings({ themePreference: 'light', darkMode: false });
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.themePreference === 'light'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 ring-1 ring-amber-500'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.themeLight}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    feedback.lightTap(settings.hapticsEnabled);
                    onUpdateSettings({ themePreference: 'dark', darkMode: true });
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.themePreference === 'dark'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 ring-1 ring-amber-500'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.themeDark}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    feedback.lightTap(settings.hapticsEnabled);
                    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    onUpdateSettings({ themePreference: 'system', darkMode: prefersDark });
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    settings.themePreference === 'system'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <span>{t.themeSystem}</span>
                </button>
              </div>
            </div>

            {/* High Contrast Mode */}
            <div className="flex items-center justify-between py-2.5 border-t border-stone-100 dark:border-stone-800/80">
              <div className="pe-4">
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100 block">
                  {t.highContrast}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                  {t.highContrastDesc}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.highContrast}
                onClick={() => {
                  feedback.lightTap(settings.hapticsEnabled);
                  onUpdateSettings({ highContrast: !settings.highContrast });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.highContrast ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.highContrast
                      ? (isAr ? '-translate-x-5' : 'translate-x-5')
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: Feedback & Audio */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              {t.tactileAndAudio}
            </h3>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between py-2.5">
              <div className="pe-4">
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100 block">
                  {t.gentleHaptics}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                  {t.gentleHapticsDesc}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.hapticsEnabled}
                onClick={() => {
                  feedback.lightTap(true);
                  onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.hapticsEnabled ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.hapticsEnabled
                      ? (isAr ? '-translate-x-5' : 'translate-x-5')
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Chime (Default Off) */}
            <div className="flex items-center justify-between py-2.5 border-t border-stone-100 dark:border-stone-800/80">
              <div className="pe-4">
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100 block">
                  {t.gentleChime}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                  {t.gentleChimeDesc}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.soundEnabled}
                onClick={() => {
                  const next = !settings.soundEnabled;
                  onUpdateSettings({ soundEnabled: next });
                  if (next) feedback.playGentleTone(true);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.soundEnabled ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.soundEnabled
                      ? (isAr ? '-translate-x-5' : 'translate-x-5')
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: Dynamic Type Accessibility */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              {t.dynamicTypeSize}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'large', 'extra_large'] as DynamicTypeSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    feedback.lightTap(settings.hapticsEnabled);
                    onUpdateSettings({ dynamicType: size });
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-all ${
                    settings.dynamicType === size
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  {isAr
                    ? (size === 'standard' ? 'عادي' : size === 'large' ? 'كبير' : 'كبير جداً')
                    : size.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Native SwiftUI Code Export Button */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              {t.developerXcode}
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSwiftSource();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-500" />
                <span>{t.swiftSourceFiles}</span>
              </span>
              <ExternalLink className={`w-3.5 h-3.5 text-stone-400 ${isAr ? 'scale-x-[-1]' : ''}`} />
            </button>
          </div>

          {/* Privacy & Guarantee Card */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 p-3.5 text-xs text-stone-600 dark:text-stone-400 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t.privacyCardTitle}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                • {t.privacyItem1}
                <br />
                • {t.privacyItem2}
                <br />
                • {t.privacyItem3}
                <br />
                • {t.privacyItem4}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 mt-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs transition-colors"
        >
          {t.doneBtn}
        </button>
      </div>
    </div>
  );
};
