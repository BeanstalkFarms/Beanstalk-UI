import React from 'react';
import { Box, Button, Card, Divider, Grid, Stack, Tooltip, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Link } from 'react-router-dom';
import { Pool, Token } from 'classes';
import { AppState } from 'state';
import { displayUSD } from 'util/index';
import TokenIcon from 'components/Common/TokenIcon';
import { BEAN, SEEDS, STALK } from 'constants/tokens';
import { AddressMap, ZERO_BN } from 'constants/index';
import { displayBN, displayFullBN } from 'util/Tokens';
import useSiloTokenToUSD from 'hooks/currency/useSiloTokenToUSD';
import useTVL from 'hooks/useTVL';
import useChainConstant from 'hooks/useChainConstant';
import useBDV from 'hooks/useBDV';
import { IconSize } from 'components/App/muiTheme';

const ARROW_CONTAINER_WIDTH = 20;

/**
 * Display a pseudo-table of Whitelisted Silo Tokens.
 * This table is the entry point to deposit Beans, LP, etc.
 */
const Whitelist : React.FC<{
  farmerSilo: AppState['_farmer']['silo'];
  config: {
    whitelist: Token[];
    poolsByAddress: AddressMap<Pool>;
  };
}> = ({
  farmerSilo,
  config,
}) => {
  const getTVL = useTVL();
  const getBDV = useBDV();
  const poolTokenToUSD = useSiloTokenToUSD();
  const Bean = useChainConstant(BEAN);

  return (
    <Card>
      {/* Table Header */}
      <Box
        display="flex"
        sx={{ 
          px: 3, // 1 + 2 from Table Body
          pt: '14px',
          pb: '5px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'secondary.main', 
          borderBottomWidth: 1.5,
        }}
      >
        <Grid container alignItems="flex-end">
          <Grid item md={3} xs={4}>
            <Typography color="gray">Token</Typography>
          </Grid>
          <Grid item md={2} xs={0} display={{ xs: 'none', md: 'block' }}>
            <Tooltip title="Stalk and Seeds earned for each 1 Bean Denominated Value (BDV) Deposited in the Silo.">
              <span>
                <Typography color="gray">
                  Rewards
                </Typography>
              </span>
            </Tooltip>
          </Grid>
          <Grid item md={2.5} xs={0} display={{ xs: 'none', md: 'block' }}>
            <Tooltip title="Total Value Deposited">
              <Typography color="gray">TVD</Typography>
            </Tooltip>
            {/* <Typography color="black" fontWeight="bold">
              ${displayBN(aggregateTVL)}
            </Typography> */}
          </Grid>
          <Grid item md={3} xs={0} display={{ xs: 'none', md: 'block' }}>
            <Typography color="gray">Deposited Amount</Typography>
          </Grid>
          <Grid item md={1.5} xs={8} sx={{ textAlign: 'right', paddingRight: `${ARROW_CONTAINER_WIDTH}px` }}>
            <Typography color="gray">Deposited Value</Typography>
            {/* <Typography color="black" fontWeight="bold">{displayUSD(breakdown.states.deposited.value)}</Typography> */}
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
                size="large"
                sx={{
                  textAlign: 'left',
                  px: 2,
                  py: 1.5,
                }}
              >
                <Grid container alignItems="center">
                  {/* Cell: Token */}
                  <Grid item md={3} xs={9}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <img
                        src={token.logo}
                        alt={token.name}
                        style={{ height: IconSize.medium, display: 'inline' }}
                      />
                      <Typography color="black" display="inline">
                        {token.name}
                      </Typography>
                    </Stack>
                  </Grid>
                  {/* Cell: Rewards */}
                  <Grid item md={2} xs={0} display={{ xs: 'none', md: 'block' }}>
                    <Tooltip title={<>BDV of 1 {token.symbol} = {displayFullBN(getBDV(token))}</>}>
                      <Typography color="black">
                        <TokenIcon token={STALK} />{token.rewards?.stalk} &nbsp;
                        <TokenIcon token={SEEDS} style={{ marginTop: 1.5 }} />{token.rewards?.seeds}
                      </Typography>
                    </Tooltip>
                  </Grid>
                  {/* Cell: TVD */}
                  <Grid item md={2.5} xs={0} display={{ xs: 'none', md: 'block' }}>
                    <Typography color="black">
                      ${displayBN(getTVL(token))}
                    </Typography>
                  </Grid>
                  {/* Cell: Deposited Amount */}
                  <Grid item md={3} xs={0} display={{ xs: 'none', md: 'block' }}>
                    <Typography color="black">
                      {/**
                        * If this is the entry for Bean deposits,
                        * display Earned Beans and Deposited Beans separately.
                        * Internally they are both considered "Deposited".
                        */}
                      {token === Bean
                        ? (
                          <Tooltip title={(
                            <>
                              {displayFullBN(deposited?.amount || ZERO_BN, token.displayDecimals)} Deposited Beans<br />
                              {displayFullBN(farmerSilo.beans.earned || ZERO_BN, token.displayDecimals)} Earned Beans<br />
                              <Divider sx={{ my: 0.5, opacity: 0.3 }} />
                              = {displayFullBN(deposited?.amount.plus(farmerSilo.beans.earned) || ZERO_BN, token.displayDecimals)} Beans<br />
                            </>
                          )}>
                            <span>
                              {displayFullBN(deposited?.amount || ZERO_BN, token.displayDecimals)}
                              {farmerSilo.beans.earned.gt(0) ? (
                                <Typography component="span" color="primary.main">
                                  {' + '}
                                  {displayFullBN(farmerSilo.beans.earned, token.displayDecimals)}
                                </Typography>
                              ) : null}
                            </span>
                          </Tooltip>
                        )
                        : displayFullBN(deposited?.amount || ZERO_BN, token.displayDecimals)}
                      <Box display={{ md: 'inline', xs: 'none' }}>&nbsp;{token.name}</Box>
                    </Typography>
                  </Grid>
                  {/* Cell: My Deposits */}
                  <Grid item md={1.5} xs={3}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                      <Typography color="black">
                        {deposited?.amount ? displayUSD(poolTokenToUSD(token, deposited.amount)) : '$0'}
                      </Typography>
                      <Stack sx={{ width: ARROW_CONTAINER_WIDTH, }} alignItems="center">
                        <ArrowRightIcon />
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Button>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
};

export default Whitelist;

// Aggregate the total TVL
// const breakdown = useFarmerSiloBreakdown();
// const aggregateTVL = useMemo(
//   () => config.whitelist.reduce<BigNumber>(
//     (agg, token) => agg.plus(getTVL(token)),
//     new BigNumber(0)
//   ),
//   [config.whitelist, getTVL]
// );
