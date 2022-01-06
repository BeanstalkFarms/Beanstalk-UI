import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import {
  BEAN,
  ETH,
} from 'constants/index';
import {
  getToAmount,
  SwapMode,
  TrimBN,
} from 'util/index';
import {
  CryptoAsset,
  EthInputField,
  InputFieldPlus,
  SettingsFormModule,
  TokenInputField,
} from 'components/Common';

export const CreateBuyOfferModule = (props) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));
  const [maxPlaceInLineValue, setMaxPlaceInLineValue] = useState(new BigNumber(-1));

  const { setBuyOffer } = props;

  //
  useEffect(() => {
    const canBuy = toBuyBeanValue.isGreaterThan(0) &&
    pricePerPodValue.isGreaterThan(0) &&
    pricePerPodValue.isLessThan(1) &&
    maxPlaceInLineValue.isGreaterThan(0);
    if (canBuy) {
      setBuyOffer({
        pricePerPod: pricePerPodValue,
        fromEthValue,
        fromBeanValue,
        buyBeanAmount: toBuyBeanValue,
        maxPlaceInLine: maxPlaceInLineValue,
      });
    } else {
      setBuyOffer(null);
    }
  }, [
    setBuyOffer,
    fromBeanValue,
    fromEthValue,
    toBuyBeanValue,
    pricePerPodValue,
    maxPlaceInLineValue,
  ]);

  /**  */
  function fromValueUpdated(newFromBeanNumber, newFromEthNumber) {
    const buyBeans = getToAmount(
      newFromEthNumber,
      props.ethReserve,
      props.beanReserve
    );
    setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals)); //
    setFromEthValue(TrimBN(newFromEthNumber, ETH.decimals)); //
    setFromBeanValue(TrimBN(newFromBeanNumber, BEAN.decimals)); //
  }

  /* Input Fields */
  const fromBeanField = (
    <InputFieldPlus
      key={0}
      // Current values
      value={fromBeanValue}
      balance={props.beanBalance}
      claimableBalance={props.beanClaimableBalance}
      beanLPClaimableBalance={props.beanLPClaimableBalance}
      // Handlers
      handleChange={(newFromBeanNumber: BigNumber) => {
        // The user set a new amount of Beans.
        fromValueUpdated(newFromBeanNumber, fromEthValue);
      }}
      token={CryptoAsset.Bean}
      // Settings
      claim={props.settings.claim}
      visible={props.settings.mode !== SwapMode.Ethereum} // should be visible if mode = Bean | BeanEthereum
    />
  );
  const fromEthField = (
    <EthInputField
      key={1}
      // Current values
      balance={props.ethBalance}
      buyBeans={toBuyBeanValue}
      value={TrimBN(fromEthValue, 9)}
      sellEth={fromEthValue}
      // Handlers
      handleChange={(newFromEthNumber: BigNumber) => {
        fromValueUpdated(fromBeanValue, newFromEthNumber);
      }}
      updateExpectedPrice={props.updateExpectedPrice}
      // Settings
      mode={props.settings.mode} // will auto-disable if mode == SwapMode.Bean
    />
  );
  const pricePerPodField = (
    <TokenInputField
      key={2}
      label="Price per pod"
      token={CryptoAsset.Bean}
      handleChange={(e) => {
        const newPricePerPodValue = new BigNumber(e.target.value);
        // Price can't be created than 1
        if (newPricePerPodValue.isGreaterThanOrEqualTo(1)) {
          setPricePerPodValue(new BigNumber(0.999999));
          return;
        }
        setPricePerPodValue(newPricePerPodValue);
      }}
      value={TrimBN(pricePerPodValue, 6)}
    />
  );
  const maxPlaceInLineField = (
    <TokenInputField
      key={3}
      label="Max Place In Line"
      handleChange={(e) => {
        const newMaxPlaceInLineValue = new BigNumber(e.target.value);
        // Line can't be greater than current pod line
        // TODO: mock data, fix this (should be pod line - number of pods)
        if (newMaxPlaceInLineValue.isGreaterThanOrEqualTo(1000000)) {
          setMaxPlaceInLineValue(new BigNumber(1000000));
          return;
        }
        setMaxPlaceInLineValue(newMaxPlaceInLineValue);
      }}
      value={maxPlaceInLineValue}
      placeholder="1000000"
    />
  );

  return (
    <>
      {fromBeanField}
      {fromEthField}
      {pricePerPodField}
      {maxPlaceInLineField}
      <SettingsFormModule
        setSettings={props.setSettings}
        settings={props.settings}
        handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
        hasClaimable={props.hasClaimable}
      />
    </>
  );
};
