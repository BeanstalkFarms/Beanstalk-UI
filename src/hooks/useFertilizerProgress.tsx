import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { ZERO_BN } from '../constants';

/**
 * The percentage of fertilizer sold.
 *
 * Need to multiply this by 100.
 */
const useFertilizerProgress = () => {
  const fertilizer = useSelector<AppState, AppState['_beanstalk']['barn']>((state) => state._beanstalk.barn);
  return fertilizer.totalRaised.gt(0)
    ? fertilizer.totalRaised.div(
        fertilizer.totalRaised.plus(fertilizer.remaining)
      )
    : ZERO_BN;
};

export default useFertilizerProgress;
