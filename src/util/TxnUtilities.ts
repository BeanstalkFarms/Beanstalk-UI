/**
 * TxnUtilities.ts
 * @author Silo Chad
 * 
 * We want to provide a simple way for components to call contract functions.
 * There are a few states during the process of transacting:
 * 
 *  1. Preparation (synchronous): dispatch actions to the UI informing that a
 *     transaction is about to be executed. For example, we may want to lock forms,
 *     disable buttons, or show a toast informing the user that their button click worked.
 * 
 *  2. Contract call (asynchronous): Using beanstalkContract().someHandler() we issue a request
 *     to the chain and await an initial response. The response is of type ethers.ContractTransaction
 *     and includes initial information about the status of a transaction, such as the txn hash. The
 *     transaction is still pending on-chain and we must wait to see if it is confirmed successfully.
 *     At this time, we may want to inform the user that the transaction is confirming, and/or allow
 *     them to follow the confirmation status via Etherscan or similar service using response txn hash.
 * 
 *  3. Execution result (asynchronous): After some time, we receive a response indicating whether or not
 *     the transaction was successful. This is the final state of the process and we should adjust UI to
 *     match the result. For example, if a transaction was successful we may show a toast indicating "you've
 *     just sown 1000 beans!" or similar.
 * 
 *  4. Data refreshing (asynchronous): Beanstalk relies on a significant amount of on-chain data, and many
 *     pieces of data are interdependent. After a contract function executes, we'll want to refresh our state
 *     in the background to provide the user with the latest correct info. For example, after sowing beans
 *     we need to refresh the user's balance. These updates *could* be performed optimistically
 *     (ex: if I sow 1000 beans and get a successful response from the chain, locally reduce my # of
 *     beans by 1000), but doing is complex. For now we'll lean on refreshing when necessary.
 * 
 * Most ethers calls to contract functions as of this writing use the same response interface:
 * ```
 * beanstalkContract()
    .withdrawLP(crates, amounts)
    .then((response) => {
      callback(response.hash);
      response.wait().then(() => {
        completeCallBack();
        txCallback();
      });
    });
 * ```
 * Since this interface is consistent, we can abstract it across all calls.
 * 
 * Design:
 * - Each contract function (like `sowBeans` of `FieldUtilities`) returns a Promise.
 * - If the transaction is confirmed, this Promise resolves with `ethers.ContractReceipt`.
 * - If the transaction fails to confirm, the Promise rejects with `reason`.
 * - For backwards compatibility, `txCallback` is called during each successful response.
 * 
 */

import { ContractReceipt, ContractTransaction } from 'ethers';
// import { txCallback } from './index';

export type TxnCallbacks = {
  onResponse: (response: ContractTransaction) => void;
}

/**
 * 
 * @param fn 
 * @param callbacks 
 */
export async function handleCallbacks(
  fn: Promise<ContractTransaction>,
  callbacks: TxnCallbacks
) : Promise<ContractReceipt> {
  return new Promise((resolve, reject) => {
    fn
      .then((response: ContractTransaction) => {
        // Received a response. Our transaction is now pending.
        // ContractTransaction contains useful info about the
        // status of the transaction.
        callbacks.onResponse(response);
        response.wait().then(
          // onfulfilled
          (value: ContractReceipt) => {
            resolve(value);
            // txCallback && txCallback();
          },
          // onrejected
          (reason: any) => {
            reject(reason);
          }
        );
      })
      .catch((err) => {
        // Received some sort of error.
        reject(err);
      });
  });
}
