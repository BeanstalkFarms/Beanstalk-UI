import { Box, Divider, Stack } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps, useFormikContext } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import BigNumber from 'bignumber.js';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { ClaimRewardsAction } from 'lib/Beanstalk/Farm';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated/index';
import beanIcon from 'img/tokens/bean-logo-circled.svg';
import stalkIcon from 'img/beanstalk/stalk-icon.svg';
import seedIcon from 'img/beanstalk/seed-icon.svg';
import toast from 'react-hot-toast';
import { parseError } from 'util/index'; 
import { useFarmerSilo } from 'state/farmer/silo/updater';
import RewardItem from '../RewardItem';
import DescriptionButton from '../../Common/DescriptionButton';
import { AppState } from '../../../state';
import TransactionToast from '../../Common/TxnToast';

export type SendFormValues = {
  to?: string;
}

type ClaimRewardsFormValues = {
  action: ClaimRewardsAction | undefined;
}

const options = [
  {
    title: 'Mow',
    description: 'Add Grown Stalk to your Stalk balance. Mow is called upon any interaction with the Silo.',
    value: ClaimRewardsAction.MOW,
  },
  {
    title: 'Plant',
    description: 'Add Plantable Seeds to your Seed balance. Also Mows Grown Stalk.',
    value: ClaimRewardsAction.PLANT_AND_MOW,
  },
  {
    title: 'Enroot',
    description: 'Add Revitalized Stalk and Seeds to your Stalk and Seed balances. Also Mows Grown Stalk.',
    value: ClaimRewardsAction.ENROOT_AND_MOW,
  },
  {
    title: 'Claim all Silo rewards',
    description: 'Add all Stalk and Seed rewards to your Stalk and Seed balances.',
    value: ClaimRewardsAction.CLAIM_ALL,
  }
];

// When this is hovered: show hover state for these
const hoverMap = {
  [ClaimRewardsAction.MOW]: [ClaimRewardsAction.MOW],
  [ClaimRewardsAction.PLANT_AND_MOW]: [ClaimRewardsAction.MOW, ClaimRewardsAction.PLANT_AND_MOW],
  [ClaimRewardsAction.ENROOT_AND_MOW]: [ClaimRewardsAction.MOW, ClaimRewardsAction.ENROOT_AND_MOW],
  [ClaimRewardsAction.CLAIM_ALL]: [ClaimRewardsAction.MOW, ClaimRewardsAction.PLANT_AND_MOW, ClaimRewardsAction.ENROOT_AND_MOW, ClaimRewardsAction.CLAIM_ALL],
};

const ClaimRewardsForm: React.FC<FormikProps<SendFormValues>> = (props) => {
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const form = useFormikContext<ClaimRewardsFormValues>();

  /** The currently hovered action. */
  const [hoveredAction, setHoveredAction] = useState<ClaimRewardsAction | undefined>(undefined);
  /** The currently selected action (after click). */
  const selectedAction = form.values.action;

  /// Handlers
  const onMouseOver = useCallback((v: ClaimRewardsAction) => (
    () => setHoveredAction(v)
  ), []);

  const onMouseOutContainer = useCallback(() => {
    setHoveredAction(undefined);
  }, []);

  // Checks if the current hoverState includes a given ClaimRewardsAction
  const isHovering = (c: ClaimRewardsAction) => {
    if (selectedAction !== undefined) {
      return hoverMap[selectedAction].includes(c);
    }
    return hoveredAction && hoverMap[hoveredAction].includes(c);
  };

  return (
    <Stack gap={2}>
      <Stack direction={{ md: 'row', xs: 'column' }} columnGap={1} rowGap={2} justifyContent="space-between">
        {/* Earned */}
        <Stack direction="row" gap={1}>
          <RewardItem
            title="Earned Beans"
            tooltip="The number of Beans earned since your last Mow, or last interaction with the Silo. Earned Beans are already Deposited in the Silo."
            amount={farmerSilo.beans?.earned}
            isClaimable={isHovering(ClaimRewardsAction.MOW)}
            icon={beanIcon}
          />
          <RewardItem
            title="Earned Stalk"
            tooltip="The number of Stalk earned from Earned Beans. Earned Stalk automatically contribute to your Stalk ownership and do not require any action to activate them."
            amount={farmerSilo.stalk?.earned}
            isClaimable={isHovering(ClaimRewardsAction.MOW)}
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
            tooltip="The number of Seeds earned from Earned Beans. Plantable Seeds do not grow Stalk until they are Planted."
            amount={farmerSilo.seeds.plantable}
            isClaimable={isHovering(ClaimRewardsAction.PLANT_AND_MOW)}
            icon={seedIcon}
          />
          <RewardItem
            title="Grown Stalk"
            tooltip="The number of Stalk earned from Seeds. Grown Stalk does not contribute to your Stalk ownership and must be Mown to add it to your Stalk balance."
            amount={farmerSilo.stalk?.grown}
            isClaimable={isHovering(ClaimRewardsAction.MOW)}
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
            tooltip="The number of pre-exploit Stalk that has vested as a function of Fertilizer sold. Revitalized Stalk does not contribute to your Stalk ownership and must be Enrooted to add it to your Stalk balance."
            amount={new BigNumber(0)}
            isClaimable={isHovering(ClaimRewardsAction.ENROOT_AND_MOW)}
            icon={stalkIcon}
          />
          <RewardItem
            title="Revitalized Seeds"
            tooltip="The number of pre-exploit Seeds that have vested as a function of Fertilizer sold. Revitalized Seeds do not grow Stalk until they are Enrooted."
            amount={new BigNumber(0)}
            isClaimable={isHovering(ClaimRewardsAction.ENROOT_AND_MOW)}
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
                if (fieldProps.form.values.action !== undefined && v === fieldProps.form.values.action) {
                  fieldProps.form.setFieldValue('action', undefined);
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
                    forceHover={isHovering(ClaimRewardsAction.MOW)}
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
                        forceHover={isHovering(ClaimRewardsAction.PLANT_AND_MOW)}
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
                        forceHover={isHovering(ClaimRewardsAction.ENROOT_AND_MOW)}
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
                    forceHover={isHovering(ClaimRewardsAction.CLAIM_ALL)}
                    recommended
                    fullWidth
                    disableRipple
                  />
                </Stack>
              );
            }}
          </Field>
          <LoadingButton
            variant="contained"
            loading={form.isSubmitting}
            disabled={form.isSubmitting || form.values.action === undefined}
            fullWidth
            type="submit"
            size="large">
            {selectedAction === undefined ? (
              'Select Claim type'
            ) : (
              `${options[selectedAction].title}`
            )}
          </LoadingButton>
        </Stack>
      </Form>
    </Stack>

  );
};

const ClaimRewards: React.FC<{}> = () => {
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const [fetchFarmerSilo] = useFarmerSilo();

  // Form
  const initialValues: ClaimRewardsFormValues = useMemo(() => ({
    action: undefined,
  }), []);

  // Handlers
  const onSubmit = useCallback(async (values: ClaimRewardsFormValues, formActions: FormikHelpers<ClaimRewardsFormValues>) => {
    let txToast;
    try {
      if (!account?.address)  throw new Error('Connect a wallet first.');
      if (!values.action)     throw new Error('No action selected.');

      // FIXME: suggest using "call" here for consistency with other forms
      // but this is perfectly functional
      let call;
      if (values.action === ClaimRewardsAction.MOW) {
        call = beanstalk.update(account.address);
      }
      else if (values.action === ClaimRewardsAction.PLANT_AND_MOW) {
        call = beanstalk.earn(account.address);
      }
      else if (values.action === ClaimRewardsAction.ENROOT_AND_MOW) {
        // do something
        // claimResult = beanstalk.unripe
      }
      else if (values.action === ClaimRewardsAction.CLAIM_ALL) {
        call = beanstalk.farm([
          // PLANT_AND_MOW
          beanstalk.interface.encodeFunctionData('earn', [account.address]),
          // ENROOT_AND_MOW
          // beanstalk.interface.encodeFunctionData("enroot", [account.address]),
        ]);
      }

      // FIXME: set the name of the action to Mow, etc. depending on `values.action`
      txToast = new TransactionToast({
        loading: 'Claiming rewards.',
        success: 'Claim successful. You have claimed your rewards.',
      });

      if (!call) throw new Error('Unknown action.');

      const txn = await call;
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await fetchFarmerSilo();
      // if (values.action === ClaimRewards)
      txToast.success(receipt);
      formActions.resetForm();
    } catch (err) {
      txToast ? txToast.error(err) : toast.error(parseError(err));
    }
  }, [
    account?.address,
    beanstalk,
    fetchFarmerSilo
  ]);

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
