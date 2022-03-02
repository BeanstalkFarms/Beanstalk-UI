import React from 'react';
import { ContractReceipt, ContractTransaction } from 'ethers';
import toast from 'react-hot-toast';
import { chainId } from 'util/index';

export function ToastAlert({ desc, hash }: { desc: string, hash?: string }) {
  return (
    <div>
      {desc}
      {hash && (
        <>
          &nbsp;&middot;&nbsp;
          <a href={`https://${chainId === 3 ? 'ropsten.' : ''}etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">View on Etherscan</a>
        </>
      )}
    </div>
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
      />
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
      />,
      {
        id: this.toastId,
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
      />,
      {
        id: this.toastId,
        duration: 5000,
      }
    );
  }

  error(error: MetamaskErrorObject | Error | string) {
    let msg;
    if (typeof error === 'object') {
      // Is there a better way to do this?
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
        console.error(error);
        msg = 'An unknown error occurred.';
      }
    } else {
      console.error(error);
      msg = 'An unknown error occurred.';
    }
    toast.error(
      msg,
      {
        id: this.toastId,
      }
    );
  }
}
