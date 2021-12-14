import React, { forwardRef, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { AppState } from 'state';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import {
  SEEDS,
  STALK,
  BEAN,
  LPBEANS_TO_SEEDS,
  BEAN_TO_SEEDS,
  UNI_V2_ETH_BEAN_LP,
} from 'constants/index';
import {
  MinBNs,
  toStringBaseUnitBN,
  TrimBN,
  poolForLP,
  getToAmount,
  // maxLPToPeg,
  convertDepositedLP,
  displayBN,
  TokenLabel,
  SwapMode,
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

export const ConvertLPModule = forwardRef((props, ref) => {
  const [fromLPValue, setFromLPValue] = useState(new BigNumber(-1));
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0));
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0));
  const [toBeanValue, setToBeanValue] = useState(new BigNumber(0));
  const [ethRemoved, setEthRemoved] = useState(new BigNumber(0));
  const [beansRemoved, setBeansRemoved] = useState(new BigNumber(0));
  const [buyBeans, setBuyBeans] = useState(new BigNumber(0));
  const [convertParams, setConvertParams] = useState({
    crates: [],
    amounts: [],
  });

  const {
    lpDeposits,
    // beanDeposits,
    lpSiloBalance,
    lpSeedDeposits,
    // lockedSeasons,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const {
    beanReserve,
    ethReserve,
    beanPrice,
    usdcPrice,
    lpToPeg,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const { totalLP } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
    return poolForLP(
      amount,
      beanReserve,
      ethReserve,
      totalLP
    );
  };

  function displayLP(beanInput, ethInput) {
    return `${displayBN(beanInput)}
      ${beanInput.isEqualTo(1) ? 'Bean' : 'Beans'} and ${displayBN(ethInput)}
      ${TokenLabel(CryptoAsset.Ethereum)}`;
  }

  const updateExpectedPrice = (sellEth: BigNumber, boughtBeans: BigNumber) => {
    const endPrice = ethReserve
      .plus(sellEth)
      .dividedBy(beanReserve.minus(boughtBeans))
      .dividedBy(usdcPrice);
    return beanPrice.plus(endPrice).dividedBy(2);
  };

  const getStalkAndSeedsRemoved = (beans) => {
    let lpRemoved = new BigNumber(0);
    let seedsRemoved = new BigNumber(0);
    const crates = [];
    const amounts = [];
    BigNumber.set({ DECIMAL_PLACES: 6 });

    Object.keys(lpDeposits)
    .sort((a, b) => parseFloat(lpSeedDeposits[a].dividedBy(lpDeposits[a]), 10) - parseInt(lpSeedDeposits[b].dividedBy(lpDeposits[b]), 10))
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
        crates.push(key);
        amounts.push(
          toStringBaseUnitBN(crateLPsRemoved, UNI_V2_ETH_BEAN_LP.decimals)
        );
        return lpRemoved.isEqualTo(beans);
      });
    BigNumber.set({ DECIMAL_PLACES: 18 });
    setConvertParams({ crates, amounts });
    return [seedsRemoved.dividedBy(LPBEANS_TO_SEEDS), seedsRemoved];
  };

  function fromValueUpdated(newFromNumber) {
    const fromNumber = MinBNs([newFromNumber, lpSiloBalance, lpToPeg]);
    const newFromLPValue = TrimBN(fromNumber, UNI_V2_ETH_BEAN_LP.decimals);
    setFromLPValue(newFromLPValue);
    const [stalkRemoved, seedsRemoved] = getStalkAndSeedsRemoved(fromNumber);

    const toBeansRemoved = fromNumber.multipliedBy(beanReserve).dividedBy(totalLP);
    const toEthRemoved = fromNumber.multipliedBy(ethReserve).dividedBy(totalLP);
    const toBuyBeans = getToAmount(
      toEthRemoved,
      ethReserve.minus(toEthRemoved),
      beanReserve.minus(toBeansRemoved)
    );
    const beans = toBeansRemoved.plus(toBuyBeans);

    const netStalk = beans.minus(stalkRemoved);
    const netSeeds = beans.multipliedBy(BEAN_TO_SEEDS).minus(seedsRemoved);

    ReactDOM.unstable_batchedUpdates(() => {
      setBeansRemoved(toBeansRemoved);
      setEthRemoved(toEthRemoved);
      setBuyBeans(toBuyBeans);
      setToBeanValue(beans);
      setToStalkValue(TrimBN(netStalk, STALK.decimals));
      setToSeedsValue(TrimBN(netSeeds, SEEDS.decimals));
    });

    props.setIsFormDisabled(newFromLPValue.isLessThanOrEqualTo(0) || lpToPeg.isLessThanOrEqualTo(0));
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value));
    } else {
      fromValueUpdated(new BigNumber(-1));
    }
  };
  const maxHandler = () => {
    if (beanPrice.isGreaterThan(1)) {
      fromValueUpdated(new BigNumber(-1));
    } else {
      fromValueUpdated(lpSiloBalance);
    }
  };

  /* Input Fields */

  const fromLPField = (
    <TokenInputField
      balance={lpSiloBalance}
      handleChange={handleFromChange}
      isLP
      maxHandler={maxHandler}
      poolForLPRatio={poolForLPRatio}
      setValue={setFromLPValue}
      token={SiloAsset.LP}
      value={TrimBN(fromLPValue, 18)}
    />
  );

  /* Output Fields */

  const toStalkField = (
    <TokenOutputField
      burn={toStalkValue.isLessThan(0)}
      mint={toStalkValue.isGreaterThan(0)}
      decimals={4}
      token={SiloAsset.Stalk}
      value={toStalkValue.abs()}
    />
  );
  const toSeedsField = (
    <TokenOutputField
      burn={toSeedsValue.isLessThan(0)}
      mint={toSeedsValue.isGreaterThan(0)}
      decimals={4}
      token={SiloAsset.Seed}
      value={toSeedsValue.abs()}
    />
  );
  const toDepositedBeansField = (
    <TokenOutputField
      mint
      token={SiloAsset.Bean}
      value={toBeanValue}
    />
  );

  const showSettings = (
    <SettingsFormModule
      // handleMode={resetFields}
      hasSlippage
      setSettings={props.setSettings}
      settings={props.settings}
      showUnitModule={false}
    />
  );

  const stalkText = toStalkValue.isGreaterThan(0) ?
  `Recieve ${displayBN(toStalkValue)} Stalk` :
  `Burn ${displayBN(toStalkValue.abs())} Stalk`;

  const seedText = toSeedsValue.isGreaterThan(0) ?
    `and recieve ${displayBN(toSeedsValue)} Seeds` :
    `and burn ${displayBN(toSeedsValue.abs())} Seeds`;

  const details = [
    `Remove ${displayBN(fromLPValue)} LP from to the BEAN:ETH pool`,
    `Recieve ${displayLP(beansRemoved, ethRemoved)} from the BEAN:ETH pool`,
    <TransactionTextModule
      key="buy"
      sellEth={ethRemoved}
      buyBeans={buyBeans}
      updateExpectedPrice={updateExpectedPrice}
      mode={SwapMode.Ethereum}
    />,
    `${stalkText} ${seedText}`,
  ];

  const priceText = lpToPeg.isLessThanOrEqualTo(0) ? (
    <Box style={{ marginTop: '-5px', fontFamily: 'Futura-PT-Book' }}>
      P must be less than $1 to convert Deposited LP Tokens to Deposited Beans.
    </Box>
  ) : null;

  function transactionDetails() {
    if (fromLPValue.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-flex' }}>
          <Box style={{ marginRight: '5px' }}>{toStalkField}</Box>
          <Box style={{ marginLeft: '5px' }}>{toSeedsField}</Box>
        </Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toDepositedBeansField}
        </Box>
        <TransactionDetailsModule fields={details} />
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (
        fromLPValue.isLessThanOrEqualTo(0) ||
        convertParams.crates.length === 0 ||
        convertParams.amounts.length === 0
      ) {
        return;
      }

      convertDepositedLP(
        toStringBaseUnitBN(fromLPValue, UNI_V2_ETH_BEAN_LP.decimals),
        toStringBaseUnitBN(toBeanValue.multipliedBy(props.settings.slippage), BEAN.decimals),
        convertParams.crates,
        convertParams.amounts, () => {
        fromValueUpdated(new BigNumber(-1));
      });
    },
  }));

  return (
    <>
      {fromLPField}
      {transactionDetails()}
      {priceText}
      {showSettings}
    </>
  );
});
