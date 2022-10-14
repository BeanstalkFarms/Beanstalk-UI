import { Typography, Stack, Grid, Card } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback,  useMemo } from 'react';
import { ERC20Token, NativeToken } from '~/classes/Token';
import { ZERO_BN } from '~/constants';
import { CRV3_UNDERLYING } from '~/constants/tokens';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import useTokenMap from '~/hooks/chain/useTokenMap';
import useFarmerBalances from '~/hooks/farmer/useFarmerBalances';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import PointImg from '~/img/misc/point-indicator.svg';
import Row from '../Common/Row';
import useCrvUnderlyingPrices from '~/hooks/beanstalk/useCrvUnderlyingPrices';
import { displayFullBN } from '~/util';
import { BeanstalkPalette } from '../App/muiTheme';

const sortMap = {
  BEAN: 0,
  BEAN3CRV: 1,
  urBEAN: 2,
  urBEAN3CRV: 3,
  DAI: 4,
  USDC: 5,
  USDT: 6,
} as const;

type TokenBalance = {
  token: ERC20Token | NativeToken;
  amount: BigNumber;
  value: BigNumber;
};

const sortTokens = (a: TokenBalance, b: TokenBalance) => {
  const tkA = sortMap[a.token.symbol as keyof typeof sortMap];
  const tkB = sortMap[b.token.symbol as keyof typeof sortMap];
  return tkA - tkB;
};

const BalanceTable: React.FC<{
  rows: TokenBalance[];
  title: JSX.Element;
  noBalances?: boolean;
  pageName?: string;
}> = ({ rows, title, noBalances, pageName }) => (
  <Card sx={{ width: '100%' }}>
    <Stack height="100%" p={2} spacing={1.5}>
      {title}
      <Stack spacing={1} height="100%">
        {noBalances ? (
          <Stack
            justifyContent="center"
            alignItems="center"
            height="100%"
      >
            <Typography
              variant="bodySmall"
              sx={{ color: BeanstalkPalette.lightGrey }}
        >
              {`You don't have any tokens in your ${pageName} Balance`}
            </Typography>
          </Stack>
    ) : (
      <>
        <Grid container direction="row">
          <Grid item xs={6} sm={5}>
            <Typography
              variant="bodySmall"
              sx={{ color: BeanstalkPalette.lightGrey }}
            >
              Token
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4.5}>
            <Stack textAlign={{ xs: 'right', sm: 'left' }}>
              <Typography
                variant="bodySmall"
                sx={{ color: BeanstalkPalette.lightGrey }}
              >
                Amount
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={0} sm={2.5} display={{ xs: 'none', sm: 'block' }}>
            <Stack>
              <Typography
                variant="bodySmall"
                textAlign="right"
                sx={{ color: BeanstalkPalette.lightGrey }}
              >
                Value
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        {rows.map(({ token, amount, value }, i) => (
          <Stack
            sx={{
              px: '20px',
              py: '10px',
              borderRadius: '6px',
              border: `1px solid ${BeanstalkPalette.lightestGrey}`,
            }}
            key={i}
          >
            <Grid container direction="row" spacing={2} alignItems="center">
              <Grid item xs={6} sm={5}>
                <Row gap={1} alignItems="center">
                  <img
                    src={token.logo}
                    alt=""
                    height="20px"
                    width="20px"
                    style={{ borderRadius: '50%' }}
                  />
                  <Typography variant="bodySmall">{token.symbol}</Typography>
                </Row>
              </Grid>
              <Grid item xs={6} sm={4.5}>
                <Stack textAlign={{ xs: 'right', sm: 'left' }}>
                  <Typography variant="bodySmall">
                    {displayFullBN(amount, token.displayDecimals)}{' '}{token.symbol}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={0} sm={2.5} display={{ xs: 'none', sm: 'block' }}>
                <Stack>
                  <Typography variant="bodySmall" textAlign="right">
                    ${displayFullBN(value, 2)}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        ))}
      </>
    )}
      </Stack>
    </Stack>
  </Card>
);

const ValuedTokenBalances: React.FC<{}> = () => {
  // constants
  const whitelist = useWhitelist();

  /// data
  const tokenMap = useTokenMap<ERC20Token | NativeToken>(CRV3_UNDERLYING);
  const tokenList = useMemo(() => Object.values(tokenMap), [tokenMap]);
  const breakdown = useFarmerBalancesBreakdown();
  const farmerBalances = useFarmerBalances();
  const getChainToken = useGetChainToken();

  const prices3Crv = useCrvUnderlyingPrices();

  const getBalances = useCallback(
    (addr: string) => ({ 
      farm: farmerBalances?.[addr]?.internal ?? ZERO_BN, 
      circulating: farmerBalances?.[addr]?.external ?? ZERO_BN
    }), 
    [farmerBalances]
  );

  const balanceData = useMemo(() => {
    const internal: { [addr: string]: TokenBalance } = {};
    const external: { [addr: string]: TokenBalance } = {};

    tokenList.forEach((_token) => {
      const token = getChainToken(_token);
      const balance = getBalances(token.address);
      const value = prices3Crv[token.address] ?? ZERO_BN;
      internal[token.address] = { 
        token, 
        amount: balance.farm, 
        value: balance.farm 
      };
      external[token.address] = {
        token, 
        amount: balance.circulating,
        value: balance.circulating.multipliedBy(value),
      };
    });

    const farm = Object.entries(breakdown.states.farm.byToken);
    const circulating = breakdown.states.circulating.byToken;
    farm.forEach(([addr, { value, amount }]) => {
      const whitelisted = whitelist[addr];
      if (!whitelisted) return;
      const token = getChainToken(whitelisted);
      internal[addr] = {
        token, 
        amount, 
        value
      };
      external[addr] = {
        token, 
        amount: circulating[addr]?.amount ?? ZERO_BN,
        value: circulating[addr]?.value ?? ZERO_BN,
      };
    });

    const _internal = Object.values(internal).sort(sortTokens);
    const _external = Object.values(external).sort(sortTokens);

    return {
      internal: { 
        data: _internal,
        hasBalances: !!(_internal.find((r) => !r.amount.eq(ZERO_BN)))
      },
      external: { 
        data: _external,
        hasBalances: !!(_external.find((r) => !r.amount.eq(ZERO_BN)))
      },
    };
  }, [
    tokenList,
    breakdown.states.farm.byToken,
    breakdown.states.circulating.byToken,
    getChainToken,
    getBalances,
    prices3Crv,
    whitelist,
  ]);

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} width="100%">
      <BalanceTable
        rows={balanceData.internal.data} 
        title={<Typography variant="h4">🚜 Farm Balance</Typography>}
        noBalances={!balanceData.internal.hasBalances} 
        pageName="Farm" 
      />
      <BalanceTable 
        rows={balanceData.external.data} 
        title={
          <Typography variant="h4" component="span">
            <Row alignItems="center">
              <img src={PointImg} alt="" /> Circulating Balance
            </Row>
          </Typography>
        }
        noBalances={!balanceData.external.hasBalances} 
        pageName="Circulating" 
      />
    </Stack>
  );
};

export default ValuedTokenBalances;