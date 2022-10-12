import { Grid, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import BigNumber from 'bignumber.js';
import OnClickTooltip from '~/components/Common/OnClickTooltip';
import Row from '~/components/Common/Row';
import TokenIcon from '~/components/Common/TokenIcon';
import { PODS, SEEDS, SPROUTS, STALK } from '~/constants/tokens';
import { AppState } from '~/state';
import { displayFullBN } from '~/util';
import EstimateBalanceInput from '../EstimateBalanceInput';
import { ZERO_BN } from '~/constants';
import BalanceStat from '../BalanceStat';
import { Module, ModuleContent } from '~/components/Common/Module';

const valueOrZeroBN = (value?: BigNumber, returnUndef?: boolean) => {
  const returnVal = returnUndef ? undefined : ZERO_BN;
  return value?.gt(0) ? value : returnVal;
};

const UserBalancesCard: React.FC<{}> = () => {
  /// State
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

  const options = [
    {
      tooltip: <Typography>STALK & SEEDS</Typography>,
      tokens: [
        {
          title: 'Stalk',
          token: STALK,
          amount: valueOrZeroBN(farmerSilo.stalk.total),
          amountModifier: undefined,
          style: { marginLeft: '-5px' },
        },
        {
          title: 'Seeds',
          token: SEEDS,
          amount: valueOrZeroBN(farmerSilo.seeds.total),
          amountModifier: undefined,
          style: {},
        },
      ],
    },
    {
      tooltip: <Typography>PODS</Typography>,
      tokens: [
        {
          title: 'Pods',
          token: PODS,
          tooltip: 'hello',
          amount: valueOrZeroBN(farmerField.pods),
          amountModifier: valueOrZeroBN(farmerField.harvestablePods, true),
          style: {},
        },
      ],
    },
    {
      tooltip: <Typography>SPROUTS</Typography>,
      tokens: [
        {
          title: 'Sprouts',
          token: SPROUTS,
          amount: valueOrZeroBN(farmerBarn.unfertilizedSprouts),
          amountModifier: valueOrZeroBN(farmerBarn.fertilizedSprouts, true),
          style: {},
        },
      ],
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
            <Grid container spacing={2} width="100%">
              {options.map((group, i) => (
                <Grid
                  item
                  xs={group.tokens.length * 6}
                  md={group.tokens.length * 3}
                  width="100%"
                  key={`bStat-${i}`}
                >
                  <OnClickTooltip tooltip={group.tooltip}>
                    <Grid container width="100%" spacing={2}>
                      {group.tokens.map((item, k) => (
                        <Grid item xs={6} key={`tokenstat-${k}`}>
                          <BalanceStat
                            variant="h4"
                            gap={0.5}
                            title={
                              <Row gap={0.2}>
                                <TokenIcon
                                  token={item.token}
                                  css={{ height: '20px', ...item.style }}
                                />
                                <Typography>{item.title}</Typography>
                                <ExpandCircleDownOutlinedIcon
                                  fontSize="inherit"
                                  color="primary"
                                />
                              </Row>
                            }
                            amount={
                              <>
                                {displayFullBN(
                                  item.amount ?? ZERO_BN,
                                  item.token?.displayDecimals ?? 2
                                )}
                                {item.amountModifier && (
                                  <Typography
                                    color="primary"
                                    variant="h4"
                                    sx={{ whiteSpace: 'nowrap' }}
                                  >
                                    +{' '}
                                    {displayFullBN(
                                      item.amountModifier,
                                      item.token?.displayDecimals ?? 2
                                    )}
                                  </Typography>
                                )}
                              </>
                            }
                            estimates={getEstimates()}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </OnClickTooltip>
                </Grid>
              ))}
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
