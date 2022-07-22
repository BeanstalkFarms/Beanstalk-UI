import { useEffect, useRef } from 'react';

const useTimedRefresh = (handler: () => any, intervalMs : number, enabled : boolean = true) => {
  const interval = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    if (interval) clearInterval(interval.current);
    if (enabled) {
      handler();
      interval.current = setInterval(() => {
        handler();
      }, intervalMs);
      return () => clearInterval(interval.current);
    }
  }, [
    enabled,
    handler,
    interval,
    intervalMs
  ]);
};

export default useTimedRefresh;
