import React, { useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { SEEDS, STALK } from 'constants/tokens';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik';
// import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormState } from 'components/Common/Form';
// import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { AddressMap } from 'constants/index';
import BigNumber from 'bignumber.js';
import TokenInputField from 'components/Common/Form/TokenInputField';
import TokenAdornment from 'components/Common/Form/TokenAdornment';
import Beanstalk from 'lib/Beanstalk';
import useSeason from 'hooks/useSeason';

// -----------------------------------------------------------------------

type WithdrawFormValues = FormState;

const simplifySiloBalances = (
  state : 'deposited' | 'withdrawn' | 'claimable',
  balances: AppState['_farmer']['silo']['balances']
) => Object.keys(balances).reduce((prev, k) => {
    prev[k] = balances[k][state].amount;
    return prev;
  }, {} as AddressMap<BigNumber>);

// -----------------------------------------------------------------------

const WithdrawForm : React.FC<
  FormikProps<WithdrawFormValues>
  & { from: Token }
> = ({
  // Custom
  from,
  // Formik
  values,
  // setFieldValue,
}) => {
  const balances = useSelector<AppState, AppState['_farmer']['silo']['balances']>((state) => state._farmer.silo.balances);
  const season = useSeason();
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

  const withdrawResult = Beanstalk.Silo.Withdraw.withdraw(
    from,
    values.tokens,
    balances[from.address].deposited.crates,
    season,
  );

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          <Field name="tokens.0.amount">
            {(fieldProps: FieldProps) => (
              <TokenInputField
                {...fieldProps}
                token={from}
                balance={depositedBalances[values.tokens[0].token.address] || undefined}
                InputProps={InputProps}
              />
            )}
          </Field>
          {(withdrawResult && withdrawResult.amount.lt(0)) ? (
            <Stack direction="column" gap={1}>
              <TokenOutputField
                token={from}
                value={withdrawResult.amount}
              />
              <Stack direction="row" gap={1} justifyContent="center">
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={STALK}
                    value={withdrawResult.stalk}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TokenOutputField
                    token={SEEDS}
                    value={withdrawResult.seeds}
                  />
                </Box>
              </Stack>
              <Box>
                <Accordion defaultExpanded variant="outlined">
                  <StyledAccordionSummary title="Transaction Details" />
                  <AccordionDetails>
                    <TransactionPreview
                      actions={withdrawResult.actions}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Stack>
          ) : null}
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
  const initialValues : WithdrawFormValues = useMemo(() => ({
    tokens: [
      {
        token: from,
        amount: null,
      },
    ],
  }), [from]);
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {(props) => <WithdrawForm from={from} {...props} />}
    </Formik>
  );
};

export default Withdraw;
