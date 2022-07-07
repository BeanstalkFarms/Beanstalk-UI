import { Box, Button, Divider, Stack } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps, useFormikContext } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import { useAccount, useSigner } from 'wagmi';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import DescriptionButton from '../../Common/DescriptionButton';
import { ClaimRewardsAction } from '../../../lib/Beanstalk/Farm';
import { useBeanstalkContract } from '../../../hooks/useContract';
import { BeanstalkReplanted } from '../../../constants/generated';
import RewardItem from '../RewardItem';
import beanIcon from '../../../img/tokens/bean-logo-circled.svg';
import stalkIcon from '../../../img/beanstalk/stalk-icon.svg';
import seedIcon from '../../../img/beanstalk/seed-icon.svg';
import { AppState } from '../../../state';
import TransactionToast from '../../Common/TxnToast';
import { displayFullBN } from '../../../util';

export type SendFormValues = {
  to?: string;
}

type ClaimRewardsFormValues = {
  action: ClaimRewardsAction | null;
}

const ClaimRewardsForm: React.FC<FormikProps<SendFormValues>> = (props) => {
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
        title: 'Claim all Silo rewards',
        description: 'Add all Stalk and Seed rewards to your Stalk and Seed balances.',
        value: ClaimRewardsAction.CLAIM_ALL,
      }]
  ), []);

  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const [hoverState, setHoverState] = useState<ClaimRewardsAction | null>(null);

  const onMouseOver = useCallback((v: ClaimRewardsAction) => (
    () => setHoverState(v)
  ), []);

  const onMouseOutContainer = useCallback(() => {
    setHoverState(null);
  }, []);

  // when this is hovered: show hover state for these
  const hoverMap: any = useMemo(() => (
    {
      [ClaimRewardsAction.MOW]: [ClaimRewardsAction.MOW],
      [ClaimRewardsAction.PLANT_AND_MOW]: [ClaimRewardsAction.MOW, ClaimRewardsAction.PLANT_AND_MOW],
      [ClaimRewardsAction.ENROOT_AND_MOW]: [ClaimRewardsAction.MOW, ClaimRewardsAction.ENROOT_AND_MOW],
      [ClaimRewardsAction.CLAIM_ALL]: [ClaimRewardsAction.MOW, ClaimRewardsAction.PLANT_AND_MOW, ClaimRewardsAction.ENROOT_AND_MOW, ClaimRewardsAction.CLAIM_ALL],
    }
  ), []);

  const actionSelected = useFormikContext<ClaimRewardsFormValues>().values.action;

  // checks if the current hoverState includes a given ClaimRewardsAction
  const showHover = (c: ClaimRewardsAction) => {
    if (actionSelected !== null) {
      return hoverMap[actionSelected].includes(c);
    }
    return hoverState && hoverMap[hoverState].includes(c);
  };

  console.log('action set', useFormikContext<ClaimRewardsFormValues>().values.action);

  return (
    <Stack gap={2}>
      <Stack direction={{ md: 'row', xs: 'column' }} columnGap={1} rowGap={2} justifyContent="space-between">
        {/* Earned */}
        <Stack direction="row" gap={1}>
          <RewardItem
            title="Earned Beans"
            tooltip="The number of Beans earned since your last interaction with the Silo. Earned Beans are automatically Deposited in the Silo."
            amount={farmerSilo.beans?.earned}
            isClaimable={showHover(ClaimRewardsAction.MOW)}
            icon={beanIcon}
          />
          <RewardItem
            title="Earned Stalk"
            tooltip="The number of Stalk earned from Earned Beans. Earned Stalk automatically contributes to total Stalk ownership."
            amount={farmerSilo.stalk?.earned}
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
            amount={farmerSilo.seeds.earned}
            isClaimable={showHover(ClaimRewardsAction.PLANT_AND_MOW)}
            icon={seedIcon}
          />
          <RewardItem
            title="Grown Stalk"
            tooltip="The number of Stalk earned from Seeds. Grown Stalk must be claimed in order for it to contribute to total Stalk ownership."
            amount={farmerSilo.stalk?.grown}
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
      <Form noValidate>
        <Stack gap={1}>
          <Field name="action">
            {(fieldProps: FieldProps<any>) => {
              const set = (v: any) => () => {
                // if user clicks on the selected action, unselect the action
                if (fieldProps.form.values.action !== null && v === fieldProps.form.values.action) {
                  fieldProps.form.setFieldValue('action', null);
                } else {
                  fieldProps.form.setFieldValue('action', v);
                }
              };
              return (
                <Stack gap={1}>
                  <DescriptionButton
                    {...options[0]}
                    key={ClaimRewardsAction.MOW}
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
                        {...options[1]}
                        key={ClaimRewardsAction.PLANT_AND_MOW}
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
                        {...options[2]}
                        key={ClaimRewardsAction.ENROOT_AND_MOW}
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
                    {...options[3]}
                    key={ClaimRewardsAction.CLAIM_ALL}
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
          <Button
            disabled={useFormikContext<ClaimRewardsFormValues>().values.action === null}
            fullWidth
            type="submit"
            variant="contained"
            size="large">
            {actionSelected === null ? (
              'Claim Selected'
            ) : (
              `${options[actionSelected].title}`
            )}
          </Button>
        </Stack>
      </Form>
    </Stack>

  );
};

const ClaimRewards: React.FC<{}> = () => {
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const beanstalk = (useBeanstalkContract(signer) as unknown) as BeanstalkReplanted;

  // Form
  const initialValues: ClaimRewardsFormValues = useMemo(() => ({
    action: null,
  }), []);

  // Handlers
  const onSubmit = useCallback((values: ClaimRewardsFormValues, formActions: FormikHelpers<ClaimRewardsFormValues>) => {
    if (!account?.address) throw new Error('Connect a wallet first.');

    if (values.action) {
      let claimResult;
      if (values.action === ClaimRewardsAction.MOW) {
        claimResult = beanstalk.update(account.address);
      }
      if (values.action === ClaimRewardsAction.PLANT_AND_MOW) {
        claimResult = beanstalk.earn(account.address);
      }
      if (values.action === ClaimRewardsAction.ENROOT_AND_MOW) {
        // do something
      }

      const txToast = new TransactionToast({
        loading: 'Claiming rewards.',
        success: 'Claim successful. You have claimed your rewards.',
      });

      if (claimResult !== undefined) {
        return claimResult
          .then((txn) => {
            txToast.confirming(txn);
            return txn.wait();
          })
          .then((receipt) => {
            txToast.success(receipt);
            formActions.resetForm();
          })
          .catch((err) => {
            console.error(
              txToast.error(err.error || err),
              {
                action: values.action,
              }
            );
          });
      }
    }
  }, [account?.address, beanstalk]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps: FormikProps<SendFormValues>) => (
        <ClaimRewardsForm
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default ClaimRewards;
