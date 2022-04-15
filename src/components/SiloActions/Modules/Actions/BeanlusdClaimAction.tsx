import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { 
  UNI_V2_ETH_BEAN_LP,
  BEANLUSD,
} from 'constants/index';
import {
  claimSeasons,
  displayBN,
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

const BeanlusdClaimAction = forwardRef(({
  setIsFormDisabled,
}, ref) => {
  const {
    beanlusdReceivableBalance,
    beanlusdReceivableCrates,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  setIsFormDisabled(beanlusdReceivableBalance.isLessThanOrEqualTo(0));

  /* Input Fields */
  const fromLPField = (
    <TokenInputField
      key={0}
      balance={beanlusdReceivableBalance}
      isLP
      token={TransitAsset.Beanlusd}
      value={TrimBN(beanlusdReceivableBalance, UNI_V2_ETH_BEAN_LP.decimals)}
    />
  );

  /* Output Fields */
  const toLPField = (
    <TokenOutputField
      key="curve"
      token={ClaimableAsset.Beanlusd}
      value={TrimBN(beanlusdReceivableBalance, UNI_V2_ETH_BEAN_LP.decimals)}
      mint
    />
  );

  /* Transaction Details, settings and text */
  const details = [];
  details.push(`Receive ${displayBN(
    new BigNumber(beanlusdReceivableBalance
  ))} BEAN:3CRV LP Tokens`);

  function transactionDetails() {
    if (beanlusdReceivableBalance.isLessThanOrEqualTo(0)) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        {toLPField}
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (beanlusdReceivableBalance.isLessThanOrEqualTo(0)) return null;

      // Toast
      const txToast = new TransactionToast({
        loading: `Claiming ${displayBN(beanlusdReceivableBalance)} BEAN:LUSD LP Tokens`,
        success: `Claimed ${displayBN(beanlusdReceivableBalance)} BEAN:LUSD LP Tokens`,
      });

      // Execute
      claimSeasons(
        Object.keys(beanlusdReceivableCrates),
        BEANLUSD.addr,
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
      {fromLPField}
      {transactionDetails()}
    </>
  );
});

export default BeanlusdClaimAction;
