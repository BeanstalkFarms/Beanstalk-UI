import { Box, Dialog, Stack, Tooltip, useMediaQuery } from '@mui/material';
import { Field, FieldProps, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import GasTag from '~/components/Common/GasTag';
import { StyledDialogActions, StyledDialogContent, StyledDialogTitle } from '~/components/Common/Dialog';
import { useSigner } from '~/hooks/ledger/useSigner';
import { ClaimRewardsAction } from '~/lib/Beanstalk/Farm';
import { useBeanstalkContract } from '~/hooks/useContract';
import { parseError } from '~/util'; 
import { UNRIPE_BEAN, UNRIPE_BEAN_CRV3, UNRIPE_TOKENS } from '~/constants/tokens';
import useTokenMap from '~/hooks/useTokenMap';
import { selectCratesForEnroot } from '~/util/Crates';
import useAccount from '~/hooks/ledger/useAccount';
import useBDV from '~/hooks/useBDV';
import { useFetchFarmerSilo } from '~/state/farmer/silo/updater';
import { AppState } from '~/state';
import TransactionToast from '../Common/TxnToast';
import DescriptionButton from '../Common/DescriptionButton';
import RewardsBar, { RewardsBarProps } from './RewardsBar';
import { hoverMap } from '../../constants/silo';
import { BeanstalkPalette } from '../App/muiTheme';
import useTimedRefresh from '~/hooks/useTimedRefresh';
import useFarmerSiloBalances from '~/hooks/useFarmerSiloBalances';
import useGetChainToken from '~/hooks/useGetChainToken';

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
    description: 'Add Plantable Seeds to your Seed balance. Also Mows Grown Stalk, Deposits Earned Beans and claims Earned Stalk.',
    value: ClaimRewardsAction.PLANT_AND_MOW,
  },
  {
    title: 'Enroot',
    description: 'Add Revitalized Stalk and Seeds to your Stalk and Seed balances, respectively. Also Mows Grown Stalk.',
    value: ClaimRewardsAction.ENROOT_AND_MOW,
    hideIfNoUnripe: true
  },
  {
    title: 'Claim all Silo Rewards',
    description: 'Mow, Plant and Enroot.',
    value: ClaimRewardsAction.CLAIM_ALL,
    hideIfNoUnripe: true
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
  /// Helpers
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const getChainToken = useGetChainToken();

  /// State
  const balances = useFarmerSiloBalances();

  /// The currently hovered action.
  const [hoveredAction, setHoveredAction] = useState<ClaimRewardsAction | undefined>(undefined);
  /// The currently selected action (after click).
  const selectedAction = values.action;

  /// Calculate Unripe Silo Balance
  const urBean      = getChainToken(UNRIPE_BEAN);
  const urBeanCrv3  = getChainToken(UNRIPE_BEAN_CRV3);
  const unripeDepositedBalance = balances[urBean.address]?.deposited.amount
    .plus(balances[urBeanCrv3.address]?.deposited.amount);

  /// Handlers
  const onMouseOver = useCallback((v: ClaimRewardsAction) => () => setHoveredAction(v), []);
  const onMouseOutContainer = useCallback(() => setHoveredAction(undefined), []);

  /// Used to grey out text in rewards bar.
  // Prioritizes selected action over hovered.
  const action = selectedAction !== undefined
    ? selectedAction
    : hoveredAction !== undefined
      ? hoveredAction
      : undefined;

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
              action={action}
              hideRevitalized={unripeDepositedBalance.eq(0)}
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
                    /// hide this option if user has no deposited unripe assets
                    if (unripeDepositedBalance?.eq(0) && option.hideIfNoUnripe) return null;
                    const disabled = !calls || calls[option.value].enabled === false;
                    const hovered = isHovering(option.value) && !disabled;
                    return (
                      <Tooltip title={!disabled || isMobile ? '' : 'Nothing to claim'}>
                        <div>
                          <DescriptionButton
                            key={option.value}
                            title={option.title}
                            description={isMobile ? undefined : `${option.description}`}
                            tooltipTitle={isMobile ? `${option.description}` : undefined}
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

  /// Helpers
  const unripeTokens      = useTokenMap(UNRIPE_TOKENS);
  
  /// Farmer data
  const farmerSilo        = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const siloBalances      = farmerSilo.balances;
  const [fetchFarmerSilo] = useFetchFarmerSilo();

  // Beanstalk data
  const getBDV = useBDV();
  
  /// Contracts
  const beanstalk = useBeanstalkContract(signer);

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
    const enrootData = Object.keys(selectedCratesByToken).map((key) => selectedCratesByToken[key].encoded);

    console.debug('[RewardsDialog] Selected crates: ', selectedCratesByToken, enrootData);

    const _calls : ClaimCalls = {
      [ClaimRewardsAction.MOW]: {
        estimateGas: () => beanstalk.estimateGas.update(account),
        execute:     () => beanstalk.update(account),
        enabled:     farmerSilo.stalk.grown.gt(0),
      },
      [ClaimRewardsAction.PLANT_AND_MOW]: {
        estimateGas: () => beanstalk.estimateGas.plant(),
        execute:     () => beanstalk.plant(),
        enabled:     farmerSilo.seeds.plantable.gt(0),
      },
      [ClaimRewardsAction.ENROOT_AND_MOW]: {
        estimateGas: () => beanstalk.estimateGas.farm([
          // PLANT_AND_MOW
          beanstalk.interface.encodeFunctionData('plant', undefined),
          // ENROOT_AND_MOW
          ...enrootData,
        ]),
        execute: () => beanstalk.farm([
          // PLANT_AND_MOW
          beanstalk.interface.encodeFunctionData('plant', undefined),
          // ENROOT_AND_MOW
          ...enrootData,
        ]),
        enabled: (
          farmerSilo.stalk.grown.gt(0)
          || farmerSilo.seeds.plantable.gt(0)
          || enrootData.length > 0
        ),
      },
      /* (
        enrootData.length > 1
          /// use `farm()` if multiple crates
          ? {
            estimateGas: () => beanstalk.estimateGas.farm(enrootData),
            execute:     () => beanstalk.farm(enrootData),
            enabled:     true,
          }
          /// send raw transaction if single crate
          /// we use this method because `selectCratesForEnroot`
          /// returns encoded function data
          : {
            estimateGas: () => provider.estimateGas(
              signer.checkTransaction({
                to: beanstalk.address,
                data: enrootData[0],
              })
            ),
            execute: () => signer.sendTransaction({
              to: beanstalk.address,
              data: enrootData[0],
            }),
            enabled: enrootData.length > 0,
          }
      ), */
      [ClaimRewardsAction.CLAIM_ALL]: {
        estimateGas: () => beanstalk.estimateGas.farm([
          // PLANT_AND_MOW
          beanstalk.interface.encodeFunctionData('plant', undefined),
          // ENROOT_AND_MOW
          ...enrootData,
        ]),
        execute: () => beanstalk.farm([
          // PLANT_AND_MOW
          beanstalk.interface.encodeFunctionData('plant', undefined),
          // ENROOT_AND_MOW
          ...enrootData,
        ]),
        enabled: (
          farmerSilo.stalk.grown.gt(0)
          || farmerSilo.seeds.plantable.gt(0)
          || enrootData.length > 0
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
  }, [account, beanstalk, farmerSilo.seeds.plantable, farmerSilo.stalk.grown, getBDV, signer, siloBalances, unripeTokens]);

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
      // PaperProps={{
      //   sx: {
      //     width: '550px'
      //   }
      // }}
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
