import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '~/state';
import { Settings } from '~/state/app';
import { updateSetting } from '~/state/app/actions';

const useSetting = (key: keyof Settings) => {
  const dispatch = useDispatch();
  const value  = useSelector<AppState, AppState['app']['settings'][typeof key]>((state) => state.app.settings[key]);
  const update = useCallback((_value: Settings[typeof key]) => {
    dispatch(
      updateSetting({
        key,
        value: _value
      })
    );
  }, [dispatch, key]);
  return useMemo(() => [value, update] as const, [value, update]);
};

export default useSetting;
