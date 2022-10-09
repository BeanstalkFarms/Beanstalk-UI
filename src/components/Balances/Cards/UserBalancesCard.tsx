import { Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import BigNumber from 'bignumber.js';
import OnClickTooltip from '~/components/Common/OnClickTooltip';
import Row from '~/components/Common/Row';
import Stat from '~/components/Common/Stat';
import TokenIcon from '~/components/Common/TokenIcon';
import { PODS, SEEDS, SPROUTS, STALK } from '~/constants/tokens';
import { AppState } from '~/state';
import { displayFullBN } from '~/util';
import BalanceCalculator from '../BalanceCalculator';
import { ZERO_BN } from '~/constants';

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

  return (
    <Row width="100%" justifyContent="space-between" gap={2}>
      <Stack width="100%" alignSelf="flex-start" gap={2}>
        <Typography variant="h4">Beanstalk Balances</Typography>
        <Grid container spacing={2} width="100%">
          {options.map((option, i) => (
            <Grid item xs={6} md={3} width="100%" key={`bStat-${i}`}>
              <OnClickTooltip tooltip={option.tooltip}>
                <Stat
                  variant="h4"
                  gap={0.5}
                  title={
                    <Row gap={0.2}>
                      <TokenIcon
                        token={option.token}
                        style={{ ...option.style, height: '20px' }}
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
                        <Typography color="primary" variant="h4">
                          +{' '}
                          {displayFullBN(
                            option.amountModifier,
                            option.token?.displayDecimals ?? 2
                          )}
                        </Typography>
                      )}
                    </>
                  }
                />
              </OnClickTooltip>
            </Grid>
          ))}
        </Grid>
      </Stack>
      <Stack display={{ xs: 'none', md: 'flex' }}>
        <BalanceCalculator />
      </Stack>
    </Row>
  );
};

export default UserBalancesCard;
