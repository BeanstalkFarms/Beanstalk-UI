import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { BEAN } from 'constants/index';
import { claimBeans, displayBN, TrimBN } from 'util/index';
import {
  ClaimableAsset,
  CryptoAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
} from 'components/Common';
import { useLatestTransactionNumber } from 'state/general/hooks';
import {
  addTransaction,
  completeTransaction,
  State,
} from 'state/general/actions';

export const BeanClaimModule = forwardRef((props, ref) => {
  props.setIsFormDisabled(props.maxFromBeanVal.isLessThanOrEqualTo(0));
  const dispatch = useDispatch();
  const latestTransactionNumber = useLatestTransactionNumber();
  /* Input Fields */

  const fromBeanField = (
    <TokenInputField
      balance={props.maxFromBeanVal}
      token={ClaimableAsset.Bean}
      value={TrimBN(props.maxFromBeanVal, BEAN.decimals)}
    />
  );

  /* Output Fields */

  const toBeanField = (
    <TokenOutputField
      mint
      token={CryptoAsset.Bean}
      value={TrimBN(props.maxFromBeanVal, BEAN.decimals)}
    />
  );

  /* Transaction Details, settings and text */

  const details = [];
  details.push(
    `Claim ${displayBN(
      new BigNumber(props.maxFromBeanVal)
    )} Beans from the Silo`
  );

  function transactionDetails() {
    if (props.maxFromBeanVal.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toBeanField}
        </Box>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (props.maxFromBeanVal.isLessThanOrEqualTo(0)) return;

      const transactionNumber = latestTransactionNumber + 1;
      dispatch(
        addTransaction({
          transactionNumber,
          description: 'Claiming Beans...',
          state: State.PENDING,
        })
      );

      claimBeans(
        Object.keys(props.crates),
        () => {},
        () => {
          dispatch(completeTransaction(transactionNumber));
        }
      );
    },
  }));

  return (
    <>
      {fromBeanField}
      {transactionDetails()}
    </>
  );
});
