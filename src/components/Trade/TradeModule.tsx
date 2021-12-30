import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { updateUniswapBeanAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE, BEAN, ETH, MIN_BALANCE } from 'constants/index';
import {
  approveUniswapBean,
  buyBeans,
  sellBeans,
  toStringBaseUnitBN,
  transferBeans,
  TokenLabel,
} from 'util/index';
import { BaseModule, CryptoAsset, Grid, tradeStrings } from 'components/Common';
import SendModule from './SendModule';
import SwapModule from './SwapModule';

export default function TradeModule() {
  const { uniswapBeanAllowance } = useSelector<
    AppState,
    AppState['allowances']
  >((state) => state.allowances);

  const { beanReserve, ethReserve, usdcPrice, beanPrice, ethPrices } = useSelector<
    AppState,
    AppState['prices']
  >((state) => state.prices);

  const { beanBalance, ethBalance } = useSelector<
    AppState,
    AppState['userBalance']
  >((state) => state.userBalance);
  const [section, setSection] = useState(0);
  const sectionTitles = ['Swap', 'Send'];
  const sectionTitlesDescription = [tradeStrings.swap, tradeStrings.send];

  /* Swap Sub-Module state */
  const [orderIndex, setOrderIndex] = useState(true);
  const [settings, setSettings] = useState({
    slippage: new BigNumber(BASE_SLIPPAGE),
  });
  const [fromValue, setFromValue] = useState(new BigNumber(-1));
  const [toValue, setToValue] = useState(new BigNumber(-1));
  const [fromToken, setFromToken] = useState(CryptoAsset.Ethereum); // default fromToken
  const [toToken, setToToken] = useState(CryptoAsset.Bean); // default toToken
  const ethToBean = new BigNumber(beanReserve.dividedBy(ethReserve));
  const beanToEth = new BigNumber(1).dividedBy(ethToBean);
  const conversionFactor = orderIndex ? ethToBean : beanToEth;

  /* Send Sub-Module state */
  const tokenList = ([
    { label: TokenLabel(CryptoAsset.Bean), token: CryptoAsset.Bean, price: beanPrice, reserve: beanReserve, balance: beanBalance, decimals: BEAN.decimals, approve: uniswapBeanAllowance },
    { label: TokenLabel(CryptoAsset.Ethereum), token: CryptoAsset.Ethereum, price: ethPrices, reserve: ethReserve, balance: ethBalance, decimals: ETH.decimals, approve: new BigNumber(1) },
    { label: TokenLabel(CryptoAsset.Usdc), token: CryptoAsset.Usdc, price: beanPrice, reserve: beanReserve, balance: beanBalance, decimals: BEAN.decimals, approve: uniswapBeanAllowance },
    { label: TokenLabel(CryptoAsset.Dai), token: CryptoAsset.Dai, price: beanPrice, reserve: beanReserve, balance: beanBalance, decimals: BEAN.decimals, approve: uniswapBeanAllowance },
    { label: TokenLabel(CryptoAsset.Usdt), token: CryptoAsset.Usdt, price: beanPrice, reserve: beanReserve, balance: beanBalance, decimals: BEAN.decimals, approve: uniswapBeanAllowance },
  ]); // temporary
  const inputToken = tokenList[Object.keys(tokenList).filter((t) => tokenList[t].token === fromToken)];
  const outputToken = tokenList[Object.keys(tokenList).filter((t) => tokenList[t].token === toToken)];

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
      inputToken={inputToken}
      outputToken={outputToken}
      tokenList={tokenList}
      orderIndex={orderIndex}
      setOrderIndex={setOrderIndex}
      fromValue={fromValue}
      setFromValue={setFromValue}
      toValue={toValue}
      setToValue={setToValue}
      balance={inputToken.balance}
      toBalance={outputToken.balance}
      maxFromVal={
        inputToken.token === CryptoAsset.Ethereum
          ? inputToken.balance.isGreaterThan(MIN_BALANCE)
            ? inputToken.balance.minus(MIN_BALANCE)
            : new BigNumber(-1)
          : inputToken.balance
      }
      beanReserve={beanReserve}
      ethReserve={ethReserve}
      usdcPrice={usdcPrice}
      beanPrice={beanPrice}
      setFromToken={setFromToken}
      setToToken={setToToken}
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
    <Grid container item xs={12} justifyContent="center">
      <Grid
        item
        xs={9}
        sm={8}
        style={{ maxWidth: '500px' }}
      >
        <BaseModule
          allowance={
            section > 0 ? new BigNumber(1) : inputToken.allowance
          }
          isDisabled={disabled}
          resetForm={() => {
            setOrderIndex(1);
            setFromToken(CryptoAsset.Ethereum);
            setToToken(CryptoAsset.Bean);
          }}
          section={section}
          sectionTitles={sectionTitles}
          sectionTitlesDescription={sectionTitlesDescription}
          setAllowance={updateUniswapBeanAllowance}
          handleApprove={approveUniswapBean}
          handleForm={handleForm}
          handleTabChange={handleTabChange}
          marginTop="16px"
        >
          {sections[section]}
        </BaseModule>
      </Grid>
    </Grid>
  );
}
