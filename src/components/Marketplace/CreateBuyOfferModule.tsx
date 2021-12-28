import React, { forwardRef, useImperativeHandle, useState } from 'react';
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
  const [pricePerPodValue, setPricePerPodValue] = useState(new BigNumber(-1));
  const [toBuyBeanValue, setToBuyBeanValue] = useState(new BigNumber(0));
  console.log('price per pod:', pricePerPodValue);

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
          setPricePerPodValue(new BigNumber(1))
          return
        }
        setPricePerPodValue(new BigNumber(e.target.value))
      }}
      value={TrimBN(pricePerPodValue, 6)}
      balance={new BigNumber(0)}
    />
  );
  console.log('eth:', fromEthValue.toString())
  console.log('price per pod:', pricePerPodValue.toString())

  /* Transaction Details, settings and text */
  const details = [];
  if (props.settings.claim) {
    details.push(
      <ClaimTextModule
        key="claim"
        balance={props.beanClaimable.plus(props.ethClaimable)}
        claim={props.settings.claim}
        mode={props.settings.mode}
        beanClaimable={props.beanClaimable}
        ethClaimable={props.ethClaimable}
      />
    );
  }
  if (
    props.settings.mode === SwapMode.Ethereum ||
    (props.settings.mode === SwapMode.BeanEthereum &&
      toBuyBeanValue.isGreaterThan(0))
  ) {
    details.push(
      <TransactionTextModule
        key="buy"
        balance={toBuyBeanValue}
        buyBeans={toBuyBeanValue}
        claim={props.settings.claim}
        claimableBalance={props.claimableEthBalance}
        mode={props.settings.mode}
        sellEth={fromEthValue}
        updateExpectedPrice={props.updateExpectedPrice}
        value={TrimBN(fromEthValue, 9)}
      />
    );
  }
  const beanOutput = MaxBN(toBuyBeanValue, new BigNumber(0)).plus(
    MaxBN(fromBeanValue, new BigNumber(0))
  );

  details.push(`Deposit ${displayBN(beanOutput)}
    ${beanOutput.isEqualTo(1) ? 'Bean' : 'Beans'} in the Silo`);

  return (
    <>
      {fromBeanField}
      {fromEthField}
      {pricePerPodField}
    </>
  );
});
