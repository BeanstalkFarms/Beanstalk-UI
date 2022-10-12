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
import BalanceCalculator from '../BalanceCalculator';
import { ZERO_BN } from '~/constants';
import BalanceStat from '../BalanceStat';

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
      title: 'Stalk',
      token: STALK,
      tooltip: 'hello',
      amount: valueOrZeroBN(farmerSilo.stalk.total),
      style: { marginLeft: '-5px' },
    },
    {
      title: 'Seeds',
      token: SEEDS,
      tooltip: 'hello',
      amount: valueOrZeroBN(farmerSilo.seeds.total),
    },
    {
      title: 'Pods',
      token: PODS,
      tooltip: 'hello',
      amount: valueOrZeroBN(farmerField.pods),
      amountModifier: valueOrZeroBN(farmerField.harvestablePods, true),
    },
    {
      title: 'Sprouts',
      token: SPROUTS,
      tooltip: 'hello',
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
    <Row width="100%" justifyContent="space-between" gap={2}>
      <Stack width="100%" alignSelf="flex-start" gap={2}>
        <Typography variant="h4">Beanstalk Balances</Typography>
        <Grid container spacing={2} width="100%">
          {options.map((option, i) => (
            <Grid item xs={6} md={3} width="100%" key={`bStat-${i}`}>
              <OnClickTooltip tooltip={option.tooltip}>
                <BalanceStat
                  variant="h4"
                  gap={0.5}
                  title={
                    <Row gap={0.2}>
                      <TokenIcon
                        token={option.token}
                        css={{ height: '20px', ...option.style }}
                      />
                      <Typography>{option.title}</Typography>
                      <ExpandCircleDownOutlinedIcon
                        fontSize="inherit"
                        color="primary"
                      />
                    </Row>
                  }
                  amount={
                    <>
                      {displayFullBN(
                        option.amount ?? ZERO_BN,
                        option.token?.displayDecimals ?? 2
                      )}
                      {option.amountModifier && (
                        <Typography color="primary" variant="h4" sx={{ whiteSpace: 'nowrap' }}>
                          +{' '}
                          {displayFullBN(
                            option.amountModifier,
                            option.token?.displayDecimals ?? 2
                          )}
                        </Typography>
                      )}
                    </>
                  }
                  estimates={getEstimates()}
                />
              </OnClickTooltip>
            </Grid>
          ))}
        </Grid>
      </Stack>
      <Stack display={{ xs: 'none', md: 'flex' }}>
        <BalanceCalculator
          active={active}
          setActive={setActive}
          amount={displayAmount}
          setAmount={setDisplayAmount}
        />
      </Stack>
    </Row>
  );
};

export default UserBalancesCard;
