import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  Module,
  ModuleContent,
  ModuleHeader,
} from '~/components/Common/Module';
import beanIcon from '~/img/tokens/bean-logo-circled.svg';
import stalkIcon from '~/img/beanstalk/stalk-icon.svg';
import seedIcon from '~/img/beanstalk/seed-icon.svg';

import useRevitalized from '~/hooks/farmer/useRevitalized';
import { AppState } from '~/state';
import RewardItem from '../Silo/RewardItem';
import { BeanstalkPalette } from '../App/muiTheme';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import DropdownIcon from '~/components/Common/DropdownIcon';
import useToggle from '~/hooks/display/useToggle';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import useFarmerSiloBalances from '~/hooks/farmer/useFarmerSiloBalances';

const ClaimRewardsContent: React.FC<{}> = () => {
  const getChainToken = useGetChainToken();
  const balances = useFarmerSiloBalances();
};

const RewardsContent: React.FC<{}> = () => {
  /// State
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>(
    (state) => state._farmer.silo
  );
  const breakdown = useFarmerBalancesBreakdown();

  const { revitalizedStalk, revitalizedSeeds } = useRevitalized();
  const [open, show, hide] = useToggle();

  return (
    <Stack gap={2}>
      <Stack spacing={0.6}>
        <Typography>Rewards from Silo Seigniorage</Typography>
        <Grid container>
          <Grid item xs={4}>
            <RewardItem
              title="Earned Beans"
              amount={farmerSilo.beans.earned}
              icon={beanIcon}
              titleColor={BeanstalkPalette.theme.fall.brown}
              titleBelow
            />
          </Grid>
          <Grid item xs={4}>
            <RewardItem
              title="Earned Stalk"
              amount={farmerSilo.stalk.earned}
              icon={stalkIcon}
              titleColor={BeanstalkPalette.theme.fall.brown}
              titleBelow
            />
          </Grid>
          <Grid item xs={4}>
            <RewardItem
              title="Plantable Seeds"
              amount={farmerSilo.seeds.earned}
              icon={seedIcon}
              titleColor={BeanstalkPalette.lightGrey}
              titleBelow
            />
          </Grid>
        </Grid>
      </Stack>
      <Stack spacing={0.6}>
        <Typography>Stalk grown from Seeds</Typography>
        <Grid container>
          <Grid item xs={4}>
            <RewardItem
              title="Grown Stalk"
              amount={farmerSilo.stalk.grown}
              icon={stalkIcon}
              titleColor={BeanstalkPalette.lightGrey}
              titleBelow
            />
          </Grid>
        </Grid>
      </Stack>
      <Stack spacing={0.6}>
        <Typography>Stalk and Seeds from Unripe Assets</Typography>
        <Grid container>
          <Grid item xs={4}>
            <RewardItem
              title="Revitalized Stalk"
              amount={revitalizedStalk}
              icon={stalkIcon}
              titleColor={BeanstalkPalette.lightGrey}
              titleBelow
            />
          </Grid>
          <Grid item xs={4}>
            <RewardItem
              title="Revitalized Seed"
              amount={revitalizedSeeds}
              icon={seedIcon}
              titleColor={BeanstalkPalette.lightGrey}
              titleBelow
            />
          </Grid>
        </Grid>
      </Stack>
      <Box
        justifySelf={{ xs: 'auto', lg: 'flex-end' }}
        width={{ xs: '100%', lg: 'auto' }}
      >
        <Button
          size="medium"
          variant="contained"
          sx={{ width: '100%', whiteSpace: 'nowrap' }}
          endIcon={!open ? <DropdownIcon open={false} /> : null}
          onClick={() => {
            if (open) hide();
            else show();
          }}
          disabled={breakdown.totalValue?.eq(0)}
        >
          {!open ? 'Claim Rewards' : 'Claim All'}
        </Button>
      </Box>
    </Stack>
  );
};

const RewardsModule: React.FC<{}> = () => (
  <Module sx={{ height: '100%' }}>
    <ModuleHeader>
      <Typography variant="h4">Rewards</Typography>
    </ModuleHeader>
    <ModuleContent px={2} pb={2}>
      <RewardsContent />
    </ModuleContent>
  </Module>
);

export default RewardsModule;
