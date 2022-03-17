import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { BEAN } from 'constants/index';
import { claimBeans, displayBN, TrimBN } from 'util/index';
import {
  ClaimableAsset,
  CryptoAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionToast,
} from 'components/Common';

const BeanClaimAction = forwardRef(({
  setIsFormDisabled,
}, ref) => {
  const {
    beanReceivableBalance,
    beanReceivableCrates,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  setIsFormDisabled(beanReceivableBalance.isLessThanOrEqualTo(0));

  /* Input Fields */
  const fromBeanField = (
    <TokenInputField
      balance={beanReceivableBalance}
      token={ClaimableAsset.Bean}
      value={TrimBN(beanReceivableBalance, BEAN.decimals)}
    />
  );

  /* Output Fields */
  const toBeanField = (
    <TokenOutputField
      mint
      token={CryptoAsset.Bean}
      value={TrimBN(beanReceivableBalance, BEAN.decimals)}
    />
  );

  /* Transaction Details, settings and text */
  const details = [];
  details.push(
    `Claim ${displayBN(
      new BigNumber(beanReceivableBalance)
    )} Beans from the Silo`
  );

  function transactionDetails() {
    if (beanReceivableBalance.isLessThanOrEqualTo(0)) return null;

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
      if (beanReceivableBalance.isLessThanOrEqualTo(0)) return null;

      // Toast
      const txToast = new TransactionToast({
        loading: `Claiming ${displayBN(beanReceivableBalance)} Beans`,
        success: `Claimed ${displayBN(beanReceivableBalance)} Beans`,
      });

      // Execute
      claimBeans(
        Object.keys(beanReceivableCrates),
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

export default BeanClaimAction;