import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { BEAN, ETH, SEEDS, STALK } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import TokenSelectDialog from 'components/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormTokenState } from 'components/Common/Form';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import Beanstalk from 'lib/Beanstalk';
import BigNumber from 'bignumber.js';
import { useBeanstalkContract } from 'hooks/useContract';
import useFarmerBalances from 'hooks/useFarmerBalances';
import { BalanceState } from 'state/farmer/balances/reducer';
import { displayFullBN, toStringBaseUnitBN } from 'util/Tokens';
import TransactionToast from 'components/Common/TxnToast';
import { useSigner } from 'wagmi';

// -----------------------------------------------------------------------

type DepositFormValues = {
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const TOKEN_LIST = [BEAN, ETH];

const DepositForm : React.FC<
  FormikProps<DepositFormValues> & {
    to: Token;
    balances: BalanceState;
  }
> = ({
  // Custom
  to,
  balances,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const erc20TokenMap = useTokenMap(TOKEN_LIST);
  const [showTokenSelect, setShowTokenSelect] = useState(false);

  const { bdv, stalk, seeds, actions } = Beanstalk.Silo.Deposit.deposit(
    to,
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
      ...Array.from(copy).map((token) => ({ token, amount: undefined })),
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
                tokenOut={to}
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
                token={to}
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
    if (values.tokens.length > 1) throw new Error('Only one token supported at this time.');
    if (values.tokens[0].token !== token) throw new Error('Must deposit token directly at this time.');

    let call;
    if (token === Bean) {
      call = beanstalk.depositBeans(
        toStringBaseUnitBN(amount, token.decimals)
      );
    } else {
      call = Promise.reject(new Error(`No supported deposit method for ${token.name}`));
    }

    const txToast = new TransactionToast({
      loading: `Depositing ${displayFullBN(amount.abs(), token.displayDecimals, token.displayDecimals)} ${token.name} to the Silo`,
      success: `Withdraw successful. Your ${token.symbol} will be available to Claim in N Seasons.`,
    });

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
  }, [
    Bean,
    beanstalk,
    token,
  ]);
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <DepositForm
          to={token}
          balances={balances}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Deposit;
