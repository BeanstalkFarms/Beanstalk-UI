import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import { useSelector } from 'react-redux';
// import { AppState } from 'state';
import { UNI_V2_ETH_BEAN_LP } from 'constants/index';
import { displayBN, TrimBN } from 'util/index';
import {
  CryptoAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
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

      console.log('handle ref');
    },
  }));

  return (
    <>
      {fromCurveField}
      {transactionDetails()}
    </>
  );
});
