/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
};

class WakeLockManager {
  private sentinel: WakeLockSentinel | null = null;
  private isRequested: boolean = false;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isRequested) {
          this.request().catch(() => {});
        }
      });
    }
  }

  async request(): Promise<boolean> {
    this.isRequested = true;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      if (this.sentinel && !this.sentinel.released) {
        return true;
      }
      const navWithWakeLock = navigator as Navigator & {
        wakeLock: {
          request: (type: 'screen') => Promise<WakeLockSentinel>;
        };
      };
      this.sentinel = await navWithWakeLock.wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = null;
      });
      return true;
    } catch {
      return false;
    }
  }

  async release(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {
        // Ignore release errors
      }
      this.sentinel = null;
    }
  }
}

export const wakeLockManager = new WakeLockManager();
