import React, { useMemo } from 'react';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useSelector } from 'react-redux';
import { SEEDS, STALK } from '~/constants/tokens';
import useWhitelist from '~/hooks/beanstalk/useWhitelist';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import { BeanstalkPalette, IconSize } from '../App/muiTheme';
import EmbeddedCard from '../Common/EmbeddedCard';
import Fiat from '~/components/Common/Fiat';

import { Module, ModuleContent, ModuleHeader } from '../Common/Module';
import UserBalancesCharts from './UserBalancesCharts';
import Row from '../Common/Row';
import { displayFullBN } from '~/util';
import TokenIcon from '../Common/TokenIcon';
import { AppState } from '~/state';
import { ZERO_BN } from '~/constants';

const ARROW_CONTAINER_WIDTH = 20;

const BalancesTable: React.FC<{}> = () => {
  /// Helpers
  const getChainToken = useGetChainToken();
  
  // Chain Constants
  const whitelist = useWhitelist();

  // State
  const balances  = useSelector<AppState, AppState['_farmer']['silo']['balances']>((state) => state._farmer.silo.balances);

  const tokens = useMemo(() => Object.entries(whitelist), [whitelist]);

  return (
    <Stack width="100%" spacing={1}>
      <Box>
        <Grid container spacing={1} width="100%" pl={2}>
          <Grid item xs={6} sm={5} md={3} display="block" textAlign="left">
            <Typography
              variant="bodySmall" 
              sx={{ color: BeanstalkPalette.lightGrey }}
            >
              Token
            </Typography>
          </Grid>
          <Grid item xs={0} sm={4} md={2} display={{ xs: 'none', sm: 'block' }} textAlign="left">
            <Typography 
              variant="bodySmall" 
              sx={{ color: BeanstalkPalette.lightGrey }}
            >
              Amount Deposited
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3} md={2.5} textAlign="right">
            <Typography 
              variant="bodySmall" 
              sx={{ color: BeanstalkPalette.lightGrey }}
            >
              Value Deposited
            </Typography>
          </Grid>
          <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }} textAlign="right">
            <Typography 
              variant="bodySmall" 
              sx={{ color: BeanstalkPalette.lightGrey }}
            >
              Stalk
            </Typography>
          </Grid>
          <Grid item xs={0} md={2.5} display={{ xs: 'none', md: 'block' }} textAlign="right">
            <Typography 
              variant="bodySmall" 
              sx={{ color: BeanstalkPalette.lightGrey, pr: 1 }}
          >
              Seeds
            </Typography>
          </Grid>
        </Grid>
      </Box>
      {tokens.map(([address, _token]) => { 
        const token = getChainToken(_token);
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
              sx={{
              textAlign: 'left',
              px: 2,
              py: 1.5,
              borderColor: BeanstalkPalette.lightestGrey
            }}>
              <Grid container alignItems="center">
                {/* 
                  * Cell: Token
                  */ }
                <Grid item xs={6} sm={5} md={3}>
                  <Row gap={1}>
                    <img src={token.logo} alt={token.name} css={{ height: IconSize.small, display: 'inline' }} />
                    <Typography color="black" display="inline" variant="bodySmall">
                      {token.symbol}
                    </Typography>
                  </Row>
                </Grid>
                {/* 
                  * Cell: Amount Deposited
                  */ }
                <Grid item xs={0} sm={4} md={2} display={{ xs: 'none', sm: 'block' }} textAlign="left">
                  <Typography variant="bodySmall" color="black">
                    {displayFullBN(deposits?.amount ?? ZERO_BN, 0)} {token.symbol}
                  </Typography>
                </Grid>
                {/*
                  * Cell: Value of Deposited
                  */ }
                <Grid item xs={6} sm={3} md={2.5} textAlign="right">
                  <Typography variant="bodySmall" color="black">
                    <Fiat token={token} amount={deposits?.amount ?? ZERO_BN} />
                  </Typography>
                </Grid>
                {/* 
                  * Cell: Stalk 
                  */ }
                <Grid item xs={0} md={2} display={{ xs: 'none', md: 'block' }} textAlign="right">
                  <Row justifyContent="flex-end">
                    <TokenIcon token={STALK} />
                    <Typography variant="bodySmall" color="black" component="span">
                      {displayFullBN(token.getStalk(deposits?.bdv ?? ZERO_BN), 0)}
                    </Typography>
                  </Row>
                </Grid>
                {/* 
                  * Cell: Seeds
                  */ }
                <Grid item xs={0} md={2.5} display={{ xs: 'none', md: 'block' }} textAlign="right">
                  <Row justifyContent="flex-end">
                    <TokenIcon token={SEEDS} />
                    <Typography variant="bodySmall" color="black" component="span">
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
  );
};

const FarmerSiloBalances: React.FC<{}> = () => (
  <Module>
    <ModuleHeader>
      <Typography variant="h4">
        DepositedBalances
      </Typography>
    </ModuleHeader>
    <ModuleContent px={2} pt={0.5} pb={2}>
      <Stack spacing={2}>
        <EmbeddedCard sx={{ pt: 2, mb: 0.5 }}>
          <UserBalancesCharts />
        </EmbeddedCard>
        <BalancesTable  />
      </Stack>
    </ModuleContent>
  </Module>
  );

export default FarmerSiloBalances;
