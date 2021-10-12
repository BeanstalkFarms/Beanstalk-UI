import BigNumber from 'bignumber.js'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { BEAN, ETH, SLIPPAGE_THRESHOLD } from '../../constants'
import {
  buyAndSowBeans,
  getFromAmount,
  getToAmount,
  MaxBN,
  MinBNs,
  sowBeans,
  SwapMode,
  toBaseUnitBN,
  toStringBaseUnitBN,
  TrimBN
} from '../../util'
import {
  CryptoAsset,
  EthInputField,
  FarmAsset,
  FrontrunText,
  InputFieldPlus,
  SettingsFormModule,
  TokenOutputField
} from '../Common'

export const SowModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1))
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(-1))
  const [buyBeanValue, setBuyBeanValue] = useState(new BigNumber(0))
  const [toPodValue, setToPodValue] = useState(new BigNumber(0))

  let claimableFromVal = props.settings.claim ? props.beanClaimableBalance : 0
  let maxFromVal = props.beanBalance.plus(claimableFromVal)
  let maxToVal = props.soil

  function fromValueUpdated(newFromNumber, newEthFromNumber) {
    const newFromValue = MinBNs([newFromNumber, maxFromVal, maxToVal])
    setFromBeanValue(TrimBN(newFromValue, 6))
    const newFromEthValue = MinBNs([newEthFromNumber, getFromAmount(maxToVal.minus(MaxBN(newFromValue, new BigNumber(0))), props.ethReserve, props.beanReserve, ETH.decimals)])
    BigNumber.set({ DECIMAL_PLACES: 6 })
    const buyBeans = getToAmount(newFromEthValue, props.ethReserve, props.beanReserve)
    BigNumber.set({ DECIMAL_PLACES: 18 })
    setBuyBeanValue(buyBeans)
    setFromEthValue(TrimBN(newFromEthValue, 6))
    const sowedBeans = MaxBN(buyBeans, new BigNumber(0)).plus(MaxBN(newFromValue, new BigNumber(0)))
    setToPodValue(TrimBN(sowedBeans.multipliedBy((new BigNumber(1)).plus(props.weather.dividedBy(100))),6))
    props.setIsFormDisabled(sowedBeans.isLessThanOrEqualTo(0))
  }

  /* Input Fields */

  const fromBeanField = (
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
  const fromEthField = (
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

  const toPodField = (
    <TokenOutputField
      token={FarmAsset.Pods}
      value={toPodValue}
      // value={MaxBN(buyBeanValue, new BigNumber(0)).plus(MaxBN(fromBeanValue, new BigNumber(0)))}
      decimals={BEAN.decimals}
      mint
    />
  )

  /* Transaction Details, settings and text */

  const sowText = (
    buyBeanValue.plus(fromBeanValue).isEqualTo(props.soil)
      ? `Sowing Maximum Soil With ${props.weather.toFixed()}% Weather`
      : `Sowing With ${props.weather.toFixed()}% Weather`
  )
  const sowTextField = (
    <div style={{marginTop: '-5px', fontFamily: 'Futura-PT-Book'}}>{sowText}</div>
  )
  const noSoilTextField = (
    props.soil.isEqualTo(0)
      ? <div style={{marginTop: '-2px', fontFamily: 'Futura-PT-Book'}}>Currently No Soil</div>
      : null
  )
  const frontrunTextField = (
    props.settings.mode !== SwapMode.Bean && props.settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD)
      ? <FrontrunText />
      : null
  )
  const showSettings = (
    <SettingsFormModule
      settings={props.settings}
      setSettings={props.setSettings}
      handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
      hasClaimable={props.hasClaimable}
      hasSlippage={true}
    />
  )
  function transactionDetails() {
    if (toPodValue.isLessThanOrEqualTo(0)) return null

    return (
      <>
      <ExpandMoreIcon color='primary' style={{marginBottom: '-14px', width: '100%'}} />
      {toPodField}
      {sowTextField}
      </>
    )
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (toPodValue.isLessThanOrEqualTo(0)) return

      const claimable = props.settings.claim ? props.claimable : null
      if (fromEthValue.isGreaterThan(0)) {
        const beans = MaxBN(toBaseUnitBN(fromBeanValue,BEAN.decimals), new BigNumber(0)).toString()
        const eth = toStringBaseUnitBN(fromEthValue,ETH.decimals)
        const buyBeans = toStringBaseUnitBN(buyBeanValue.multipliedBy(props.settings.slippage),BEAN.decimals)
        buyAndSowBeans(beans, buyBeans, eth, claimable, () => {
          fromValueUpdated(new BigNumber(-1), new BigNumber(-1))
        })

      } else {
        sowBeans(toStringBaseUnitBN(fromBeanValue,BEAN.decimals), claimable, () => {
          fromValueUpdated(new BigNumber(-1), new BigNumber(-1))
        })
      }
    }
  }))

  return (
    <>
    {fromBeanField}
    {fromEthField}
    {noSoilTextField}
    {frontrunTextField}
    {transactionDetails()}
    {showSettings}
    </>
  )
})
