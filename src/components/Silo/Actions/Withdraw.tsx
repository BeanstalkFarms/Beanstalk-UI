import React, { useCallback, useMemo } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip } from '@mui/material';
import { Token } from 'classes';
import { SEEDS, STALK } from 'constants/tokens';
import { Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
// import TokenSelectDialog, { TokenSelectMode } from 'components/Common/Form/TokenSelectDialog';
import TokenOutputField from 'components/Common/Form/TokenOutputField';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import { FormState } from 'components/Common/Form';
// import TokenQuoteProvider from 'components/Common/Form/TokenQuoteProvider';
import TransactionPreview from 'components/Common/Form/TransactionPreview';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import BigNumber from 'bignumber.js';
import TokenInputField from 'components/Common/Form/TokenInputField';
import TokenAdornment from 'components/Common/Form/TokenAdornment';
import Beanstalk from 'lib/Beanstalk';
import useSeason from 'hooks/useSeason';
import { FarmerSilo } from 'state/farmer/silo';
import { useBeanstalkContract } from 'hooks/useContract';
import { displayFullBN, toStringBaseUnitBN } from 'util/index';
import TransactionToast from 'components/Common/TxnToast';
import { useSigner } from 'wagmi';
import useFarmerSiloBalances from 'hooks/useFarmerSiloBalances';
import { ERC20Token } from 'classes/Token';
import { BeanstalkReplanted } from 'constants/generated';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

// -----------------------------------------------------------------------

type WithdrawFormValues = FormState;

// const simplifySiloBalances = (
//   state : 'deposited' | 'withdrawn' | 'claimable',
//   balances: AppState['_farmer']['silo']['balances']
// ) => Object.keys(balances).reduce((prev, k) => {
//   prev[k] = balances[k][state].amount;
//   return prev;
// }, {} as AddressMap<BigNumber>);

// -----------------------------------------------------------------------

const WithdrawForm : React.FC<
  FormikProps<WithdrawFormValues> & {
    token: Token;
    siloBalances: FarmerSilo['balances'];
    // depositedBalances: AddressMap<BigNumber>;
    depositedBalance: BigNumber;
    season: BigNumber;
  }
> = ({
  // Formik
  values,
  isSubmitting,
  // Custom
  token,
  siloBalances,
  // depositedBalances,
  depositedBalance,
  season,
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
  const withdrawResult = Beanstalk.Silo.Withdraw.withdraw(
    token,
    values.tokens,
    siloBalances[token.address]?.deposited.crates,
    season,
  );
  const isReady = (withdrawResult && withdrawResult.amount.lt(0));

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        <Stack gap={1}>
          <Field name="tokens.0.amount">
            {(fieldProps: FieldProps) => (
              <TokenInputField
                {...fieldProps}
                token={token}
                balance={depositedBalance || undefined}
                balanceLabel="Deposited Balance"
                InputProps={InputProps}
              />
            )}
          </Field>
          {isReady ? (
            <Stack direction="column" gap={1}>
              <TokenOutputField
                token={token}
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
          <Button disabled={!isReady || isSubmitting || isMainnet} type="submit" size="large" fullWidth>
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
const Withdraw : React.FC<{ token: ERC20Token; }> = ({ token }) => {
  const season = useSeason();
  const siloBalances = useFarmerSiloBalances();
  const { data: signer } = useSigner();
  const beanstalk = (useBeanstalkContract(signer) as unknown) as BeanstalkReplanted;
  const withdrawSeasons = useSelector<AppState, AppState['_beanstalk']['silo']['withdrawSeasons']>(state => state._beanstalk.silo.withdrawSeasons);

  // Form data
  // const depositedBalances = useMemo(() => simplifySiloBalances('deposited', siloBalances), [siloBalances]);
  const depositedBalance = siloBalances[token.address]?.deposited.amount;
  const initialValues : WithdrawFormValues = useMemo(() => ({
    tokens: [
      {
        token: token,
        amount: null,
      },
    ],
  }), [token]);

  // Handlers
  const onSubmit = useCallback((values: WithdrawFormValues, formActions: FormikHelpers<WithdrawFormValues>) => {
    const withdrawResult = Beanstalk.Silo.Withdraw.withdraw(
      token,
      values.tokens,
      siloBalances[token.address]?.deposited.crates,
      season,
    );
    if (withdrawResult) {
      let call;
      const seasons = withdrawResult.deltaCrates.map((crate) => crate.season.toString());
      const amounts = withdrawResult.deltaCrates.map((crate) => toStringBaseUnitBN(crate.amount.abs(), token.decimals));
      
      console.debug('[silo/withdraw] withdrawing: ', {
        withdrawResult,
        calldata: {
          seasons,
          amounts,
        },
      });

      //
      if (seasons.length === 0) {
        throw new Error('Malformatted crates.')
      } else if (seasons.length === 1) {
        call = beanstalk.withdrawDeposit(
          token.address,
          seasons[0],
          amounts[0],
        );
      } else {
        call = beanstalk.withdrawDeposits(
          token.address,
          seasons,
          amounts,
        );
      }

      const txToast = new TransactionToast({
        loading: `Withdrawing ${displayFullBN(withdrawResult.amount.abs(), token.displayDecimals, token.displayDecimals)} ${token.name} from the Silo`,
        success: `Withdraw successful. Your ${token.name} will be available to Claim in ${withdrawSeasons.toFixed()} Seasons.`,
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
              token: token.address,
              seasons,
              amounts,
            }
          );
        });
    }
  }, [
    siloBalances,
    beanstalk,
    token,
    season,
    withdrawSeasons,
  ]);

  //
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {(formikProps) => (
        <>
          {/* Padding below matches tabs and input position. See Figma. */}
          {/* <Box sx={{ position: 'absolute', top: 0, right: 0, pr: 1.3, pt: 1.7 }}>
            <TransactionSettings>
              {token !== Bean && (
                <SettingSwitch name="settings.removeLP" label="Remove LP" />
              )}
            </TransactionSettings>
          </Box> */}
          <WithdrawForm
            token={token}
            siloBalances={siloBalances}
            depositedBalance={depositedBalance}
            season={season}
            {...formikProps}
          />
        </>
      )}
    </Formik>
  );
};

export default Withdraw;
