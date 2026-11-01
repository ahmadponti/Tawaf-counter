/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCw, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import { AppLanguage } from '../types/tawaf';
import { translations } from '../utils/i18n';
import { feedback } from '../utils/haptics';

interface MatafSimulatorProps {
  isOpen: boolean;
  language: AppLanguage;
  onClose: () => void;
  cumulativeAngle: number;
  estimatedDistance: number;
  currentCircuit: number;
  onSimulateStep: (angleDelta: number, distanceDelta: number) => void;
  onTriggerUncertainty: () => void;
  onSimulateFullLap: () => void;
}

export const MatafSimulator: React.FC<MatafSimulatorProps> = ({
  isOpen,
  language,
  onClose,
  cumulativeAngle,
  estimatedDistance,
  currentCircuit,
  onSimulateStep,
  onTriggerUncertainty,
  onSimulateFullLap,
}) => {
  const [isAutoWalking, setIsAutoWalking] = useState(false);
  const autoWalkInterval = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];
  const isAr = language === 'ar';

  const currentBearing = (125 - (cumulativeAngle % 360) + 360) % 360;

  useEffect(() => {
    if (isAutoWalking) {
      autoWalkInterval.current = setInterval(() => {
        onSimulateStep(15, 12);
      }, 350);
    } else if (autoWalkInterval.current) {
      clearInterval(autoWalkInterval.current);
    }

    return () => {
      if (autoWalkInterval.current) clearInterval(autoWalkInterval.current);
    };
  }, [isAutoWalking, onSimulateStep]);

  if (!isOpen) return null;

  const center = 130;
  const radius = 90;
  const rad = (currentBearing * Math.PI) / 180;
  const pilgrimX = center + radius * Math.cos(rad);
  const pilgrimY = center + radius * Math.sin(rad);

  const hajarRad = (125 * Math.PI) / 180;
  const hajarLineX = center + (radius + 25) * Math.cos(hajarRad);
  const hajarLineY = center + (radius + 25) * Math.sin(hajarRad);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sim-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-amber-500" />
            <h2 id="sim-title" className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t.simulatorTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            aria-label={t.closeSimulator}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top-down Mataf Viewport */}
        <div className="my-4 flex flex-col items-center">
          <div className="relative w-[260px] h-[260px] bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden shadow-inner flex items-center justify-center">
            <svg width="260" height="260" className="absolute inset-0">
              {/* Mataf Circular Boundary */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#44403c"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
              />

              {/* Counter-Clockwise Directional Arrow Hint */}
              <path
                d="M 130 35 A 95 95 0 0 0 40 130"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="2 3"
                fill="none"
                opacity="0.6"
              />

              {/* Hajar al-Aswad Start Axis (Green Line) */}
              <line
                x1={center}
                y1={center}
                x2={hajarLineX}
                y2={hajarLineY}
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Kaaba Center (Square) */}
              <rect
                x={center - 16}
                y={center - 16}
                width={32}
                height={32}
                fill="#1c1917"
                stroke="#f59e0b"
                strokeWidth="2"
                rx="3"
              />
              {/* Gold Kiswah band */}
              <line
                x1={center - 16}
                y1={center - 8}
                x2={center + 16}
                y2={center - 8}
                stroke="#fbbf24"
                strokeWidth="1.5"
              />

              {/* Pilgrim Avatar */}
              <circle
                cx={pilgrimX}
                cy={pilgrimY}
                r={9}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            </svg>

            {/* Label overlays */}
            <div className={`absolute top-2 ${isAr ? 'right-2' : 'left-2'} text-[10px] font-semibold text-stone-400`}>
              {t.counterClockwiseDir}
            </div>
            <div className={`absolute bottom-2 ${isAr ? 'left-2' : 'right-2'} text-[10px] font-semibold text-emerald-400 flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {t.greenLineMarker}
            </div>
          </div>

          {/* Telemetry info */}
          <div className="w-full mt-3 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-stone-100 dark:bg-stone-800/60 p-2 rounded-xl">
              <span className="text-stone-400 text-[10px] block uppercase font-medium">{t.circuitProgress}</span>
              <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                {Math.min(360, Math.round(cumulativeAngle))}° / 360°
              </span>
            </div>
            <div className="bg-stone-100 dark:bg-stone-800/60 p-2 rounded-xl">
              <span className="text-stone-400 text-[10px] block uppercase font-medium">{t.perimeterWalked}</span>
              <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                ~{Math.round(estimatedDistance)}m (Min 140m)
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Simulation Controls */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                feedback.lightTap();
                setIsAutoWalking(!isAutoWalking);
              }}
              className={`h-10 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                isAutoWalking
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              {isAutoWalking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoWalking ? t.pauseWalk : t.autoWalk}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                feedback.lightTap();
                onSimulateStep(30, 22);
              }}
              className="h-10 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t.step30}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                feedback.lightTap();
                onTriggerUncertainty();
              }}
              className="h-10 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-medium text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{t.testUncertainty}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                feedback.lightTap();
                onSimulateFullLap();
              }}
              className="h-10 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.finishFullLap}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 mt-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-xs"
        >
          {t.closeSimulator}
        </button>
      </div>
    </div>
  );
};
