import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { updateUniswapBeanAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE, BEAN, ETH, MIN_BALANCE } from '../../constants';
import {
  approveUniswapBean,
  buyBeans,
  sellBeans,
  toStringBaseUnitBN,
  transferBeans,
} from '../../util';
import { BaseModule, CryptoAsset } from '../Common';
import SendModule from './SendModule';
import SwapModule from './SwapModule';

export default function TradeModule() {
  const { uniswapBeanAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  const { beanReserve, ethReserve, usdcPrice, beanPrice } = useSelector<
    AppState,
    AppState['prices']
  >((state) => state.prices);

  const { beanBalance, ethBalance } = useSelector<
    AppState,
    AppState['userBalance']
  >((state) => state.userBalance);
  const [section, setSection] = useState(0);
  const sectionTitles = ['Swap', 'Send'];
  const sectionTitlesDescription = [
    'Use this tab to trade against the BEAN:ETH Uniswap pool directly on the bean.money website.',
    'Use this tab to send Beans to another Ethereum address.',
  ];

  /* Swap Sub-Module state */

  const [orderIndex, setOrderIndex] = useState(true);
  const [settings, setSettings] = useState({
    slippage: new BigNumber(BASE_SLIPPAGE),
  });
  const [fromValue, setFromValue] = useState(new BigNumber(-1));
  const [toValue, setToValue] = useState(new BigNumber(-1));
  const fromToken = orderIndex ? CryptoAsset.Ethereum : CryptoAsset.Bean;
  const toToken = !orderIndex ? CryptoAsset.Ethereum : CryptoAsset.Bean;
  const ethToBean = new BigNumber(beanReserve.dividedBy(ethReserve));
  const beanToEth = new BigNumber(1).dividedBy(ethToBean);
  const conversionFactor = orderIndex ? ethToBean : beanToEth;

  /* Send Sub-Module state */

  const [toAddress, setToAddress] = useState('');
  const [isValidAddress, setIsValidAddress] = useState(false);

  function handleSwapCallback() {
    setFromValue(new BigNumber(-1));
    setToValue(new BigNumber(-1));
  }

  const handleTabChange = (event, newSection) => {
    handleSwapCallback();
    setToAddress('');
    setSection(newSection);
  };

  const handleForm = () => {
    if (section === 0) {
      const minimumToAmount = toValue.multipliedBy(settings.slippage);

      if (toValue.isGreaterThan(0)) {
        if (fromToken === CryptoAsset.Ethereum) {
          buyBeans(
            toStringBaseUnitBN(fromValue, ETH.decimals),
            toStringBaseUnitBN(minimumToAmount, BEAN.decimals),
            handleSwapCallback
          );
        } else {
          sellBeans(
            toStringBaseUnitBN(fromValue, BEAN.decimals),
            toStringBaseUnitBN(minimumToAmount, ETH.decimals),
            handleSwapCallback
          );
        }
      }
    } else if (section === 1) {
      if (fromValue.isGreaterThan(0)) {
        transferBeans(
          toAddress,
          toStringBaseUnitBN(fromValue, BEAN.decimals),
          handleSwapCallback
        );
      }
    }
  };

  const disabled =
    section === 0
      ? toValue.isLessThanOrEqualTo(0)
      : fromValue.isLessThanOrEqualTo(0) ||
        toAddress.length !== 42 ||
        isValidAddress !== true;

  const sections = [
    <SwapModule
      orderIndex={orderIndex}
      setOrderIndex={setOrderIndex}
      fromValue={fromValue}
      setFromValue={setFromValue}
      toValue={toValue}
      setToValue={setToValue}
      balance={fromToken === CryptoAsset.Ethereum ? ethBalance : beanBalance}
      toBalance={fromToken === CryptoAsset.Ethereum ? beanBalance : ethBalance}
      maxFromVal={
        fromToken === CryptoAsset.Ethereum
          ? ethBalance.isGreaterThan(MIN_BALANCE)
            ? ethBalance.minus(MIN_BALANCE)
            : new BigNumber(-1)
          : beanBalance
      }
      beanReserve={beanReserve}
      ethReserve={ethReserve}
      usdcPrice={usdcPrice}
      beanPrice={beanPrice}
      fromToken={fromToken}
      toToken={toToken}
      conversionFactor={conversionFactor}
      settings={settings}
      setSettings={setSettings}
    />,
    <SendModule
      toAddress={toAddress}
      setToAddress={setToAddress}
      fromAddress=""
      fromBeanValue={fromValue}
      isValidAddress={isValidAddress}
      setIsValidAddress={setIsValidAddress}
      setFromBeanValue={setFromValue}
      maxFromBeanVal={beanBalance}
      fromToken={CryptoAsset.Bean}
    />,
  ];

  return (
    <BaseModule
      allowance={
        section > 0 || orderIndex ? new BigNumber(1) : uniswapBeanAllowance
      }
      isDisabled={disabled}
      resetForm={() => {
        setOrderIndex(1);
      }}
      section={section}
      sectionTitles={sectionTitles}
      sectionTitlesDescription={sectionTitlesDescription}
      setAllowance={updateUniswapBeanAllowance}
      handleApprove={approveUniswapBean}
      handleForm={handleForm}
      handleTabChange={handleTabChange}
    >
      {sections[section]}
    </BaseModule>
  );
}
