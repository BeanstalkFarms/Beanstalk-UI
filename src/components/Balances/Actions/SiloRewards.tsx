import React, { useCallback, useState } from 'react';
import {
  Grid,
  Button,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { Field, FieldProps } from 'formik';
import { useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Module, ModuleContent } from '~/components/Common/Module';
import beanIcon from '~/img/tokens/bean-logo-circled.svg';
import stalkIcon from '~/img/beanstalk/stalk-icon.svg';
import seedIcon from '~/img/beanstalk/seed-icon.svg';

import useRevitalized from '~/hooks/farmer/useRevitalized';
import { AppState } from '~/state';
import RewardItem from '../../Silo/RewardItem';
import { BeanstalkPalette } from '../../App/muiTheme';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import DropdownIcon from '~/components/Common/DropdownIcon';
import useToggle from '~/hooks/display/useToggle';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import useFarmerSiloBalances from '~/hooks/farmer/useFarmerSiloBalances';
import RewardsForm, { ClaimRewardsFormParams } from '../../Silo/RewardsForm';
import { ClaimRewardsAction } from '~/lib/Beanstalk/Farm';
import { UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import DescriptionButton from '../../Common/DescriptionButton';
import GasTag from '../../Common/GasTag';
import { hoverMap } from '~/constants/silo';
import MountedAccordion from '../../Common/Accordion/MountedAccordion';

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

// somewhat duplicated code from Rewards Dialog
const ClaimRewardsContent: React.FC<
  ClaimRewardsFormParams & {
    open: boolean;
    show: () => void;
    hide: () => void;
  }
> = ({ submitForm, isSubmitting, values, gas, calls, open, show, hide }) => {
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

  const handleOnClick = () => {
    if (!open) {
      show();
      return;
    }
    if (open) {
      if (selectedAction !== undefined) {
        submitForm();
      } else {
        hide();
      }
    }
  };

  return (
    <Stack gap={1.5}>
      <MountedAccordion open={open}>
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
                          tag={
                            <GasTag gasLimit={gas?.[option.value] || null} />
                          }
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
      </MountedAccordion>
      <LoadingButton
        type="submit"
        variant="contained"
        fullWidth
        size="medium"
        loading={isSubmitting}
        disabled={isSubmitting}
        onClick={handleOnClick}
        endIcon={!open ? <DropdownIcon open={false} /> : null}
      >
        {!open
          ? 'Claim Rewards'
          : selectedAction === undefined
          ? 'Close'
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
    <Stack spacing={1} whiteSpace={{ xs: 'normal', sm: 'nowrap' }}>
      <Stack gap={2} px={0.5}>
        <Grid spacing={1} container width="100%" justifyContent="flex-start">
          <Grid item xs={4}>
            <RewardItem
              title="Earned Beans"
              amount={farmerSilo.beans.earned}
              icon={beanIcon}
              titleColor={BeanstalkPalette.theme.fall.brown}
            />
          </Grid>
          <Grid item xs={4}>
            <RewardItem
              title="Earned Stalk"
              amount={farmerSilo.stalk.earned}
              icon={stalkIcon}
              titleColor={BeanstalkPalette.theme.fall.brown}
            />
          </Grid>
          <Grid item xs={4}>
            <RewardItem
              title="Plantable Seeds"
              amount={farmerSilo.seeds.earned}
              icon={seedIcon}
              titleColor="text.primary"
            />
          </Grid>
        </Grid>
        <Stack>
          <RewardItem
            title="Grown Stalk"
            amount={farmerSilo.stalk.grown}
            icon={stalkIcon}
            titleColor="text.primary"
          />
        </Stack>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <RewardItem
              title="Revitalized Stalk"
              amount={revitalizedStalk}
              icon={stalkIcon}
              titleColor="text.primary"
            />
          </Grid>
          <Grid item xs={4}>
            <RewardItem
              title="Revitalized Seed"
              amount={revitalizedSeeds}
              icon={seedIcon}
              titleColor="text.primary"
            />
          </Grid>
        </Grid>
        {open && (
          <RewardsForm>
            {(props) => (
              <ClaimRewardsContent
                open={open}
                show={show}
                hide={hide}
                {...props}
              />
            )}
          </RewardsForm>
        )}
      </Stack>
      {/* dupliate button here b/c submit button has be within formik context */}
      {!open && (
        <Button
          size="medium"
          variant="contained"
          sx={{ width: '100%', whiteSpace: 'nowrap' }}
          endIcon={!open ? <DropdownIcon open={false} /> : null}
          onClick={() => {
            if (open) {
              hide();
            } else {
              show();
            }
          }}
          disabled={breakdown.totalValue?.eq(0)}
        >
          Claim Rewards
        </Button>
      )}
    </Stack>
  );
};

const SiloRewards: React.FC<{}> = () => (
  <Module>
    <ModuleContent pt={1.5}>
      <Stack px={0.5} pb={1}>
        <Typography variant="h4">Rewards</Typography>
      </Stack>
      <RewardsContent />
    </ModuleContent>
  </Module>
);

export default SiloRewards;
