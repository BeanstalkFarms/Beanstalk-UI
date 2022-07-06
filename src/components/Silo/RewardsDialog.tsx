import React, { useCallback, useMemo, useState } from 'react';
import { Box, Dialog, DialogProps, Divider, Stack } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers } from 'formik';
import BigNumber from 'bignumber.js';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import stalkIcon from 'img/beanstalk/stalk-icon.svg';
import seedIcon from 'img/beanstalk/seed-icon.svg';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import RewardItem from './RewardItem';
import { FarmerSiloRewards } from '../../state/farmer/silo';
import { ClaimRewardsAction } from '../../lib/Beanstalk/Farm';
import DescriptionButton from '../Common/DescriptionButton';

export interface RewardDialogProps {
  /** Closes dialog */
  handleClose: any;
  beans: FarmerSiloRewards['beans'];
  stalk: FarmerSiloRewards['stalk'];
  seeds: FarmerSiloRewards['seeds'];
}

type ClaimRewardsFormValues = {
  action: ClaimRewardsAction | null;
}

const RewardsDialog: React.FC<RewardDialogProps & DialogProps> = ({
  handleClose,
  onClose,
  open,
  beans,
  stalk,
  seeds,
}) => {
  // Form
  const initialValues: ClaimRewardsFormValues = useMemo(() => ({
    action: null,
  }), []);

  const [hoverState, setHoverState] = useState<ClaimRewardsAction | null>(null);

  const onSubmit = useCallback(async (values: ClaimRewardsFormValues, formActions: FormikHelpers<ClaimRewardsFormValues>) => {
    console.log('SUBMIT');
  }, []);

  const options = useMemo(() => ([
    {
      title: 'Mow',
      description: 'Add Earned Beans, Earned Stalk, and Grown Stalk to your Silo balance.',
      value: ClaimRewardsAction.MOW,
      // icon: '🚜',
    },
    {
      title: 'Plant & Mow',
      description: 'Add Plantable Seeds to your Seed balance. Also Mows Grown Stalk.',
      value: ClaimRewardsAction.PLANT_AND_MOW,
    },
    {
      title: 'Enroot & Mow',
      description: 'Add Revitalized Stalk and Seeds to your Stalk and Seed balance. Also Mows Grown Stalk.',
      value: ClaimRewardsAction.ENROOT_AND_MOW,
    },
    {
      title: 'Claim all Silo rewards.',
      description: 'Add all Stalk and Seed rewards to your Stalk and Seed balances.',
      value: ClaimRewardsAction.CLAIM_ALL,
    }]
  ), []);

  // when this is hovered: show hover state for these
  const hoverMap: any = useMemo(() => (
    {
      [ClaimRewardsAction.MOW]: [ClaimRewardsAction.MOW],
      [ClaimRewardsAction.PLANT_AND_MOW]: [ClaimRewardsAction.MOW, ClaimRewardsAction.PLANT_AND_MOW],
      [ClaimRewardsAction.ENROOT_AND_MOW]: [ClaimRewardsAction.MOW, ClaimRewardsAction.ENROOT_AND_MOW],
      [ClaimRewardsAction.CLAIM_ALL]: [ClaimRewardsAction.MOW, ClaimRewardsAction.PLANT_AND_MOW, ClaimRewardsAction.ENROOT_AND_MOW, ClaimRewardsAction.CLAIM_ALL],
    }
  ), []);

  const onMouseOver = useCallback((v: ClaimRewardsAction) => (
    () => setHoverState(v)
  ), []);
  
  const onMouseOutContainer = useCallback(() => {
    setHoverState(null);
  }, []);

  // checks if the current hoverState includes a given ClaimRewardsAction
  const showHover = (c: ClaimRewardsAction) => (hoverState && hoverMap[hoverState].includes(c));

  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="md"
    >
      <StyledDialogTitle onClose={handleClose}>Claim Rewards</StyledDialogTitle>
      <StyledDialogContent>
        <Stack gap={2}>
          <Stack direction={{ md: 'row', xs: 'column' }} columnGap={1} rowGap={2} justifyContent="space-between">
            {/* Earned */}
            <Stack direction="row" gap={1}>
              <RewardItem
                title="Earned Beans"
                tooltip="The number of Beans earned since your last interaction with the Silo. Earned Beans are automatically Deposited in the Silo."
                amount={beans.earned}
                isClaimable={showHover(ClaimRewardsAction.MOW)}
                icon={beanIcon}
              />
              <RewardItem
                title="Earned Stalk"
                tooltip="The number of Stalk earned from Earned Beans. Earned Stalk automatically contributes to total Stalk ownership."
                amount={stalk.earned}
                isClaimable={showHover(ClaimRewardsAction.MOW)}
                icon={stalkIcon}
              />
            </Stack>
            {/* Divider */}
            <Box>
              <Divider orientation="vertical" />
            </Box>
            {/* Grown */}
            <Stack direction="row" gap={1}>
              <RewardItem
                title="Plantable Seeds"
                tooltip="The number of Seeds earned from Earned Beans. Earned Seeds do not generate Stalk until they are claimed."
                amount={seeds.earned}
                isClaimable={showHover(ClaimRewardsAction.PLANT_AND_MOW)}
                icon={seedIcon}
              />
              <RewardItem
                title="Grown Stalk"
                tooltip="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership."
                amount={stalk.grown}
                isClaimable={showHover(ClaimRewardsAction.MOW)}
                icon={stalkIcon}
              />
            </Stack>
            {/* Divider */}
            <Box>
              <Divider orientation="vertical" />
            </Box>
            {/* Revitalized */}
            <Stack direction="row" gap={1}>
              <RewardItem
                title="Revitalized Stalk"
                tooltip="The number of Seeds earned from Earned Beans. Earned Seeds do not generate Stalk until they are claimed."
                amount={new BigNumber(0)}
                isClaimable={showHover(ClaimRewardsAction.ENROOT_AND_MOW)}
                icon={stalkIcon}
              />
              <RewardItem
                title="Revitalized Seed"
                tooltip="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership."
                amount={new BigNumber(0)}
                isClaimable={showHover(ClaimRewardsAction.ENROOT_AND_MOW)}
                icon={seedIcon}
              />
            </Stack>
          </Stack>
          <Stack>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
              <Form noValidate>
                <Field name="action">
                  {(fieldProps: FieldProps<any>) => {
                    const set = (v: any) => () => {
                      fieldProps.form.setFieldValue('action', v);
                    };
                    return (
                      <Stack gap={1}>
                        <DescriptionButton
                          key={ClaimRewardsAction.MOW}
                          {...options[0]}
                          onClick={set(ClaimRewardsAction.MOW)}
                          onMouseOver={onMouseOver(ClaimRewardsAction.MOW)}
                          onMouseLeave={onMouseOutContainer}
                          forceHover={showHover(ClaimRewardsAction.MOW)}
                          fullWidth
                          disableRipple
                        />
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                          <Box width={{ xs: '100%', md: '50%' }}>
                            <DescriptionButton
                              key={ClaimRewardsAction.PLANT_AND_MOW}
                              {...options[1]}
                              onClick={set(ClaimRewardsAction.PLANT_AND_MOW)}
                              onMouseOver={onMouseOver(ClaimRewardsAction.PLANT_AND_MOW)}
                              onMouseLeave={onMouseOutContainer}
                              forceHover={showHover(ClaimRewardsAction.PLANT_AND_MOW)}
                              fullWidth
                              disableRipple
                            />
                          </Box>
                          <Box width={{ xs: '100%', md: '50%' }}>
                            <DescriptionButton
                              key={ClaimRewardsAction.ENROOT_AND_MOW}
                              {...options[2]}
                              onClick={set(ClaimRewardsAction.ENROOT_AND_MOW)}
                              onMouseOver={onMouseOver(ClaimRewardsAction.ENROOT_AND_MOW)}
                              onMouseLeave={onMouseOutContainer}
                              forceHover={showHover(ClaimRewardsAction.ENROOT_AND_MOW)}
                              fullWidth
                              disableRipple
                            />
                          </Box>
                        </Stack>
                        <DescriptionButton
                          key={ClaimRewardsAction.CLAIM_ALL}
                          {...options[3]}
                          onClick={set(ClaimRewardsAction.CLAIM_ALL)}
                          onMouseOver={onMouseOver(ClaimRewardsAction.CLAIM_ALL)}
                          onMouseLeave={onMouseOutContainer}
                          forceHover={showHover(ClaimRewardsAction.CLAIM_ALL)}
                          recommended
                          fullWidth
                          disableRipple
                        />
                      </Stack>
                    );
                  }}
                </Field>
              </Form>
            </Formik>
          </Stack>
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default RewardsDialog;
