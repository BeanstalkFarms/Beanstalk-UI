import { useCallback, useEffect } from 'react';
import fetch from 'node-fetch';
import { useDispatch } from 'react-redux';
import useAppFlag from 'hooks/display/useAppFlag';
import useTimedRefresh from 'hooks/useTimedRefresh';
import { useHotkeys } from 'react-hotkeys-hook';
import useSetting from 'hooks/useSetting';
import toast from 'react-hot-toast';
import { setAlmanacView, setEthPrices, updateSetting } from './actions';

export const useEthPrices = () => {
  const dispatch = useDispatch();
  const getGas = useCallback(() => {
    (async () => {
      dispatch(setEthPrices(
        await fetch('/.netlify/functions/ethprice').then((response: any) => response.json()).catch((err) => {
          console.error(err);
          return null;
        })
      ));
    })();
  }, [dispatch]);

  /// Auto-refresh gas prices every 10s.
  /// FIXME: refresh every block or N blocks instead?
  useTimedRefresh(getGas, 10 * 1000);

  return [getGas, () => {}];
};

export default function AppUpdater() {
  const dispatch = useDispatch();
  const pressed  = useAppFlag('almanacView');
  const [denomination] = useSetting('denomination');
  
  useEthPrices();

  useEffect(() => {
    window.addEventListener('blur', () => {
      dispatch(setAlmanacView(false));
    });
  }, [dispatch]);
  
  useHotkeys('opt+q, alt+q', (/* event, handler */) => {
    if (!pressed) {
      dispatch(setAlmanacView(true));
    }
  }, { keydown: true }, [pressed]);
  useHotkeys('opt+q, alt+q', (/* event, handler */) => {
    dispatch(setAlmanacView(false));
  }, { keyup: true });

  useHotkeys('opt+f, alt+f', (/* event, handler */) => {
    toast.success(`Updated setting: Show ${denomination === 'bdv' ? 'BDV' : 'USD value'} for fiat.`);
    dispatch(updateSetting({ key: 'denomination', value: denomination === 'bdv' ? 'usd' : 'bdv' }));
  }, { keyup: true, }, [denomination]);

  return null;
}
