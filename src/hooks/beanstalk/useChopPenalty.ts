import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { AppState } from '~/state';
import { getChainConstant } from '../../util';
import { UNRIPE_BEAN } from '../../constants/tokens';
import useChainId from '../chain/useChainId';
import { NEW_BN } from '../../constants';

/**
 * Returns the chop penalty for a given
 * tokenAddr. If no tokenAddr is passed,
 * use unripeBeans address.
 *
 * The number returned is converted to
 * percentage form for display.
 */
const useChopPenalty = (tokenAddr?: string) => {
  const chainId         = useChainId();
  const unripe          = useSelector<AppState, AppState['_bean']['unripe']>((state) => state._bean.unripe);
  const unripeBeanAddr  = getChainConstant(UNRIPE_BEAN, chainId).address;
  const chopPenalty     = unripe.chopRates[tokenAddr !== undefined ? tokenAddr : unripeBeanAddr];
  return chopPenalty 
    ? new BigNumber(1).minus(chopPenalty).multipliedBy(100) 
    : NEW_BN;
};

export default useChopPenalty;
