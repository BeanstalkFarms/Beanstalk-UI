import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import Row from '~/components/Common/Row';
import TokenIcon from '~/components/Common/TokenIcon';
import { ONE_BN, ZERO_BN } from '~/constants';
import { RINSABLE_SPROUTS, SPROUTS } from '~/constants/tokens';
import { FertilizerBalance } from '~/state/farmer/barn';
import { AppState } from '~/state';
import { displayFullBN, MinBN } from '~/util';
import BalancePopover from './BalancePopover';
import FertilizerItem from '~/components/Barn/FertilizerItem';
import EmptyState from '~/components/Common/ZeroState/EmptyState';
import { MY_FERTILIZER } from '~/components/Barn/FertilizerItemTooltips';

const SproutsBalance: React.FC<{}> = () => {
  // data
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>(
    (state) => state._farmer.barn
  );
  const beanstalkBarn = useSelector<AppState, AppState['_beanstalk']['barn']>(
    (state) => state._beanstalk.barn
  );

  // helpers
  const pctRepaid = useCallback(
    (balance: FertilizerBalance) =>
      MinBN(
        beanstalkBarn.currentBpf
          .minus(balance.token.startBpf)
          .div(balance.token.id.minus(balance.token.startBpf)),
        ONE_BN
      ),
    [beanstalkBarn.currentBpf]
  );

  const filteredBalances = useMemo(
    () =>
      farmerBarn.balances?.filter((balance) => !pctRepaid(balance).gte(1)) ||
      [],
    [farmerBarn.balances, pctRepaid]
  );

  return (
    <BalancePopover
      items={[
        {
          token: SPROUTS,
          title: 'SPROUTS',
          amount: farmerBarn.unfertilizedSprouts,
          description:
            'Sprouts represent how many Beans there are left to be earned from Fertilizer. Sprouts become Rinsable on a pari passu basis.',
          amountModifier: farmerBarn.fertilizedSprouts?.gt(0)
            ? `+${displayFullBN(farmerBarn.fertilizedSprouts, 0)} Rinsable`
            : undefined,
        },
      ]}
      maxWidth={490}
    >
      <Stack sx={{ px: 2 }}>
        <Stack spacing={1}>
          <Row justifyContent="space-between" width="100%">
            <Typography variant="bodySmall">Sprouts</Typography>
            <Typography variant="bodySmall" component="span">
              <TokenIcon token={SPROUTS} />
              {displayFullBN(
                farmerBarn.unfertilizedSprouts || ZERO_BN,
                SPROUTS.displayDecimals
              )}
            </Typography>
          </Row>
          <Row justifyContent="space-between" width="100%">
            <Typography variant="bodySmall">Rinsable Sprouts</Typography>
            <Typography variant="bodySmall" component="span" color="primary">
              <TokenIcon
                token={RINSABLE_SPROUTS}
                css={{ color: BeanstalkPalette.theme.fall.brown }}
              />
              {displayFullBN(
                farmerBarn.fertilizedSprouts || ZERO_BN,
                RINSABLE_SPROUTS.displayDecimals
              )}
            </Typography>
          </Row>
          <Divider
            sx={{ width: '100%', color: BeanstalkPalette.lightYellow }}
          />
          <Stack sx={{ pb: 2 }} spacing={0}>
            <Box>
              {filteredBalances.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredBalances.map((balance) => {
                    const pct = pctRepaid(balance);
                    const status = pct.eq(1) ? 'used' : 'active';
                    const humidity = balance.token.humidity;
                    const debt = balance.amount.multipliedBy(
                      humidity.div(100).plus(1)
                    );
                    const sprouts = debt.multipliedBy(ONE_BN.minus(pct));
                    const rinsableSprouts = debt.multipliedBy(pct);
                    return (
                      <Grid
                        key={balance.token.id.toString()}
                        item
                        xs={12}
                        md={4}
                      >
                        <FertilizerItem
                          id={balance.token.id}
                          season={balance.token.season}
                          state={status}
                          humidity={humidity.div(100)}
                          amount={balance.amount} // of FERT
                          rinsableSprouts={rinsableSprouts} // rinsable sprouts
                          sprouts={sprouts} // sprouts
                          progress={pct.toNumber()}
                          tooltip={MY_FERTILIZER}
                          fontWeight="normal"
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <EmptyState
                  message="Your Active Fertilizer will appear here."
                  height={150}
                />
              )}
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </BalancePopover>
  );
};

export default SproutsBalance;
