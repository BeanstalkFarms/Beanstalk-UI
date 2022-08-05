import React from 'react';
import { Box, Divider, Stack } from '@mui/material';
import BigNumber from 'bignumber.js';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import stalkIcon from 'img/beanstalk/stalk-icon.svg';
import seedIcon from 'img/beanstalk/seed-icon.svg';
import { NEW_BN } from '~/constants/index';
import { FarmerSiloRewards } from '~/state/farmer/silo';
import RewardItem from './RewardItem';
import { ClaimRewardsAction } from '../../lib/Beanstalk/Farm';
import { hoverMap } from '../../constants/silo';

export type RewardsBarProps = {
  beans: FarmerSiloRewards['beans'];
  stalk: FarmerSiloRewards['stalk'];
  seeds: FarmerSiloRewards['seeds'];
  /// TEMP
  revitalizedStalk?: BigNumber;
  revitalizedSeeds?: BigNumber;
  /**
   * Either the selected or hovered action.
   * If present, grey out the non-included
   * rewards.
  */
  action?: ClaimRewardsAction | undefined;
};

const RewardsBar : React.FC<RewardsBarProps & { compact?: boolean }> = ({
  beans,
  stalk,
  seeds,
  revitalizedStalk = NEW_BN,
  revitalizedSeeds = NEW_BN,
  action,
  compact = false,
}) => {
  const GAP_LG = compact ? 2 : 3.5;
  const GAP_MD = compact ? 1 : 2;
  const GAP_XS = compact ? 0.5 : 1;

  const isHovering = (c: ClaimRewardsAction) => action && hoverMap[action].includes(c);

  return (
    <Stack direction={{ lg: 'row', xs: 'column' }} columnGap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }} rowGap={1.5}>
      {/* Earned */}
      <Stack direction="row" gap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }}>
        <RewardItem
          title="Earned Beans"
          tooltip="The number of Beans earned since your last Plant. Earned Beans are already Deposited in the Silo."
          amount={beans.earned}
          icon={beanIcon}
          compact={compact}
          isClaimable={isHovering(ClaimRewardsAction.MOW)}
        />
        <RewardItem
          title="Earned Stalk"
          tooltip="Stalk earned from Earned Beans. Earned Stalk automatically contribute to Stalk ownership and do not require any action to claim them."
          amount={stalk.earned}
          icon={stalkIcon}
          compact={compact}
          isClaimable={isHovering(ClaimRewardsAction.MOW)}
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
          tooltip="Seeds earned in conjuction with Earned Beans. Plantable Seeds must be Planted in order to grow Stalk."
          amount={seeds.plantable}
          icon={seedIcon}
          compact={compact}
          isClaimable={isHovering(ClaimRewardsAction.PLANT_AND_MOW)}
        />
        <RewardItem
          title="Grown Stalk"
          tooltip="Stalk earned from Seeds. Grown Stalk does not contribute to Stalk ownership until it is Mown. Mow can be called on its own, and it is also called at the beginning of any Silo interaction."
          amount={stalk.grown}
          icon={stalkIcon}
          compact={compact}
          isClaimable={isHovering(ClaimRewardsAction.MOW)}
        />
      </Stack>
      <Box display={{ xs: 'block', lg: compact ? 'none' : 'block' }}>
        <Divider orientation="vertical" />
      </Box>
      {/* Revitalized */}
      <Stack direction="row" gap={{ xs: GAP_XS, md: GAP_MD, lg: GAP_LG }}>
        <RewardItem
          title="Revitalized Stalk"
          tooltip="Stalk that are minted for pre-exploit Silo Members as Fertilizer is sold. Revitalized Stalk must be Enrooted in order to contribute to Stalk ownership."
          amount={revitalizedStalk}
          icon={stalkIcon}
          compact={compact}
          isClaimable={isHovering(ClaimRewardsAction.ENROOT_AND_MOW)}
        />
        <RewardItem
          title="Revitalized Seeds"
          tooltip="Seeds that are minted for pre-exploit Silo Members as Fertilizer is sold. Revitalized Seeds must be Enrooted in order grow Stalk."
          amount={revitalizedSeeds}
          icon={seedIcon}
          compact={compact}
          isClaimable={isHovering(ClaimRewardsAction.ENROOT_AND_MOW)}
        />
      </Stack>
    </Stack>
  );
};

export default RewardsBar;
