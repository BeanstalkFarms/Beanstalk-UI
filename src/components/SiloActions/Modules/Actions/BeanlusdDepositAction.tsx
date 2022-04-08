import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import {
  LUSD_BDV_TO_STALK,
  LUSD_BDV_TO_SEEDS,
  BEANLUSD,
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

const BeanlusdDepositAction = forwardRef(({
  setIsFormDisabled,
}, ref) => {
  const [fromLPValue, setFromLPValue] = useState(new BigNumber(-1));
  const [toLPValue, setToLPValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [toSeedValue, setToSeedValue] = useState(new BigNumber(0));

  const { totalStalk } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const { beanlusdBalance } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const { beanlusdToBDV } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  function fromValueUpdated(newFromLPNumber) {
    let fromNumber = MinBN(newFromLPNumber, beanlusdBalance);

    const newFromLPValue = TrimBN(MaxBN(fromNumber, new BigNumber(0)), UNI_V2_ETH_BEAN_LP.decimals);
    // fromNumber = tokenForLP(newFromLPValue, beanReserve, totalLP);
    fromNumber = MaxBN(newFromLPNumber, new BigNumber(0));
    const bdvNumber = fromNumber.multipliedBy(beanlusdToBDV);

    setFromLPValue(TrimBN(newFromLPValue, 9));
    setToLPValue(TrimBN(newFromLPValue, UNI_V2_ETH_BEAN_LP.decimals));
    // need curve LP to token bean value for Stalk and Seeds

    setToStalkValue(
      TrimBN(
        bdvNumber.multipliedBy(LUSD_BDV_TO_STALK),
        STALK.decimals
      )
    );
    setToSeedValue(
      TrimBN(
        bdvNumber.multipliedBy(LUSD_BDV_TO_SEEDS),
        SEEDS.decimals
      )
    );

    setIsFormDisabled(newFromLPValue.isLessThanOrEqualTo(0));
  }

  /* Input Fields */
  const fromLPField = (
    <InputFieldPlus
      key={0}
      balance={beanlusdBalance}
      handleChange={(v) => fromValueUpdated(v)}
      token={CryptoAsset.Beanlusd}
      value={fromLPValue}
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
  const toLPField = (
    <TokenOutputField
      key="curve"
      token={SiloAsset.Beanlusd}
      value={toLPValue}
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
    new BigNumber(toLPValue
  ))} Deposited BEAN:LUSD LP Tokens`);

  const noBeanCrv3 = beanlusdBalance.isLessThanOrEqualTo(0) ? (
    <Box
      style={{
        display: 'inline-block',
        width: '100%',
        fontSize: 'calc(9px + 0.5vmin)',
      }}
    >
      <span>
        To deposit BEAN:LUSD LP Tokens, you must first add liquidity on Curve <a href="https://curve.fi/factory/103/deposit" target="break">here</a>.
      </span>
    </Box>
  ) : null;

  function transactionDetails() {
    if (toLPValue.isLessThanOrEqualTo(0)) return null;

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
          {toLPField}
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
      if (toLPValue.isLessThanOrEqualTo(0)) return null;

      // Toast
      const txToast = new TransactionToast({
        loading: `Depositing ${displayBN(toLPValue)} BEAN:LUSD LP Tokens`,
        success: `Deposited ${displayBN(toLPValue)} BEAN:LUSD LP Tokens`,
      });

      // Execute
      deposit(
        utils.parseEther(toLPValue.toString()),
        BEANLUSD.addr,
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
      {fromLPField}
      {noBeanCrv3}
      {transactionDetails()}
    </>
  );
});

export default BeanlusdDepositAction;
