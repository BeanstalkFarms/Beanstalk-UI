import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { AppState } from 'state';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN, BEAN_TO_SEEDS } from 'constants/index';

import {
  MinBN,
  MinBNs,
  toStringBaseUnitBN,
  TrimBN,
  convertDepositedBeans,
} from 'util/index';
import {
  SettingsFormModule,
  SiloAsset,
  TokenInputField,
  TokenOutputField,
} from 'components/Common';

export const ConvertBeanModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  // const [toLPValue, setToLPValue] = useState(new BigNumber(0));
  const [convertParams, setConvertParams] = useState({
    crates: [],
    amounts: [],
  });

  const {
    beanSiloBalance,
    beanDeposits,
    locked,
    // lpSiloBalance,
    seedBalance,
    stalkBalance,
    // lpSeedDeposits,
    // lockedSeasons,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const prices = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const season = useSelector<AppState, AppState['season']>(
    (state) => state.season.season
  );

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
    const fromNumber = MinBN(newFromNumber, beanSiloBalance);
    const newFromBeanValue = TrimBN(fromNumber, BEAN.decimals);
    getStalkRemoved(newFromBeanValue);
    setFromBeanValue(newFromBeanValue);
    setToSeedsValue(newFromBeanValue.multipliedBy(BEAN_TO_SEEDS));
    props.setIsFormDisabled(newFromBeanValue.isLessThanOrEqualTo(0));
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };
  const maxHandler = () => {
    const minMaxFromVal = MinBNs([
      seedBalance.multipliedBy(props.seedsToBean),
      stalkBalance.multipliedBy(props.stalkToBean),
      beanSiloBalance,
    ]);
    if (locked || prices.beanPrice.isLessThan(1)) {
      fromValueUpdated(new BigNumber(-1));
    } else {
      fromValueUpdated(minMaxFromVal);
    }
  };

  /* Input Fields */
  const fromBeanField = (
    <TokenInputField
      balance={beanSiloBalance}
      handleChange={handleFromChange}
      locked={locked || prices.beanPrice.isLessThan(1)}
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
      token={SiloAsset.LP}
      value={fromBeanValue}
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
        '0',
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
      {showSettings}
    </>
  );
});
