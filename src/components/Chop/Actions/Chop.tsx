import { Accordion, AccordionDetails, Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormState,
  SettingInput,
  SmartSubmitButton,
  TokenAdornment,
  TokenOutputField,
  TokenSelectDialog,
  TxnPreview,
  TxnSeparator,
  TxnSettings
} from 'components/Common/Form';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import { BeanstalkReplanted } from 'generated/index';
import { ZERO_BN } from 'constants/index';
import { BEAN, BEAN_CRV3_LP, UNRIPE_BEAN, UNRIPE_BEAN_CRV3 } from 'constants/tokens';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useTokenMap from 'hooks/useTokenMap';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { displayBN, displayFullBN, getChainConstant, parseError, toStringBaseUnitBN } from 'util/index';
import { useSigner } from 'hooks/ledger/useSigner';
import toast from 'react-hot-toast';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { ActionType } from 'util/Actions';
import TokenInputField from 'components/Common/Form/TokenInputField';
import { BeanstalkPalette } from 'components/App/muiTheme';
import useChainId from 'hooks/useChain';
import TransactionToast from 'components/Common/TxnToast';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import DestinationField from 'components/Field/DestinationField';
import useAccount from 'hooks/ledger/useAccount';
import { useFetchFarmerBalances } from 'state/farmer/balances/updater';
import usePreferredToken, { PreferredToken } from 'hooks/usePreferredToken';
import { optimizeFromMode } from 'util/Farm';

type ChopFormValues = FormState & {
  destination: FarmToMode;
};

const ChopForm: React.FC<
  FormikProps<ChopFormValues> & {
    balances: ReturnType<typeof useFarmerBalances>;
    beanstalk: BeanstalkReplanted;
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
  const penalties = useSelector<AppState, AppState['_bean']['unripe']>((state) => state._bean.unripe);

  /// Maps an unripe token to its output token
  const tokenOutputMap = {
    [getChainConstant(UNRIPE_BEAN, chainId).address]:      getChainConstant(BEAN, chainId),
    [getChainConstant(UNRIPE_BEAN_CRV3, chainId).address]: getChainConstant(BEAN_CRV3_LP, chainId),
  };

  /// Derived values
  const state          = values.tokens[0];
  const inputToken     = state.token;
  const tokenBalance   = balances[inputToken.address];
  const chopPenalty    = penalties.penalties[inputToken.address];
  const outputToken    = tokenOutputMap[inputToken.address];
  const amountOut      = state.amount?.multipliedBy(chopPenalty);
  const displayPenalty = new BigNumber(1).minus(chopPenalty).multipliedBy(100);

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

  const isValid = (
    amountOut?.gt(0)
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
          <DestinationField
            name="destination"
          />
          <Stack direction="row" justifyContent="space-between" px={0.5}>
            <Typography variant="body1" color="gray">Chop Penalty</Typography>
            <Typography variant="body1" color={BeanstalkPalette.washedRed}>{displayFullBN(displayPenalty, 5)}%</Typography>
          </Stack>
        </Stack>
        {isValid ? (
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
                        message: `Chop ${displayBN(state.amount || ZERO_BN)} ${inputToken}`
                      },
                      {
                        type: ActionType.BASE,
                        message: `Receive ${displayBN(amountOut || ZERO_BN)} ${outputToken}`
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
          disabled={!isValid}
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
  const beanstalk         = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  ///
  const baseToken         = usePreferredToken(PREFERRED_TOKENS, 'use-best');
  const farmerBalances    = useFarmerBalances();
  const [refetchFarmerBalances] = useFetchFarmerBalances();

  // Form setup
  const initialValues: ChopFormValues = useMemo(() => ({
    tokens: [
      {
        token:  baseToken as ERC20Token,
        amount: null,
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
        const state = values.tokens[0];
        if (!state.amount?.gt(0)) { throw new Error('No Unfertilized token to Chop.'); }

        txToast = new TransactionToast({
          loading: `Chopping ${displayFullBN(state.amount)} ${state.token.symbol}`,
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
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <ChopForm
            balances={farmerBalances}
            beanstalk={beanstalk}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Chop;
