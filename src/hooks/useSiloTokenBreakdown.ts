import React, { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

const useSiloTokenBreakdown = () => {
  const tokens = useSelector<AppState, AppState['_farmer']['silo']['tokens']>((state) => state._farmer.silo.tokens);
  return useMemo(() => 
    Object.keys(tokens).reduce((prev, curr) => {
      const t = tokens[curr];
      // TODO: BDV conversion to $
      prev.circulating  = prev.circulating.plus(t.circulating);
      prev.deposited    = prev.deposited.plus(t.deposited);
      prev.claimable    = prev.claimable.plus(t.claimable);
      prev.wrapped      = prev.wrapped.plus(t.wrapped);
      prev.withdrawn    = prev.withdrawn.plus(t.withdrawn);
      return prev;
    }, {
      circulating: new BigNumber(0),
      deposited: new BigNumber(0),
      claimable: new BigNumber(0),
      wrapped: new BigNumber(0),
      withdrawn: new BigNumber(0),
    }),
  []);
}

export default useSiloTokenBreakdown;