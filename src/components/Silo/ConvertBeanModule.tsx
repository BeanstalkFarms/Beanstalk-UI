import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { AppState } from 'state';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN, BEAN_TO_SEEDS, SEEDS, STALK } from 'constants/index';
// LPBEAN_TO_STALK
import {
  // convertDepositedBeans,
  // maxBeansToPeg,
  // poolForLP,
  displayBN,
  MinBN,
  MinBNs,
  smallDecimalPercent,
  toStringBaseUnitBN,
  TrimBN,
  withdrawBeans,
} from 'util/index';
import {
  SettingsFormModule,
  SiloAsset,
  siloStrings,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
} from 'components/Common';

export const ConvertBeanModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  // const [toLPValue, setToLPValue] = useState(new BigNumber(0));
  const [withdrawParams, setWithdrawParams] = useState({
    crates: [],
    amounts: [],
  });

  const {
    beanSiloBalance,
    // lpDeposits,
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

  const totalBalance = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  /* function maxBeans(stalk: BugNumber) {
    var stalkRemoved = new BigNumber(0)
    var beans = new BigNumber(0)
    Object.keys(props.crates).sort((a,b) => parseInt(a) - parseInt(b)).forEach(key => {
      let stalkPerBean = (new BigNumber(10000)).plus(props.season.minus(key)).multipliedBy(5)
      const stalkLeft = stalk.minus(stalkRemoved)
      if (stalkPerBean.multipliedBy(props.crates[key]).isGreaterThanOrEqualTo(stalkLeft)) {
        stalkRemoved = stalkRemoved.plus(stalkPerBean.multipliedBy(props.crates[key]))
        beans = beans.plus(props.crates[key])
        if (stalkRemoved.isEqualTo(stalk)) return
      } else {
        beans = beans.plus(TrimBN(stalkLeft.dividedBy(stalkPerBean),BEAN.decimals))
        return
      }
    })
    return beans
  }
  */
  // const beanToEth = prices.ethReserve.dividedBy(prices.beanReserve);
  // const ethToBean = prices.beanReserve.dividedBy(prices.ethReserve);

  // beanReserve={prices.beanReserve}
  // beanToStalk={LPBEAN_TO_STALK}
  // ethReserve={prices.ethReserve}

  // const poolForLPRatio = (amount: BigNumber) => {
  //   if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
  //   return poolForLP(
  //     amount,
  //     prices.beanReserve,
  //     prices.ethReserve,
  //     totalBalance.totalLP
  //   );
  // };

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
    setWithdrawParams({ crates, amounts });
    return stalkRemoved;
  };

  function fromValueUpdated(newFromNumber) {
    const fromNumber = MinBN(newFromNumber, beanSiloBalance);
    const newFromBeanValue = TrimBN(fromNumber, BEAN.decimals);
    setFromBeanValue(newFromBeanValue);
    // const lpToDeposit =
    //   lpForPool(
    //     MaxBN(fromNumber, new BigNumber(0)),
    //     newBeanReserve,
    //     MaxBN(fromEtherNumber, new BigNumber(0)),
    //     newEthReserve,
    //     props.totalLP
    //   )
    // );
    setToStalkValue(TrimBN(getStalkRemoved(fromNumber), STALK.decimals));
    setToSeedsValue(
      TrimBN(fromNumber.multipliedBy(BEAN_TO_SEEDS), SEEDS.decimals)
    );
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

  const toBurnStalkField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Stalk}
      value={new BigNumber(0)}
    />
  );
  const toBurnSeedsField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Seed}
      value={fromBeanValue.multipliedBy(2)}
    />
  );
  const toTransitBeanField = (
    <TokenOutputField
      mint
      token={SiloAsset.LP}
      value={fromBeanValue}
    />
  );

  /* Transaction Details, settings and text */

  const details = [];
  const beanOutput = new BigNumber(fromBeanValue);

  details.push(`Convert ${displayBN(beanOutput)}
    ${beanOutput.isEqualTo(1) ? 'Bean' : 'Beans'} from the Silo`);
  // details.push(
  //   `Add ${displayLP(
  //     MaxBN(fromBeanValue, new BigNumber(0)),
  //     MaxBN(fromEthValue, new BigNumber(0))
  //   )} to the BEAN:ETH pool`
  // );
  // details.push(
  //   `Receive ${displayBN(
  //     new BigNumber(toSiloLPValue.minus(MaxBN(fromLPValue, new BigNumber(0))))
  //   )} LP Tokens`
  // );
  // details.push(
  //   `Deposit ${displayBN(
  //     new BigNumber(toSiloLPValue).plus(MinBN(fromLPValue, new BigNumber(0)))
  //   )} LP Tokens in the Silo`
  // );
  details.push(
    `Receive ${displayBN(new BigNumber(toSeedsValue))} Seeds`
  );

  const unvoteTextField = locked ? (
    <Box style={{ marginTop: '-5px', fontFamily: 'Futura-PT-Book' }}>
      Unvote Active BIPs to Withdraw
    </Box>
  ) : null;
  const showSettings = (
    <SettingsFormModule
      setSettings={props.setSettings}
      settings={props.settings}
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      showUnitModule={false}
      hasSlippage
    />
  );
  const stalkChangePercent = toStalkValue
    .dividedBy(totalBalance.totalStalk)
    .multipliedBy(100);

  function transactionDetails() {
    if (fromBeanValue.isLessThanOrEqualTo(0) || locked) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-flex' }}>
          <Box style={{ marginRight: '5px' }}>{toBurnStalkField}</Box>
          <Box style={{ marginLeft: '5px' }}>{toBurnSeedsField}</Box>
        </Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toTransitBeanField}
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
            {`You will forfeit ${smallDecimalPercent(
              stalkChangePercent
            )}% ownership of Beanstalk.`}
          </span>
          <br />
          <span style={{ color: 'red', fontSize: 'calc(9px + 0.5vmin)' }}>
            {siloStrings.withdrawWarning}
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (
        fromBeanValue.isLessThanOrEqualTo(0) ||
        withdrawParams.crates.length === 0 ||
        withdrawParams.amounts.length === 0
      ) {
        return;
      }

      withdrawBeans(withdrawParams.crates, withdrawParams.amounts, () => {
        fromValueUpdated(new BigNumber(-1));
      });
      // const beans = MaxBN(fromBeanValue, new BigNumber(0));
      // const minLP = MaxBN(
      //   MinBN(beanSiloBalance,
      //     maxBeansToPeg(
      //       fromBeanValue,
      //       prices.beanReserve,
      //       prices.ethReserve,
      //       totalBalance.totalLP
      //     );
      //   ), new BigNumber(0));
      // convertDepositedBeans(
      //   toStringBaseUnitBN(beans, BEAN.decimals),
      //   toStringBaseUnitBN(minLP, ETH.decimals),
      //   beanConvertParams.crates,
      //   beanConvertParams.amounts,
      //   () => resetFields()
      // );
    },
  }));

  return (
    <>
      {fromBeanField}
      {unvoteTextField}
      {transactionDetails()}
      {showSettings}
    </>
  );
});
