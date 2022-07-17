import React from 'react';
import { Box, Divider, Stack } from '@mui/material';
import { FarmerSiloRewards } from 'state/farmer/silo';
import BigNumber from 'bignumber.js';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import stalkIcon from 'img/beanstalk/stalk-icon.svg';
import seedIcon from 'img/beanstalk/seed-icon.svg';
import { NEW_BN } from 'constants/index';
import RewardItem from './RewardItem';

export type RewardsBarProps = {
  beans: FarmerSiloRewards['beans'];
  stalk: FarmerSiloRewards['stalk'];
  seeds: FarmerSiloRewards['seeds'];
  /// TEMP
  revitalizedStalk?: BigNumber;
  revitalizedSeeds?: BigNumber;
};

const RewardsBar : React.FC<RewardsBarProps & { compact?: boolean }> = ({
  beans,
  stalk,
  seeds,
  revitalizedStalk = NEW_BN,
  revitalizedSeeds = NEW_BN,
  compact = false,
}) => {
  const GAP_LG = compact ? 2 : 3.5;
  const GAP_MD = compact ? 1 : 2;
  const GAP_XS = compact ? 0.5 : 1;
  return (
    <Stack direction={{ lg: 'row', xs: 'column' }} columnGap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }} rowGap={1.5}>
      {/* Earned */}
      <Stack direction="row" gap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }}>
        <RewardItem
          title="Earned Beans"
          tooltip="The number of Beans earned since your last Mow, or last interaction with the Silo. Earned Beans are already Deposited in the Silo."
          amount={beans.earned}
          icon={beanIcon}
          compact={compact}
        />
        <RewardItem
          title="Earned Stalk"
          tooltip="The number of Stalk earned from Earned Beans. Earned Stalk automatically contribute to your Stalk ownership and do not require any action to activate them."
          amount={stalk.earned}
          icon={stalkIcon}
          compact={compact}
        />
      </Stack>
      {/* Divider */}
      <Box display={{ xs: 'block', lg: compact ? 'none' : 'block' }}>
        <Divider orientation="vertical" />
      </Box>
      {/* Grown */}
      <Stack direction="row" gap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }}>
        <RewardItem
          title="Plantable Seeds"
          tooltip="The number of Seeds earned from Earned Beans. Plantable Seeds do not grow Stalk until they are Planted."
          amount={seeds.plantable}
          icon={seedIcon}
          compact={compact}
        />
        <RewardItem
          title="Grown Stalk"
          tooltip="The number of Stalk earned from Seeds. Grown Stalk does not contribute to your Stalk ownership and must be Mown to add it to your Stalk balance."
          amount={stalk.grown}
          icon={stalkIcon}
          compact={compact}
        />
      </Stack>
      <Box display={{ xs: 'block', lg: compact ? 'none' : 'block' }}>
        <Divider orientation="vertical" />
      </Box>
      {/* Revitalized */}
      <Stack direction="row" gap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }}>
        <RewardItem
          title="Revitalized Stalk"
          tooltip="The number of pre-exploit Stalk that has vested as a function of Fertilizer sold. Revitalized Stalk does not contribute to your Stalk ownership and must be Enrooted to add it to your Stalk balance."
          amount={revitalizedStalk}
          icon={stalkIcon}
          compact={compact}
        />
        <RewardItem
          title="Revitalized Seeds"
          tooltip="The number of pre-exploit Seeds that have vested as a function of Fertilizer sold. Revitalized Seeds do not grow Stalk until they are Enrooted."
          amount={revitalizedSeeds}
          icon={seedIcon}
          compact={compact}
        />
      </Stack>
    </Stack>
  );
};

export default RewardsBar;
