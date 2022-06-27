import React, { useCallback, useMemo, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, ButtonProps, Link, Stack, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useFormikContext } from 'formik';
import BigNumber from 'bignumber.js';
import { MAX_UINT256 } from 'constants/index';
import { CHAIN_INFO, SupportedChainId } from 'constants/chains';
import useAllowances from 'hooks/useAllowances';
import { BEANSTALK_ADDRESSES, BEANSTALK_FERTILIZER_ADDRESSES } from 'constants/addresses';
import useChainConstant from 'hooks/useChainConstant';
import { useGetERC20Contract } from 'hooks/useContract';
import { useConnect } from 'wagmi';
import { StyledDialog, StyledDialogActions, StyledDialogContent, StyledDialogTitle } from '../Dialog';
import TransactionToast from '../TxnToast';
import { FormState, FormTokenState } from '.';
import WalletButton from '../Connection/WalletButton';
import Token from 'classes/Token';

const CONTRACT_NAMES : { [address: string] : string } = {
  [BEANSTALK_ADDRESSES[SupportedChainId.MAINNET]]: 'Beanstalk',
  [BEANSTALK_ADDRESSES[SupportedChainId.ROPSTEN]]: 'Beanstalk',
  [BEANSTALK_FERTILIZER_ADDRESSES[SupportedChainId.MAINNET]]: 'Beanstalk Fertilizer',
  [BEANSTALK_FERTILIZER_ADDRESSES[SupportedChainId.ROPSTEN]]: 'Beanstalk Fertilizer',
};

/**
 * FIXME:
 * - Since this depends on `tokens` which is derived directly from
 *   form state, it changes every time an input value changes.
 */
const SmartSubmitButton : React.FC<{
  /**
   * The contract we're interacting with. Must approve 
   * `contract.address` to use `tokens`.
   */
  contract: ethers.Contract;
  /**
   * The tokens (and respective values) currently tracked in the form.
   */
  tokens: FormTokenState[];
  /**
   * auto = the module assumes the user wants to max out their allowance.
   * manual = show a modal to let the user decide their allowance.
   */
  mode: 'auto' | 'manual';
} & {
  /**
   * LoadingButton
   */
  loading?: boolean;
} & ButtonProps> = ({
  contract,
  tokens,
  mode = 'auto',
  children,
  ...props
}) => {
  const { explorer } = useChainConstant(CHAIN_INFO);
  const { values, setFieldValue } = useFormikContext<FormState>();
  const { status } = useConnect();
  const getErc20Contract = useGetERC20Contract();

  // Convert the current `FormTokenState[]` into more convenient forms,
  // and find the next token that we need to seek approval for.
  const selectedTokens : Token[] = useMemo(() => tokens.map((elem) => elem.token), [tokens]);
  const [allowances, refetchAllowances] = useAllowances(
    contract.address,
    selectedTokens,
    { loadIfAbsent: true }
  );
  const nextApprovalIndex = useMemo(
    () => allowances.findIndex(
      (allowance, index) => {
        const amt = tokens[index].amount;
        console.debug(`allowance ${index} ${tokens[index].token.symbol}`, allowance, amt)
        return (
          !allowance                    // waiting for allowance to load
          || allowance.eq(0)            // allowance is zero
          || (amt && amt.gt(0)          // entered amount is greater than allowance
              ? amt.gt(allowance)
              : false)
        );
      }
    ),
    [allowances, tokens]
  );

  // Derived
  const nextApprovalToken = nextApprovalIndex > -1 ? selectedTokens[nextApprovalIndex] : null;
  const isApproving = !!values?.approving;

  // Dialog state and handlers
  const [open, setOpen] = useState(false);
  const handleOpen  = useCallback(() => setOpen(true),  []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleApproval = useCallback(() => {
    if (nextApprovalToken && contract?.address) {
      const amount = MAX_UINT256;

      // State
      const txToast = new TransactionToast({
        loading: `Approving ${nextApprovalToken.symbol}`,
        success: 'Success!',
      });
      setFieldValue('approving', {
        contract: contract.address,
        token: nextApprovalToken,
        amount: new BigNumber(MAX_UINT256),
      });

      // Execute
      const [tokenContract] = getErc20Contract(nextApprovalToken.address);
      if (!tokenContract) throw new Error(`Failed to instantiate tokenContract for token ${nextApprovalToken.address}`);
      tokenContract.approve(
        contract.address,
        amount,
      )
      .then((txn) => {
        // submitted
        // TODO: some sort of global txn tracker here
        txToast.confirming(txn);
        return txn.wait();
      })
      .then((receipt) => {
        // confirmed
        if (refetchAllowances) {
          refetchAllowances()
            .then(() => {
              txToast.success(receipt);
              setFieldValue('approving', undefined);
            });
        }
      })
      .catch((err) => {
        // failed
        txToast.error(err);
        setFieldValue('approving', undefined);
      });
    }
  }, [
    contract?.address,
    nextApprovalToken,
    setFieldValue,
    refetchAllowances,
    getErc20Contract
  ]);
  const handleClickApproveButton = useCallback(() => {
    if (mode === 'auto') {
      handleApproval();
    } else {
      handleOpen();
    }
  }, [
    mode,
    handleApproval,
    handleOpen
  ]);

  if (status === 'disconnected') {
    return (
      <WalletButton
        {...props}
        // Prevent `type='submit'` from getting passed through here.
        // Otherwise this will call the form's submit function when
        // the wallet button is pressed to connect.
        type="button"
        disabled={false}
      />
    );
  }

  return (
    <>
      {(nextApprovalToken && contract?.address) && (
        <StyledDialog
          open={open}
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          PaperProps={{
            sx: {
              minWidth: '450px'
            }
          }}
          transitionDuration={0}
          TransitionProps={{}}
        >
          <StyledDialogTitle id="customized-dialog-title" sx={{ fontSize: 20 }} onClose={handleClose}>
            <Stack direction="row" alignItems="center" gap={1}>
              <img src={nextApprovalToken.logo} style={{ height: '1.5em' }} alt={nextApprovalToken.symbol} />
              <span>
                Approve {nextApprovalToken.symbol}
              </span>
            </Stack>
          </StyledDialogTitle>
          <StyledDialogContent>
            <Stack gap={1} sx={{ pt: 1 }}>
              <Typography>
                The <Typography fontWeight="bold" display="inline">{CONTRACT_NAMES[contract.address]}</Typography> contract needs permission to use your {nextApprovalToken.symbol} before executing this transaction.
              </Typography>
              <Typography>View on Etherscan: <Link href={`${explorer}/address/${contract.address}`} target="_blank" rel="noreferrer">{contract.address} ↗</Link></Typography>
            </Stack>
          </StyledDialogContent>
          <StyledDialogActions>
            <Button variant="outlined" fullWidth onClick={handleApproval}>
              Submit Approval
            </Button>
          </StyledDialogActions>
        </StyledDialog>
      )}
      {nextApprovalToken ? (
        <LoadingButton
          {...props}
          onClick={handleClickApproveButton}
          loading={isApproving}
        >
          Approve {nextApprovalToken.symbol}
        </LoadingButton>
      ) : (
        <LoadingButton {...props}>
          {children}
        </LoadingButton>
      )}
    </>
  );
};

export default SmartSubmitButton;
