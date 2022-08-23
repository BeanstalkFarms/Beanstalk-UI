import { Accordion, AccordionDetails, Box, CircularProgress, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import {
  FormState,
  SmartSubmitButton,
  TokenAdornment,
  TokenOutputField,
  TokenSelectDialog,
  TxnPreview,
  TxnSeparator
} from '~/components/Common/Form';
import { TokenSelectMode } from '~/components/Common/Form/TokenSelectDialog';
import StyledAccordionSummary from '~/components/Common/Accordion/AccordionSummary';
import TokenInputField from '~/components/Common/Form/TokenInputField';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import TransactionToast from '~/components/Common/TxnToast';
import FarmModeField from '~/components/Common/Form/FarmModeField';
import Token, { ERC20Token, NativeToken } from '~/classes/Token';
import { Beanstalk } from '~/generated/index';
import useToggle from '~/hooks/display/useToggle';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import useFarmerBalances from '~/hooks/farmer/useFarmerBalances';
import useTokenMap from '~/hooks/chain/useTokenMap';
import { useSigner } from '~/hooks/ledger/useSigner';
import useChainId from '~/hooks/chain/useChainId';
import useAccount from '~/hooks/ledger/useAccount';
import usePreferredToken, { PreferredToken } from '~/hooks/farmer/usePreferredToken';
import { optimizeFromMode } from '~/util/Farm';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import { ActionType } from '~/util/Actions';
import { displayBN, displayFullBN, getChainConstant, parseError, toStringBaseUnitBN } from '~/util';
import { BEAN, BEAN_CRV3_LP, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from '~/constants/tokens';
import { NEW_BN, ZERO_BN } from '~/constants';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';
import { AppState } from '~/state';
import useChopPenalty from '~/hooks/beanstalk/useChopPenalty';

type ChopFormValues = FormState & {
  destination: FarmToMode | undefined;
};

const ChopForm: React.FC<
  FormikProps<ChopFormValues> & {
    balances: ReturnType<typeof useFarmerBalances>;
    beanstalk: Beanstalk;
  }
> = ({
  values,
  setFieldValue,
  balances,
  beanstalk,
}) => {
  const chainId = useChainId();
  const erc20TokenMap = useTokenMap<ERC20Token | NativeToken>([UNRIPE_BEAN, UNRIPE_BEAN_CRV3]);
  const [isTokenSelectVisible, showTokenSelect, hideTokenSelect] = useToggle();

  /// Maps an unripe token to its output token
  const tokenOutputMap = {
    [getChainConstant(UNRIPE_BEAN, chainId).address]:      getChainConstant(BEAN, chainId),
    [getChainConstant(UNRIPE_BEAN_CRV3, chainId).address]: getChainConstant(BEAN_CRV3_LP, chainId),
  };

  /// Derived values
  const state          = values.tokens[0];
  const inputToken     = state.token;
  const tokenBalance   = balances[inputToken.address];
  const outputToken    = tokenOutputMap[inputToken.address];

  /// Chop Penalty  = 99% <-> Chop Rate     = 0.01
  const chopPenalty = useChopPenalty(inputToken.address);
  const chopRates   = useSelector<AppState, AppState['_bean']['unripe']['chopRates']>((_state) => _state._bean.unripe.chopRates);
  const amountOut   = state.amount?.multipliedBy(chopRates[inputToken.address] || ZERO_BN);

  ///
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    // If the user has typed some existing values in,
    // save them. Add new tokens to the end of the list.
    // FIXME: match sorting of erc20TokenList
    const copy = new Set(_tokens);
    const newValue = values.tokens.filter((x) => {
      copy.delete(x.token);
      return _tokens.has(x.token);
    });
    setFieldValue('tokens', [
      ...newValue,
      ...Array.from(copy).map((_token) => ({ 
        token: _token, 
        amount: undefined // balances[_token.address]?.total || 
      })),
    ]);
  }, [values.tokens, setFieldValue]);

  const isSubmittable = (
    amountOut?.gt(0)
    && values.destination
  );

  return (
    <Form autoComplete="off">
      <TokenSelectDialog
        open={isTokenSelectVisible}
        handleClose={hideTokenSelect}
        handleSubmit={handleSelectTokens}
        selected={values.tokens}
        balances={balances}
        tokenList={Object.values(erc20TokenMap)}
        mode={TokenSelectMode.SINGLE}
      />
      <Stack gap={1}>
        <TokenInputField
          token={inputToken}
          balance={tokenBalance || ZERO_BN}
          name="tokens.0.amount"
          // MUI 
          fullWidth
          InputProps={{
            endAdornment: (
              <TokenAdornment
                token={inputToken}
                onClick={showTokenSelect}
              />
            )
          }}
        />
        <Stack gap={0.5}>
          <FarmModeField
            name="destination"
          />
          <Stack direction="row" justifyContent="space-between" px={0.5}>
            <Typography variant="body1" color="gray">Chop Penalty</Typography>
            {chopPenalty === NEW_BN ? (
              <CircularProgress size={16} thickness={5} sx={{ color: BeanstalkPalette.washedRed }} />
            ) : (
              <Typography variant="body1" color={BeanstalkPalette.washedRed}>{displayFullBN(chopPenalty, 5)}%</Typography>
            )}
          </Stack>
        </Stack>
        {isSubmittable ? (
          <>
            <TxnSeparator />
            <TokenOutputField
              token={outputToken}
              amount={amountOut || ZERO_BN}
            />
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: `Chop ${displayBN(state.amount || ZERO_BN)} ${inputToken}.`
                      },
                      {
                        type: ActionType.BASE,
                        message: `Add ${displayBN(amountOut || ZERO_BN)} ${outputToken} to the balance selected in the Destination field.`
                      },
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </>
        ) : null}
        <SmartSubmitButton
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={!isSubmittable}
          contract={beanstalk}
          tokens={values.tokens}
          mode="auto"
        >
          Chop
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const PREFERRED_TOKENS : PreferredToken[] = [
  {
    token: UNRIPE_BEAN,
    minimum: new BigNumber(1),
  },
  {
    token: UNRIPE_BEAN_CRV3,
    minimum: new BigNumber(1),
  }
];

const Chop: React.FC<{}> = () => {
  ///
  const account           = useAccount();
  const { data: signer }  = useSigner();
  const beanstalk         = useBeanstalkContract(signer);

  ///
  const baseToken         = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const farmerBalances    = useFarmerBalances();
  const [refetchFarmerBalances] = useFetchFarmerBalances();

  // Form setup
  const initialValues: ChopFormValues = useMemo(() => ({
    tokens: [
      {
        token:  baseToken as ERC20Token,
        amount: undefined,
      },
    ],
    destination: FarmToMode.INTERNAL,
  }), [baseToken]);

  const onSubmit = useCallback(
    async (
      values: ChopFormValues,
      formActions: FormikHelpers<ChopFormValues>
    ) => {
      let txToast;
      try {
        if (!account) throw new Error('Connect a wallet first.');
        if (!values.destination) throw new Error('No destination selected.');
        const state = values.tokens[0];
        if (!state.amount?.gt(0)) throw new Error('No Unfertilized token to Chop.');

        txToast = new TransactionToast({
          loading: `Chopping ${displayFullBN(state.amount)} ${state.token.symbol}...`,
          success: 'Chop successful.',
        });

        const txn = await beanstalk.chop(
          state.token.address,
          toStringBaseUnitBN(state.amount, state.token.decimals),
          optimizeFromMode(state.amount, farmerBalances[state.token.address]),
          values.destination
        );
        txToast.confirming(txn);

        const receipt = await txn.wait();
        await Promise.all([refetchFarmerBalances()]); // should we also refetch the penalty?
        txToast.success(receipt);
        formActions.resetForm();
      } catch (err) {
        txToast ? txToast.error(err) : toast.error(parseError(err));
        formActions.setSubmitting(false);
      }
    },
    [
      account,
      beanstalk,
      refetchFarmerBalances,
      farmerBalances,
    ]
  );

  return (
    <Formik<ChopFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<ChopFormValues>) => (
        <ChopForm
          balances={farmerBalances}
          beanstalk={beanstalk}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Chop;
