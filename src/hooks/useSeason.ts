import { useSelector } from 'react-redux';
import { AppState } from 'state';

export default function useFarmerBalances() {
  return useSelector<AppState, AppState['_beanstalk']['sun']['season']>((state) => state._beanstalk.sun.season);
}
