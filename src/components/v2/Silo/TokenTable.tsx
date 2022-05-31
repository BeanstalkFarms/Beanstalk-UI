import React, { useCallback, useMemo } from 'react';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Link } from 'react-router-dom';
import { Pool, Token } from 'classes';
import { AppState } from 'state';
import useBeansToUSD from 'hooks/useBeansToUSD';
import { displayUSD } from 'util/index';
import { zeroBN } from 'constants/index';
import useSiloTokenBreakdown from 'hooks/useSiloTokenBreakdown';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { BEAN, SEEDS, STALK } from 'constants/v2/tokens';
import { SupportedChainId } from 'constants/chains';
import useChainId from 'hooks/useChain';
import BigNumber from 'bignumber.js';
import { displayBN } from 'util/TokenUtilitiesOld';
import useChainConstant from 'hooks/useChainConstant';

const arrowContainerWidth = 20;

const TokenTable : React.FC<{
  config: {
    /** Array of Whitelisted tokens in the Silo. */
    whitelist: Token[];
    /** */
    poolsByAddress: { [address: string] : Pool };
  };
  beanPools:  AppState['_bean']['pools'];
  farmerSilo: AppState['_farmer']['silo'];
  beanstalkSilo: AppState['_beanstalk']['silo'];
}> = ({
  config,
  beanPools,
  farmerSilo,
  beanstalkSilo,
}) => {
  const beansToUSD = useBeansToUSD();
  const chainId = useChainId();
  const breakdown = useSiloTokenBreakdown();
  const Bean = useChainConstant(BEAN);
  const getTVL = useCallback((_token: Token) => {
    // For Beans, grab the amount in the Silo.
    if (_token === Bean) return beansToUSD(beanstalkSilo.beans.total || zeroBN);
    // For everything else, use `liquidity` from the price contract.
    return beanPools[_token.address]?.liquidity || zeroBN;
  }, [beanPools, beanstalkSilo, Bean, beansToUSD]);
  const poolTokenToUSD = useCallback((_token: Token, _amount: BigNumber) => {
    if (!_amount) return zeroBN;
    // For Beans, use the aggregate Bean price.
    if (_token === Bean) return beansToUSD(_amount);
    // For everything else, use the value of the LP token via the beanPool liquidity/supply ratio.
    const pool = beanPools[_token.address];
    return (pool?.liquidity && pool?.supply) ? _amount.times(pool.liquidity.div(pool.supply)) : zeroBN;
  }, [Bean, beanPools, beansToUSD]);

  //
  const aggregateTVL = useMemo(
    () => config.whitelist.reduce<BigNumber>(
      (agg, token) => agg.plus(getTVL(token)),
      new BigNumber(0)
    ),
    [config.whitelist, getTVL]
  );

  return (
    <Card>
      {/* Table Header */}
      <Box
        display="flex"
        sx={{ 
          px: 3, // 1 + 2 from Table Body
          py: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'secondary.main', 
          borderBottomWidth: 1.5 
        }}
      >
        <Grid container alignItems="flex-end">
          <Grid item xs={3}>
            <Typography color="gray">Silo Whitelisted Token</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography color="gray">Rewards</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography color="gray">TVL</Typography>
            <Typography color="black" fontWeight="bold">${displayBN(aggregateTVL)}</Typography>
          </Grid>
          <Grid item xs={3} sx={{ textAlign: 'right', paddingRight: `${arrowContainerWidth}px` }}>
            <Typography color="gray">My Deposits</Typography>
            <Typography color="black" fontWeight="bold">{displayUSD(beansToUSD(breakdown.bdv))}</Typography>
          </Grid>
        </Grid>
      </Box>
      <Stack direction="column" gap={1} sx={{ p: 1 }}>
        {config.whitelist.map((token) => {
          const deposited = farmerSilo.tokens[token.address]?.deposited;
          return (
            <Box key={`${token.address}-${token.chainId}`}>
              <Button
                component={Link}
                to={`/silo/${token.address}`}
                fullWidth
                variant="outlined"
                color="secondary"
                sx={{
                  textAlign: 'left',
                  px: 2,
                  py: 1.5,
                }}
              >
                <Grid container alignItems="center">
                  <Grid item xs={3}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <img
                        src={token.logo}
                        alt={token.name}
                        style={{ height: 20, display: 'inline' }}
                      />
                      <Typography color="black" display="inline">
                        {token.name}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography color="black">
                      <TokenIcon token={STALK} />{token.rewards?.stalk} &nbsp;
                      <TokenIcon token={SEEDS} />{token.rewards?.seeds}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography color="black">
                      ${displayBN(getTVL(token))}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                      <Typography color="black">
                        {deposited?.total ? displayUSD(poolTokenToUSD(token, deposited.total)) : '$0'}
                      </Typography>
                      <Stack sx={{ width: arrowContainerWidth, }} alignItems="center">
                        <ArrowRightIcon />
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Button>
            </Box>
          );
        })}
        {chainId !== SupportedChainId.MAINNET && (
          <Box>
            <Button variant="contained" color="primary" size="large" fullWidth>
              Convert Allocation of Deposited Assets
            </Button>
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default TokenTable;
