import { Typography, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
import { ERC20Token, NativeToken } from '~/classes/Token';
import { ZERO_BN } from '~/constants';
import { CRV3_UNDERLYING } from '~/constants/tokens';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import useTokenMap from '~/hooks/chain/useTokenMap';
import useFarmerBalances from '~/hooks/farmer/useFarmerBalances';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import { Module, ModuleContent, ModuleHeader } from '../Common/Module';
import BalanceTable, { BalanceRow } from './BalanceTable';
import PointImg from '~/img/misc/point-indicator.svg';
import Row from '../Common/Row';

const sortable = {
  BEAN: 0,
  BEAN3CRV: 1,
  urBEAN: 2,
  urBEAN3CRV: 3,
  DAI: 4,
  USDC: 5,
  USDT: 6,
} as const;

type BalanceItem = {
  token: ERC20Token | NativeToken;
  farm: { amount: BigNumber; value: BigNumber };
  circulating: { amount: BigNumber; value: BigNumber };
};

export const FarmBalances: React.FC<{ balances: BalanceItem[] }> = ({
  balances: _balances,
}) => {
  const rows: BalanceRow[] = useMemo(
    () =>
      _balances.map((balance) => ({ token: balance.token, ...balance.farm })),
    [_balances]
  );

  return (
    <Module>
      <ModuleHeader>
        <Typography variant="h4">🚜 Farm Balance</Typography>
      </ModuleHeader>
      <ModuleContent px={2} pb={2}>
        <BalanceTable rows={rows} />
      </ModuleContent>
    </Module>
  );
};

export const CirculatingBalances: React.FC<{ balances: BalanceItem[] }> = ({
  balances: _balances,
}) => {
  const rows: BalanceRow[] = useMemo(
    () =>
      _balances.map((balance) => ({
        token: balance.token,
        ...balance.circulating,
      })),
    [_balances]
  );

  return (
    <Module>
      <ModuleHeader>
        <Typography variant="h4" component="span">
          <Row alignItems="center">
            <img src={PointImg} alt="" /> Circulating Balance
          </Row>
        </Typography>
      </ModuleHeader>
      <ModuleContent px={2} pb={2}>
        <BalanceTable rows={rows} />
      </ModuleContent>
    </Module>
  );
};

const TokenBalancesModule: React.FC<{}> = () => {
  // constants
  const whitelist = useWhitelist();

  /// data
  const tokenMap = useTokenMap<ERC20Token | NativeToken>(CRV3_UNDERLYING);
  const tokenList = useMemo(() => Object.values(tokenMap), [tokenMap]);
  const breakdown = useFarmerBalancesBreakdown();
  const farmerBalances = useFarmerBalances();
  const getChainToken = useGetChainToken();

  const getBalances = useCallback(
    (addr: string) => {
      if (!farmerBalances) return { farm: ZERO_BN, circulating: ZERO_BN };
      const balances = farmerBalances[addr];
      return {
        farm: balances?.internal ?? ZERO_BN,
        circulating: balances?.external ?? ZERO_BN,
      };
    },
    [farmerBalances]
  );

  const balanceData = useMemo(() => {
    const balanceMap: { [addr: string]: BalanceItem } = {};

    // assuming 3crv underlying is $1. Need to get accurate data here
    tokenList.forEach((_token) => {
      const token = getChainToken(_token);
      const balance = getBalances(token.address);
      balanceMap[token.address] = {
        token,
        circulating: {
          amount: balance.circulating,
          value: balance.circulating,
        },
        farm: { amount: balance.farm, value: balance.farm },
      };
    });

    const farm = Object.entries(breakdown.states.farm.byToken);
    const circulating = breakdown.states.circulating.byToken;

    farm.forEach(([addr, { value, amount }]) => {
      const whitelisted = whitelist[addr];
      if (!whitelisted) return;
      const token = getChainToken(whitelisted);
      const external = circulating[addr];
      balanceMap[addr] = {
        token,
        circulating: {
          amount: external?.amount ?? ZERO_BN,
          value: external?.amount ?? ZERO_BN,
        },
        farm: { amount, value },
      };
    });

    return Object.values(balanceMap).sort(
      (a, b) =>
        sortable[a.token.symbol as keyof typeof sortable] -
        sortable[b.token.symbol as keyof typeof sortable]
    );
  }, [tokenList, breakdown, getChainToken, getBalances, whitelist]);

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} width="100%">
      <Stack width="100%">
        <FarmBalances balances={balanceData} />
      </Stack>
      <Stack width="100%">
        <CirculatingBalances balances={balanceData} />
      </Stack>
    </Stack>
  );
};

export default TokenBalancesModule;
