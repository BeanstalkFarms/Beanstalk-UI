import BigNumber from 'bignumber.js'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {
  BEAN,
  BEAN_TO_SEEDS,
  ETH,
  SEEDS,
  SLIPPAGE_THRESHOLD,
  STALK
} from '../../constants'
import {
  buyAndDepositBeans,
  depositBeans,
  displayBN,
  getToAmount,
  MaxBN,
  SwapMode,
  toBaseUnitBN,
  toStringBaseUnitBN,
  TrimBN
} from '../../util'
import {
  CryptoAsset,
  EthInputField,
  FrontrunText,
  InputFieldPlus,
  SettingsFormModule,
  SiloAsset,
  TokenOutputField
} from '../Common'

export const BeanDepositSubModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1))
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1))
  const [buyBeanValue, setBuyBeanValue] = useState(new BigNumber(0))
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0))
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0))

  function fromValueUpdated(newFromNumber, newFromEthNumber) {
    const buyBeans = getToAmount(newFromEthNumber, props.ethReserve, props.beanReserve)
    setBuyBeanValue(TrimBN(buyBeans, BEAN.decimals))
    setFromEthValue(TrimBN(newFromEthNumber, ETH.decimals))
    setFromBeanValue(TrimBN(newFromNumber, BEAN.decimals))
    const depositedBeans = MaxBN(buyBeans, new BigNumber(0)).plus(MaxBN(newFromNumber, new BigNumber(0)))
    const newToStalkValue = TrimBN(depositedBeans.multipliedBy(props.beanToStalk), STALK.decimals)
    setToStalkValue(newToStalkValue)
    setToSeedsValue(TrimBN(depositedBeans.multipliedBy(BEAN_TO_SEEDS), SEEDS.decimals))
    props.setIsFormDisabled(newToStalkValue.isLessThanOrEqualTo(0))
  }

  /* Input Fields */

  const beanField = (
    <InputFieldPlus
      key={0}
      balance={props.beanBalance}
      claim={props.settings.claim}
      claimableBalance={props.beanClaimableBalance}
      handleChange={(v) => { fromValueUpdated(v, fromEthValue) }}
      token={CryptoAsset.Bean}
      value={fromBeanValue}
      visible={props.settings.mode !== SwapMode.Ethereum}
    />
  )
  const ethField = (
    <EthInputField
      key={1}
      balance={props.ethBalance}
      buyBeans={buyBeanValue}
      claim={props.settings.claim}
      claimableBalance={props.claimableEthBalance}
      handleChange={(v) => fromValueUpdated(fromBeanValue, v)}
      mode={props.settings.mode}
      sellEth={fromEthValue}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromEthValue, 9)}
    />
  )

  /* Output Fields */

  const toStalkField = (
    <TokenOutputField
      decimals={4}
      mint
      token={SiloAsset.Stalk}
      value={toStalkValue}
    />
  )
  const toSeedsField = (
    <TokenOutputField
      decimals={4}
      mint
      token={SiloAsset.Seed}
      value={toSeedsValue}
    />
  )
  const toSiloBeanField = (
    <TokenOutputField
      mint
      token={SiloAsset.Bean}
      value={MaxBN(buyBeanValue, new BigNumber(0)).plus(MaxBN(fromBeanValue, new BigNumber(0)))}
    />
  )

  /* Transaction Details, settings and text */

  const frontrunTextField = (
    props.settings.mode !== SwapMode.Bean && props.settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD)
      ? <FrontrunText />
      : null
  )
  const showSettings = (
    <SettingsFormModule
      setSettings={props.setSettings}
      settings={props.settings}
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      hasClaimable={props.hasClaimable}
      hasSlippage={true}
    />
  )
  function transactionDetails() {
    if (toStalkValue.isLessThanOrEqualTo(0)) return null

    return (
      <>
      <ExpandMoreIcon color='primary' style={{marginBottom: '-14px', width: '100%'}} />
      <div style={{display: 'inline-flex'}}>
        <div style={{marginRight: '5px'}}>{toStalkField}</div>
        <div style={{marginLeft: '5px'}}>{toSeedsField}</div>
      </div>
      <div style={{display: 'inline-block', width: '100%'}}>{toSiloBeanField}</div>
      <div style={{display: 'inline-block', width: '100%'}}>
        <span>{`You will Deposit ${displayBN(new BigNumber(toStalkValue))} Beans in the Silo.`}</span>
        <br/>
        <span>{`You will immediately receive ${displayBN(new BigNumber(toStalkValue))} Stalk and ${displayBN(new BigNumber(toSeedsValue))} Seeds.`}</span>
        <br/>
        <span>{`${displayBN(new BigNumber(toStalkValue))} Stalk currently translates to ${toStalkValue.dividedBy(props.totalStalk).multipliedBy(100).toFixed(3)}% ownership of Beanstalk.`}</span>
      </div>
      </>
    )
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toStalkValue.isZero() || toStalkValue.isNegative()) return

      const claimable = props.settings.claim ? props.claimable : null
      if (fromEthValue.isGreaterThan(0)) {
        const beans = MaxBN(toBaseUnitBN(fromBeanValue,BEAN.decimals), new BigNumber(0)).toString()
        const eth = toStringBaseUnitBN(fromEthValue,ETH.decimals)
        const buyBeans = toStringBaseUnitBN(buyBeanValue.multipliedBy(props.settings.slippage),BEAN.decimals)
        buyAndDepositBeans(beans, buyBeans, eth, claimable, () => {
          fromValueUpdated(new BigNumber(-1), new BigNumber(-1))
        })
      } else {
        depositBeans(toStringBaseUnitBN(fromBeanValue, BEAN.decimals), claimable, () => {
          fromValueUpdated(new BigNumber(-1), new BigNumber(-1))
        })
      }
    }
  }))

  return (
    <>
    {beanField}
    {ethField}
    {transactionDetails()}
    {frontrunTextField}
    {showSettings}
    </>
  )
})
