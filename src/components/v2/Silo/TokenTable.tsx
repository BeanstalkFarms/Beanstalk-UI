import React, { useCallback, useMemo } from 'react';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Link } from 'react-router-dom';
import { Pool, Token } from 'classes';
import { AppState } from 'state';
import useUSD from 'hooks/useUSD';
import { displayUSD } from 'util/index';
import { zeroBN } from 'constants/index';
import useSiloTokenBreakdown from 'hooks/useSiloTokenBreakdown';
import TokenIcon from 'components/v2/Common/TokenIcon';
import { BEAN, SEEDS, STALK } from 'constants/v2/tokens';
import { SupportedChainId } from 'constants/chains';
import useChainId from 'hooks/useChain';
import BigNumber from 'bignumber.js';
import { displayBN } from 'util/TokenUtilitiesOld';

const arrowContainerWidth = 20;


const TokenTable : React.FC<{
  config: {
    /** Array of Whitelisted tokens in the Silo. */
    whitelist: Token[];
    /** */
    poolsByAddress: { [address: string] : Pool };
  };
  // beanPrice:  AppState['_bean']['price'];
  beanPools:  AppState['_bean']['pools'];
  farmerSilo: AppState['_farmer']['silo'];
  beanstalkSilo: AppState['_beanstalk']['silo'];
}> = ({
  config,
  // beanPrice,
  beanPools,
  farmerSilo,
  beanstalkSilo,
}) => {
  const getUSD = useUSD();
  const chainId = useChainId();
  const breakdown = useSiloTokenBreakdown();
  const getTVL = useCallback((_token: Token) => {
    // For Beans.
    if (_token === BEAN[chainId as any]) {
      return getUSD(beanstalkSilo.beans.total || zeroBN);
    }
    return beanPools[_token.address]?.liquidity || zeroBN;
  }, [beanPools, beanstalkSilo, chainId, getUSD])

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
            <Typography color="black" fontWeight="bold">{displayUSD(getUSD(breakdown.bdv))}</Typography>
          </Grid>
        </Grid>
      </Box>
      <Stack direction="column" gap={1} sx={{ p: 1 }}>
        {config.whitelist.map((token) => {
          const farmerDeposited = farmerSilo.tokens[token.address]?.deposited;
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
                      {displayUSD(getTVL(token))}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ textAlign: 'right' }}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                      <Typography color="black">
                        {farmerDeposited?.bdv ? displayUSD(getUSD(farmerDeposited.bdv)) : '$0'}
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
