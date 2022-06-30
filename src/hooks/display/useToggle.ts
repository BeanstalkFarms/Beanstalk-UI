import { useCallback, useState } from "react";

export default function useToggle(onShow?: () => void) {
  const [open, setOpen] = useState(false);
  const show  = useCallback(() => {
    setOpen(true);
    onShow?.();
  }, [onShow]);
  const hide  = useCallback(() => {
    setOpen(false);
  }, []);
  return [open, show, hide] as const;
}