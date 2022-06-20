import React, { useCallback, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Button, Grid, Stack, Tooltip, Typography } from '@mui/material';
import { Token } from 'classes';
import { BEAN } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormTokenState } from 'components/Common/Form';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import BigNumber from 'bignumber.js';
import { useBeanstalkContract } from 'hooks/useContract';
import { displayBN } from 'util/Tokens';
import { useSigner } from 'wagmi';
import { FarmerSiloBalance } from 'state/farmer/silo';
import TokenAdornment from 'components/Common/Form/TokenAdornment';
import TokenInputField from 'components/Common/Form/TokenInputField';
import { ActionType } from 'util/Actions';
import TransactionSettings from 'components/Common/Form/TransactionSettings';
import SettingSwitch from 'components/Common/Form/SettingSwitch';
import usePools from 'hooks/usePools';

// -----------------------------------------------------------------------

type ClaimFormValues = {
  settings: {
    removeLP: boolean;
  };
  tokens: FormTokenState[];
}

// -----------------------------------------------------------------------

const ClaimForm : React.FC<
  FormikProps<ClaimFormValues> & {
    token: Token;
    claimableBalance: BigNumber;
  }
> = ({
  // Custom
  token,
  claimableBalance,
  // Formik
  values,
  isSubmitting,
  // setFieldValue,
}) => {
  const chainId = useChainId();
  const pools = usePools();
  const isMainnet = chainId === SupportedChainId.MAINNET;

  // Input props
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment token={token} />
    )
  }), [token]);

  // ASSUMPTION: Pool address === LP Token address
  // Lazy way to do this. Should key pools by lpToken.address.
  const pool = pools[token.address];

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
              {values.settings.removeLP ? (
                <Grid container spacing={1}>
                  {pool?.tokens.map((_token) => (
                    <Grid key={_token.address} item xs={12} md={6}>
                      <TokenOutputField
                        token={_token}
                        value={amount}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <TokenOutputField
                  token={token}
                  value={amount}
                />
              )}
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

const Claim : React.FC<{
  token: Token;
  siloBalance: FarmerSiloBalance;
}> = ({
  token,
  siloBalance
}) => {
  // Constants
  const Bean = useChainConstant(BEAN);

  // Contracts
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);

  // Balances
  const claimableBalance = siloBalance.claimable.amount;

  // Form
  const initialValues : ClaimFormValues = useMemo(() => ({
    settings: {
      removeLP: token !== Bean
    },
    tokens: [
      {
        token,
        amount: null,
      },
    ],
  }), [token, Bean]);
  const onSubmit = useCallback((values: ClaimFormValues, formActions: FormikHelpers<ClaimFormValues>) => {
    console.debug(beanstalk, formActions);
  }, [
    beanstalk
  ]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <>
          {/* Padding below matches tabs and input position. See Figma. */}
          <Box sx={{ position: 'absolute', top: 0, right: 0, pr: 1.3, pt: 1.7 }}>
            <TransactionSettings>
              {token !== Bean && (
                <SettingSwitch name="settings.removeLP" label="Remove LP" />
              )}
            </TransactionSettings>
          </Box>
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
            <ClaimForm
              token={token}
              claimableBalance={claimableBalance}
              {...formikProps}
            />
          </Stack>
        </>
      )}
    </Formik>
  );
};

export default Claim;
