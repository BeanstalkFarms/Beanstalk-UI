import { Box, Dialog, Stack } from '@mui/material';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps, useFormikContext } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { useSigner } from 'hooks/ledger/useSigner';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { ClaimRewardsAction } from 'lib/Beanstalk/Farm';
import { useBeanstalkContract } from 'hooks/useContract';
import { BeanstalkReplanted } from 'generated/index';
import toast from 'react-hot-toast';
import { parseError } from 'util/index'; 
import { useFetchFarmerSilo } from 'state/farmer/silo/updater';
import useRevitalized from 'hooks/useRevitalized';
import useFarmerSiloBalances from 'hooks/useFarmerSiloBalances';
import useGetChainToken from 'hooks/useGetChainToken';
import { UNRIPE_TOKENS } from 'constants/tokens';
import useTokenMap from 'hooks/useTokenMap';
import { encodeCratesForEnroot } from 'util/Crates';
import { StyledDialogActions, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import TransactionToast from '../Common/TxnToast';
import { AppState } from '../../state';
import DescriptionButton from '../Common/DescriptionButton';
import RewardsBar, { RewardsBarProps } from './RewardsBar';

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

const hoverMap = {
  [ClaimRewardsAction.MOW]:             [ClaimRewardsAction.MOW],
  [ClaimRewardsAction.PLANT_AND_MOW]:   [ClaimRewardsAction.MOW, ClaimRewardsAction.PLANT_AND_MOW],
  [ClaimRewardsAction.ENROOT_AND_MOW]:  [ClaimRewardsAction.MOW, ClaimRewardsAction.ENROOT_AND_MOW],
  [ClaimRewardsAction.CLAIM_ALL]:       [ClaimRewardsAction.MOW, ClaimRewardsAction.PLANT_AND_MOW, ClaimRewardsAction.ENROOT_AND_MOW, ClaimRewardsAction.CLAIM_ALL],
};

// ------------------------------------------

const ClaimRewardsForm : React.FC<
  FormikProps<ClaimRewardsFormValues>
  & RewardsBarProps
> = ({
  submitForm,
  isSubmitting,
  values,
  ...rewardsBarProps
}) => {
  /** The currently hovered action. */
  const [hoveredAction, setHoveredAction] = useState<ClaimRewardsAction | undefined>(undefined);
  /** The currently selected action (after click). */
  const selectedAction = values.action;

  /// Handlers
  const onMouseOver = useCallback((v: ClaimRewardsAction) => () => setHoveredAction(v), []);
  const onMouseOutContainer = useCallback(() => setHoveredAction(undefined), []);
  // Checks if the current hoverState includes a given ClaimRewardsAction
  const isHovering = (c: ClaimRewardsAction) => {
    if (selectedAction !== undefined) {
      return hoverMap[selectedAction].includes(c);
    }
    return hoveredAction && hoverMap[hoveredAction].includes(c);
  };

  return (
    <>
      <StyledDialogContent sx={{ pb: 0 }}>
        <Stack gap={1.5}>
          <Box px={1} py={0.5}>
            <RewardsBar
              compact
              {...rewardsBarProps}
            />
          </Box>
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
        </Stack>
      </StyledDialogContent>
      <StyledDialogActions>
        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          loading={isSubmitting}
          disabled={isSubmitting || values.action === undefined}
          onClick={submitForm}
        >
          {selectedAction === undefined ? (
            'Select Claim type'
          ) : (
            `${options[selectedAction].title}`
          )}
        </LoadingButton>
      </StyledDialogActions>
    </>
  );
};

const RewardsDialog: React.FC<RewardsBarProps & {
  handleClose: () => void;
  open: boolean;
}> = ({
  handleClose,
  open,
  ...rewardsBarProps
}) => {
  /// Helpers
  const getChainToken     = useGetChainToken();
  const unripeTokens      = useTokenMap(UNRIPE_TOKENS);

  /// Wallet
  const { data: account } = useAccount();
  const { data: signer }  = useSigner();
  const provider          = useProvider();
  
  /// Farmer data
  const revitalized       = useRevitalized();
  const siloBalances      = useFarmerSiloBalances();
  const [fetchFarmerSilo] = useFetchFarmerSilo();
  
  /// Contracts
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  /// Form
  const initialValues: ClaimRewardsFormValues = useMemo(() => ({
    action: undefined,
  }), []);

  /// Handlers
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
        const encodedDataByToken  = encodeCratesForEnroot(beanstalk, unripeTokens, siloBalances);
        const encodedData         = Object.values(encodedDataByToken);

        /// If enrooting across multiple tokens, use the Farm function
        if (encodedData.length > 0) {
          call = beanstalk.farm(encodedData);
        }
        
        /// Send a single raw transaction with the lone piece of encoded
        /// function data; this is more gas efficient than a farm() call
        else {
          if (!signer) throw new Error('No signer');
          call = provider.sendTransaction(
            signer.signTransaction({
              to: beanstalk.address,
              data: encodedData[0],
            })
          );
        }
      }

      else if (values.action === ClaimRewardsAction.CLAIM_ALL) {
        const encodedDataByToken  = encodeCratesForEnroot(beanstalk, unripeTokens, siloBalances);
        const encodedData         = Object.values(encodedDataByToken);
        call = beanstalk.farm([
          // PLANT_AND_MOW
          beanstalk.interface.encodeFunctionData('earn', [account.address]),
          // ENROOT_AND_MOW
          ...encodedData,
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
    fetchFarmerSilo,
    provider,
    signer,
    siloBalances,
    unripeTokens,
  ]);

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      fullWidth
      maxWidth="md"
    >
      <StyledDialogTitle onClose={handleClose}>Claim Rewards</StyledDialogTitle>
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {(formikProps: FormikProps<ClaimRewardsFormValues>) => (
          <ClaimRewardsForm
            {...formikProps}
            {...rewardsBarProps}
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default RewardsDialog;
