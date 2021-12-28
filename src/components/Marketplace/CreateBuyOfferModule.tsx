import React, { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import {
  BEAN,
  ETH,
  SLIPPAGE_THRESHOLD,
} from 'constants/index';
import {
  buyAndDepositBeans,
  depositBeans,
  displayBN,
  getToAmount,
  MaxBN,
  smallDecimalPercent,
  SwapMode,
  toBaseUnitBN,
  toStringBaseUnitBN,
  TrimBN,
} from 'util/index';
import {
  CryptoAsset,
  ClaimTextModule,
  EthInputField,
  TokenInputField,
  FrontrunText,
  InputFieldPlus,
  SettingsFormModule,
  SiloAsset,
  TokenOutputField,
  TransactionTextModule,
  TransactionDetailsModule,
} from 'components/Common';

export const CreateBuyOfferModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1));
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));
  const [maxPlaceInLineValue, setMaxPlaceInLineValue] = useState(new BigNumber(-1));

  const { setCanCreateBuyOffer } = props;
  useEffect(() => {
    console.log('new:', fromBeanValue.toString(), fromEthValue.toString(), toBuyBeanValue.toString(), pricePerPodValue.toString(), maxPlaceInLineValue.toString());
    const canBuy = toBuyBeanValue.isGreaterThan(0) && pricePerPodValue.isGreaterThan(0) && pricePerPodValue.isLessThan(1) && maxPlaceInLineValue.isLessThan(10000000) && maxPlaceInLineValue.isGreaterThan(0)
    setCanCreateBuyOffer(canBuy);
  }, [setCanCreateBuyOffer, fromBeanValue, fromEthValue, toBuyBeanValue, pricePerPodValue, maxPlaceInLineValue]);

  function fromValueUpdated(newFromNumber, newFromEthNumber) {
    const buyBeans = getToAmount(
      newFromEthNumber,
      props.ethReserve,
      props.beanReserve
    );
    setToBuyBeanValue(TrimBN(buyBeans, BEAN.decimals));
    setFromEthValue(TrimBN(newFromEthNumber, ETH.decimals));
    setFromBeanValue(TrimBN(newFromNumber, BEAN.decimals));
  }

  /* Input Fields */

  const fromBeanField = (
    <InputFieldPlus
      key={0}
      balance={props.beanBalance}
      claim={props.settings.claim}
      claimableBalance={props.beanClaimableBalance}
      beanLPClaimableBalance={props.beanLPClaimableBalance}
      handleChange={(v) => {
        fromValueUpdated(v, fromEthValue);
      }}
      token={CryptoAsset.Bean}
      value={fromBeanValue}
      visible={props.settings.mode !== SwapMode.Ethereum}
    />
  );
  const fromEthField = (
    <EthInputField
      key={1}
      balance={props.ethBalance}
      buyBeans={toBuyBeanValue}
      claim={props.settings.claim}
      claimableBalance={props.claimableEthBalance}
      handleChange={(v) => {
        fromValueUpdated(fromBeanValue, v);
      }}
      mode={props.settings.mode}
      sellEth={fromEthValue}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromEthValue, 9)}
    />
  );
  const pricePerPodField = (
    <TokenInputField
      key={2}
      label="Price per pod"
      handleChange={(e) => {
        const newPricePerPodValue = new BigNumber(e.target.value)
        // Price can't be created than 1
        if (newPricePerPodValue.isGreaterThanOrEqualTo(1)) {
          setPricePerPodValue(new BigNumber(0.999999))
          return
        }
        setPricePerPodValue(newPricePerPodValue)
      }}
      value={TrimBN(pricePerPodValue, 6)}
    />
  );
  const maxPlaceInLineField = (
    <TokenInputField
      key={3}
      label="Max Place In Line"
      handleChange={(e) => {
        const newMaxPlaceInLineValue = new BigNumber(e.target.value)
        // Line can't be greater than current pod line
        // TODO: mock data, fix this (should be pod line - number of pods)
        if (newMaxPlaceInLineValue.isGreaterThanOrEqualTo(1000000)) {
          setMaxPlaceInLineValue(new BigNumber(1000000))
          return
        }
        setMaxPlaceInLineValue(newMaxPlaceInLineValue)
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
    </>
  );
});
