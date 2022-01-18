import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { unstable_batchedUpdates } from 'react-dom'; // eslint-disable-line
import { AppState } from 'state';
import { Box } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  BEAN,
  ETH,
  SLIPPAGE_THRESHOLD,
} from 'constants/index';
import {
  displayBN,
  getToAmount,
  MaxBN,
  SwapMode,
  TrimBN,
  toBaseUnitBN,
  toStringBaseUnitBN,
  buyBeansAndListBuyOffer,
  listBuyOffer,
} from 'util/index';
import {
  ClaimTextModule,
  CryptoAsset,
  EthInputField,
  FarmAsset,
  FrontrunText,
  InputFieldPlus,
  SettingsFormModule,
  TokenInputField,
  TokenOutputField,
  TransactionDetailsModule,
  TransactionTextModule,
} from 'components/Common';

export const CreateOfferModule = forwardRef(({
  isFormDisabled,
  setIsFormDisabled,
  settings,
  setSettings,
  poolForLPRatio,
  updateExpectedPrice,
}, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));
  const [maxPlaceInLineValue, setMaxPlaceInLineValue] = useState(new BigNumber(0));
  const [toPodValue, setToPodValue] = useState(new BigNumber(0));

  const {
    beanBalance,
    beanClaimableBalance,
    claimable,
    claimableEthBalance,
    lpReceivableBalance,
    ethBalance,
    hasClaimable,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const { beanReserve, ethReserve } = useSelector<AppState, AppState['prices']>(
    (state) => state.prices
  );

  const { totalPods } = useSelector<AppState, AppState['totalBalance']>(
    (state) => state.totalBalance
  );

  useEffect(() => {
    const isDisabled = () => {
      if (
        !maxPlaceInLineValue.isGreaterThan(0) ||
        toPodValue.isLessThanOrEqualTo(0) ||
        maxPlaceInLineValue.isLessThan(toPodValue)
      ) {
        setIsFormDisabled(true);
      } else {
        setIsFormDisabled(false);
      }
    };

    isDisabled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    maxPlaceInLineValue,
    toPodValue,
    isFormDisabled,
  ]);

  function calculatePods(buyNumber, price) {
    let podNumber = new BigNumber(0);
    if (price.isGreaterThan(1) || price.isLessThanOrEqualTo(0)) {
      setToPodValue(new BigNumber(0));
    } else {
      setToPodValue(buyNumber.dividedBy(price));
      podNumber = (buyNumber.dividedBy(price));
    }
    return podNumber;
  }

  /**  */
  function fromValueUpdated(newFromBeanNumber, newFromEthNumber) {
    const buyBeans = getToAmount(
      newFromEthNumber,
      ethReserve,
      beanReserve
    );
    setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    setFromEthValue(TrimBN(newFromEthNumber, ETH.decimals));
    setFromBeanValue(TrimBN(newFromBeanNumber, BEAN.decimals));
    calculatePods(
      buyBeans.plus(MaxBN(newFromBeanNumber, new BigNumber(0))),
      pricePerPodValue
    );
  }

  const handlePriceChange = (v) => {
    let newPricePerPodValue = v.target.value !== ''
      ? new BigNumber(v.target.value)
      : new BigNumber(0);

    if (newPricePerPodValue.isGreaterThanOrEqualTo(1)) {
      newPricePerPodValue = new BigNumber(1);
    }

    setPricePerPodValue(newPricePerPodValue);
    calculatePods(
      toBuyBeanValue.plus(MaxBN(fromBeanValue, new BigNumber(0))),
      newPricePerPodValue
    );
  };

  // TODO: needs to be optimized for more efficient rerendering
  const handleInputChange = (event) => {
    const newMaxPlaceInLineValue = event.target.value !== ''
      ? new BigNumber(event.target.value)
      : new BigNumber(0);

    if (
      newMaxPlaceInLineValue.isGreaterThanOrEqualTo(totalPods) ||
      toPodValue.isGreaterThanOrEqualTo(totalPods)
    ) {
      setMaxPlaceInLineValue(totalPods);
      return;
    }
    setMaxPlaceInLineValue(newMaxPlaceInLineValue);
  };

  /* Input Fields */
  const maxPlaceInLineField = (
    <>
      <TokenInputField
        key={3}
        balance={totalPods}
        label="Buy Range"
        handleChange={handleInputChange}
        handleSlider={(v) => {
          setMaxPlaceInLineValue(new BigNumber(v));
        }}
        placeholder={totalPods.toFixed()}
        value={TrimBN(maxPlaceInLineValue, 6)}
        range
        error={maxPlaceInLineValue.isLessThan(toPodValue)}
      />
    </>
  );

  // TODO: Make field outlined red when user inputs price (given range) that is lower than the average of the marketplace average price
  const pricePerPodField = (
    <>
      <TokenInputField
        key={2}
        label="Price per pod"
        token={CryptoAsset.Bean}
        handleChange={handlePriceChange}
        placeholder="0.50"
        value={TrimBN(pricePerPodValue, 6)}
      />
    </>
  );
  const fromBeanField = (
    <InputFieldPlus
      key={0}
      balance={beanBalance}
      claimableBalance={beanClaimableBalance}
      beanLPClaimableBalance={poolForLPRatio(lpReceivableBalance)[0]}
      token={CryptoAsset.Bean}
      handleChange={(v) => fromValueUpdated(v, fromEthValue)}
      claim={settings.claim}
      visible={settings.mode !== SwapMode.Ethereum} // should be visible if mode = Bean | BeanEthereum
      value={TrimBN(fromBeanValue, 6)}
    />
  );
  const fromEthField = (
    <EthInputField
      key={1}
      balance={ethBalance}
      buyBeans={toBuyBeanValue}
      sellEth={fromEthValue}
      claimableBalance={claimableEthBalance}
      handleChange={(v) => fromValueUpdated(fromBeanValue, v)}
      mode={settings.mode} // will auto-disable if mode == SwapMode.Bean
      claim={settings.claim}
      updateExpectedPrice={updateExpectedPrice}
      value={TrimBN(fromEthValue, 9)}
    />
  );

  /* Output Fields */
  const toPodField = (
    <TokenOutputField
      key={4}
      label="Price per pod"
      token={FarmAsset.Pods}
      value={TrimBN(toPodValue, 6)}
    />
  );

  /* Transaction Details, settings and text */
  const beanClaimable = MaxBN(
    poolForLPRatio(lpReceivableBalance)[0], new BigNumber(0)
  ).plus(beanClaimableBalance);
  const ethClaimable = MaxBN(
    poolForLPRatio(lpReceivableBalance)[1], new BigNumber(0)
  ).plus(claimableEthBalance);

  const details = [];
  if (settings.claim) {
    details.push(
      <ClaimTextModule
        key="claim"
        claim={settings.claim}
        beanClaimable={beanClaimable}
        ethClaimable={ethClaimable}
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
        balance={toBuyBeanValue}
        buyBeans={toBuyBeanValue}
        claim={settings.claim}
        claimableBalance={ethClaimable}
        mode={settings.mode}
        sellEth={fromEthValue}
        updateExpectedPrice={updateExpectedPrice}
        value={TrimBN(fromEthValue, 9)}
      />
    );
  }
  details.push(
    `Place a buy offer for ${displayBN(
      toPodValue
    )} Pods anywhere before ${displayBN(maxPlaceInLineValue)} in the Pod line at
    ${pricePerPodValue.toFixed(2)} price per Pod`
  );
  details.push(
    `${displayBN(toBuyBeanValue.plus(MaxBN(fromBeanValue, new BigNumber(0))))} Beans
    will be locked in the Marketplace to allow for order fulfillment.`
  );
  details.push(
    `Your offer will expire after ${displayBN(maxPlaceInLineValue)} Pods are harvested from the Pod line`
  );

  const rangeWarning = maxPlaceInLineValue.isLessThan(toPodValue)
    ? (
      <>
        <span style={{ color: 'red', fontSize: 'calc(9px + 0.5vmin)' }}>
          WARNING: The Buy Range is too small to make an offer or there aren&apos;t enough availble Pods in the market.
        </span>
        <br />
      </>
      )
    : null;
  const frontrunTextField =
    settings.mode !== SwapMode.Bean &&
    settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD) ? (
      <FrontrunText />
    ) : null;
  const showSettings = (
    <SettingsFormModule
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      hasClaimable={hasClaimable}
      hasSlippage
      setSettings={setSettings}
      settings={settings}
    />
  );

  const resetFields = () => {
    // eslint-disable-next-line
    unstable_batchedUpdates(() => {
      fromValueUpdated(new BigNumber(-1), new BigNumber(-1));
      setPricePerPodValue(new BigNumber(-1));
      setMaxPlaceInLineValue(new BigNumber(-1));
      setToPodValue(new BigNumber(-1));
    });
  };

  function transactionDetails() {
    if (isFormDisabled) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        {toPodField}
        <TransactionDetailsModule fields={details} />
        <Box
          style={{
            display: 'inline-block',
            width: '100%',
            fontSize: 'calc(9px + 0.5vmin)',
          }}
        >
          <span style={{ fontSize: 'calc(9px + 0.5vmin)' }}>
            You can cancel the offer to return the locked Beans from the marketplace
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toPodValue.isLessThanOrEqualTo(0)) return;

      const claimabl = settings.claim ? claimable : null;
      if (fromEthValue.isGreaterThan(0)) {
        const beans = MaxBN(
          toBaseUnitBN(fromBeanValue, BEAN.decimals),
          new BigNumber(0)
        ).toString();
        const eth = toStringBaseUnitBN(fromEthValue, ETH.decimals);
        const buyBeans = toStringBaseUnitBN(
          toBuyBeanValue.multipliedBy(settings.slippage),
          BEAN.decimals
        );
        buyBeansAndListBuyOffer(
          toStringBaseUnitBN(maxPlaceInLineValue, BEAN.decimals),
          toStringBaseUnitBN(pricePerPodValue, BEAN.decimals),
          beans,
          buyBeans,
          eth,
          claimabl,
          () => {
            resetFields();
          }
        );
      } else {
        listBuyOffer(
          toStringBaseUnitBN(maxPlaceInLineValue, BEAN.decimals),
          toStringBaseUnitBN(pricePerPodValue, BEAN.decimals),
          toStringBaseUnitBN(fromBeanValue, BEAN.decimals),
          claimabl,
          () => {
            resetFields();
          }
        );
      }
    },
  }));

  return (
    <>
      {maxPlaceInLineField}
      {pricePerPodField}
      {fromBeanField}
      {fromEthField}
      {transactionDetails()}
      {rangeWarning}
      {frontrunTextField}
      {showSettings}
    </>
  );
});
