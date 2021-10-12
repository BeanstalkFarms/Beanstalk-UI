import BigNumber from 'bignumber.js'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {
  BEAN,
  BEAN_TO_SEEDS,
  BEAN_TO_STALK,
  ETH,
  LPBEANS_TO_SEEDS,
  MIN_BALANCE,
  SEEDS,
  SLIPPAGE_THRESHOLD,
  STALK,
  UNI_V2_ETH_BEAN_LP
} from '../../constants'
import {
  addAndDepositLP,
  convertAddAndDepositLP,
  depositLP,
  displayBN,
  getBuyAndAddLPAmount,
  getFromAmount,
  lpForPool,
  MaxBN,
  MinBN,
  SwapMode,
  tokenForLP,
  toStringBaseUnitBN,
  toTokenUnitsBN,
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

export const LPDepositSubModule = forwardRef((props, ref) => {
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(0))
  const [fromEthValue, setFromEthValue] = useState(new BigNumber(0))
  const [fromLPValue, setFromLPValue] = useState(new BigNumber(0))
  const [toSellBeansValue, setToSellBeansValue] = useState(new BigNumber(0))
  const [toBuyBeansValue, setToBuyBeansValue] = useState(new BigNumber(0))
  const [toSellEthValue, setToSellEthValue] = useState(new BigNumber(0))
  const [toBuyEthValue, setToBuyEthValue] = useState(new BigNumber(0))
  const [toSiloLPValue, setToSiloLPValue] = useState(new BigNumber(0))
  const [toStalkValue, setToStalkValue] = useState(new BigNumber(0))
  const [toSeedsValue, setToSeedsValue] = useState(new BigNumber(0))
  const [beanConvertParams, setBeanConvertParams] = useState({
    crates: [],
    amounts: []
  })

  function fromValueUpdated(newFromNumber, newFromEthNumber, newFromLPNumber) {
    if (newFromNumber.isLessThanOrEqualTo(0) && newFromEthNumber.isLessThanOrEqualTo(0) && newFromLPNumber.isLessThan(0)) {
      unstable_batchedUpdates(() => {
        setToBuyBeansValue(new BigNumber(0))
        setToSellEthValue(new BigNumber(0))
        setFromEthValue(new BigNumber(-1))
        setFromBeanValue(new BigNumber(-1))
        setFromLPValue(new BigNumber(-1))
        setToBuyEthValue(new BigNumber(0))
        setToSellBeansValue(new BigNumber(0))
        setToSiloLPValue(new BigNumber(0))
        setToStalkValue(new BigNumber(0))
        setToSeedsValue(new BigNumber(0))
      })
      props.setIsFormDisabled(true)
      return
    }
    let fromNumber = new BigNumber(0)
    let fromEtherNumber = new BigNumber(0)
    let fromLPNumber = MaxBN(newFromLPNumber, new BigNumber(0))
    let buyNumber = new BigNumber(0)
    let stalkRemoved = new BigNumber(0)
    let sellNumber = new BigNumber(0)
    let fromConvertBeans = new BigNumber(0)
    let newBeanReserve = props.beanReserve
    let newEthReserve = props.ethReserve
    if (props.settings.mode === SwapMode.BeanEthereum || props.settings.mode === SwapMode.BeanEthereumSwap) {
      const newBeanFromEthNumber = (
        newFromEthNumber.isGreaterThan(0)
          ? newFromEthNumber.multipliedBy(props.ethToBean).plus(0.000001)
          : new BigNumber(0)
      )
      fromNumber = MinBN(newFromNumber, newBeanFromEthNumber)
      if (props.settings.convert) {
          [stalkRemoved, fromConvertBeans] = handleConvertCrates(fromNumber)
      }
      fromEtherNumber = fromNumber.multipliedBy(props.beanToEth)
      newFromEthNumber = newFromEthNumber.minus(fromEtherNumber)
      if (props.settings.mode === SwapMode.BeanEthereum) {
        setFromBeanValue(TrimBN(fromNumber, BEAN.decimals))
        setFromEthValue(TrimBN(fromEtherNumber, ETH.decimals))
      }
    } if (props.settings.mode === SwapMode.Ethereum || (props.settings.mode === SwapMode.BeanEthereumSwap && fromNumber.isEqualTo(newFromNumber))) {
        buyNumber = getBuyAndAddLPAmount(newFromEthNumber.minus(fromEtherNumber), props.ethReserve, props.beanReserve)
        sellNumber = getFromAmount(buyNumber, props.ethReserve, props.beanReserve, ETH.decimals)
        fromEtherNumber = newFromEthNumber
        setToBuyBeansValue(buyNumber)
        setToSellEthValue(sellNumber)
        setFromEthValue(TrimBN(fromEtherNumber, ETH.decimals))
        setFromBeanValue(fromNumber)
        fromEtherNumber = newFromEthNumber.minus(sellNumber)
        fromNumber = fromNumber.plus(buyNumber)
        newEthReserve = newEthReserve.plus(sellNumber)
        newBeanReserve = newBeanReserve.minus(buyNumber)
    } else if (props.settings.mode === SwapMode.Bean || (props.settings.mode === SwapMode.BeanEthereumSwap && fromNumber.isLessThan(newFromNumber))) {
        buyNumber = getBuyAndAddLPAmount(newFromNumber.minus(fromNumber), props.beanReserve, props.ethReserve)
        sellNumber = getFromAmount(buyNumber, props.beanReserve, props.ethReserve)
        fromNumber = newFromNumber
        setToBuyEthValue(buyNumber)
        setToSellBeansValue(sellNumber)
        setFromEthValue(fromEtherNumber)
        setFromBeanValue(TrimBN(fromNumber, BEAN.decimals))
        fromNumber = fromNumber.minus(sellNumber)
        fromEtherNumber = fromEtherNumber.plus(buyNumber)
        newBeanReserve = newBeanReserve.plus(sellNumber)
        newEthReserve = newEthReserve.minus(buyNumber)
    }
    setFromLPValue(fromLPNumber)
    const lpToDeposit = fromLPNumber.plus(lpForPool(fromNumber, newBeanReserve, fromEtherNumber, newEthReserve, props.totalLP))
    fromNumber = fromNumber.plus(tokenForLP(fromLPNumber, newBeanReserve, props.totalLP))
    setToSiloLPValue(lpToDeposit,UNI_V2_ETH_BEAN_LP.decimals)
    setToStalkValue(TrimBN(fromNumber.multipliedBy(props.beanToStalk).minus(fromConvertBeans.multipliedBy(BEAN_TO_STALK)), STALK.decimals))
    setToSeedsValue(TrimBN(fromNumber.multipliedBy(2*LPBEANS_TO_SEEDS).minus(fromConvertBeans.multipliedBy(BEAN_TO_SEEDS)), SEEDS.decimals))
    props.setIsFormDisabled(fromNumber.isLessThanOrEqualTo(0) && fromEtherNumber.isLessThanOrEqualTo(0) && fromLPNumber.isLessThanOrEqualTo(0))
  }

  const handleConvertCrates = (beans) => {
    var beansRemoved = new BigNumber(0)
    var stalkRemoved = new BigNumber(0)
    var crates = []
    var amounts = []
    Object.keys(props.beanCrates).sort((a,b) => parseInt(b) - parseInt(a)).some(key => {
      const crateBeansRemoved = beansRemoved.plus(props.beanCrates[key]).isLessThanOrEqualTo(beans) ? props.beanCrates[key] : beans.minus(beansRemoved)
      beansRemoved = beansRemoved.plus(crateBeansRemoved)
      stalkRemoved = stalkRemoved.plus(crateBeansRemoved.multipliedBy(props.season.minus(key)).multipliedBy(BEAN_TO_SEEDS))
      crates.push(key)
      amounts.push(toStringBaseUnitBN(crateBeansRemoved, BEAN.decimals))
      return beansRemoved.isEqualTo(beans)
    })
    setBeanConvertParams({crates,amounts})
    return [toTokenUnitsBN(stalkRemoved,4), beansRemoved]
  }

  const convertibleBeans = props.settings.convert && props.settings.mode === SwapMode.BeanEthereum ? props.maxFromBeanSiloVal : 0
  const claimableBeans = props.settings.claim ? props.maxFromClaimableVal : 0
  const maxBeans = props.beanBalance.plus(convertibleBeans).plus(claimableBeans)

  /* Input Fields */

  const fromBeanField = (
    <InputFieldPlus
      balance={props.beanBalance.plus(convertibleBeans)}
      buyEth={toBuyEthValue}
      claim={props.settings.claim}
      claimableBalance={props.maxFromClaimableVal}
      handleChange={(v) => fromValueUpdated(v, (props.ethBalance.isGreaterThan(MIN_BALANCE) ? props.ethBalance.minus(MIN_BALANCE) : new BigNumber(0)), fromLPValue)}
      sellToken={toSellBeansValue}
      updateExpectedPrice={props.updateExpectedPrice}
      value={TrimBN(fromBeanValue, BEAN.decimals)}
      visible={props.settings.mode < 2}
    />
  )
  const fromLPField = (
    <InputFieldPlus
      balance={props.lpBalance}
      claim={props.settings.claim}
      claimableBalance={new BigNumber(0)}
      handleChange={(v) => fromValueUpdated(fromBeanValue, fromEthValue, v)}
      isLP={true}
      poolForLPRatio={props.poolForLPRatio}
      token={CryptoAsset.LP}
      value={TrimBN(fromLPValue, UNI_V2_ETH_BEAN_LP.decimals)}
      visible={props.settings.useLP || props.settings.mode === SwapMode.LP}
    />
  )
  const fromEthField = (
    <EthInputField
      balance={props.ethBalance}
      buyBeans={toBuyBeansValue}
      claim={props.settings.claim}
      claimableBalance={props.claimableEthBalance}
      handleChange={(v) => fromValueUpdated(maxBeans, v, fromLPValue)}
      mode={props.settings.mode}
      sellEth={toSellEthValue}
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
  const toSeedsField = <TokenOutputField
    decimals={4}
    mint
    token={SiloAsset.Seed}
    value={toSeedsValue}
  />
  const toSiloLPField = (
    <TokenOutputField
      mint
      token={SiloAsset.LP}
      value={toSiloLPValue}
    />
  )

  /* Transaction Details, settings and text */

  const resetFields = () => {
    fromValueUpdated(new BigNumber(-1), new BigNumber(-1), new BigNumber(-1))
  }
  const frontrunTextField = (
    props.settings.mode !== SwapMode.Bean && props.settings.slippage.isLessThanOrEqualTo(SLIPPAGE_THRESHOLD)
      ? <FrontrunText />
      : null
  )
  const showSettings = (
    <SettingsFormModule
      handleMode={resetFields}
      hasClaimable={props.hasClaimable}
      hasConvertible={props.maxFromBeanSiloVal.isGreaterThan(0)}
      hasSlippage={true}
      setSettings={props.setSettings}
      settings={props.settings}
      showLP={props.lpBalance.isGreaterThan(0)}
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
      <div style={{display: 'inline-block', width: '100%'}}>{toSiloLPField}</div>
      <div style={{display: 'inline-block', width: '100%'}}>
        <span>{`Note: Your Deposit will be instantly received.`}</span>
        <br/>
        <span>{`You will receive ${displayBN(new BigNumber(toStalkValue))} Stalk, ${displayBN(new BigNumber(toSeedsValue))} Seeds and gain ${toSiloLPValue.dividedBy(props.totalLP).multipliedBy(100).toFixed(3)}% of the LP pool.`}</span>
      </div>
      </>
    )
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (fromBeanValue.isGreaterThan(0) || fromEthValue.isGreaterThan(0) || fromLPValue.isGreaterThan(0)) {
        const claimable = props.settings.claim ? props.claimable : null
        const lp = MaxBN(fromLPValue, new BigNumber(0))
        if (props.settings.mode === SwapMode.LP && lp.isGreaterThan(0)) {
          depositLP(toStringBaseUnitBN(lp,ETH.decimals),claimable, () => resetFields())
        }
        else if (props.settings.convert) {
          convertAddAndDepositLP(
            toStringBaseUnitBN(lp,ETH.decimals),
            toStringBaseUnitBN(fromEthValue,ETH.decimals),
            [
              toStringBaseUnitBN(fromBeanValue,BEAN.decimals),
              toStringBaseUnitBN(fromBeanValue.multipliedBy(props.settings.slippage),BEAN.decimals),
              toStringBaseUnitBN(fromEthValue.multipliedBy(props.settings.slippage),ETH.decimals)
            ],
            beanConvertParams.crates,
            beanConvertParams.amounts,
            claimable,
            () => resetFields())
        } else {
          const beans = fromBeanValue.plus(toBuyBeansValue).minus(toSellBeansValue)
          const buyEth = MaxBN(toBuyEthValue, new BigNumber(0))
          const eth = fromEthValue.plus(buyEth).minus(toSellEthValue)
          addAndDepositLP(
            toStringBaseUnitBN(lp,ETH.decimals),
            toStringBaseUnitBN(toBuyBeansValue,BEAN.decimals),
            toStringBaseUnitBN(buyEth,ETH.decimals),
            toStringBaseUnitBN(fromEthValue,ETH.decimals),
            [
              toStringBaseUnitBN(beans,BEAN.decimals),
              toStringBaseUnitBN(beans.multipliedBy(props.settings.slippage),BEAN.decimals),
              toStringBaseUnitBN(eth.multipliedBy(props.settings.slippage),ETH.decimals)
            ],
            claimable,
            () => resetFields())
        }
      }
    }
  }))

  return (
    <>
    {fromLPField}
    {fromBeanField}
    {fromEthField}
    {transactionDetails()}
    {frontrunTextField}
    {showSettings}
    </>
  )
})
