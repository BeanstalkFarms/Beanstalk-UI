import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { unstable_batchedUpdates } from 'react-dom'; // eslint-disable-line
import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  ETH,
  LPBEAN_TO_STALK,
  LPBEANS_TO_SEEDS,
  SEEDS,
  STALK,
  UNI_V2_ETH_BEAN_LP,
} from 'constants/index';
import {
  displayBN,
  deposit,
  MaxBN,
  MinBN,
  smallDecimalPercent,
  TrimBN,
  tokenForLP,
  toStringBaseUnitBN,
} from 'util/index';
import {
  CryptoAsset,
  InputFieldPlus,
  SiloAsset,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionToast,
} from 'components/Common';

export const DepositModule = forwardRef(({
  setIsFormDisabled,
}, ref) => {
  const [fromCurveLPValue, setFromCurveLPValue] = useState(new BigNumber(-1));
  const [toCurveLPValue, setToCurveLPValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [toSeedValue, setToSeedValue] = useState(new BigNumber(0));

  // const tokenBalances = useSelector<AppState, AppState['tokenBalances']>(
  //   (state) => state.tokenBalances
  // );
  const { totalStalk, totalLP } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { lpBalance } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const { beanReserve } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  function fromValueUpdated(newFromCurveLPNumber) {
    let fromNumber = MinBN(newFromCurveLPNumber, lpBalance);

    const newFromCurveLPValue = TrimBN(MaxBN(fromNumber, new BigNumber(0)), UNI_V2_ETH_BEAN_LP.decimals);
    fromNumber = tokenForLP(newFromCurveLPValue, beanReserve, totalLP);

    setFromCurveLPValue(TrimBN(newFromCurveLPValue, 9));
    setToCurveLPValue(TrimBN(newFromCurveLPValue, UNI_V2_ETH_BEAN_LP.decimals));
    // need curve LP to token bean value for Stalk and Seeds

    setToStalkValue(
      TrimBN(
        fromNumber.multipliedBy(LPBEAN_TO_STALK),
        STALK.decimals
      )
    );
    setToSeedValue(
      TrimBN(
        fromNumber.multipliedBy(2 * LPBEANS_TO_SEEDS),
        SEEDS.decimals
      )
    );

    setIsFormDisabled(newFromCurveLPValue.isLessThanOrEqualTo(0));
  }

  /* Input Fields */
  const fromCurveLPField = (
    <InputFieldPlus
      key={0}
      balance={lpBalance}
      handleChange={(v) => fromValueUpdated(v)}
      token={CryptoAsset.Crv3}
      value={fromCurveLPValue}
    />
  );

  /* Output Fields */
  const toStalkField = (
    <TokenOutputField
      decimals={4}
      mint
      token={SiloAsset.Stalk}
      value={toStalkValue}
    />
  );
  const toSeedField = (
    <TokenOutputField
      decimals={4}
      mint
      token={SiloAsset.Seed}
      value={toSeedValue}
    />
  );
  const toCurveLPField = (
    <TokenOutputField
      key="curve"
      token={CryptoAsset.Crv3}
      value={toCurveLPValue}
      mint
    />
  );

  /* Transaction Details, settings and text */
  const stalkChangePercent = toStalkValue
    .dividedBy(totalStalk.plus(toStalkValue))
    .multipliedBy(100);

  const resetFields = () => {
    fromValueUpdated(new BigNumber(-1));
  };

  const details = [];
  details.push(`Receive ${displayBN(
    new BigNumber(toCurveLPValue
  ))} Curve BEAN LP Tokens`);

  function transactionDetails() {
    if (toCurveLPValue.isLessThanOrEqualTo(0)) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-flex' }}>
          <Box style={{ marginRight: '5px' }}>{toStalkField}</Box>
          <Box style={{ marginLeft: '5px' }}>{toSeedField}</Box>
        </Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toCurveLPField}
        </Box>
        <TransactionDetailsModule fields={details} />
        <Box
          style={{
            display: 'inline-block',
            width: '100%',
            fontSize: 'calc(9px + 0.5vmin)',
          }}
        >
          <span>
            {`You will gain ${smallDecimalPercent(
              stalkChangePercent
            )}% ownership of Beanstalk.`}
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toCurveLPValue.isLessThanOrEqualTo(0)) return null;

      // Contract Inputs
      const lp = MaxBN(toCurveLPValue, new BigNumber(0));

      // Toast
      const txToast = new TransactionToast({
        loading: `Depositing ${displayBN(lp)} BEAN:3CRV LP Tokens`,
        success: `Deposited ${displayBN(lp)} BBEAN:3CRV LP Tokens`,
      });

      // Execute
      deposit(
        toStringBaseUnitBN(lp, ETH.decimals),
        (response) => {
          resetFields();
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
      {fromCurveLPField}
      {transactionDetails()}
    </>
  );
});
