import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useSigner } from 'wagmi';
import { BEAN, ETH, SEEDS, STALK } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import TokenSelectDialog from 'components/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormTokenState } from 'components/Common/Form';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import Beanstalk from 'lib/Beanstalk';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import { BalanceState } from 'state/farmer/balances/reducer';
import { displayFullBN, toStringBaseUnitBN } from 'util/Tokens';
import TransactionToast from 'components/Common/TxnToast';
import TransactionSettings from 'components/Common/Form/TransactionSettings';
import SettingInput from 'components/Common/Form/SettingInput';

// -----------------------------------------------------------------------

type DepositFormValues = {
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const DepositForm : React.FC<
  FormikProps<DepositFormValues> & {
    token: Token;
    balances: BalanceState;
  }
> = ({
  // Custom
  token,
  balances,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const erc20TokenMap = useTokenMap([BEAN, ETH, token]);
  const [showTokenSelect, setShowTokenSelect] = useState(false);

  const { bdv, stalk, seeds, actions } = Beanstalk.Silo.Deposit.deposit(
    token,
    values.tokens,
    (amount: BigNumber) => amount,
  );

  const isMainnet = chainId === SupportedChainId.MAINNET;
  const isReady   = bdv.gt(0);
  const handleClose = useCallback(() => setShowTokenSelect(false), []);
  const handleOpen  = useCallback(() => setShowTokenSelect(true),  []);
  const handleSelectTokens = useCallback((_tokens: Set<Token>) => {
    // If the user has typed some existing values in,
    // save them. Add new tokens to the end of the list.
    // FIXME: match sorting of erc20TokenList
    const copy = new Set(_tokens);
    const v = values.tokens.filter((x) => {
      copy.delete(x.token);
      return _tokens.has(x.token);
    });
    setFieldValue('tokens', [
      ...v,
      ...Array.from(copy).map((_token) => ({ token: _token, amount: undefined })),
    ]);
  }, [values.tokens, setFieldValue]);
  
  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          <TokenSelectDialog
            open={showTokenSelect}
            handleClose={handleClose}
            selected={values.tokens}
            handleSubmit={handleSelectTokens}
            balances={balances}
            tokenList={Object.values(erc20TokenMap)}
          />
          <Stack gap={1.5}>
            {values.tokens.map((state, index) => (
              <TokenQuoteProvider
                name={`tokens.${index}`}
                tokenOut={token}
                balance={balances[state.token.address] || undefined}
                state={state}
                showTokenSelect={handleOpen}
                disabled={isMainnet}
                disableTokenSelect={isMainnet}
                handleQuote={(tokenIn, amountIn) => 
                   Promise.resolve(amountIn.times(1E9))
                  // return beanstalk.callStatic.curveToBDV(amountIn.toString()).then(bigNumberResult)
                }
              />
            ))}
          </Stack>
          {isReady ? (
            <Stack direction="column" gap={1}>
              <TokenOutputField
                token={token}
                value={bdv}
              />
              <Stack direction="row" gap={1} justifyContent="center">
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={STALK}
                    value={stalk}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={SEEDS}
                    value={seeds}
                  />
                </Box>
              </Stack>
              <Box>
                <Accordion defaultExpanded variant="outlined">
                  <StyledAccordionSummary title="Transaction Details" />
                  <AccordionDetails>
                    <TransactionPreview
                      actions={actions}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Stack>
          ) : null}
          <Button disabled={!isReady || isSubmitting} type="submit" size="large" fullWidth>
            Deposit
          </Button>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

// TODO:
// - implement usePreferredToken here
const Deposit : React.FC<{ token: Token; }> = ({ token }) => {
  const Bean = useChainConstant(BEAN);
  const balances = useFarmerBalances();
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);
  const initialValues : DepositFormValues = useMemo(() => ({
    settings: {
      slippage: 0.1,
    },
    tokens: [
      {
        token: Bean,
        amount: null,
      },
    ],
  }), [Bean]);
  const onSubmit = useCallback((values: DepositFormValues, formActions: FormikHelpers<DepositFormValues>) => {
    const { amount } = Beanstalk.Silo.Deposit.deposit(
      token,
      values.tokens,
      (_amount: BigNumber) => _amount,
    );
    const txToast = new TransactionToast({
      loading: `Depositing ${displayFullBN(amount.abs(), token.displayDecimals, token.displayDecimals)} ${token.name} to the Silo`,
      success: 'Deposit successful.',
    });
    
    try {
      if (values.tokens.length > 1) throw new Error('Only one token supported at this time');
      if (values.tokens[0].token !== token) throw new Error('Must deposit token directly at this time');

      let call;
      if (token === Bean) {
        call = beanstalk.depositBeans(
          toStringBaseUnitBN(amount, token.decimals)
        );
      } else {
        call = Promise.reject(new Error(`No supported deposit method for ${token.name}`));
      }

      return call
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
              calldata: {
                amount: toStringBaseUnitBN(amount, token.decimals)
              }
            }
          );
        });
      } catch (err) {
        txToast.error(err);
      }
  }, [
    Bean,
    beanstalk,
    token,
  ]);

  //
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <>
          {/* Padding below matches tabs and input position. See Figma. */}
          <Box sx={{ position: 'absolute', top: 0, right: 0, pr: 1.3, pt: 1.7 }}>
            <TransactionSettings>
              <SettingInput name="settings.slippage" label="Slippage Tolerance" endAdornment="%" />
            </TransactionSettings>
          </Box>
          <DepositForm
            token={token}
            balances={balances}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Deposit;
