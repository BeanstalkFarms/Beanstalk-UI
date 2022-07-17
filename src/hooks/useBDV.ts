import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Token from 'classes/Token';
import { NEW_BN } from 'constants/index';

export default function useTVL() {
  const beanstalkSiloBalances = useSelector<
    AppState,
    AppState['_beanstalk']['silo']['balances']
  >((state) => state._beanstalk.silo.balances);
  return useCallback(
    (_token: Token) =>
      beanstalkSiloBalances[_token.address]?.bdvPerToken || NEW_BN,
    [beanstalkSiloBalances]
  );
}
