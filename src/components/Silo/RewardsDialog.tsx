import React, { useCallback, useMemo } from 'react';
import { Box, Dialog, DialogProps, Divider, Stack } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers } from 'formik';
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
              />
              <RewardItem
                title="Earned Stalk"
                tooltip="The number of Stalk earned from Earned Beans. Earned Stalk automatically contributes to total Stalk ownership."
                amount={stalk.earned}
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
              />
              <RewardItem
                title="Grown Stalk"
                tooltip="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership."
                amount={stalk.grown}
              />
            </Stack>
            {/* Divider */}
            <Box>
              <Divider orientation="vertical" />
            </Box>
            {/* Grown */}
            <Stack direction="row" gap={1}>
              <RewardItem
                title="Revitalized Stalk"
                tooltip="The number of Seeds earned from Earned Beans. Earned Seeds do not generate Stalk until they are claimed."
                amount={seeds.earned}
              />
              <RewardItem
                title="Revitalized Seed"
                tooltip="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership."
                amount={stalk.grown}
              />
            </Stack>
          </Stack>
          {/* goes here */}
          <Stack>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
              {(formikProps) => (
                <>
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
                              fullWidth
                              disableRipple
                            />
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                              <Box width={{ xs: '100%', md: '50%' }}>
                                <DescriptionButton
                                  key={ClaimRewardsAction.PLANT_AND_MOW}
                                  {...options[1]}
                                  onClick={set(ClaimRewardsAction.PLANT_AND_MOW)}
                                  fullWidth
                                  disableRipple
                                />
                              </Box>
                              <Box width={{ xs: '100%', md: '50%' }}>
                                <DescriptionButton
                                  key={ClaimRewardsAction.PLANT_AND_MOW}
                                  {...options[2]}
                                  onClick={set(ClaimRewardsAction.PLANT_AND_MOW)}
                                  fullWidth
                                  disableRipple
                                />
                              </Box>
                            </Stack>
                            <DescriptionButton
                              key={ClaimRewardsAction.CLAIM_ALL}
                              {...options[3]}
                              onClick={set(ClaimRewardsAction.CLAIM_ALL)}
                              fullWidth
                              disableRipple
                            />
                          </Stack>
                        );
                      }}
                    </Field>
                  </Form>
                </>
              )}
            </Formik>
          </Stack>
        </Stack>
      </StyledDialogContent>
    </Dialog>
  );
};

export default RewardsDialog;
