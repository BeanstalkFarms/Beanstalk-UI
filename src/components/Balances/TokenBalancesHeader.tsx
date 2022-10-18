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
import { ZERO_BN } from '~/constants';

const STALK_TOOLTIP = 'This is your total Stalk balance. Stalk is the governance token of the Beanstalk DAO. Stalk entitles holders to passive interest in the form of a share of future Bean mints, and the right to propose and vote on BIPs. Your Stalk is forfeited when you Withdraw your Deposited assets from the Silo.';
const SEEDS_TOOLTIP = 'This is your total Seed balance. Each Seed yields 1/10000 Grown Stalk each Season. Grown Stalk must be Mown to add it to your Stalk balance.';
const PODS_TOOLTIP = 'This is your total Pod Balance. Pods become Harvestable on a FIFO basis. For more information on your place in the Pod Line, head over to the Field page.';
const SPROUTS_TOOLTIP = 'This is your total Sprout balance. The number of Beans left to be earned from your Fertilizer. Sprouts become Rinsable on a pari passu basis. For more information on your Sprouts, head over to the Barn page.';

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
          {displayFullBN(amount?.gt(0) ? amount : ZERO_BN, token.displayDecimals)}
          <Tooltip title={tooltip}>
            <HelpOutlineIcon sx={{ color: 'text.secondary', fontSize: FontSize.sm, ml: '3px' }} />
          </Tooltip>
        </Typography>
      </Row>
    </Row>
  </Stack>
);

const TokenBalancesHeader: React.FC<{}> = () => {
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>((state) => state._farmer.field);
  const farmerBarn = useSelector<AppState, AppState['_farmer']['barn']>((state) => state._farmer.barn);

  const tokensProps = useMemo(
    () => ({
      stalk: {
        token: STALK,
        title: 'STALK',
        amount: farmerSilo.stalk.total,
        tooltip: STALK_TOOLTIP,
      },
      seeds: {
        token: SEEDS,
        title: 'SEEDS',
        amount: farmerSilo.seeds.total,
        tooltip: SEEDS_TOOLTIP,
      },
      pods: {
        token: PODS,
        title: 'PODS',
        amount: farmerField.pods,
        tooltip: PODS_TOOLTIP,
      },
      sprouts: {
        token: SPROUTS,
        title: 'SPROUTS',
        amount: farmerBarn.unfertilizedSprouts,
        tooltip: SPROUTS_TOOLTIP,
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
      {/* breakpoints above md */}
      <Row display={{ xs: 'none', md: 'flex' }} width="100%" justifyContent="space-between">
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

      {/* breakpoints xs & sm */}
      <Grid container display={{ md: 'none' }} gap={0.5}>
        <Grid container item xs={12} gap={0.5}>
          {/* STALK */}
          <Grid item xs={12} sm={6}>
            <TokenBalanceItem 
              {...tokensProps.stalk} 
              justifyContent={{ 
                xs: 'space-between', 
                sm: 'flex-start'
              }} 
            />
          </Grid>
          {/* SEEDS */}
          <Grid item xs sm>
            <TokenBalanceItem 
              {...tokensProps.seeds} 
              justifyContent={{ 
                xs: 'space-between', 
                sm: 'flex-end' 
              }} 
            />
          </Grid>
        </Grid>
        <Grid container item xs sm gap={0.5}>
          {/* PODS */}
          <Grid item xs={12} sm={6}>
            <TokenBalanceItem
              {...tokensProps.pods}
              justifyContent={{
                xs: 'space-between',
                sm: 'flex-start'
              }}
            />
          </Grid>
          {/* SPROUTS */}
          <Grid item xs sm>
            <TokenBalanceItem
              {...tokensProps.sprouts}
              justifyContent={{
                xs: 'space-between',
                sm: 'flex-end',
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default TokenBalancesHeader;
