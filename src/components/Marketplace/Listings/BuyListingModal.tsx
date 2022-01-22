import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  Box,
  Modal,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { Listing } from 'state/marketplace/reducer';
import { FarmAsset, TrimBN, getToAmount, getFromAmount, poolForLP, CryptoAsset, SwapMode, MinBN, displayBN, MaxBN, toBaseUnitBN, toStringBaseUnitBN, buyListing, buyBeansAndBuyListing } from 'util/index';
import { BaseModule, ClaimTextModule, EthInputField, InputFieldPlus, SettingsFormModule, TransactionDetailsModule, TransactionTextModule } from 'components/Common';
import { BEAN, ETH, BASE_SLIPPAGE } from 'constants/index';

import ListingsTable from './ListingsTable';

type BuyListingModalProps = {
  currentListing: Listing;
  setCurrentListing: Function;
}

export default function BuyListingModal({
  currentListing,
  setCurrentListing,
}: BuyListingModalProps) {
  /** Number of Pods to buy */
  const [buyPods, setBuyPods] = useState(new BigNumber(0));
  /** Number of beans to spend to aquire Pods */
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(0));
  /** */
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  /** */
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  /** */
  const [settings, setSettings] = useState({
    claim: false,
    mode: null,
    slippage: new BigNumber(BASE_SLIPPAGE),
  });

  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const { harvestableIndex } = useSelector<AppState, AppState['weather']>(
    (state) => state.weather
  );
  const {
    beanBalance,
    ethBalance,
    lpReceivableBalance,
    beanClaimableBalance,
    claimableEthBalance,
    claimable,
    hasClaimable,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
  const { totalLP } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );
  const {
    ethReserve,
    beanReserve,
    usdcPrice,
    beanPrice,
  } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  //
  if (currentListing == null) return null;

  /* Handlers */
  const poolForLPRatio = (amount: BigNumber) => {
    if (amount.isLessThanOrEqualTo(0)) return [new BigNumber(-1), new BigNumber(-1)];
    return poolForLP(
      amount,
      beanReserve,
      ethReserve,
      totalLP
    );
  };
  const updateExpectedPrice = (sellEth: BigNumber, buyBeans: BigNumber) => {
    const endPrice = ethReserve
      .plus(sellEth)
      .dividedBy(beanReserve.minus(buyBeans))
      .dividedBy(usdcPrice);
    return beanPrice.plus(endPrice).dividedBy(2);
  };
  const toValueUpdated = (newToPodsNumber: BigNumber) => {
    const fromBeansNumber = newToPodsNumber.multipliedBy(currentListing.pricePerPod);
    let buyBeans;
    let fromBeans;
    if (settings.mode === SwapMode.Bean || settings.mode === SwapMode.BeanEthereum) {
      fromBeans = MinBN(fromBeansNumber, beanBalance);
      setFromBeanValue(TrimBN(fromBeans, BEAN.decimals));

      buyBeans = fromBeansNumber.minus(fromBeans);
      const fromEth = MinBN(getFromAmount(
        buyBeans,
        ethReserve,
        beanReserve
      ), ethBalance);

      buyBeans = getToAmount(
        fromEth,
        ethReserve,
        beanReserve
      );

      setSettings({ ...settings, mode: fromEth.isGreaterThan(0) ? SwapMode.BeanEthereum : SwapMode.Bean });
      setFromEthValue(TrimBN(fromEth, ETH.decimals));
      setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    } else {
      buyBeans = fromBeansNumber;
      const fromEth = MinBN(getFromAmount(
        buyBeans,
        ethReserve,
        beanReserve
      ), ethBalance);

      fromBeans = MinBN(fromBeansNumber.minus(buyBeans), beanBalance);
      setFromBeanValue(TrimBN(fromBeans, BEAN.decimals));

      setSettings({
        ...settings,
        mode: fromBeans.isGreaterThan(0) 
          ? SwapMode.BeanEthereum 
          : SwapMode.Ethereum 
      });
      setFromEthValue(TrimBN(fromEth, ETH.decimals));
      setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    }

    setBuyPods(TrimBN(buyBeans.plus(fromBeans).dividedBy(currentListing.pricePerPod), BEAN.decimals));
  };
  const fromValueUpdated = (newFromNumber: BigNumber, newFromEthNumber: BigNumber) => {
    const toBeans = currentListing.amount.multipliedBy(currentListing.pricePerPod);
    const fromBeans = MinBN(toBeans, newFromNumber);

    let buyBeans = getToAmount(
      newFromEthNumber,
      ethReserve,
      beanReserve
    );

    buyBeans = MinBN(toBeans.minus(fromBeans), buyBeans);
    const fromEth = getFromAmount(
      buyBeans,
      ethReserve,
      beanReserve
    );

    setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    setFromEthValue(TrimBN(fromEth, ETH.decimals));
    setFromBeanValue(TrimBN(fromBeans, BEAN.decimals));
    setBuyPods(fromBeans.plus(buyBeans).dividedBy(currentListing.pricePerPod));
  };
  const handleForm = () => {
    const listingIndex = toStringBaseUnitBN(currentListing.objectiveIndex, BEAN.decimals);
    console.log(`Buy Listing Modal: `, {
      listingIndex,
      fromEthValue,
      buyPods,
      currentListing,
    })

    if (buyPods.isLessThanOrEqualTo(0)) return;

    const _claimable = settings.claim ? claimable : null;
    const onComplete = () => {
      // Reset form
      fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
    }

    if (fromEthValue.isGreaterThan(0)) {
      console.log(`Transaction will include ETH. Using buyBeansAndBuyListing`)
      const beans = MaxBN(
        toBaseUnitBN(fromBeanValue, BEAN.decimals),
        new BigNumber(0)
      ).toString();
      const eth = toStringBaseUnitBN(fromEthValue, ETH.decimals);
      const buyBeans = toStringBaseUnitBN(
        toBuyBeanValue.multipliedBy(settings.slippage),
        BEAN.decimals
      );
      buyBeansAndBuyListing(
        listingIndex,
        currentListing.listerAddress,
        beans,
        buyBeans,
        eth,
        _claimable,
        onComplete
      );
    } else {
      console.log(`Transaction will include just Beans. Using buyListing`)
      buyListing(
        listingIndex,
        currentListing.listerAddress,
        toStringBaseUnitBN(
          fromBeanValue,
          BEAN.decimals
        ),
        _claimable,
        onComplete
      );
    }
  };

  /* Derived values */
  const leftMargin = width < 800 ? 0 : 120;
  const claimableLPBeans = lpReceivableBalance.isGreaterThan(0)
    ? poolForLPRatio(lpReceivableBalance)[0]
    : new BigNumber(0);
  const claimableBeans = beanClaimableBalance.plus(claimableLPBeans);

  if (settings.mode === null) {
    if (beanBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Bean }));
    } else if (ethBalance.isGreaterThan(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Ethereum }));
    } else if (beanBalance.isEqualTo(0) && ethBalance.isEqualTo(0)) {
      setSettings((p) => ({ ...p, mode: SwapMode.Ethereum }));
    }
  }

  /* Settings */
  const showSettings = (
    <SettingsFormModule
      setSettings={setSettings}
      settings={settings}
      handleMode={() => fromValueUpdated(new BigNumber(0), new BigNumber(0))}
      hasClaimable={hasClaimable}
      hasSlippage
    />
  );

  /* Details */
  const details = [];
  if (settings.claim) {
    details.push(
      <ClaimTextModule
        key="claim"
        balance={claimableBeans.plus(claimableEthBalance)}
        claim={settings.claim}
        mode={settings.mode}
        beanClaimable={claimableBeans}
        ethClaimable={claimableEthBalance}
      />
    );
  }
  if (
    settings.mode === SwapMode.Ethereum ||
    (settings.mode === SwapMode.BeanEthereum &&
      toBuyBeanValue.isGreaterThan(0))
  ) {
    details.push(
      <TransactionTextModule
        key="buy"
        buyBeans={toBuyBeanValue}
        mode={settings.mode}
        sellEth={fromEthValue}
        updateExpectedPrice={updateExpectedPrice}
        value={TrimBN(fromEthValue, 9)}
      />
    );
  }
  details.push(
    `Buy ${displayBN(buyPods)} Pods at ${displayBN(currentListing.objectiveIndex.minus(harvestableIndex))} in line with ${displayBN(fromBeanValue.plus(toBuyBeanValue))} Beans for ${displayBN(currentListing.pricePerPod)} Beans each`
  );

  const isReadyToSubmit = (
    (fromBeanValue?.gt(0) || fromEthValue?.gt(0))
    && buyPods.gt(0)
  );

  return (
    <Modal
      open={currentListing !== null}
      onClose={() => {
        setCurrentListing(null);
        toValueUpdated(new BigNumber(0));
      }}>
      <BaseModule
        style={{
          position: 'absolute',
          top: '50%',
          marginTop: '-40px',
          width: '400px',
          left: '50%',
          marginLeft: `${leftMargin}px`,
          textAlign: 'center',
          transform: 'translate(-50%, -50%)',
        }}
        section={0}
        sectionTitles={['Buy Pods']}
        size="small"
        marginTop="0px"
        handleForm={handleForm}
        isDisabled={!isReadyToSubmit}
      >
        <ListingsTable
          mode="ALL"
          harvestableIndex={harvestableIndex}
          listings={[currentListing]}
        />
        <Box sx={{ marginTop: 20 }}>
          {/*
            * The number of pods to purchase from this Plot.
            */}
          <InputFieldPlus
            key={0}
            balance={beanBalance}
            claim={settings.claim}
            claimableBalance={claimableBeans}
            beanLPClaimableBalance={claimableLPBeans}
            handleChange={(event) => {
              fromValueUpdated(event, fromEthValue);
            }}
            token={CryptoAsset.Bean}
            value={fromBeanValue}
            visible={settings.mode !== SwapMode.Ethereum}
          />
          <EthInputField
            key={1}
            balance={ethBalance}
            buyBeans={toBuyBeanValue}
            claim={settings.claim}
            claimableBalance={claimableEthBalance}
            handleChange={(event) => {
              fromValueUpdated(fromBeanValue, event);
            }}
            mode={settings.mode}
            sellEth={fromEthValue}
            updateExpectedPrice={updateExpectedPrice}
            value={TrimBN(fromEthValue, 9)}
          />
          <ExpandMoreIcon
            color="primary"
            style={{ marginBottom: '-14px', width: '100%' }}
          />
          {/*
            * The number of pods to purchase from this Plot.
            */}
          <InputFieldPlus
            key={2}
            balanceLabel="Available"
            balance={currentListing.amount}
            token={FarmAsset.Pods}
            value={TrimBN(buyPods, 6)}
            handleChange={(event) => toValueUpdated(event)}
          />
          {buyPods.isGreaterThan(0) ? (
            <TransactionDetailsModule
              fields={details}
            />
          ) : null}
          {showSettings}
        </Box>
      </BaseModule>
    </Modal>
  );
}
