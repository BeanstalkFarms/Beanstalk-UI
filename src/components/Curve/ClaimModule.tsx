import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { ETH, UNI_V2_ETH_BEAN_LP } from 'constants/index';
import {
  claimWithdrawals,
  displayBN,
  MaxBN,
  toStringBaseUnitBN,
  TrimBN,
} from 'util/index';
import {
  ClaimableAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionToast,
  TransitAsset,
} from 'components/Common';

export const ClaimModule = forwardRef(({
  setIsFormDisabled,
}, ref) => {
  const {
    curveReceivableBalance,
    curveReceivableCrates,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  setIsFormDisabled(curveReceivableBalance.isLessThanOrEqualTo(0));

  /* Input Fields */
  const fromCurveField = (
    <TokenInputField
      key={0}
      balance={curveReceivableBalance}
      isLP
      token={TransitAsset.Crv3}
      value={TrimBN(curveReceivableBalance, UNI_V2_ETH_BEAN_LP.decimals)}
      size="small"
    />
  );

  /* Output Fields */
  const toCurveField = (
    <TokenOutputField
      key="curve"
      token={ClaimableAsset.Crv3}
      value={TrimBN(curveReceivableBalance, UNI_V2_ETH_BEAN_LP.decimals)}
      mint
    />
  );

  /* Transaction Details, settings and text */
  const details = [];
  details.push(`Receive ${displayBN(
    new BigNumber(curveReceivableBalance
  ))} BEAN:3CRV LP Tokens`);

  function transactionDetails() {
    if (curveReceivableBalance.isLessThanOrEqualTo(0)) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        {toCurveField}
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (curveReceivableBalance.isLessThanOrEqualTo(0)) return null;

      // Toast
      const txToast = new TransactionToast({
        loading: `Claiming ${displayBN(curveReceivableBalance)} BEAN:3CRV LP Tokens`,
        success: `Claimed ${displayBN(curveReceivableBalance)} BEAN:3CRV LP Tokens`,
      });

      // Execute
      claimWithdrawals(
        Object.keys(curveReceivableCrates),
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
      {fromCurveField}
      {transactionDetails()}
    </>
  );
});
