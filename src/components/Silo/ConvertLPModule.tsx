import React, { forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { AppState } from 'state';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import {
  SEEDS,
  STALK,
  LPBEANS_TO_SEEDS,
  // LPBEAN_TO_STALK,
  UNI_V2_ETH_BEAN_LP,
} from 'constants/index';
import {
  displayBN,
  MaxBN,
  MinBN,
  MinBNs,
  smallDecimalPercent,
  toStringBaseUnitBN,
  TrimBN,
  TokenLabel,
  withdrawLP,
  poolForLP,
  // maxLPToPeg,
  // convertDepositedLP,
} from 'util/index';
import {
  CryptoAsset,
  SettingsFormModule,
  SiloAsset,
  siloStrings,
  TokenInputField,
  TokenOutputField,
  // TransactionTextModule,
  TransactionDetailsModule,
} from 'components/Common';

export const ConvertLPModule = forwardRef((props, ref) => {
  const [fromLPValue, setFromLPValue] = useState(new BigNumber(-1));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [toBeanValue, setToBeanValue] = useState(new BigNumber(0));
  const [withdrawParams, setWithdrawParams] = useState({
    crates: [],
    amounts: [],
  });

  const {
    // beanSiloBalance,
    lpDeposits,
    // beanDeposits,
    locked,
    lpSiloBalance,
    seedBalance,
    stalkBalance,
    lpSeedDeposits,
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

  /* function maxLPs(stalk: BugNumber) {
    var stalkRemoved = new BigNumber(0)
    var beans = new BigNumber(0)
    Object.keys(props.crates).sort((a,b) => parseInt(a) - parseInt(b)).forEach(key => {
      let stalkPerLP = (new BigNumber(10000)).plus(props.season.minus(key)).multipliedBy(5)
      const stalkLeft = stalk.minus(stalkRemoved)
      if (stalkPerLP.multipliedBy(props.crates[key]).isGreaterThanOrEqualTo(stalkLeft)) {
        stalkRemoved = stalkRemoved.plus(stalkPerLP.multipliedBy(props.crates[key]))
        beans = beans.plus(props.crates[key])
        if (stalkRemoved.isEqualTo(stalk)) return
      } else {
        beans = beans.plus(TrimBN(stalkLeft.dividedBy(stalkPerLP),18))
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
  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
    return poolForLP(
      amount,
      prices.beanReserve,
      prices.ethReserve,
      totalBalance.totalLP
    );
  };

  const getStalkAndSeedsRemoved = (beans) => {
    let lpRemoved = new BigNumber(0);
    let stalkRemoved = new BigNumber(0);
    let seedsRemoved = new BigNumber(0);
    const crates = [];
    const amounts = [];
    BigNumber.set({ DECIMAL_PLACES: 6 });
    Object.keys(lpDeposits)
      .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
      .some((key) => {
        const crateLPsRemoved = lpRemoved
          .plus(lpDeposits[key])
          .isLessThanOrEqualTo(beans)
          ? lpDeposits[key]
          : beans.minus(lpRemoved);
        const crateSeedsRemoved = lpSeedDeposits[key]
          .multipliedBy(crateLPsRemoved)
          .dividedBy(lpDeposits[key]);
        lpRemoved = lpRemoved.plus(crateLPsRemoved);
        seedsRemoved = seedsRemoved.plus(crateSeedsRemoved);
        BigNumber.set({ DECIMAL_PLACES: 10 });
        stalkRemoved = stalkRemoved.plus(
          crateSeedsRemoved.dividedBy(LPBEANS_TO_SEEDS)
        );
        stalkRemoved = stalkRemoved.plus(
          crateSeedsRemoved
            .multipliedBy(season.minus(key))
            .multipliedBy(0.00001)
        );
        BigNumber.set({ DECIMAL_PLACES: 6 });
        crates.push(key);
        amounts.push(
          toStringBaseUnitBN(crateLPsRemoved, UNI_V2_ETH_BEAN_LP.decimals)
        );
        return lpRemoved.isEqualTo(beans);
      });
    BigNumber.set({ DECIMAL_PLACES: 18 });
    setWithdrawParams({ crates, amounts });
    return [stalkRemoved, seedsRemoved];
  };

  function fromValueUpdated(newFromNumber) {
    const fromNumber = MinBN(newFromNumber, lpSiloBalance);
    const newFromLPValue = TrimBN(fromNumber, UNI_V2_ETH_BEAN_LP.decimals);
    setToBeanValue(poolForLPRatio(fromNumber)[0].multipliedBy(2));
    setFromLPValue(newFromLPValue);
    const [stalkRemoved, seedsRemoved] = getStalkAndSeedsRemoved(fromNumber);
    setToStalkValue(TrimBN(stalkRemoved, STALK.decimals));
    setToSeedsValue(TrimBN(seedsRemoved, SEEDS.decimals));
    props.setIsFormDisabled(newFromLPValue.isLessThanOrEqualTo(0));
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
      stalkBalance.multipliedBy(props.stalkToLP),
      seedBalance.multipliedBy(props.seedsToLP),
      lpSiloBalance,
    ]);
    if (locked || prices.beanPrice.isGreaterThan(1)) {
      fromValueUpdated(new BigNumber(-1));
    } else {
      fromValueUpdated(minMaxFromVal);
    }
  };

  /* Input Fields */

  const fromLPField = (
    <TokenInputField
      balance={lpSiloBalance}
      handleChange={handleFromChange}
      isLP
      locked={locked || prices.beanPrice.isGreaterThan(1)}
      maxHandler={maxHandler}
      poolForLPRatio={poolForLPRatio}
      setValue={setFromLPValue}
      token={SiloAsset.LP}
      value={TrimBN(fromLPValue, 9)}
    />
  );

  /* Output Fields */

  const toBurnStalkField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Stalk}
      value={toStalkValue}
    />
  );
  const toBurnSeedsField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Seed}
      value={toSeedsValue}
    />
  );
  const toTransitLPField = (
    <TokenOutputField
      mint
      token={SiloAsset.Bean}
      value={toBeanValue}
    />
  );
  function displayLP(beanInput, ethInput) {
    return `${displayBN(beanInput)}
      ${beanInput.isEqualTo(1) ? 'Bean' : 'Beans'} and ${displayBN(ethInput)}
      ${TokenLabel(CryptoAsset.Ethereum)}`;
  }
  console.log(poolForLPRatio(fromLPValue)[1].toFixed());

  /* Transaction Details, settings and text */

  const details = [];
  details.push(
    `Convert ${displayBN(new BigNumber(fromLPValue))} LP Tokens in the Silo`
  );
  details.push(
    `Receive ${displayLP(
      MaxBN(poolForLPRatio(fromLPValue)[0], new BigNumber(0)),
      MaxBN(poolForLPRatio(fromLPValue)[1], new BigNumber(0))
    )} from converting`
  );
  // details.push(
  //   <TransactionTextModule
  //     key="buy"
  //     balance={poolForLPRatio(fromLPValue)[0]}
  //     buyBeans={poolForLPRatio(fromLPValue)[0]}
  //     // claim={props.settings.claim}
  //     // claimableBalance={props.claimableEthBalance}
  //     mode={props.settings.mode}
  //     // sellEth={toSellEthValue}
  //     updateExpectedPrice={props.updateExpectedPrice}
  //     value={TrimBN(poolForLPRatio(fromLPValue)[1], 9)}
  //   />
  // );
  // details.push(
  //   `Deposit ${displayBN(
  //     new BigNumber(toSiloLPValue).plus(MinBN(fromLPValue, new BigNumber(0)))
  //   )} Beans in the Silo`
  // );
  details.push(
    `Burn ${displayBN(
      new BigNumber(toSeedsValue)
    )} Seeds during conversion`
  );

  const unvoteTextField = locked ? (
    <Box style={{ marginTop: '-5px', fontFamily: 'Futura-PT-Book' }}>
      Unvote Active BIPs to Withdraw
    </Box>
  ) : null;
  const showSettings = (
    <SettingsFormModule
      // handleMode={resetFields}
      hasSlippage
      setSettings={props.setSettings}
      settings={props.settings}
      showUnitModule={false}
    />
  );
  const stalkChangePercent = toStalkValue
    .dividedBy(totalBalance.totalStalk)
    .multipliedBy(100);

  function transactionDetails() {
    if (fromLPValue.isLessThanOrEqualTo(0) || locked) return;

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
          {toTransitLPField}
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
          <span style={{ color: 'red' }}>{siloStrings.withdrawWarning}</span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (
        fromLPValue.isLessThanOrEqualTo(0) ||
        withdrawParams.crates.length === 0 ||
        withdrawParams.amounts.length === 0
      ) {
        return;
      }

      withdrawLP(withdrawParams.crates, withdrawParams.amounts, () => {
        fromValueUpdated(new BigNumber(-1));
      });
      // const lp = MaxBN(fromLPValue, new BigNumber(0));
      // const minBeans = MaxBN(
      //   MinBN(beanSiloBalance,
      //     maxLPToPeg(
      //       fromLPValue,
      //       prices.beanReserve,
      //       prices.ethReserve,
      //       totalBalance.totalLP
      //     );
      //   ), new BigNumber(0));

      // convertDepositedLP(
      //   toStringBaseUnitBN(lp, ETH.decimals),
      //   toStringBaseUnitBN(minBeans, BEAN.decimals),
      //   beanConvertParams.crates,
      //   beanConvertParams.amounts,
      //   () => resetFields()
      // );
    },
  }));

  return (
    <>
      {fromLPField}
      {unvoteTextField}
      {transactionDetails()}
      {showSettings}
    </>
  );
});
