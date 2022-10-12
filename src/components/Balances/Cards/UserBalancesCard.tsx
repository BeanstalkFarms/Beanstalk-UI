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
import PodsBalance from '../tooltips/PodsBalance';
import useAccount from '~/hooks/ledger/useAccount';
import { BeanstalkPalette } from '~/components/App/muiTheme';

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
  const account = useAccount();
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>(
    (state) => state._farmer.silo
  );
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>(
    (state) => state._farmer.barn
  );
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [active, setActive] = useState(false);

  const canPerformActions = account !== undefined;

  const stalkAndSeedsOption = {
    popperEl: <Typography>STALK & SEEDS</Typography>,
    tokens: [
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
    ],
  };

  const podsAndSproutsOptions = [
    {
      popperEl: <PodsBalance />,
      token: {
        title: 'Pods',
        token: PODS,
        amount: valueOrZeroBN(farmerField.pods),
        amountModifier: valueOrZeroBN(farmerField.harvestablePods, true),
      },
    },
    {
      popperEl: <Typography>SPROUTS</Typography>,
      token: {
        title: 'Sprouts',
        token: SPROUTS,
        amount: valueOrZeroBN(farmerBarn.unfertilizedSprouts),
        amountModifier: valueOrZeroBN(farmerBarn.fertilizedSprouts, true),
      },
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
            <Stack>
              {/* stalk and seeds */}
              <Grid container>
                <>
                  <Grid item xs={12} md={5.5}>
                    <AnimatedPopper
                      id="stalkAndSeeds"
                      popperEl={stalkAndSeedsOption.popperEl}
                      openCondition={canPerformActions}
                    >
                      <Grid container>
                        {stalkAndSeedsOption.tokens.map((item) => (
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
                </>
                {/* width of 6.4 to take into account width of divider */}
                {/* pods and sprouts */}
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
                            id={`${opt.token.title}-popper`}
                            popperEl={opt.popperEl}
                            openCondition={canPerformActions}
                          >
                            <BalanceStat
                              {...opt.token}
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
