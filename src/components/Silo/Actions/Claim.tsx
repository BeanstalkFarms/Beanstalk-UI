import React, { useCallback, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Button, Grid, Stack, Tooltip } from '@mui/material';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import BigNumber from 'bignumber.js';
import { useSigner } from 'wagmi';
import { Token } from 'classes';
import { BEAN, CRV3 } from 'constants/tokens';
import useChainConstant from 'hooks/useChainConstant';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { useBeanstalkContract } from 'hooks/useContract';
import { FarmerSiloBalance } from 'state/farmer/silo';
import { ActionType } from 'util/Actions';
import usePools from 'hooks/usePools';
import { ERC20Token, NativeToken } from 'classes/Token';
import useSeason from 'hooks/useSeason';
import { FormTokenState, TxnPreview, TokenOutputField, TokenAdornment, RadioCardField } from 'components/Common/Form';
import { BeanstalkReplanted } from 'constants/generated';
import { FarmToMode } from 'lib/Beanstalk/Farm';
import FieldWrapper from 'components/Common/Form/FieldWrapper';
import useGetChainToken from 'hooks/useGetChainToken';
import { ZERO_BN } from 'constants/index';
import { displayTokenAmount } from 'util/index';

// -----------------------------------------------------------------------

type ClaimFormValues = {
  settings: {
    destination: FarmToMode;
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
  const getChainToken = useGetChainToken();

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
  const amount = claimableBalance;
  const isSubmittable = (
    amount
    && amount.gt(0)
    && values.settings.destination !== undefined
    && (pool ? values.settings.removeLP !== undefined : true)
  );

  const destination = (
    values.settings.destination === FarmToMode.EXTERNAL
      ? `to your wallet`
      : `to your internal balance`
  );

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          <Stack gap={1} pb={0.5}>
            <TokenOutputField
              token={values.settings.removeLP ? getChainToken(CRV3) : token}
              amount={amount || ZERO_BN}
              modifier="Claimable"
            />
            <FieldWrapper label="Destination">
              <RadioCardField
                name="settings.destination"
                options={[
                  {
                    title: `Farm Balance`,
                    description: `Keep tokens within Beanstalk`,
                    value: FarmToMode.INTERNAL,
                  },
                  {
                    title: `Wallet`,
                    description: `Send tokens to your wallet`,
                    value: FarmToMode.EXTERNAL,
                  }
                ]}
              />
            </FieldWrapper>
            {pool ? (
              <FieldWrapper label="Claim as">
                <RadioCardField
                  name="settings.removeLP"
                  options={[
                    {
                      title: `3CRV`,
                      description: `Unpack LP into underlying 3CRV`,
                      value: true,
                    },
                    {
                      title: `LP`,
                      description: `Receive ${token.name} Tokens`,
                      value: false,
                    }
                  ]}
                />
              </FieldWrapper>
            ) : null}
          </Stack>
          {isSubmittable ? (
            <Box>
              <Accordion variant="outlined">
                <StyledAccordionSummary title="Transaction Details" />
                <AccordionDetails>
                  <TxnPreview
                    actions={[
                      {
                        type: ActionType.BASE,
                        message: `Claim ${displayTokenAmount(amount, token)}.`
                      },
                      {
                        type: ActionType.BASE,
                        message: values.settings.removeLP ? (
                          `Unpack ${displayTokenAmount(amount, token)} into 3CRV and send ${destination}.`
                        ) : (
                          `Send ${displayTokenAmount(amount, token)} and send ${destination}.`
                        )
                      }
                    ]}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : null}
          <Button disabled={!isSubmittable || isSubmitting || isMainnet} type="submit" size="large" fullWidth>
            Claim
          </Button>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

const Claim : React.FC<{
  token: ERC20Token | NativeToken;
  siloBalance: FarmerSiloBalance;
}> = ({
  token,
  siloBalance
}) => {
  // Constants
  const Bean = useChainConstant(BEAN);

  // Contracts
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  const currentSeason = useSeason();

  // Balances
  const claimableBalance = siloBalance?.claimable.amount;

  // Form
  const initialValues : ClaimFormValues = useMemo(() => ({
    settings: {
      removeLP: token !== Bean,
      destination: FarmToMode.INTERNAL,
    },
    tokens: [
      {
        token,
        amount: null,
      },
    ],
  }), [token, Bean]);
  const onSubmit = useCallback((values: ClaimFormValues, formActions: FormikHelpers<ClaimFormValues>) => {
    // let call;
    // if (token === Bean) {
    //   call = false;
    // }
  }, [
    // Bean,
    // beanstalk,
    // token
  ]);

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <>
          {/* Padding below matches tabs and input position. See Figma. */}
          {/* <Box sx={{ position: 'absolute', top: 0, right: 0, pr: 1.3, pt: 1.7 }}>
            <TxnSettings>
              {token !== Bean && (
                <SettingSwitch name="settings.removeLP" label="Remove LP" />
              )}
              <SettingSwitch name="settings.toWallet" label="Send to wallet" />
            </TxnSettings>
          </Box> */}
          <Stack spacing={1}>
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

/* {siloBalance?.withdrawn?.crates.length > 0 ? (
  <Box sx={{ borderColor: 'primary.main', borderWidth: 1, borderStyle: 'solid', p: 1, borderRadius: 1 }}>
    {siloBalance.withdrawn.crates.map((crate) => {
      const seasonsToArrival = crate.season.minus(currentSeason);
      if (seasonsToArrival.gt(0)) {
        return (
          <Typography key={crate.season.toString()} color="primary">
            {displayBN(crate.amount)} {token.name} will become Claimable in {seasonsToArrival.toFixed()} Season{seasonsToArrival.eq(1) ? '' : 's'}
          </Typography>
        );
      }
      return null;
    })}
  </Box>
) : null} */

// {values.settings.removeLP ? (
//   <Grid container spacing={1}>
//     {pool?.tokens.map((_token) => (
//       <Grid key={_token.address} item xs={12} md={6}>
//         <TokenOutputField
//           token={_token}
//           amount={amount}
//         />
//       </Grid>
//     ))}
//   </Grid>
// ) : (
// )}