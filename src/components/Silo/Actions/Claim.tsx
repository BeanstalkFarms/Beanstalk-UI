import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { Token } from 'classes';
import { BEAN, ETH, SEEDS, STALK } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import useTokenMap from 'hooks/useTokenMap';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
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
import { displayBN, displayFullBN, toStringBaseUnitBN } from 'util/Tokens';
import TransactionToast from 'components/Common/TxnToast';
import { useSigner } from 'wagmi';
import { FarmerSilo, FarmerSiloBalance } from 'state/farmer/silo';
import TokenAdornment from 'components/Common/Form/TokenAdornment';
import TokenInputField from 'components/Common/Form/TokenInputField';
import { ActionType } from 'util/Actions';

// -----------------------------------------------------------------------

type ClaimFormValues = {
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const TOKEN_LIST = [BEAN, ETH];

const ClaimForm : React.FC<
  FormikProps<ClaimFormValues> & {
    token: Token;
    siloBalance: FarmerSiloBalance;
    claimableBalance: BigNumber;
  }
> = ({
  // Custom
  token,
  claimableBalance,
  siloBalance,
  // Formik
  values,
  isSubmitting,
  setFieldValue,
}) => {
  const chainId = useChainId();
  const isMainnet = chainId === SupportedChainId.MAINNET;

  // Input props
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment token={token} />
    )
  }), [token]);

  //
  const amount  = values.tokens[0].amount;
  const isReady = amount && amount?.gt(0);

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          <Field name="tokens.0.amount">
            {(fieldProps: FieldProps) => (
              <TokenInputField
                {...fieldProps}
                token={token}
                balance={claimableBalance || undefined}
                InputProps={InputProps}
              />
            )}
          </Field>
          {isReady ? (
            <Stack direction="column" gap={1}>
              <TokenOutputField
                token={token}
                value={amount}
              />
              <Box>
                <Accordion defaultExpanded variant="outlined">
                  <StyledAccordionSummary title="Transaction Details" />
                  <AccordionDetails>
                    <TransactionPreview
                      actions={[
                        {
                          type: ActionType.BASE,
                          message: 'Test'
                        }
                      ]}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Stack>
          ) : null}
          <Button disabled={!isReady || isSubmitting || isMainnet} type="submit" size="large" fullWidth>
            Claim
          </Button>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

// TODO:
// - implement usePreferredToken here
const Claim : React.FC<{
  token: Token;
  siloBalance: FarmerSiloBalance;
}> = ({
  token,
  siloBalance
}) => {
  const Bean = useChainConstant(BEAN);
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);
  const initialValues : ClaimFormValues = useMemo(() => ({
    tokens: [
      {
        token,
        amount: null,
      },
    ],
  }), [token]);

  //
  const onSubmit = useCallback((values: ClaimFormValues, formActions: FormikHelpers<ClaimFormValues>) => {
    // let call;
    // beanstalk.
  }, [
    // Bean,
    // beanstalk,
    // token,
  ]);

  // const withdrawnBalance = siloBalance.deposited.amount;
  const claimableBalance = siloBalance.claimable.amount;

  return (
    <Stack spacing={1}>
      {siloBalance?.withdrawn?.crates.length > 0 ? (
        <Box sx={{ borderColor: 'primary.main', borderWidth: 1, borderStyle: 'solid', p: 1, borderRadius: 1 }}>
          {siloBalance.withdrawn.crates.map((crate) => (
            <Typography key={crate.season.toString()} color="primary">
              {displayBN(crate.amount)} {token.symbol} will become Claimable in N Seasons
            </Typography>
          ))}
        </Box>
      ) : null}
      <Formik initialValues={initialValues} onSubmit={onSubmit}>
        {(formikProps) => (
          <ClaimForm
            token={token}
            siloBalance={siloBalance}
            claimableBalance={claimableBalance}
            {...formikProps}
          />
        )}
      </Formik>
    </Stack>
  );
};

export default Claim;
