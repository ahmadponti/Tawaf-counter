/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery } from 'lucide-react';

interface IOSDeviceFrameProps {
  children: React.ReactNode;
  darkMode: boolean;
  language?: 'en' | 'ar';
  onOpenSwiftSource: () => void;
}

export const IOSDeviceFrame: React.FC<IOSDeviceFrameProps> = ({
  children,
  darkMode,
  language = 'en',
  onOpenSwiftSource,
}) => {
  const [useDeviceFrame, setUseDeviceFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('09:41');
  const isAr = language === 'ar';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen w-full transition-colors ${darkMode ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-100 text-stone-900'} flex flex-col items-center justify-center p-0 md:p-6 select-none`}>
      {/* Top Banner on Desktop for Simulator & Xcode Code switch */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl mb-4 px-2" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            {isAr ? 'عداد الطواف' : 'Tawaf Counter'}
          </span>
          <span className="text-stone-400 text-xs">
            {isAr ? '· رفيق المعتمر والحاج' : '· iOS Umrah Companion'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle between iPhone Frame and Full-Width View */}
          <div className="flex items-center bg-stone-200 dark:bg-stone-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setUseDeviceFrame(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                useDeviceFrame
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone Frame</span>
            </button>
            <button
              type="button"
              onClick={() => setUseDeviceFrame(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                !useDeviceFrame
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Expanded</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenSwiftSource}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors"
          >
            <span>SwiftUI Xcode Code</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          useDeviceFrame
            ? 'md:w-[410px] md:h-[840px] md:max-h-[92vh] md:rounded-[52px] md:border-[10px] md:border-stone-800 dark:md:border-stone-800/90 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] md:ring-1 md:ring-stone-700/50 relative overflow-hidden flex flex-col bg-white dark:bg-stone-950'
            : 'w-full max-w-2xl min-h-[85vh] md:rounded-3xl md:border md:border-stone-200 dark:md:border-stone-800 md:shadow-xl flex flex-col bg-white dark:bg-stone-950'
        }`}
      >
        {/* iOS Dynamic Island & Status Bar (Visible in frame mode or mobile) */}
        <div className="w-full pt-2 px-7 flex items-center justify-between text-xs font-semibold shrink-0 z-20 select-none">
          {/* Left: Time */}
          <span className="font-semibold tabular-nums text-stone-800 dark:text-stone-200 text-xs">
            {currentTime}
          </span>

          {/* Dynamic Island Pill (Center) */}
          <div className="w-24 h-6 bg-black rounded-full flex items-center justify-center px-2 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-900 ring-1 ring-stone-800 mr-auto" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse ml-auto" title="Tawaf active" />
          </div>

          {/* Right: Status Icons */}
          <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
            <span className="text-[10px] tracking-tighter">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-stone-800 dark:fill-stone-200" />
          </div>
        </div>

        {/* Child Screen Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full pb-2 pt-1 flex justify-center items-center shrink-0 z-20 pointer-events-none">
          <div className="w-32 h-1 bg-stone-400/40 dark:bg-stone-600/50 rounded-full" />
        </div>
      </div>
    </div>
  );
};
