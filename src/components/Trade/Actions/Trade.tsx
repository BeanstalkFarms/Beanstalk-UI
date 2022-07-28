import { Accordion, AccordionDetails, Box, Stack } from '@mui/material';
import Token, { ERC20Token, NativeToken } from 'classes/Token';
import {
  FormApprovingState, FormTokenState,
  SettingInput,
  SmartSubmitButton,
  TokenAdornment,
  TokenSelectDialog,
  TxnPreview,
  TxnSeparator,
  TxnSettings
} from 'components/Common/Form';
import { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import { BeanstalkReplanted } from 'generated/index';
import { ZERO_BN } from 'constants/index';
import { BEAN, ETH, USDC } from 'constants/tokens';
import { Form, Formik, FormikProps } from 'formik';
import useToggle from 'hooks/display/useToggle';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import useTokenMap from 'hooks/useTokenMap';
import React, { useCallback, useMemo } from 'react';
import { useSigner } from 'hooks/ledger/useSigner';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { ActionType } from 'util/Actions';
import TokenInputField from 'components/Common/Form/TokenInputField';
import { FarmFromMode, FarmToMode } from 'lib/Beanstalk/Farm';
import DestinationField from 'components/Common/Form/DestinationField';
import useChainConstant from '../../../hooks/useChainConstant';

type TradeFormValues = {
  fromTokens: FormTokenState[];
  toTokens: FormTokenState[];
  fromDestination: FarmFromMode;
  toDestination: FarmToMode;
  approving?: FormApprovingState;
};

const TradeForm: React.FC<FormikProps<TradeFormValues> & {
  balances: ReturnType<typeof useFarmerBalances>;
  beanstalk: BeanstalkReplanted;
}> = ({
        values,
        setFieldValue,
        balances,
        beanstalk,
      }) => {
  // Hide token in "from" dropdown if it is selected in "to"
  const fromTokensMap = useTokenMap<ERC20Token | NativeToken>(
    [
      useChainConstant(ETH),
      useChainConstant(BEAN),
      useChainConstant(USDC)
    ]
      .filter((token) => token.address !== values.toTokens[0].token.address)
  );

  // Hide token in "to" dropdown if it is selected in "from"
  const toTokensMap = useTokenMap<ERC20Token | NativeToken>(
    [
      useChainConstant(ETH),
      useChainConstant(BEAN),
      useChainConstant(USDC)
    ]
      .filter((token) => token.address !== values.fromTokens[0].token.address)
  );

  // fromToken
  const [isFromTokenSelectVisible, showFromTokenSelect, hideFromTokenSelect] = useToggle();
  // toToken
  const [isToTokenSelectVisible, showToTokenSelect, hideToTokenSelect] = useToggle();

  /// Derived values
  const fromState = values.fromTokens[0];
  const fromToken = fromState.token;
  const fromTokenBalance = balances[fromToken.address];

  const toState = values.toTokens[0];
  const toToken = toState.token;
  const toTokenBalance = balances[toToken.address];

  ///
  const handleSelectTokens = useCallback((_tokens: Set<Token>, formTokens: FormTokenState[], fieldName: string) => {
    const copy = new Set(_tokens);
    const newValue = formTokens.filter((x) => {
      copy.delete(x.token);
      return _tokens.has(x.token);
    });
    setFieldValue(fieldName, [
      ...newValue,
      ...Array.from(copy).map((_token) => ({
        token: _token,
        amount: undefined // balances[_token.address]?.total ||
      })),
    ]);
  }, [setFieldValue]);

  const handleSelectFromTokens = useCallback((_tokens: Set<Token>) => {
    handleSelectTokens(_tokens, values.fromTokens, 'fromTokens');
  }, [handleSelectTokens, values.fromTokens]);

  const handleSelectToTokens = useCallback((_tokens: Set<Token>) => {
    handleSelectTokens(_tokens, values.toTokens, 'toTokens');
  }, [handleSelectTokens, values.toTokens]);

  const isValid = true;

  return (
    <Form autoComplete="off">
      <TokenSelectDialog
        open={isFromTokenSelectVisible || isToTokenSelectVisible}
        handleClose={isFromTokenSelectVisible ? hideFromTokenSelect : hideToTokenSelect}
        handleSubmit={isFromTokenSelectVisible ? handleSelectFromTokens : handleSelectToTokens}
        selected={isFromTokenSelectVisible ? values.fromTokens : values.toTokens}
        balances={balances}
        tokenList={isFromTokenSelectVisible ? Object.values(fromTokensMap) : Object.values(toTokensMap)}
        mode={TokenSelectMode.SINGLE}
      />
      {/* <pre>{JSON.stringify(values, null, 2)}</pre> */}
      <Stack gap={1}>
        <TokenInputField
          token={fromToken}
          balance={fromTokenBalance || ZERO_BN}
          name="fromTokens.0.amount"
          // MUI
          fullWidth
          InputProps={{
            endAdornment: (
              <TokenAdornment
                token={fromToken}
                onClick={showFromTokenSelect}
              />
            )
          }}
        />
        <Stack gap={0.5}>
          <DestinationField
            name="toDestination"
            label="To"
          />
        </Stack>
        {isValid ? (
          <>
            <TxnSeparator />
            <TokenInputField
              token={toToken}
              balance={toTokenBalance || ZERO_BN}
              name="toTokens.0.amount"
              // MUI
              fullWidth
              InputProps={{
                endAdornment: (
                  <TokenAdornment
                    token={toToken}
                    onClick={showToTokenSelect}
                  />
                )
              }}
            />
            <Stack gap={0.5}>
              <DestinationField
                name="fromDestination"
                label="From"
              />
            </Stack>
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: 'Trade!'
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
          tokens={values.toTokens.concat(values.fromTokens)}
          mode="auto"
        >
          Trade
        </SmartSubmitButton>
      </Stack>
    </Form>
  );
};

// ---------------------------------------------------

const Trade: React.FC<{}> = () => {
  ///
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;

  ///
  const farmerBalances = useFarmerBalances();
  const Eth = useChainConstant(ETH);
  const Bean = useChainConstant(BEAN);

  // Form setup
  const initialValues: TradeFormValues = useMemo(() => ({
    fromTokens: [
      {
        token: Eth,
        amount: undefined,
      }
    ],
    toTokens: [
      {
        token: Bean,
        amount: undefined,
      }
    ],
    fromDestination: FarmFromMode.INTERNAL,
    toDestination: FarmToMode.INTERNAL,
  }), [Bean, Eth]);

  const onSubmit = useCallback(async () => {
      console.log('SUBMIT');
    },
    []
  );

  return (
    <Formik<TradeFormValues>
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps: FormikProps<TradeFormValues>) => (
        <>
          <TxnSettings placement="form-top-right">
            <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
          </TxnSettings>
          <TradeForm
            balances={farmerBalances}
            beanstalk={beanstalk}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Trade;
