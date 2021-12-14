import React, { forwardRef, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { AppState } from 'state';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN, BEAN_TO_SEEDS, UNI_V2_ETH_BEAN_LP } from 'constants/index';

import {
  MinBNs,
  toStringBaseUnitBN,
  TrimBN,
  convertDepositedBeans,
  calculateBeansToLP,
  MaxBN,
  displayBN,
  TokenLabel,
  calculateMaxBeansToPeg,
} from 'util/index';
import {
  SettingsFormModule,
  SiloAsset,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionTextModule,
  CryptoAsset,
} from 'components/Common';

export const ConvertBeanModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toLPValue, setToLPValue] = useState(new BigNumber(0));
  const [toAddBeans, setToAddBeans] = useState(new BigNumber(0));
  const [toAddEth, setToAddEth] = useState(new BigNumber(0));
  const [toSellBeans, setToSellBeans] = useState(new BigNumber(0));
  const [convertParams, setConvertParams] = useState({
    crates: [],
    amounts: [],
  });

  const {
    beanSiloBalance,
    beanDeposits,
    locked,
    // lpSiloBalance,
    // lpSeedDeposits,
    // lockedSeasons,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season.season
  );

  const {
    totalLP,
  } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const {
    beanReserve,
    ethReserve,
    beanPrice,
    usdcPrice,
    beansToPeg,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const maxBeansToPeg = calculateMaxBeansToPeg(beansToPeg, beanReserve, ethReserve);

  function displayLP(beanInput, ethInput) {
    return `${displayBN(beanInput)}
      ${beanInput.isEqualTo(1) ? 'Bean' : 'Beans'} and ${displayBN(ethInput)}
      ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  const updateExpectedPrice = (buyEth: BigNumber, sellBeans: BigNumber) => {
    const endPrice = ethReserve
      .minus(buyEth.abs())
      .dividedBy(beanReserve.plus(sellBeans.abs()))
      .dividedBy(usdcPrice);
    return beanPrice.plus(endPrice).dividedBy(2);
  };

  const getStalkRemoved = (beans) => {
    let beansRemoved = new BigNumber(0);
    let stalkRemoved = new BigNumber(0);
    const crates = [];
    const amounts = [];
    Object.keys(beanDeposits)
      .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
      .some((key) => {
        const crateBeansRemoved = beansRemoved
          .plus(beanDeposits[key])
          .isLessThanOrEqualTo(beans)
          ? beanDeposits[key]
          : beans.minus(beansRemoved);
        beansRemoved = beansRemoved.plus(crateBeansRemoved);
        stalkRemoved = stalkRemoved.plus(crateBeansRemoved);
        stalkRemoved = stalkRemoved.plus(
          crateBeansRemoved
            .multipliedBy(season.minus(key))
            .multipliedBy(0.0002)
        );
        crates.push(key);
        amounts.push(toStringBaseUnitBN(crateBeansRemoved, BEAN.decimals));
        return beansRemoved.isEqualTo(beans);
      });
    setConvertParams({ crates, amounts });
    return stalkRemoved;
  };

  function fromValueUpdated(newFromNumber) {
    const fromNumber = MinBNs([newFromNumber, beanSiloBalance, maxBeansToPeg]);
    const newFromBeanValue = TrimBN(fromNumber, BEAN.decimals);
    getStalkRemoved(newFromBeanValue);
    const {
      swapBeans,
      addEth,
      addBeans,
      lp,
    } = calculateBeansToLP(
      newFromBeanValue,
      beanReserve,
      ethReserve,
      totalLP
    );

    ReactDOM.unstable_batchedUpdates(() => {
      setFromBeanValue(newFromBeanValue);
      setToSeedsValue(newFromBeanValue.multipliedBy(BEAN_TO_SEEDS));
      setToLPValue(lp);
      setToAddBeans(addBeans);
      setToAddEth(addEth);
      setToSellBeans(swapBeans);
    });

    props.setIsFormDisabled(newFromBeanValue.isLessThanOrEqualTo(0) || maxBeansToPeg.isLessThanOrEqualTo(0));
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };
  const maxHandler = () => {
    if (locked || beanPrice.isLessThan(1)) {
      fromValueUpdated(new BigNumber(-1));
    } else {
      fromValueUpdated(beanSiloBalance);
    }
  };

  /* Input Fields */
  const fromBeanField = (
    <TokenInputField
      balance={beanSiloBalance}
      handleChange={handleFromChange}
      locked={locked || beanPrice.isLessThan(1)}
      maxHandler={maxHandler}
      setValue={setFromBeanValue}
      token={SiloAsset.Bean}
      value={fromBeanValue}
    />
  );

  /* Output Fields */

  const toStalkField = (
    <TokenOutputField
      decimals={4}
      token={SiloAsset.Stalk}
      value={new BigNumber(0)}
    />
  );
  const toMintSeedsField = (
    <TokenOutputField
      mint
      decimals={4}
      token={SiloAsset.Seed}
      value={toSeedsValue}
    />
  );
  const toMintDepositedLPField = (
    <TokenOutputField
      mint
      decimals={9}
      token={SiloAsset.LP}
      value={toLPValue}
    />
  );

  const showSettings = (
    <SettingsFormModule
      setSettings={props.setSettings}
      settings={props.settings}
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      showUnitModule={false}
      hasSlippage
    />
  );

  const priceText = beansToPeg.isLessThanOrEqualTo(0) ? (
    <Box style={{ marginTop: '-5px', fontFamily: 'Futura-PT-Book' }}>
      Price must be greater than $1 to convert from Beans to LP.
    </Box>
  ) : null;

  const details = [
    <TransactionTextModule
      key="sell"
      buyEth={toAddEth}
      sellToken={toSellBeans}
      updateExpectedPrice={updateExpectedPrice}
    />,
    `Add ${displayLP(MaxBN(toAddBeans, new BigNumber(0)),
      MaxBN(toAddEth, new BigNumber(0))
    )} to the BEAN:ETH pool`,
    `Receive ${displayBN(toLPValue)} LP Tokens`,
    `Receive ${displayBN(toSeedsValue)} Seeds.`,
  ];

  function transactionDetails() {
    if (fromBeanValue.isLessThanOrEqualTo(0) || locked) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-flex' }}>
          <Box style={{ marginRight: '5px' }}>{toStalkField}</Box>
          <Box style={{ marginLeft: '5px' }}>{toMintSeedsField}</Box>
        </Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          <Box style={{ marginLeft: '5px' }}>{toMintDepositedLPField}</Box>
        </Box>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (
        fromBeanValue.isLessThanOrEqualTo(0) ||
        convertParams.crates.length === 0 ||
        convertParams.amounts.length === 0
      ) {
        return;
      }
      convertDepositedBeans(
        toStringBaseUnitBN(fromBeanValue, BEAN.decimals),
        toStringBaseUnitBN(toLPValue.multipliedBy(props.settings.slippage), UNI_V2_ETH_BEAN_LP.decimals),
        convertParams.crates,
        convertParams.amounts,
        () => {
          fromValueUpdated(new BigNumber(-1));
        }
      );
    },
  }));

  return (
    <>
      {fromBeanField}
      {transactionDetails()}
      {priceText}
      {showSettings}
    </>
  );
});
