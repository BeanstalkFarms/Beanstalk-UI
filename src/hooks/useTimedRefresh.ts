import { useCallback, useEffect, useRef } from 'react';

const useTimedRefresh = (handler: () => any, intervalMs : number, enabled : boolean = true) => {
  const interval = useRef<ReturnType<typeof setInterval>>();

  /// Start running the handler every `intervalMs` millis
  const start = useCallback(() => {
    handler();
    interval.current = setInterval(() => {
      handler();
    }, intervalMs);
    return () => clearInterval(interval.current);
  }, [handler, intervalMs]);

  /// Window event handlers
  const onFocus = useCallback(() => {
    start();
  }, [start]);
  const onBlur = useCallback(() => {
    clearInterval(interval.current);
  }, [interval]);

  /// Setup interval on initial load or params change
  useEffect(() => {
    if (interval) clearInterval(interval.current);
    if (enabled) {
      const cancel = start();
      return () => cancel();
    }
  }, [enabled, interval, start]);

  /// Clear interval on blur; re-run on focus
  useEffect(() => {
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  });
};

export default useTimedRefresh;
