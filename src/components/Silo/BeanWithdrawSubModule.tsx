import BigNumber from 'bignumber.js'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {
  BEAN,
  BEAN_TO_SEEDS,
  SEEDS,
  STALK
} from '../../constants'
import {
  claimAndWithdrawBeans,
  displayBN,
  MinBN,
  MinBNs,
  toStringBaseUnitBN,
  TrimBN,
  withdrawBeans
} from '../../util'
import {
  SettingsFormModule,
  SiloAsset,
  TokenInputField,
  TokenOutputField,
  TransitAsset
} from '../Common'

export const BeanWithdrawSubModule = forwardRef((props, ref) => {
  const [fromStalkValue, setFromStalkValue] = useState(new BigNumber(0))
  const [fromSeedsValue, setFromSeedsValue] = useState(new BigNumber(0))
  const [fromBeanValue, setFromBeanValue] = useState(new BigNumber(-1))
  const [withdrawParams, setWithdrawParams] = useState({
    crates: [],
    amounts: []
  })

  /*function maxBeans(stalk: BugNumber) {
    var stalkRemoved = new BigNumber(0)
    var beans = new BigNumber(0)
    Object.keys(props.crates).sort((a,b) => parseInt(a) - parseInt(b)).forEach(key => {
      let stalkPerBean = (new BigNumber(10000)).plus(props.season.minus(key)).multipliedBy(5)
      const stalkLeft = stalk.minus(stalkRemoved)
      if (stalkPerBean.multipliedBy(props.crates[key]).isGreaterThanOrEqualTo(stalkLeft)) {
        stalkRemoved = stalkRemoved.plus(stalkPerBean.multipliedBy(props.crates[key]))
        beans = beans.plus(props.crates[key])
        if (stalkRemoved.isEqualTo(stalk)) return
      } else {
        beans = beans.plus(TrimBN(stalkLeft.dividedBy(stalkPerBean),BEAN.decimals))
        return
      }
    })
    return beans
  }
  */

  function fromValueUpdated(newFromNumber) {
    const fromNumber = MinBN(newFromNumber, props.maxFromBeanVal)
    const newFromBeanValue = TrimBN(fromNumber, BEAN.decimals)
    setFromBeanValue(newFromBeanValue)
    setFromStalkValue(TrimBN(getStalkRemoved(fromNumber), STALK.decimals))
    setFromSeedsValue(TrimBN(fromNumber.multipliedBy(BEAN_TO_SEEDS), SEEDS.decimals))
    props.setIsFormDisabled(newFromBeanValue.isLessThanOrEqualTo(0))
  }

   const getStalkRemoved = (beans) => {
     var beansRemoved = new BigNumber(0)
     var stalkRemoved = new BigNumber(0)
     var crates = []
     var amounts = []
     Object.keys(props.crates).sort((a,b) => parseInt(b) - parseInt(a)).some(key => {
       const crateBeansRemoved = (
         beansRemoved.plus(props.crates[key]).isLessThanOrEqualTo(beans)
          ? props.crates[key]
          : beans.minus(beansRemoved)
        )
       beansRemoved = beansRemoved.plus(crateBeansRemoved)
       stalkRemoved = stalkRemoved.plus(crateBeansRemoved)
       stalkRemoved = stalkRemoved.plus(crateBeansRemoved.multipliedBy(props.season.minus(key)).multipliedBy(0.0002))
       crates.push(key)
       amounts.push(toStringBaseUnitBN(crateBeansRemoved, BEAN.decimals))
       return beansRemoved.isEqualTo(beans)
     })
     setWithdrawParams({crates,amounts})
     return stalkRemoved
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(event.target.value))
    } else {
      fromValueUpdated(new BigNumber(-1))
    }
  }
  const maxHandler = () => {
    const minMaxFromVal = MinBNs([
      props.maxFromStalkVal.multipliedBy(props.stalkToBean),
      props.maxFromSeedsVal.multipliedBy(props.seedsToBean),
      props.maxFromBeanVal
    ])
    fromValueUpdated(minMaxFromVal)
  }

  /* Input Fields */

  const fromBeanField = (
    <TokenInputField
      balance={props.maxFromBeanVal}
      claim={props.settings.claim}
      claimableBalance={props.beanClaimableBalance}
      handleChange={handleFromChange}
      maxHandler={maxHandler}
      setValue={setFromBeanValue}
      token={SiloAsset.Bean}
      value={fromBeanValue}
    />
  )

  /* Output Fields */

  const toBurnStalkField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Stalk}
      value={fromStalkValue}
    />
  )
  const toBurnSeedsField = (
    <TokenOutputField
      burn
      decimals={4}
      token={SiloAsset.Seed}
      value={fromSeedsValue}
    />
  )
  const toTransitBeanField = (
    <TokenOutputField
      mint
      token={TransitAsset.Bean}
      value={fromBeanValue}
    />
  )

  /* Transaction Details, settings and text */

  const unvoteTextField = (
    props.locked
      ? <div style={{marginTop: '-5px', fontFamily: 'Futura-PT-Book'}}>{'Unvote Active BIPs to Withdraw'}</div>
      : null
  )
  const showSettings = (
    props.hasClaimable
      ? <SettingsFormModule
          hasClaimable={props.hasClaimable}
          showUnitModule={false}
          setSettings={props.setSettings}
          settings={props.settings}
        />
      : null
  )
  function transactionDetails() {
    if (fromBeanValue.isLessThanOrEqualTo(0)) return null

    return (
      <>
      <ExpandMoreIcon color='primary' style={{marginBottom: '-14px', width: '100%'}} />
      <div style={{display: 'inline-flex'}}>
        <div style={{marginRight: '5px'}}>{toBurnStalkField}</div>
        <div style={{marginLeft: '5px'}}>{toBurnSeedsField}</div>
      </div>
      <div style={{display: 'inline-block', width: '100%'}}>{toTransitBeanField}</div>
      <div style={{display: 'inline-block', width: '100%', color: 'black'}}>
        <span>{`You will lose ${fromStalkValue.dividedBy(props.totalStalk).multipliedBy(100).toFixed(3)}% ownership of Beanstalk.`}</span>
        <br/>
        <span style={{color: 'red'}}>{`WARNING: Your Withdrawal will be frozen for 24 full Seasons.`}</span>
      </div>
      </>
    )
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (fromBeanValue.isLessThanOrEqualTo(0)
          || withdrawParams.crates.length === 0
          || withdrawParams.amounts.length === 0) return

      if (props.settings.claim) {
        claimAndWithdrawBeans(withdrawParams.crates, withdrawParams.amounts, props.claimable, () => {
          fromValueUpdated(new BigNumber(-1))
        })
      } else {
        withdrawBeans(withdrawParams.crates, withdrawParams.amounts,() => {
          fromValueUpdated(new BigNumber(-1))
        })
      }
    }
  }))

  return (
    <>
    {fromBeanField}
    {unvoteTextField}
    {transactionDetails()}
    {showSettings}
    </>
  )
})
