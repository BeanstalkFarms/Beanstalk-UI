import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Card, IconButton, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Token } from 'classes';
import { BEAN, ETH, SEEDS, STALK } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Field, FieldArray, FieldProps, Form, Formik, FormikProps } from 'formik';
import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormState, FormTokenState } from 'components/Common/Form';
import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import useDepositSummary from 'hooks/summary/useDepositSummary';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { AddressMap } from 'constants/index';
import BigNumber from 'bignumber.js';
import TokenInputField from 'components/Common/Form/TokenInputField';
import TokenAdornment from 'components/Common/Form/TokenAdornment';

// -----------------------------------------------------------------------

type WithdrawFormValues = FormState;

const simplifySiloBalances = (
  state : 'deposited' | 'withdrawn' | 'claimable',
  balances: AppState['_farmer']['silo']['balances']
) => {
  return Object.keys(balances).reduce((prev, k) => {
    prev[k] = balances[k][state].amount;
    return prev;
  }, {} as AddressMap<BigNumber>)
}

// -----------------------------------------------------------------------

const WithdrawForm : React.FC<
  FormikProps<WithdrawFormValues>
  & { from: Token }
> = ({
  // Custom
  from,
  // Formik
  values,
  setFieldValue,
}) => {
  const balances = useSelector<AppState, AppState['_farmer']['silo']['balances']>((state) => state._farmer.silo.balances);
  // const { bdv, stalk, seeds, actions } = useDepositSummary(to, values.tokens);
  const chainId = useChainId();

  //
  const isMainnet = chainId === SupportedChainId.MAINNET;
  const depositedBalances = useMemo(() => simplifySiloBalances('deposited', balances), [balances]);
  
  // Input props
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment token={from} />
    )
  }), [from]);

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          <Field name={`tokens.0.amount`}>
            {(fieldProps: FieldProps) => (
              <TokenInputField
                {...fieldProps}
                balance={depositedBalances[values.tokens[0].token.address] || undefined}
                InputProps={InputProps}
              />
            )}
          </Field>
          {/* @ts-ignore */}
          {/* <FieldArray name="tokens">
            {() => (
              <div>
                <Stack gap={1.5}>
                  {values.tokens.map((state, index) => (
                  ))}
                </Stack>
              </div>
            )}
          </FieldArray> */}
          {/* {bdv.gt(0) ? (
            <Stack direction="column" gap={1}>
              <TokenOutputField
                token={from}
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
          ) : null} */}
          <Button disabled type="submit" size="large" fullWidth>
            Withdraw
          </Button>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

// TODO:
// - implement usePreferredToken here
const Withdraw : React.FC<{ from: Token; }> = ({ from }) => {
  const Bean = useChainConstant(BEAN);
  const initialValues : WithdrawFormValues = useMemo(() => ({
    tokens: [
      {
        token: Bean,
        amount: null,
      },
    ],
  }), [Bean]);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {(props) => <WithdrawForm from={from} {...props} />}
    </Formik>
  );
};

export default Withdraw;
