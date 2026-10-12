/**
 * Screen Wake Lock API manager.
 * Keeps the screen awake during Andhera Mode while the phone is passed around in the dark.
 */

class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;
  private isRequested: boolean = false;

  public async requestLock(): Promise<boolean> {
    this.isRequested = true;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        // If release happened because the user backgrounded the app, re-acquire when visibility returns
        if (this.isRequested && document.visibilityState === 'visible') {
          this.requestLock().catch(() => {});
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  public async releaseLock(): Promise<void> {
    this.isRequested = false;
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
      } catch {
        // Ignore
      }
      this.wakeLock = null;
    }
  }

  public initVisibilityListener() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isRequested && !this.wakeLock) {
        this.requestLock().catch(() => {});
      }
    });
  }
}

export const wakeLockService = new WakeLockManager();
wakeLockService.initVisibilityListener();
