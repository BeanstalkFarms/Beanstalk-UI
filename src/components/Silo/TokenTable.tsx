import React, { useMemo } from 'react';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Link } from 'react-router-dom';
import { Pool, Token } from 'classes';
import { AppState } from 'state';
import { displayUSD } from 'util/index';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import TokenIcon from 'components/Common/TokenIcon';
import { SEEDS, STALK } from 'constants/tokens';
import { SupportedChainId } from 'constants/chains';
import useChainId from 'hooks/useChain';
import BigNumber from 'bignumber.js';
import { displayBN } from 'util/Tokens';
import useSiloTokenToUSD from 'hooks/currency/useSiloTokenToUSD';
import useTVL from 'hooks/useTVL';
import { AddressMap } from 'constants/index';

const arrowContainerWidth = 20;

const TokenTable : React.FC<{
  config: {
    /** Array of Whitelisted tokens in the Silo. */
    whitelist: Token[];
    /** */
    poolsByAddress: AddressMap<Pool>;
  };
  farmerSilo: AppState['_farmer']['silo'];
  // beanPools:  AppState['_bean']['pools'];
  // beanstalkSilo: AppState['_beanstalk']['silo'];
}> = ({
  config,
  farmerSilo,
  // beanPools,
  // beanstalkSilo,
}) => {
  const chainId = useChainId();
  const breakdown = useFarmerSiloBreakdown();
  const getTVL = useTVL();
  const poolTokenToUSD = useSiloTokenToUSD();

  // Aggregate the total TVL
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
          <Grid item md={3} xs={4}>
            <Typography color="gray">Token</Typography>
          </Grid>
          <Grid item xs={3} display={{ xs: 'none', md: 'block' }}>
            <Typography color="gray">Rewards</Typography>
          </Grid>
          <Grid item xs={3} display={{ xs: 'none', md: 'block' }}>
            <Typography color="gray">TVL</Typography>
            <Typography color="black" fontWeight="bold">
              ${displayBN(aggregateTVL)}
            </Typography>
          </Grid>
          <Grid item md={3} xs={8} sx={{ textAlign: 'right', paddingRight: `${arrowContainerWidth}px` }}>
            <Typography color="gray">My Deposits</Typography>
            <Typography color="black" fontWeight="bold">{displayUSD(breakdown.states.deposited.value)}</Typography>
          </Grid>
        </Grid>
      </Box>
      <Stack direction="column" gap={1} sx={{ p: 1 }}>
        {config.whitelist.map((token) => {
          const deposited = farmerSilo.balances[token.address]?.deposited;
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
                  {/* Cell: Token */}
                  <Grid item md={3} xs={4}>
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
                  {/* Cell: Rewards */}
                  <Grid item xs={3} display={{ xs: 'none', md: 'block' }}>
                    <Typography color="black">
                      <TokenIcon token={STALK} />{token.rewards?.stalk} &nbsp;
                      <TokenIcon token={SEEDS} />{token.rewards?.seeds}
                    </Typography>
                  </Grid>
                  {/* Cell: TVL */}
                  <Grid item xs={3} display={{ xs: 'none', md: 'block' }}>
                    <Typography color="black">
                      ${displayBN(getTVL(token))}
                    </Typography>
                  </Grid>
                  {/* Cell: My Deposits */}
                  <Grid item md={3} xs={8} sx={{ textAlign: 'right' }}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                      <Typography color="black">
                        {deposited?.amount ? displayUSD(poolTokenToUSD(token, deposited.amount)) : '$0'}
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
