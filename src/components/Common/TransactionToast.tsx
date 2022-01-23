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
  success(value: ContractReceipt) {
    toast.success(
      <ToastAlert
        desc={this.messages.success}
        hash={value.transactionHash}
      />, 
      {
        id: this.toastId,
        duration: 5000,
      }
    );
  }

  error(error: any) {
    toast.error(error.toString(), { id: this.toastId });
  }
}
