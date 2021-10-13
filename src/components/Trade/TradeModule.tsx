import BigNumber from 'bignumber.js'
import React, { useState } from 'react'
import {
  BASE_SLIPPAGE,
  BEAN,
  ETH,
  MIN_BALANCE
} from '../../constants'
import {
  approveUniswapBean,
  buyBeans,
  sellBeans,
  toStringBaseUnitBN,
  transferBeans
} from '../../util'
import { BaseModule, CryptoAsset } from '../Common'
import SendSubModule from './SendSubModule'
import SwapSubModule from './SwapSubModule'

export default function TradeModule(props) {
  const [section, setSection] = useState(0)
  const sectionTitles = ['Swap', 'Send']
  const sectionTitlesDescription = ['Use this tab to trade against the BEAN:ETH Uniswap pool directly on the bean.money website.', 'Use this tab to send Beans to another Ethereum address.']
  const handleTabChange = (event, newSection) => {
    handleSwapCallback()
    setToAddress('')
    setSection(newSection)
  }

  /* Swap Sub-Module state */

  const [orderIndex, setOrderIndex] = useState(true)
  const [settings, setSettings] = useState({ slippage: new BigNumber(BASE_SLIPPAGE) })
  const [fromValue, setFromValue] = useState(new BigNumber(-1))
  const [toValue, setToValue] = useState(new BigNumber(-1))
  const fromToken = orderIndex ? CryptoAsset.Ethereum : CryptoAsset.Bean
  const toToken = !orderIndex ? CryptoAsset.Ethereum : CryptoAsset.Bean
  const ethToBean = new BigNumber(props.beanReserve.dividedBy(props.ethReserve))
  const beanToEth = new BigNumber(1).dividedBy(ethToBean)
  const conversionFactor = orderIndex ? ethToBean : beanToEth

  /* Send Sub-Module state */

  const [toAddress, setToAddress] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)

  function handleSwapCallback() {
    setFromValue(new BigNumber(-1))
    setToValue(new BigNumber(-1))
  }

  function handleForm() {
    if (section === 0) {
      var minimumToAmount = toValue.multipliedBy(settings.slippage)

      if (toValue.isGreaterThan(0)) {
        if (fromToken === CryptoAsset.Ethereum)
          buyBeans(toStringBaseUnitBN(fromValue, ETH.decimals), toStringBaseUnitBN(minimumToAmount,BEAN.decimals), handleSwapCallback)
        else
          sellBeans(toStringBaseUnitBN(fromValue, BEAN.decimals), toStringBaseUnitBN(minimumToAmount, ETH.decimals), handleSwapCallback)
      }
    } else if (section === 1) {
        if (fromValue.isGreaterThan(0)) {
          transferBeans(toAddress, toStringBaseUnitBN(fromValue, BEAN.decimals), handleSwapCallback)
        }
    }
  }

  const disabled = (
    section === 0
      ? toValue.isLessThanOrEqualTo(0)
      : (fromValue.isLessThanOrEqualTo(0) || toAddress.length !== 42 || isValidAddress !== true)
  )

  const sections = [
    <SwapSubModule
      orderIndex={orderIndex}
      setOrderIndex={setOrderIndex}
      fromValue={fromValue}
      setFromValue={setFromValue}
      toValue={toValue}
      setToValue={setToValue}
      balance={fromToken === CryptoAsset.Ethereum ? props.ethBalance : props.beanBalance}
      toBalance={fromToken === CryptoAsset.Ethereum ? props.beanBalance : props.ethBalance}
      maxFromVal={fromToken === CryptoAsset.Ethereum
        ? props.ethBalance.isGreaterThan(MIN_BALANCE)
          ? props.ethBalance.minus(MIN_BALANCE)
          : new BigNumber(-1)
        : props.beanBalance
      }
      beanReserve={props.beanReserve}
      ethReserve={props.ethReserve}
      usdcPrice={props.usdcPrice}
      beanPrice={props.beanPrice}
      fromToken={fromToken}
      toToken={toToken}
      conversionFactor={conversionFactor}
      settings={settings}
      setSettings={setSettings}
    />,
    <SendSubModule
      toAddress={toAddress}
      setToAddress={setToAddress}
      fromAddress={props.address}
      fromBeanValue={fromValue}
      isValidAddress={isValidAddress}
      setIsValidAddress={setIsValidAddress}
      setFromBeanValue={setFromValue}
      maxFromBeanVal={props.beanBalance}
      fromToken={CryptoAsset.Bean}
    />
  ]

  return (
    <BaseModule
      allowance={section > 0 || orderIndex ? new BigNumber(1) : props.uniswapBeanAllowance}
      isDisabled={disabled}
      resetForm={() => { setOrderIndex(1) }}
      section={section}
      sectionTitles={sectionTitles}
      sectionTitlesDescription={sectionTitlesDescription}
      setAllowance={props.setUniswapBeanAllowance}
      handleApprove={approveUniswapBean}
      handleForm={handleForm}
      handleTabChange={handleTabChange}
    >
      {sections[section]}
    </BaseModule>
  )
}
