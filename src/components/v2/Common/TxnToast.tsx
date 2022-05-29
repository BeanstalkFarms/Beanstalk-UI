import React, { useCallback } from 'react';
import { ContractReceipt, ContractTransaction } from 'ethers';
import toast from 'react-hot-toast';
import { chainId } from 'util/index';
import { Box, IconButton, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  errorMessage: {
    wordBreak: 'break-all'
  }
});

function dismissErrors(id?: any) {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
}

export function ToastAlert({ desc, hash, msg, id }: { desc: string, hash?: string, msg?: string, id?: any }) {
  const classes = useStyles();
  const handleClick = useCallback(() => (
    id !== null ? dismissErrors(id) : dismissErrors()
  ), [id]);
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <Typography sx={{ pl: 1, pr: 2, flex: 1, textAlign: 'center' }}>
        <div>
          {desc}
          {hash && (
            <>
              &nbsp;&middot;&nbsp;
              <a href={`https://${chainId === 3 ? 'ropsten.' : ''}etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">View on Etherscan</a>
            </>
          )}
        </div>
        {msg && (
          <div className={classes.errorMessage}>
            {msg}
          </div>
        )}
      </Typography>
      {msg && (
        <IconButton
          sx={{
            backgroundColor: 'transparent',
            p: 0,
            width: '20px',
            height: '20px',
            '& svg': {
              width: '18px',
              height: '18px',
            }
          }}
          size="small"
          onClick={handleClick}
        >
          <ClearIcon />
        </IconButton>
      )}
    </Box>
  );
}

ToastAlert.defaultProps = {
  hash: undefined,
};

type ToastMessages = {
  loading: string;
  success: string;
  error?: string;
}

type MetamaskErrorObject = {
  code: number;
  message: string;
}

/**
 * A lightweight wrapper around react-hot-toast
 * to minimize repetitive Toast code when issuing transactions.
 */
export default class TransactionToast {
  /** */
  messages: ToastMessages;

  /** */
  toastId: any;

  constructor(messages: ToastMessages) {
    this.messages = messages;
    this.toastId = toast.loading(
      <ToastAlert
        desc={this.messages.loading}
      />, {
        duration: Infinity,
      }
    );
  }

  /**
   * Shows a loading message with Etherscan txn link while
   * a transaction is confirming
   * @param response The ethers.ContractTransaction response
   */
  confirming(response: ContractTransaction) {
    toast.loading(
      <ToastAlert
        desc={this.messages.loading}
        hash={response.hash}
        id={this.toastId}
      />,
      {
        id: this.toastId,
        duration: Infinity,
      }
    );
  }

  /**
   * After a transaction confirms, show a success message
   * and set a timeout duration for the toast.
   * @param value The ethers.ContractReceipt confirming the txn.
   */
  success(value?: ContractReceipt) {
    toast.success(
      <ToastAlert
        desc={this.messages.success}
        hash={value?.transactionHash}
        id={this.toastId}
      />,
      {
        id: this.toastId,
        duration: 5000,
      }
    );
  }

  error(error: MetamaskErrorObject | Error | string) {
    let msg;
    let duration = 5000;
    if (typeof error === 'object') {
      duration = Infinity;
      // SC: Is there a better way to do this?
      if (error.message && error.message.substring(0, 8).toLowerCase() === 'metamask') {
        switch ((error as MetamaskErrorObject).code) {
          // MetaMask - RPC Error: MetaMask Tx Signature: User denied transaction signature.
          case 4001:
            msg = 'You rejected the signature request.';
            break;
          // Unknown
          default:
            msg = 'An error occurred with Metamask';
            break;
        }
      } else {
        const message = error.message.substring(0, 200);
        msg = error.message.length > 200 ? message.concat('...') : message;
      }
    } else {
      console.error(error);
      msg = 'An unknown error occurred.';
    }
    toast.error(
      <ToastAlert
        desc={this.messages.error}
        msg={msg}
        id={this.toastId}
      />,
      {
        id: this.toastId,
        duration: duration
      }
    );
  }
}
