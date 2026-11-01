/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Audio context singleton initialized on first user gesture
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const feedback = {
  /**
   * Gentle haptic pulse for circuit count increment
   */
  circuitCounted(enabled: boolean = true) {
    if (!enabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 50, 45]);
      } catch {
        // Ignore vibration errors
      }
    }
  },

  /**
   * Subtle haptic feedback for button tap
   */
  lightTap(enabled: boolean = true) {
    if (!enabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // Ignore vibration errors
      }
    }
  },

  /**
   * Respectful celebratory haptic pattern on 7th circuit completion
   */
  completion(enabled: boolean = true) {
    if (!enabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 60, 80, 60, 100]);
      } catch {
        // Ignore vibration errors
      }
    }
  },

  /**
   * Optional gentle serene harmonic chime (disabled by default)
   */
  playGentleTone(enabled: boolean = false) {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.18); // E5

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not permitted or not supported
    }
  }
};
