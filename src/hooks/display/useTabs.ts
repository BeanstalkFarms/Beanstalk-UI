import { useCallback, useState, SyntheticEvent } from 'react';

const useTabs = () => {
  const [tab, setTab] = useState(0);
  const handleChangeTab = useCallback((event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);
  return [tab, handleChangeTab] as const;
};

export default useTabs;
