import { Typography, Stack, Grid, Card, Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
import { ERC20Token, NativeToken } from '~/classes/Token';
import { ZERO_BN } from '~/constants';
import { CRV3_UNDERLYING, ETH } from '~/constants/tokens';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import useTokenMap from '~/hooks/chain/useTokenMap';
import useFarmerBalances from '~/hooks/farmer/useFarmerBalances';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import Row from '../Common/Row';
import useCrvUnderlyingPrices from '~/hooks/beanstalk/useCrvUnderlyingPrices';
import { displayFullBN } from '~/util';
import { BeanstalkPalette } from '../App/muiTheme';
import AddressIcon from '~/components/Common/AddressIcon';

const sortMap = {
  BEAN: 0,
  BEAN3CRV: 1,
  urBEAN: 2,
  urBEAN3CRV: 3,
  ETH: 4,
  DAI: 5,
  USDC: 6,
  USDT: 7,
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
  pageName?: string;
}> = (props) => (
  <Card sx={{ width: '100%' }}>
    <Stack spacing={1.5} pt={2} pb={1}>
      <Box px={2} pb={0.5}>
        {props.title}
      </Box>
      <Stack spacing={1} px={1}>
        <>
          <Grid container direction="row" px={2}>
            <Grid item {...{ xs: 6, sm: 5 }}>
              <Typography sx={{ color: BeanstalkPalette.lightGrey }}>
                Token
              </Typography>
            </Grid>
            <Grid item {...{ xs: 6, sm: 4 }} pl={1}>
              <Stack textAlign={{ xs: 'right', sm: 'left' }}>
                <Typography sx={{ color: BeanstalkPalette.lightGrey }}>
                  Amount
                </Typography>
              </Stack>
            </Grid>
            <Grid
              item
              {...{ xs: 0, sm: 3 }}
              display={{ xs: 'none', sm: 'block' }}
            >
              <Stack>
                <Typography
                  textAlign="right"
                  sx={{ color: BeanstalkPalette.lightGrey }}
                >
                  Value
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Stack spacing={1}>
            {props.rows.map(({ token, amount, value }, i) => (
              <Stack
                {...{ px: 2, py: 1 }}
                sx={{
                  borderRadius: '6px',
                  border: `1px solid ${BeanstalkPalette.lightestGrey}`,
                }}
                key={i}
              >
                <Grid container direction="row" spacing={2} alignItems="center">
                  <Grid item {...{ xs: 6, sm: 5 }}>
                    <Row gap={1} alignItems="center">
                      <img
                        src={token.logo}
                        alt=""
                        height="20px"
                        width="20px"
                        style={{ borderRadius: '50%' }}
                      />
                      <Typography>{token.symbol}</Typography>
                    </Row>
                  </Grid>
                  <Grid item {...{ xs: 6, sm: 4 }}>
                    <Stack textAlign={{ xs: 'right', sm: 'left' }}>
                      <Typography>
                        {displayFullBN(amount, token.displayDecimals)}{' '}
                        {token.symbol}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid
                    item
                    {...{ xs: 0, sm: 3 }}
                    display={{ xs: 'none', sm: 'block' }}
                  >
                    <Stack>
                      <Typography textAlign="right">
                        ${displayFullBN(value, 2)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            ))}
          </Stack>
        </>
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
      circulating: farmerBalances?.[addr]?.external ?? ZERO_BN,
    }),
    [farmerBalances]
  );

  const balanceData = useMemo(() => {
    const internal: { [addr: string]: TokenBalance } = {};
    const external: { [addr: string]: TokenBalance } = {};

    // Add ETH or other tokens
    const updatedTokenList = tokenList.concat(ETH[1]);

    updatedTokenList.forEach((_token) => {
      const token = getChainToken(_token);
      const balance = getBalances(token.address);
      const value = prices3Crv[token.address] ?? ZERO_BN;
      internal[token.address] = {
        token,
        amount: balance.farm,
        value: balance.farm,
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
        value,
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
        hasBalances: !!_internal.find((r) => !r.amount.eq(ZERO_BN)),
      },
      external: {
        data: _external,
        hasBalances: !!_external.find((r) => !r.amount.eq(ZERO_BN)),
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
        pageName="Farm"
      />
      <BalanceTable
        rows={balanceData.external.data}
        title={
          <Row gap={0.5}>
            <AddressIcon size={16} />
            <Typography variant="h4" component="span">
              Circulating Balance
            </Typography>
          </Row>
        }
        pageName="Circulating"
      />
    </Stack>
  );
};

export default ValuedTokenBalances;
