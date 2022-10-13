import React, { useState } from 'react';
import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import AnimatedPopper from '~/components/Common/AnimatedPopper';
import Row from '~/components/Common/Row';
import { PODS, SEEDS, SPROUTS, STALK } from '~/constants/tokens';
import { AppState } from '~/state';
import EstimateBalanceInput from '../EstimateBalanceInput';
import { ZERO_BN } from '~/constants';
import BalanceStat from '../BalanceStat';
import { Module, ModuleContent } from '~/components/Common/Module';
import useAccount from '~/hooks/ledger/useAccount';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import PodsBalance from '../poppers/PodsBalance';
import SproutsBalance from '../poppers/SproutsBalance';

const valueOrZeroBN = (value?: BigNumber, returnUndef?: boolean) => {
  const returnVal = returnUndef ? undefined : ZERO_BN;
  return value?.gt(0) ? value : returnVal;
};

const ResponsiveDivider = () => (
  <>
    <Box display={{ xs: 'none', md: 'block' }}>
      <Divider
        sx={{
          color: BeanstalkPalette.lightYellow,
          height: '45px',
          alignSelf: 'flex-end',
          marginBottom: '5px',
        }}
        orientation="vertical"
      />
    </Box>
    <Box width="100%" display={{ xs: 'block', md: 'none' }}>
      <Divider
        sx={{
          color: BeanstalkPalette.lightYellow,
          width: '100%',
          height: '1px',
          my: 2,
        }}
        orientation="horizontal"
      />
    </Box>
  </>
);

const UserBalancesCard: React.FC<{}> = () => {
  // state
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>(
    (state) => state._farmer.silo
  );
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>(
    (state) => state._farmer.barn
  );
  const account = useAccount();

  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [active, setActive] = useState(false);

  // helpers
  const canPerformActions = account !== undefined;

  // options
  const stalkAndSeedsOption = [
    {
      title: 'Stalk',
      token: STALK,
      amount: valueOrZeroBN(farmerSilo.stalk.total),
      amountModifier: undefined,
    },
    {
      title: 'Seeds',
      token: SEEDS,
      amount: valueOrZeroBN(farmerSilo.seeds.total),
      amountModifier: undefined,
    },
  ];

  const podsAndSproutsOptions = [
    {
      title: 'Pods',
      token: PODS,
      amount: valueOrZeroBN(farmerField.pods),
      amountModifier: valueOrZeroBN(farmerField.harvestablePods, true),
    },
    {
      title: 'Sprouts',
      token: SPROUTS,
      amount: valueOrZeroBN(farmerBarn.unfertilizedSprouts),
      amountModifier: valueOrZeroBN(farmerBarn.fertilizedSprouts, true),
    },
  ];

  const getEstimates = () => {
    if (!active) return [];
    return [
      { delta: 200, name: 'Earned beans' },
      { delta: 200, name: 'Earned beans' },
    ];
  };

  return (
    <Module sx={{ zIndex: 1 }}>
      <ModuleContent px={2} py={2}>
        <Row width="100%" justifyContent="space-between" gap={2}>
          <Stack width="100%" alignSelf="flex-start" gap={1}>
            <Typography variant="h4" sx={{ pb: 0.5 }}>
              Beanstalk Balances
            </Typography>
            {/* stalk and seeds */}
            <Grid container>
              <Grid item xs={12} md={5.5}>
                <AnimatedPopper
                  id="stalkAndSeeds"
                  popperEl={<Typography>stalk and seeds</Typography>}
                  disabled={!canPerformActions}
                >
                  <Grid container spacing={2}>
                    {stalkAndSeedsOption.map((item) => (
                      <Grid
                        item
                        xs={6}
                        key={item.title}
                        width="100%"
                        sx={{ maxWidth: '100% !important' }}
                      >
                        <BalanceStat {...item} estimates={getEstimates()} />
                      </Grid>
                    ))}
                  </Grid>
                </AnimatedPopper>
              </Grid>
              <ResponsiveDivider />
              {/* pods and sprouts */}
              {/* width of 6.4 to take into account width of divider */}
              <Grid item xs={12} md={6.4}>
                <Grid container spacing={2}>
                  {podsAndSproutsOptions.map((opt, k) => (
                    <Grid
                      item
                      xs={6}
                      key={k}
                      sx={{ maxWidth: '100% !important' }}
                    >
                      <Stack alignItems={{ xs: 'flex-start', md: 'center' }}>
                        <AnimatedPopper
                          id={`${opt.title}-popper`}
                          disabled={!canPerformActions}
                          popperEl={
                            opt.token === PODS ? (
                              <PodsBalance />
                            ) : (
                              <SproutsBalance />
                            )
                          }
                        >
                          <BalanceStat
                            {...opt}
                            estimates={getEstimates()}
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                          />
                        </AnimatedPopper>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Stack>
          <Stack
            display={{ xs: 'none', lg: 'flex' }}
            maxWidth={{ xs: '100%', lg: '340px' }}
            width="100%"
          >
            <EstimateBalanceInput
              active={active}
              setActive={setActive}
              amount={displayAmount}
              setAmount={setDisplayAmount}
            />
          </Stack>
        </Row>
      </ModuleContent>
    </Module>
  );
};

export default UserBalancesCard;
