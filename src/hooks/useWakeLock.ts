import { useState, useEffect, useCallback } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<unknown | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return false;
    try {
      const sentinel = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<{ release: () => Promise<void>; addEventListener: (event: string, cb: () => void) => void }> } }).wakeLock.request('screen');
      setWakeLockSentinel(sentinel);
      setIsLocked(true);

      sentinel.addEventListener('release', () => {
        setIsLocked(false);
        setWakeLockSentinel(null);
      });
      return true;
    } catch {
      setIsLocked(false);
      return false;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockSentinel && typeof (wakeLockSentinel as { release: () => Promise<void> }).release === 'function') {
      try {
        await (wakeLockSentinel as { release: () => Promise<void> }).release();
        setWakeLockSentinel(null);
        setIsLocked(false);
      } catch {}
    }
  }, [wakeLockSentinel]);

  const toggleLock = useCallback(() => {
    if (isLocked) {
      releaseLock();
    } else {
      requestLock();
    }
  }, [isLocked, releaseLock, requestLock]);

  return { isLocked, isSupported, toggleLock, requestLock, releaseLock };
}
