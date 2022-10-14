import {
  Box,
  Button,
  Grid,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field, FieldProps } from 'formik';
import { useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
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
import RewardsForm, { ClaimRewardsFormParams } from '../Silo/RewardsForm';
import { ClaimRewardsAction } from '~/lib/Beanstalk/Farm';
import { UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import DescriptionButton from '../Common/DescriptionButton';
import GasTag from '../Common/GasTag';
import { hoverMap } from '~/constants/silo';

const options = [
  {
    title: 'Mow',
    description: 'Last called: 2 Seasons ago',
    value: ClaimRewardsAction.MOW,
  },
  {
    title: 'Plant',
    description: 'Last called: 2 Seasons ago',
    value: ClaimRewardsAction.PLANT_AND_MOW,
  },
  {
    title: 'Enroot',
    description: 'Last called: 2 Seasons ago',
    value: ClaimRewardsAction.ENROOT_AND_MOW,
    hideIfNoUnripe: true,
  },
  {
    title: 'Claim all Silo Rewards',
    description: 'Last called: 2 Seasons ago',
    value: ClaimRewardsAction.CLAIM_ALL,
    hideIfNoUnripe: true,
  },
];

const ClaimRewardsContent: React.FC<ClaimRewardsFormParams> = ({
  submitForm,
  isSubmitting,
  values,
  gas,
  calls,
}) => {
  // helpers
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const getChainToken = useGetChainToken();
  const balances = useFarmerSiloBalances();

  /// The currently hovered action.
  const [hoveredAction, setHoveredAction] = useState<
    ClaimRewardsAction | undefined
  >(undefined);

  /// The currently selected action (after click).
  const selectedAction = values.action;

  /// Calculate Unripe Silo Balance
  const urBean = getChainToken(UNRIPE_BEAN);
  const urBeanCrv3 = getChainToken(UNRIPE_BEAN_CRV3);
  const unripeDepositedBalance = balances[
    urBean.address
  ]?.deposited.amount.plus(balances[urBeanCrv3.address]?.deposited.amount);

  /// Handlers
  const onMouseOver = useCallback(
    (v: ClaimRewardsAction) => () => setHoveredAction(v),
    []
  );
  const onMouseOutContainer = useCallback(
    () => setHoveredAction(undefined),
    []
  );

  // Checks if the current hoverState includes a given ClaimRewardsAction
  const isHovering = (c: ClaimRewardsAction) => {
    if (selectedAction !== undefined) {
      return hoverMap[selectedAction].includes(c);
    }
    return hoveredAction && hoverMap[hoveredAction].includes(c);
  };

  return (
    <Stack gap={1.5}>
      <Field name="action">
        {(fieldProps: FieldProps<any>) => {
          const set = (v: any) => () => {
            // if user clicks on the selected action, unselect the action
            if (
              fieldProps.form.values.action !== undefined &&
              v === fieldProps.form.values.action
            ) {
              fieldProps.form.setFieldValue('action', undefined);
            } else {
              fieldProps.form.setFieldValue('action', v);
            }
          };
          return (
            <Stack gap={1}>
              {options.map((option) => {
                /// hide this option if user has no deposited unripe assets
                if (unripeDepositedBalance?.eq(0) && option.hideIfNoUnripe) {
                  return null;
                }
                const disabled =
                  !calls || calls[option.value].enabled === false;
                const hovered = isHovering(option.value) && !disabled;

                return (
                  <Tooltip
                    title={!disabled || isMobile ? '' : 'Nothing to claim'}
                  >
                    <div>
                      <DescriptionButton
                        key={option.value}
                        title={option.title}
                        description={
                          isMobile ? undefined : `${option.description}`
                        }
                        titleTooltip={
                          isMobile ? `${option.description}` : undefined
                        }
                        tag={<GasTag gasLimit={gas?.[option.value] || null} />}
                        // Button
                        fullWidth
                        onClick={set(option.value)}
                        onMouseOver={onMouseOver(option.value)}
                        onMouseLeave={onMouseOutContainer}
                        isSelected={hovered}
                        disabled={disabled}
                        sx={{
                          padding: '12.5px 10px !important',
                          '&:disabled': {
                            borderColor: BeanstalkPalette.lightestGrey,
                          },
                        }}
                      />
                    </div>
                  </Tooltip>
                );
              })}
            </Stack>
          );
        }}
      </Field>
      <LoadingButton
        type="submit"
        variant="contained"
        fullWidth
        size="medium"
        loading={isSubmitting}
        disabled={isSubmitting || values.action === undefined}
        onClick={submitForm}
      >
        {selectedAction === undefined
          ? 'Select Claim type'
          : `${options[selectedAction].title}`}
      </LoadingButton>
    </Stack>
  );
};

const RewardsContent: React.FC<{}> = () => {
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
      {open && (
        <RewardsForm>
          {(props) => <ClaimRewardsContent {...props} />}
        </RewardsForm>
      )}
      {!open && (
        <Box width={{ xs: '100%', lg: 'auto' }}>
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
      )}
    </Stack>
  );
};

const SiloRewards: React.FC<{}> = () => (
  <Module>
    <ModuleHeader>
      <Typography variant="h4">Rewards</Typography>
    </ModuleHeader>
    <ModuleContent px={2} pb={2}>
      <RewardsContent />
    </ModuleContent>
  </Module>
);

export default SiloRewards;