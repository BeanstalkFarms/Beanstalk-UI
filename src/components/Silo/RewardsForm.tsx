import { Field, FieldProps, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Stack, Tooltip, useMediaQuery } from '@mui/material';
import { useSigner } from '~/hooks/ledger/useSigner';
import { ClaimRewardsAction } from '~/lib/Beanstalk/Farm';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import { parseError } from '~/util';
import {
  UNRIPE_BEAN,
  UNRIPE_BEAN_CRV3,
  UNRIPE_TOKENS,
} from '~/constants/tokens';
import useTokenMap from '~/hooks/chain/useTokenMap';
import { selectCratesForEnroot } from '~/util/Crates';
import useAccount from '~/hooks/ledger/useAccount';
import useBDV from '~/hooks/beanstalk/useBDV';
import { useFetchFarmerSilo } from '~/state/farmer/silo/updater';
import { AppState } from '~/state';
import TransactionToast from '~/components/Common/TxnToast';
import useTimedRefresh from '~/hooks/app/useTimedRefresh';
import { hoverMap } from '~/constants/silo';
import useGetChainToken from '~/hooks/chain/useGetChainToken';
import useFarmerSiloBalances from '~/hooks/farmer/useFarmerSiloBalances';
import { BeanstalkPalette } from '../App/muiTheme';
import DescriptionButton from '../Common/DescriptionButton';
import GasTag from '../Common/GasTag';

export type SendFormValues = {
  to?: string;
};

type ClaimRewardsFormValues = {
  action: ClaimRewardsAction | undefined;
};

export type ClaimCalls = {
  [key in ClaimRewardsAction]: {
    estimateGas: () => Promise<ethers.BigNumber>;
    execute: () => Promise<ethers.ContractTransaction>;
    enabled: boolean;
  };
};
export type ClaimGasResults = {
  [key in ClaimRewardsAction]?: BigNumber;
};

export type ClaimRewardsFormParams = {
  gas: ClaimGasResults | null;
  calls: ClaimCalls | null;
} & FormikProps<ClaimRewardsFormValues>;

export type RewardsFormProps = {
  open?: boolean;
  children: (props: ClaimRewardsFormParams) => React.ReactNode;
};

const RewardsForm: React.FC<RewardsFormProps> = ({ open, children }) => {
  const account = useAccount();
  const { data: signer } = useSigner();

  /// Helpers
  const unripeTokens = useTokenMap(UNRIPE_TOKENS);

  /// Farmer data
  const farmerSilo = useSelector<AppState, AppState['_farmer']['silo']>(
    (state) => state._farmer.silo
  );
  const siloBalances = farmerSilo.balances;
  const [fetchFarmerSilo] = useFetchFarmerSilo();

  // Beanstalk data
  const getBDV = useBDV();

  /// Contracts
  const beanstalk = useBeanstalkContract(signer);

  /// Form
  const initialValues: ClaimRewardsFormValues = useMemo(
    () => ({
      action: undefined,
    }),
    []
  );

  /// Gas calculations
  const [gas, setGas] = useState<ClaimGasResults | null>(null);
  const [calls, setCalls] = useState<ClaimCalls | null>(null);
  const estimateGas = useCallback(async () => {
    if (!account) return;
    if (!signer) throw new Error('No signer');

    const selectedCratesByToken = selectCratesForEnroot(
      beanstalk,
      unripeTokens,
      siloBalances,
      getBDV
    );
    const enrootData = Object.keys(selectedCratesByToken).map(
      (key) => selectedCratesByToken[key].encoded
    );

    console.debug(
      '[RewardsDialog] Selected crates: ',
      selectedCratesByToken,
      enrootData
    );

    const _calls: ClaimCalls = {
      [ClaimRewardsAction.MOW]: {
        estimateGas: () => beanstalk.estimateGas.update(account),
        execute: () => beanstalk.update(account),
        enabled: farmerSilo.stalk.grown.gt(0),
      },
      [ClaimRewardsAction.PLANT_AND_MOW]: {
        estimateGas: () => beanstalk.estimateGas.plant(),
        execute: () => beanstalk.plant(),
        enabled: farmerSilo.seeds.earned.gt(0),
      },
      [ClaimRewardsAction.ENROOT_AND_MOW]: {
        estimateGas: () =>
          beanstalk.estimateGas.farm([
            // PLANT_AND_MOW
            beanstalk.interface.encodeFunctionData('plant', undefined),
            // ENROOT_AND_MOW
            ...enrootData,
          ]),
        execute: () =>
          beanstalk.farm([
            // PLANT_AND_MOW
            beanstalk.interface.encodeFunctionData('plant', undefined),
            // ENROOT_AND_MOW
            ...enrootData,
          ]),
        enabled:
          farmerSilo.stalk.grown.gt(0) ||
          farmerSilo.seeds.earned.gt(0) ||
          enrootData.length > 0,
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
        estimateGas: () =>
          beanstalk.estimateGas.farm([
            // PLANT_AND_MOW
            beanstalk.interface.encodeFunctionData('plant', undefined),
            // ENROOT_AND_MOW
            ...enrootData,
          ]),
        execute: () =>
          beanstalk.farm([
            // PLANT_AND_MOW
            beanstalk.interface.encodeFunctionData('plant', undefined),
            // ENROOT_AND_MOW
            ...enrootData,
          ]),
        enabled:
          farmerSilo.stalk.grown.gt(0) ||
          farmerSilo.seeds.earned.gt(0) ||
          enrootData.length > 0,
      },
    };

    /// Push calls
    setCalls(_calls);

    /// For each reward type, run the estimateGas function in parallel
    /// and then match outputs to their corresponding keys.
    const keys = Object.keys(_calls);
    const _gas = await Promise.all(
      keys.map((key) => _calls[key as ClaimRewardsAction]!.estimateGas())
    ).then((results) =>
      results.reduce<Partial<ClaimGasResults>>((prev, curr, index) => {
        prev[keys[index] as ClaimRewardsAction] = new BigNumber(
          curr.toString()
        );
        return prev;
      }, {})
    );
    setGas(_gas);
  }, [
    account,
    beanstalk,
    farmerSilo.seeds.earned,
    farmerSilo.stalk.grown,
    getBDV,
    signer,
    siloBalances,
    unripeTokens,
  ]);

  useTimedRefresh(estimateGas, 20 * 1000, open);

  /// Handlers
  const onSubmit = useCallback(
    async (
      values: ClaimRewardsFormValues,
      formActions: FormikHelpers<ClaimRewardsFormValues>
    ) => {
      let txToast;
      try {
        if (!account) throw new Error('Connect a wallet first.');
        if (!values.action) throw new Error('No action selected.');
        if (!calls) throw new Error('Waiting for gas data.');

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
    },
    [account, calls, fetchFarmerSilo]
  );

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps: FormikProps<ClaimRewardsFormValues>) => (
        <>{children({ gas, calls, ...formikProps })}</>
      )}
    </Formik>
  );
};

export default RewardsForm;

export type RewardsFormContentOption = {
  title: 'Mow' | 'Plant' | 'Enroot' | string;
  description: string;
  value: ClaimRewardsAction;
  hideIfNoUnripe?: boolean;
};

export const RewardsFormField: React.FC<
  ClaimRewardsFormParams & {
    options: RewardsFormContentOption[];
  }
> = ({ submitForm, isSubmitting, values, gas, calls, options }) => {
  /// Helpers
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const getChainToken = useGetChainToken();

  /// State
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

  /// Used to grey out text in rewards bar.
  // Prioritizes selected action over hovered.
  const action =
    selectedAction !== undefined
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
              const disabled = !calls || calls[option.value].enabled === false;
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
  );
};
