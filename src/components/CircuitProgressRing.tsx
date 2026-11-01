/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CircuitProgressRingProps {
  currentCircuit: number; // 1 to 7
  totalCircuits?: number;
  size?: number;
  strokeWidth?: number;
  highContrast?: boolean;
  language?: 'en' | 'ar';
}

export const CircuitProgressRing: React.FC<CircuitProgressRingProps> = ({
  currentCircuit,
  totalCircuits = 7,
  size = 260,
  strokeWidth = 14,
  highContrast = false,
  language = 'en',
}) => {
  const isAr = language === 'ar';
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Completed circuits count: if on circuit 1, 0 are completed yet; current circuit is active
  const completedCount = Math.max(0, Math.min(totalCircuits, currentCircuit - 1));
  const progressPercent = completedCount / totalCircuits;
  const strokeDashoffset = circumference - progressPercent * circumference;

  // Segment angles for 7 circuits
  const segments = Array.from({ length: totalCircuits }, (_, i) => i + 1);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={currentCircuit}
      aria-valuemin={1}
      aria-valuemax={totalCircuits}
      aria-label={isAr ? `الشوط ${currentCircuit} من ${totalCircuits}` : `Circuit ${currentCircuit} of ${totalCircuits}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg] transition-all duration-500"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-stone-200 dark:text-stone-800/80 transition-colors"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className={`transition-all duration-700 ease-out ${
            highContrast
              ? 'text-amber-400'
              : 'text-amber-500 dark:text-amber-400'
          }`}
          style={{
            filter: highContrast ? 'none' : 'drop-shadow(0 2px 8px rgba(217, 119, 6, 0.3))',
          }}
        />

        {/* 7 Circuit Tick Marks */}
        {segments.map((seg, i) => {
          const angle = (i / totalCircuits) * 360;
          const rad = (angle * Math.PI) / 180;
          const x1 = size / 2 + (radius - strokeWidth / 2 - 2) * Math.cos(rad);
          const y1 = size / 2 + (radius - strokeWidth / 2 - 2) * Math.sin(rad);
          const x2 = size / 2 + (radius + strokeWidth / 2 + 2) * Math.cos(rad);
          const y2 = size / 2 + (radius + strokeWidth / 2 + 2) * Math.sin(rad);
          const isPassed = seg <= completedCount;

          return (
            <line
              key={seg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={2.5}
              className={isPassed ? 'text-amber-600 dark:text-amber-300' : 'text-stone-300 dark:text-stone-700'}
            />
          );
        })}
      </svg>

      {/* Center Kaaba Silhouette & Indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        {/* Stylized Kaaba Emblem */}
        <div className="w-12 h-12 mb-1 relative flex items-center justify-center">
          <div className="w-10 h-10 bg-stone-900 dark:bg-stone-950 border-2 border-amber-500/70 rounded-md shadow-md flex items-center justify-center relative overflow-hidden">
            {/* Kiswah gold band */}
            <div className="absolute top-2 left-0 right-0 h-1 bg-amber-400/90" />
            {/* Hajar al-Aswad indicator on lower right corner */}
            <div
              className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300 animate-pulse"
              title="Hajar al-Aswad Corner (Green Light)"
            />
          </div>
        </div>

        <span className="text-[11px] font-semibold tracking-widest text-stone-600 dark:text-stone-400 uppercase">
          {isAr ? 'الشوط' : 'Circuit'}
        </span>

        <span className="text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-50 tabular-nums leading-none my-1">
          {currentCircuit}
        </span>

        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
          {isAr ? `من ${totalCircuits} أشواط مكتملة` : `of ${totalCircuits} completed`}
        </span>
      </div>
    </div>
  );
};
