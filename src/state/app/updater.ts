import { useCallback, useEffect } from 'react';
import fetch from 'node-fetch';
import { useDispatch } from 'react-redux';
import useAppFlag from 'hooks/display/useAppFlag';
import useTimedRefresh from 'hooks/useTimedRefresh';
import { useHotkeys } from 'react-hotkeys-hook';
import useSetting from 'hooks/useSetting';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
  useTimedRefresh(getGas, 30 * 1000);

  return [getGas, () => {}];
};

export default function AppUpdater() {
  const dispatch = useDispatch();
  const pressed  = useAppFlag('almanacView');
  const [denomination] = useSetting('denomination');
  const navigate = useNavigate();
  
  useEthPrices();

  useEffect(() => {
    window.addEventListener('blur', () => {
      dispatch(setAlmanacView(false));
    });
  }, [dispatch]);
  
  // useHotkeys('opt+q, alt+q', (/* event, handler */) => {
  //   if (!pressed) {
  //     dispatch(setAlmanacView(true));
  //   }
  // }, { keydown: true }, [pressed]);
  // useHotkeys('opt+q, alt+q', (/* event, handler */) => {
  //   dispatch(setAlmanacView(false));
  // }, { keyup: true });

  useHotkeys('opt+f, alt+f', (/* event, handler */) => {
    dispatch(updateSetting({ key: 'denomination', value: denomination === 'bdv' ? 'usd' : 'bdv' }));
    toast.success(`Updated setting: Show fiat in ${denomination === 'bdv' ? 'USD' : 'BDV'}.`);
  }, { keyup: true, }, [denomination]);
  
  useHotkeys('opt+q, alt+q', () => {
    navigate('/');
  }, {}, [navigate]);
  useHotkeys('opt+w, alt+w', () => {
    navigate('/silo');
  }, {}, [navigate]);
  useHotkeys('opt+e, alt+e', () => {
    navigate('/field');
  }, {}, [navigate]);
  useHotkeys('opt+r, alt+r', () => {
    navigate('/barn');
  }, {}, [navigate]);
  useHotkeys('opt+t, alt+t', () => {
    navigate('/market');
  }, {}, [navigate]);
  useHotkeys('opt+a, alt+a', () => {
    navigate('/analytics');
  }, {}, [navigate]);
  useHotkeys('opt+s, alt+s', () => {
    navigate('/balances');
  }, {}, [navigate]);
  useHotkeys('opt+d, alt+d', () => {
    navigate('/balances');
  }, {}, [navigate]);

  return null;
}
