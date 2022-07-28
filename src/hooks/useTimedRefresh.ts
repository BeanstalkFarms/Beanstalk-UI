import { useCallback, useEffect, useRef } from 'react';

const useTimedRefresh = (handler: () => any, intervalMs : number, enabled : boolean = true) => {
  const interval = useRef<ReturnType<typeof setInterval>>();

  const start = useCallback(() => {
    handler();
    interval.current = setInterval(() => {
      handler();
    }, intervalMs);
    return () => clearInterval(interval.current);
  }, [handler, intervalMs]);

  ///
  useEffect(() => {
    if (interval) clearInterval(interval.current);
    if (enabled) {
      const cancel = start();
      return () => cancel();
    }
  }, [enabled, interval, start]);

  ///
  useEffect(() => {
    window.addEventListener('focus', () => {
      start();
    });
    window.addEventListener('blur', () => {
      clearInterval(interval.current);
    });
  });
};

export default useTimedRefresh;
