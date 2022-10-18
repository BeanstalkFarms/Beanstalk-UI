import React, { useMemo } from 'react';
import { Box, Button, Divider, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useSelector } from 'react-redux';
import { SEEDS, STALK } from '~/constants/tokens';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import { BeanstalkPalette, IconSize } from '../App/muiTheme';
import Fiat from '~/components/Common/Fiat';

import Row from '../Common/Row';
import { displayFullBN } from '~/util';
import TokenIcon from '../Common/TokenIcon';
import { AppState } from '~/state';
import { ZERO_BN } from '~/constants';

const ARROW_CONTAINER_WIDTH = 20;

const FarmerSiloBalances: React.FC<{}> = () => {
  // Chain Constants
  const whitelist = useWhitelist();

  // State
  const balances = useSelector<AppState, AppState['_farmer']['silo']['balances']>((state) => state._farmer.silo.balances);

  const tokens = useMemo(() => Object.entries(whitelist), [whitelist]);

  return (
    <Stack width="100%" pt={1.5}>
      <Box pb={1} px={1}>
        <Grid container rowSpacing={1} width="100%" boxSizing="border-box">
          <Grid item xs={6} sm={5} md={3} display="block" textAlign="left" pl={2}>
            <Typography variant="bodySmall" sx={{ color: BeanstalkPalette.lightGrey, boxSizing: 'border-box' }}>
              Token
            </Typography>
          </Grid>
          <Grid item xs={0} sm={4} md={2} display={{ xs: 'none', sm: 'block' }} textAlign="left">
            <Typography variant="bodySmall" sx={{ color: BeanstalkPalette.lightGrey }}>
              Amount Deposited
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3} md={2.5} textAlign="right">
            <Typography variant="bodySmall" sx={{ color: BeanstalkPalette.lightGrey }}>
              Value Deposited
            </Typography>
          </Grid>
          <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }} textAlign="right">
            <Typography variant="bodySmall" sx={{ color: BeanstalkPalette.lightGrey }}>
              Stalk
            </Typography>
          </Grid>
          <Grid item xs={0} md={2.5} display={{ xs: 'none', md: 'block' }} textAlign="right" pr={4.5}>
            <Typography variant="bodySmall" sx={{ color: BeanstalkPalette.lightGrey }}>
              Seeds
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Divider orientation="horizontal" sx={{ width: '100%', height: '1px', color: BeanstalkPalette.yellow }} />
      <Stack px={1} py={1} spacing={1}>
        {tokens.map(([address, token]) => {
          const deposits = balances[address]?.deposited;
          return (
            <Box key={`${token.address}-${token.chainId}`}>
              <Button
                component={RouterLink}
                to={`/silo/${token.address}`}
                fullWidth
                variant="outlined"
                color="secondary"
                size="large"
                sx={{ textAlign: 'left', px: 0, py: 1, borderColor: BeanstalkPalette.lightestGrey }}
              >
                <Grid container alignItems="center">
                  {/* Cell: Token */}
                  <Grid item xs={6} sm={5} md={3} pl={2}>
                    <Row gap={1}>
                      <img src={token.logo} alt={token.name} css={{ height: IconSize.small, display: 'inline' }} />
                      <Typography color="text.primary" display="inline" variant="bodySmall">
                        {token.symbol}
                      </Typography>
                    </Row>
                  </Grid>
                  {/* Cell: Amount Deposited */}
                  <Grid item xs={0} sm={4} md={2} display={{ xs: 'none', sm: 'block' }} textAlign="left">
                    <Typography variant="bodySmall" color="text.primary">
                      {displayFullBN(deposits?.amount ?? ZERO_BN, 0)}{' '}
                      {token.symbol}
                    </Typography>
                  </Grid>
                  {/* Cell: Value of Deposited */}
                  <Grid item xs={6} sm={3} md={2.5} textAlign="right">
                    <Typography variant="bodySmall" color="text.primary">
                      <Fiat token={token} amount={deposits?.amount ?? ZERO_BN} />
                    </Typography>
                  </Grid>
                  {/* Cell: Stalk */}
                  <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }} textAlign="right">
                    <Row justifyContent="flex-end">
                      <TokenIcon token={STALK} />
                      <Typography variant="bodySmall" color="text.primary" component="span">
                        {displayFullBN(token.getStalk(deposits?.bdv ?? ZERO_BN), 0)}
                      </Typography>
                    </Row>
                  </Grid>
                  {/* Cell: Seeds */}
                  <Grid item xs={0} md={2.5} display={{ xs: 'none', md: 'block' }} textAlign="right" pr={2.25}>
                    <Row justifyContent="flex-end">
                      <TokenIcon token={SEEDS} />
                      <Typography variant="bodySmall" color="text.primary" component="span">
                        {displayFullBN(token.getSeeds(deposits?.bdv ?? ZERO_BN), 0)}
                      </Typography>
                      <Stack display={{ xs: 'none', md: 'block' }} sx={{ width: ARROW_CONTAINER_WIDTH }} alignItems="center">
                        <ArrowRightIcon sx={{ color: BeanstalkPalette.lightestGrey }} />
                      </Stack>
                    </Row>
                  </Grid>
                </Grid>
              </Button>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default FarmerSiloBalances;
