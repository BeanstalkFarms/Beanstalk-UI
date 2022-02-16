import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { unstable_batchedUpdates } from 'react-dom'; // eslint-disable-line
import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  BEAN_TO_STALK,
  BEAN_TO_SEEDS,
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

  const { totalStalk } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { curveBalance } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const { curveToBDV } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  function fromValueUpdated(newFromCurveLPNumber) {
    let fromNumber = MinBN(newFromCurveLPNumber, curveBalance);

    const newFromCurveLPValue = TrimBN(MaxBN(fromNumber, new BigNumber(0)), UNI_V2_ETH_BEAN_LP.decimals);
    // fromNumber = tokenForLP(newFromCurveLPValue, beanReserve, totalLP);
    fromNumber = MaxBN(newFromCurveLPNumber, new BigNumber(0));
    const bdvNumber = fromNumber.multipliedBy(curveToBDV);

    setFromCurveLPValue(TrimBN(newFromCurveLPValue, 9));
    setToCurveLPValue(TrimBN(newFromCurveLPValue, UNI_V2_ETH_BEAN_LP.decimals));
    // need curve LP to token bean value for Stalk and Seeds

    setToStalkValue(
      TrimBN(
        bdvNumber.multipliedBy(BEAN_TO_STALK),
        STALK.decimals
      )
    );
    setToSeedValue(
      TrimBN(
        bdvNumber.multipliedBy(2 * BEAN_TO_SEEDS),
        SEEDS.decimals
      )
    );

    setIsFormDisabled(newFromCurveLPValue.isLessThanOrEqualTo(0));
  }

  /* Input Fields */
  const fromCurveLPField = (
    <InputFieldPlus
      key={0}
      balance={curveBalance}
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
      token={SiloAsset.Crv3}
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
  ))} Deposited BEAN:3CRV LP Tokens`);

  const noBeanCrv3 = curveBalance.isLessThanOrEqualTo(0) ? (
    <Box
      style={{
        display: 'inline-block',
        width: '100%',
        fontSize: 'calc(9px + 0.5vmin)',
      }}
    >
      <span>
        To deposit BEAN:3CRV LP Tokens, you must first add liquidity on Curve <a href="https://curve.fi/factory/81/deposit" target="break">here</a>.
      </span>
    </Box>
  ) : null;

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

      // Toast
      const txToast = new TransactionToast({
        loading: `Depositing ${displayBN(toCurveLPValue)} BEAN:3CRV LP Tokens`,
        success: `Deposited ${displayBN(toCurveLPValue)} BEAN:3CRV LP Tokens`,
      });

      // Execute
      deposit(
        utils.parseEther(toCurveLPValue.toString()),
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
      {noBeanCrv3}
      {transactionDetails()}
    </>
  );
});
