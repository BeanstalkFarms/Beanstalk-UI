import { useCallback, useState, SyntheticEvent, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const useTabs = (slugs?: string[], key : string = 'tab') => {
  const [params, update] = useSearchParams();
  const currSlug = params.get(key);
  
  ///
  const getTabIndex = useCallback((slug: string | null | undefined) => {
    /// If `slug` exists in `slugToIndex`...
    if (slug && slugs && slugs.length > 0) {
      const index = slugs!.indexOf(slug);
      if (index > -1) return index;
    }
    return 0;
  }, [slugs]);

  /// Init state
  const [tab, setTab]   = useState(getTabIndex(params.get(key)));

  /// Setup tab state
  const handleChangeTab = useCallback((event: SyntheticEvent, newIndex: number) => {
    if (slugs && slugs[newIndex]) {
      update({ [key]: slugs[newIndex] });
    }
    setTab(newIndex);
  }, [key, slugs, update]);

  /// Handle external navigation
  useEffect(() => {
    setTab(getTabIndex(currSlug));
  }, [currSlug, getTabIndex]);

  return [tab, handleChangeTab] as const;
};

export default useTabs;
