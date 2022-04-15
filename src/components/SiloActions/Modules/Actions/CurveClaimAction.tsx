import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  UNI_V2_ETH_BEAN_LP,
  CURVE,
} from 'constants/index';
import {
  claimSeasons,
  displayBN,
  TrimBN,
} from 'util/index';
import {
  ClaimableAsset,
  CryptoAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionToast,
} from 'components/Common';

const CurveClaimAction = forwardRef(({
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
      token={ClaimableAsset.Crv3}
      value={TrimBN(curveReceivableBalance, UNI_V2_ETH_BEAN_LP.decimals)}
    />
  );

  /* Output Fields */
  const toCurveField = (
    <TokenOutputField
      key="curve"
      token={CryptoAsset.Crv3}
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
      claimSeasons(
        Object.keys(curveReceivableCrates),
        CURVE.addr,
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

export default CurveClaimAction;
