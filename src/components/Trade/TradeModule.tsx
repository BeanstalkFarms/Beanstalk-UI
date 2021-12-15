import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'state';
import { updateUniswapBeanAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE, BEAN, ETH, MIN_BALANCE } from 'constants/index';
import {
  approveUniswapBean,
  buyBeans,
  sellBeans,
  toStringBaseUnitBN,
  transferBeans,
} from 'util/index';
import { BaseModule, CryptoAsset, Grid, tradeStrings } from 'components/Common';
import { useLatestTransactionNumber } from 'state/general/hooks';
import {
  addTransaction,
  completeTransaction,
  State,
} from 'state/general/actions';
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
  const sectionTitlesDescription = [tradeStrings.swap, tradeStrings.send];

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
  const dispatch = useDispatch();
  const latestTransactionNumber = useLatestTransactionNumber();

  function handleSwapCallback(transactionNumber = null) {
    if (!transactionNumber) {
      dispatch(completeTransaction(transactionNumber));
    }
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
          const transactionNumber = latestTransactionNumber + 1;
          dispatch(
            addTransaction({
              transactionNumber,
              description: `Buying ${fromValue} beans`,
              state: State.PENDING,
            })
          );

          buyBeans(
            toStringBaseUnitBN(fromValue, ETH.decimals),
            toStringBaseUnitBN(minimumToAmount, BEAN.decimals),
            () => handleSwapCallback(transactionNumber)
          );
        } else {
          const transactionNumber = latestTransactionNumber + 1;
          dispatch(
            addTransaction({
              transactionNumber,
              description: `Selling ${fromValue} beans`,
              state: State.PENDING,
            })
          );

          sellBeans(
            toStringBaseUnitBN(fromValue, BEAN.decimals),
            toStringBaseUnitBN(minimumToAmount, ETH.decimals),
            () => handleSwapCallback(transactionNumber)
          );
        }
      }
    } else if (section === 1) {
      if (fromValue.isGreaterThan(0)) {
        const transactionNumber = latestTransactionNumber + 1;
        dispatch(
          addTransaction({
            transactionNumber,
            description: `Transfering ${fromValue} beans to ${toAddress}`,
            state: State.PENDING,
          })
        );

        transferBeans(
          toAddress,
          toStringBaseUnitBN(fromValue, BEAN.decimals),
          () => handleSwapCallback(transactionNumber)
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
    <Grid container item xs={12} justifyContent="center">
      <Grid
        item
        xs={9}
        sm={8}
        style={{ maxWidth: '500px', minHeight: '645px' }}
      >
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
          marginTop="16px"
        >
          {sections[section]}
        </BaseModule>
      </Grid>
    </Grid>
  );
}
