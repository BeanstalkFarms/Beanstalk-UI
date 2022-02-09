import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import { useSelector } from 'react-redux';
// import { AppState } from 'state';
import { ETH, UNI_V2_ETH_BEAN_LP } from 'constants/index';
import {
  claimWithdrawal,
  displayBN,
  MaxBN,
  TrimBN,
  toStringBaseUnitBN,
} from 'util/index';
import {
  CryptoAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionToast,
} from 'components/Common';

export const ClaimModule = forwardRef(({
  claimableCurveLPBalance,
  setIsFormDisabled,
}, ref) => {
  // const tokenBalances = useSelector<AppState, AppState['tokenBalances']>(
  //   (state) => state.tokenBalances
  // );

  setIsFormDisabled(claimableCurveLPBalance.isLessThanOrEqualTo(0));

  /* Input Fields */
  const fromCurveField = (
    <TokenInputField
      key={0}
      balance={claimableCurveLPBalance}
      isLP
      token={CryptoAsset.Crv3}
      value={TrimBN(claimableCurveLPBalance, UNI_V2_ETH_BEAN_LP.decimals)}
      size="small"
    />
  );

  /* Output Fields */
  const toCurveField = (
    <TokenOutputField
      key="curve"
      token={CryptoAsset.Crv3}
      value={TrimBN(claimableCurveLPBalance, UNI_V2_ETH_BEAN_LP.decimals)}
      mint
    />
  );

  /* Transaction Details, settings and text */
  const details = [];
  details.push(`Receive ${displayBN(
    new BigNumber(claimableCurveLPBalance
  ))} BEAN:3Crv LP Tokens`);

  function transactionDetails() {
    if (claimableCurveLPBalance.isLessThanOrEqualTo(0)) return null;

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
      if (claimableCurveLPBalance.isLessThanOrEqualTo(0)) return null;

      // Contract Inputs
      const lp = MaxBN(claimableCurveLPBalance, new BigNumber(0));

      // Toast
      const txToast = new TransactionToast({
        loading: `Claiming ${displayBN(lp)} BEAN:3CRV LP Tokens`,
        success: `Claimed ${displayBN(lp)} BBEAN:3CRV LP Tokens`,
      });

      // Execute
      claimWithdrawal(
        toStringBaseUnitBN(lp, ETH.decimals),
        (response) => {
          txToast.confirming(response);
        }
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
