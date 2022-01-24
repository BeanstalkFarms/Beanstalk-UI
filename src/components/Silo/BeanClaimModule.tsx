import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN } from 'constants/index';
import { claimBeans, displayBN, TrimBN } from 'util/index';
import {
  ClaimableAsset,
  CryptoAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
} from 'components/Common';
import TransactionToast from 'components/Common/TransactionToast';

export const BeanClaimModule = forwardRef((props, ref) => {
  props.setIsFormDisabled(props.maxFromBeanVal.isLessThanOrEqualTo(0));
  
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

      // Toast
      const txToast = new TransactionToast({
        loading: `Claiming ${props.maxFromBeanVal.toFixed(3)} Beans`,
        success: `Claimed ${props.maxFromBeanVal.toFixed(3)} Beans`,
      });

      // Execute
      claimBeans(
        Object.keys(props.crates),
        (response) => txToast.confirming(response)
      )
      .then((value) => {
        txToast.success(value);
      })
      .catch((err) => {
        txToast.error(err);
      });
    },
  }));

  return (
    <>
      {fromBeanField}
      {transactionDetails()}
    </>
  );
});
