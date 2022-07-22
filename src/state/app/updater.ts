import useAppFlag from 'hooks/display/useAppFlag';
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch } from 'react-redux';
import { setAlmanacView } from './actions';

export default function AppUpdater() {
  const dispatch = useDispatch();
  const pressed  = useAppFlag('almanacView');

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

  return null;
}
