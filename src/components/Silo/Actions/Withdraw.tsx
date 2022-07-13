import React, { useCallback, useMemo, useState } from 'react';
import { Accordion, AccordionDetails, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Token } from 'classes';
import { SEEDS, STALK } from 'constants/tokens';
import StyledAccordionSummary from 'components/Common/Accordion/AccordionSummary';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/chains';
import { FormState, TxnPreview, TokenOutputField, TokenInputField, TokenAdornment, TxnSeparator } from 'components/Common/Form';
import Beanstalk from 'lib/Beanstalk';
import useSeason from 'hooks/useSeason';
import { FarmerSilo } from 'state/farmer/silo';
import { useBeanstalkContract } from 'hooks/useContract';
import { displayFullBN, toStringBaseUnitBN } from 'util/index';
import TransactionToast from 'components/Common/TxnToast';
import { useSigner } from 'wagmi';
import useFarmerSiloBalances from 'hooks/useFarmerSiloBalances';
import { ERC20Token } from 'classes/Token';
import { BeanstalkReplanted } from 'generated/index';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import useSiloTokenToUSD from 'hooks/currency/useSiloTokenToUSD';
import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import { ActionType } from 'util/Actions';
import { ZERO_BN } from 'constants/index';

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
    depositedBalance: BigNumber;
    withdrawSeasons: BigNumber;
    season: BigNumber;
  }
> = ({
  // Formik
  values,
  isSubmitting,
  submitForm,
  // Custom
  token,
  siloBalances,
  depositedBalance,
  withdrawSeasons,
  season,
}) => {
  const chainId = useChainId();
  const getUSD = useSiloTokenToUSD();
  const isMainnet = chainId === SupportedChainId.MAINNET;

  // Input props
  const InputProps = useMemo(() => ({
    endAdornment: (
      <TokenAdornment token={token} />
    )
  }), [token]);

  // Confirmation dialog
  const CONFIRM_DELAY = 2000; // ms
  const [confirming, setConfirming] = useState(false);
  const [allowConfirm, setAllowConfirm] = useState(false);
  const [fill, setFill] = useState('');
  const onClose = useCallback(() => {
    setConfirming(false);
    setAllowConfirm(false);
    setFill('');
  }, []);
  const onOpen  = useCallback(() => {
    setConfirming(true);
    setTimeout(() => {
      setFill('fill');
    }, 0);
    setTimeout(() => {
      setAllowConfirm(true);
    }, CONFIRM_DELAY);
  }, []);
  const onSubmit = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    submitForm();
    onClose();
  }, [onClose, submitForm]);

  // Results
  const withdrawResult = Beanstalk.Silo.Withdraw.withdraw(
    token,
    values.tokens,
    siloBalances[token.address]?.deposited.crates || [], // fallback
    season,
  );
  const isReady = (withdrawResult && withdrawResult.amount.lt(0));

  // For the Withdraw form, move this fragment outside of the return
  // statement because it's displayed twice (once in the form and)
  // once in the final popup
  const tokenOutputs = isReady ? (
    <>
      <Stack direction="row" gap={1} justifyContent="center">
        <Box sx={{ flex: 1 }}>
          <TokenOutputField
            token={STALK}
            amount={withdrawResult.stalk}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <TokenOutputField
            token={SEEDS}
            amount={withdrawResult.seeds}
          />
        </Box>
      </Stack>
      <TokenOutputField
        token={token}
        amount={withdrawResult.amount.abs()}
        value={getUSD(token, withdrawResult.amount).abs()}
        modifier="Withdrawn"
      />
    </>
  ) : null;

  return (
    <Tooltip title={isMainnet ? <>Deposits will be available once Beanstalk is Replanted.</> : ''} followCursor>
      <Form noValidate>
        {/* Confirmation Dialog */}
        <StyledDialog open={confirming} onClose={onClose}>
          <StyledDialogTitle onClose={onClose}>Confirm Silo Withdrawal</StyledDialogTitle>
          <StyledDialogContent sx={{ pb: 1 }}>
            <Stack direction="column" gap={1}>
              <Box>
                <Typography variant="body2">
                  You will forfeit .0001% ownership of Beanstalk. Withdrawing will burn your Grown Stalk & Seeds associated with your initial Deposit. 
                </Typography>
              </Box>
              {tokenOutputs}
            </Stack>
          </StyledDialogContent>
          <StyledDialogActions>
            <Button disabled={!allowConfirm} type="submit" onClick={onSubmit} variant="contained" color="warning" size="large" fullWidth sx={{ position: 'relative', overflow: 'hidden' }}>
              <Box
                sx={{
                  background: 'rgba(0,0,0,0.03)',
                  // display: !allowConfirm ? 'none' : 'block',
                  width: '100%',
                  transition: `height ${CONFIRM_DELAY}ms linear`,
                  height: '0%',
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  '&.fill': {
                    transition: `height ${CONFIRM_DELAY}ms linear`,
                    height: '100%',
                  }
                }}
                className={fill}
              />
              Confirm Withdrawal
            </Button>
          </StyledDialogActions>
        </StyledDialog>
        {/* Form Content */}
        <Stack gap={1}>
          <TokenInputField
            name="tokens.0.amount"
            token={token}
            disabled={!depositedBalance || depositedBalance.eq(0)}
            balance={depositedBalance || ZERO_BN}
            balanceLabel="Deposited Balance"
            InputProps={InputProps}
          />
          {isReady ? (
            <Stack direction="column" gap={1}>
              <TxnSeparator />
              {tokenOutputs}
              <Box>
                <Accordion defaultExpanded variant="outlined">
                  <StyledAccordionSummary title="Transaction Details" />
                  <AccordionDetails>
                    <TxnPreview
                      actions={[
                        {
                          type: ActionType.WITHDRAW,
                          amount: withdrawResult.amount,
                          token: token,
                        },
                        {
                          type: ActionType.UPDATE_SILO_REWARDS,
                          stalk: withdrawResult.stalk,
                          seeds: withdrawResult.seeds,
                        },
                        {
                          type: ActionType.IN_TRANSIT,
                          amount: withdrawResult.amount,
                          token: token,
                          withdrawSeasons
                        }
                      ]}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Stack>
          ) : null}
          <LoadingButton
            variant="contained"
            color="primary"
            loading={isSubmitting}
            onClick={onOpen}
            disabled={!isReady || isSubmitting || isMainnet}
            size="large"
            fullWidth
          >
            Withdraw
          </LoadingButton>
        </Stack>
      </Form>
    </Tooltip>
  );
};

// -----------------------------------------------------------------------

const Withdraw : React.FC<{ token: ERC20Token; }> = ({ token }) => {
  const season = useSeason();
  const siloBalances = useFarmerSiloBalances();
  const { data: signer } = useSigner();
  const beanstalk = (useBeanstalkContract(signer) as unknown) as BeanstalkReplanted;
  const withdrawSeasons = useSelector<AppState, AppState['_beanstalk']['silo']['withdrawSeasons']>((state) => state._beanstalk.silo.withdrawSeasons);

  // Form data
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
        throw new Error('Malformatted crates.');
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
        <WithdrawForm
          token={token}
          siloBalances={siloBalances}
          depositedBalance={depositedBalance}
          withdrawSeasons={withdrawSeasons}
          season={season}
          {...formikProps}
        />
      )}
    </Formik>
  );
};

export default Withdraw;
