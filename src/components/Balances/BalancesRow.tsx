import {
  Box,
  Divider,
  Grid,
  Stack,
  StackProps,
  Tooltip,
  Typography,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { BeanstalkToken } from '~/classes/Token';
import { AppState } from '~/state';
import { displayFullBN } from '~/util';
import Row from '../Common/Row';
import TokenIcon from '../Common/TokenIcon';
import { BeanstalkPalette, FontSize } from '../App/muiTheme';
import { PODS, SEEDS, SPROUTS, STALK } from '~/constants/tokens';

type TokenItemProps = {
  token: BeanstalkToken;
  title: string;
  amount: BigNumber;
  tooltip: string;
} & StackProps;

const VerticalDivider = () => (
  <Box display={{ xs: 'none', md: 'block' }} alignSelf="flex-end">
    <Divider
      orientation="vertical"
      sx={{
        width: '0.5px',
        height: '20px',
        borderColor: BeanstalkPalette.lightGrey,
      }}
    />
  </Box>
);

const TokenBalanceItem: React.FC<TokenItemProps> = ({
  token,
  title,
  amount,
  tooltip,
  ...stackProps
}) => (
  <Stack>
    <Row width="100%" {...stackProps} gap={0.6}>
      <Typography variant="h4" color="text.primary">
        {title}
      </Typography>
      <Row gap={0.5}>
        <TokenIcon token={token} />
        <Typography variant="h4" color="text.primary" display="inline-flex">
          {displayFullBN(amount, token.displayDecimals)}
          <Tooltip title={tooltip}>
            <HelpOutlineIcon
              sx={{ color: 'text.secondary', fontSize: FontSize.sm, ml: '3px' }}
            />
          </Tooltip>
        </Typography>
      </Row>
    </Row>
  </Stack>
);

const BeanstalkTokenBalancesRow: React.FC<{}> = () => {
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>(
    (state) => state._farmer.silo
  );
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>(
    (state) => state._farmer.barn
  );

  const tokensProps = useMemo(
    () => ({
      stalk: {
        token: STALK,
        title: 'STALK',
        amount: farmerSilo.stalk.total,
        tooltip: 'asdfjkal;sdfjklas',
      },
      seeds: {
        token: SEEDS,
        title: 'SEEDS',
        amount: farmerSilo.seeds.total,
        tooltip: 'asdfjkl;asdtfrhi',
      },
      pods: {
        token: PODS,
        title: 'PODS',
        amount: farmerField.pods,
        tooltip: 'asdjfhklqawef',
      },
      sprouts: {
        token: SPROUTS,
        title: 'SPROUTS',
        amount: farmerBarn.unfertilizedSprouts,
        tooltip: ';asdfjkalw;f',
      },
    }),
    [
      farmerBarn.unfertilizedSprouts,
      farmerField.pods,
      farmerSilo.seeds.total,
      farmerSilo.stalk.total,
    ]
  );

  return (
    <>
      {/* breakpoints xs & sm */}
      <Row
        display={{ xs: 'none', md: 'flex' }}
        width="100%"
        justifyContent="space-between"
      >
        {/* STALK */}
        <TokenBalanceItem {...tokensProps.stalk} alignItems="flex-start" />
        <Row width="100%" justifyContent="space-evenly">
          {/* SEEDS */}
          <TokenBalanceItem {...tokensProps.seeds} />
          <VerticalDivider />
          {/* PODS */}
          <TokenBalanceItem {...tokensProps.pods} />
          <VerticalDivider />
          {/* SPROUTS */}
          <TokenBalanceItem {...tokensProps.sprouts} />
        </Row>
      </Row>
      {/* breakpoints above md */}
      <Grid container display={{ md: 'none' }} spacing={0.5}>
        <Grid container item xs={12} spacing={0.5}>
          {/* STALK */}
          <Grid item xs={12} sm={6}>
            <TokenBalanceItem {...tokensProps.stalk} />
          </Grid>
          {/* SEEDS */}
          <Grid item xs sm>
            <TokenBalanceItem
              {...tokensProps.seeds}
              justifyContent={{
                xs: 'flex-start',
                sm: 'flex-end',
              }}
            />
          </Grid>
        </Grid>
        <Grid container item xs sm spacing={0.5}>
          {/* PODS */}
          <Grid item xs={12} sm={6}>
            <TokenBalanceItem
              {...tokensProps.pods}
              justifyContent="flex-start"
            />
          </Grid>
          {/* SPROUTS */}
          <Grid item xs sm>
            <TokenBalanceItem
              {...tokensProps.sprouts}
              justifyContent={{
                xs: 'flex-start',
                sm: 'flex-end',
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default BeanstalkTokenBalancesRow;
