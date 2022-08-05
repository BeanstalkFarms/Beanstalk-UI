import { Box, Dialog, Stack, Tooltip } from '@mui/material';
import { Field, FieldProps, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import { useProvider } from 'wagmi';
import { LoadingButton } from '@mui/lab';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import GasTag from '~/components/Common/GasTag';
import { StyledDialogActions, StyledDialogContent, StyledDialogTitle } from '~/components/Common/Dialog';
import { useSigner } from '~/hooks/ledger/useSigner';
import { ClaimRewardsAction } from '~/lib/Beanstalk/Farm';
import { useBeanstalkContract } from '~/hooks/useContract';
import { parseError } from '~/util/index'; 
import { UNRIPE_TOKENS } from '~/constants/tokens';
import useTokenMap from '~/hooks/useTokenMap';
import { selectCratesForEnroot } from '~/util/Crates';
import useAccount from '~/hooks/ledger/useAccount';
import useTimedRefresh from '~/hooks/useTimedRefresh';
import useBDV from '~/hooks/useBDV';
import { useFetchFarmerSilo } from '~/state/farmer/silo/updater';
import { AppState } from '~/state';
import TransactionToast from '../Common/TxnToast';
import DescriptionButton from '../Common/DescriptionButton';
import RewardsBar, { RewardsBarProps } from './RewardsBar';
import { hoverMap } from '../../constants/silo';
import { BeanstalkPalette } from '../App/muiTheme';

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
    description: 'Add Plantable Seeds to your Seed balance. Also Mows Grown Stalk, claims Earned Beans and claims Earned Stalk.',
    value: ClaimRewardsAction.PLANT_AND_MOW,
  },
  {
    title: 'Enroot',
    description: 'Add Revitalized Stalk and Seeds to your Stalk and Seed balances. Also Mows Grown Stalk.',
    value: ClaimRewardsAction.ENROOT_AND_MOW,
  },
  {
    title: 'Claim all Silo Rewards',
    description: 'Add all Stalk and Seed rewards to your Stalk and Seed balances.',
    value: ClaimRewardsAction.CLAIM_ALL,
  }
];

type ClaimCalls = {
  [key in ClaimRewardsAction] : { 
    estimateGas: () => Promise<ethers.BigNumber>;
    execute: () => Promise<ethers.ContractTransaction>;
    enabled: boolean;
  }
};
type ClaimGasResults = {
  [key in ClaimRewardsAction]? : BigNumber
};

// ------------------------------------------

const ClaimRewardsForm : React.FC<
  FormikProps<ClaimRewardsFormValues>
  & RewardsBarProps
  & {
    gas: ClaimGasResults | null;
    calls: ClaimCalls | null;
  }
> = ({
  submitForm,
  isSubmitting,
  values,
  gas,
  calls,
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

  /// Used to grey out text in rewards bar.
  // Prioritizes selected action over hovered.
  const action = selectedAction !== undefined
    ? selectedAction
    : hoveredAction !== undefined
      ? hoveredAction
      : undefined;

  return (
    <>
      <StyledDialogContent sx={{ pb: 0 }}>
        <Stack gap={1.5}>
          <Box px={1} py={0.5}>
            <RewardsBar
              compact
              action={action}
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
                  {options.map((option) => {
                    const disabled = !calls || calls[option.value].enabled === false;
                    const hovered = isHovering(option.value) && !disabled;
                    return (
                      <Tooltip title={!disabled ? '' : 'Nothing to claim'}>
                        <div>
                          <DescriptionButton
                            key={option.value}
                            title={option.title}
                            description={`${option.description}`}
                            tag={<GasTag gasLimit={gas?.[option.value] || null} />}
                            // Button
                            fullWidth
                            onClick={set(option.value)}
                            onMouseOver={onMouseOver(option.value)}
                            onMouseLeave={onMouseOutContainer}
                            selected={hovered}
                            disabled={disabled}
                            sx={{
                              '&:disabled': {
                                borderColor: BeanstalkPalette.lightGrey,
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
  /// Wallet
  const account           = useAccount();
  const { data: signer }  = useSigner();
  const provider          = useProvider();
  
  /// Helpers
  const unripeTokens      = useTokenMap(UNRIPE_TOKENS);
  
  /// Farmer data
  const farmerSilo        = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const siloBalances      = farmerSilo.balances;
  const [fetchFarmerSilo] = useFetchFarmerSilo();

  // Beanstalk data
  const getBDV = useBDV();
  
  /// Contracts
  const beanstalk         = useBeanstalkContract(signer);

  /// Form
  const initialValues: ClaimRewardsFormValues = useMemo(() => ({
    action: undefined,
  }), []);

  /// Gas calculations
  const [gas,   setGas]   = useState<ClaimGasResults | null>(null);
  const [calls, setCalls] = useState<ClaimCalls | null>(null);
  const estimateGas = useCallback(async () => {
    if (!account) return;
    if (!signer) throw new Error('No signer');

    const selectedCratesByToken  = selectCratesForEnroot(beanstalk, unripeTokens, siloBalances, getBDV);
    const encodedData = Object.keys(selectedCratesByToken).map((key) => selectedCratesByToken[key].encoded);

    console.debug('[RewardsDialog] Selected crates: ', selectedCratesByToken);

    const _calls : ClaimCalls = {
      [ClaimRewardsAction.MOW]: {
        estimateGas: () => beanstalk.estimateGas.update(account),
        execute: () => beanstalk.update(account),
        enabled: farmerSilo.stalk.grown.gt(0),
      },
      [ClaimRewardsAction.PLANT_AND_MOW]: {
        estimateGas: () => beanstalk.estimateGas.plant(),
        execute: () => beanstalk.plant(),
        enabled: farmerSilo.seeds.plantable.gt(0),
      },
      [ClaimRewardsAction.ENROOT_AND_MOW]: (
        encodedData.length > 1
          ? {
            estimateGas: () => beanstalk.estimateGas.farm(encodedData),
            execute: () => beanstalk.farm(encodedData),
            enabled: true,
          }
          : {
            estimateGas: () => provider.estimateGas(
              signer.checkTransaction({
                to: beanstalk.address,
                data: encodedData[0],
              })
            ),
            execute: () => signer.sendTransaction({
              to: beanstalk.address,
              data: encodedData[0],
            }),
            enabled: encodedData.length > 0,
          }
      ),
      [ClaimRewardsAction.CLAIM_ALL]: {
        estimateGas: () => beanstalk.estimateGas.farm([
          // PLANT_AND_MOW
          beanstalk.interface.encodeFunctionData('plant', undefined),
          // ENROOT_AND_MOW
          ...encodedData,
        ]),
        execute: () => beanstalk.farm([
          // PLANT_AND_MOW
          beanstalk.interface.encodeFunctionData('plant', undefined),
          // ENROOT_AND_MOW
          ...encodedData,
        ]),
        enabled: (
          farmerSilo.stalk.grown.gt(0)
          || farmerSilo.seeds.plantable.gt(0)
          || encodedData.length > 0
        ),
      },
    };

    /// Push calls
    setCalls(_calls);
    
    /// For each reward type, run the estimateGas function in parallel
    /// and then match outputs to their corresponding keys.
    const keys = Object.keys(_calls);
    const _gas = await Promise.all(
      keys.map((key) => _calls[key as ClaimRewardsAction]!.estimateGas())
    ).then((results) => results.reduce<Partial<ClaimGasResults>>(
      (prev, curr, index) => {
        prev[keys[index] as ClaimRewardsAction] = new BigNumber(curr.toString());
        return prev;
      },
      {}
    ));
    setGas(_gas);
  }, [account, beanstalk, farmerSilo.seeds.plantable, farmerSilo.stalk.grown, getBDV, provider, signer, siloBalances, unripeTokens]);

  useTimedRefresh(estimateGas, 20 * 1000, open);

  /// Handlers
  const onSubmit = useCallback(async (values: ClaimRewardsFormValues, formActions: FormikHelpers<ClaimRewardsFormValues>) => {
    let txToast;
    try {
      if (!account)  throw new Error('Connect a wallet first.');
      if (!values.action)     throw new Error('No action selected.');
      if (!calls)    throw new Error('Waiting for gas data.');

      const call = calls[values.action];

      // FIXME: set the name of the action to Mow, etc. depending on `values.action`
      txToast = new TransactionToast({
        loading: 'Claiming rewards.',
        success: 'Claim successful. You have claimed your rewards.',
      });

      if (!call) throw new Error('Unknown action.');

      const txn = await call.execute();
      txToast.confirming(txn);

      const receipt = await txn.wait();
      await fetchFarmerSilo();
      txToast.success(receipt);
      formActions.resetForm();
    } catch (err) {
      txToast ? txToast.error(err) : toast.error(parseError(err));
    }
  }, [account, calls, fetchFarmerSilo]);

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
            gas={gas}
            calls={calls}
            {...formikProps}
            {...rewardsBarProps}
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default RewardsDialog;
