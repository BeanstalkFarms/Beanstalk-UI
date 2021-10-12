import BigNumber from 'bignumber.js'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { BEAN } from '../../constants'
import {
  isAddress,
  toStringBaseUnitBN,
  transferBeans,
  TrimBN
} from '../../util'
import { AddressInputField, ListInputField } from '../Common'

export const SendPlotModule = forwardRef((props, ref) => {
  const [place, setPlace] = useState(new BigNumber(-1))
  const [plotEndIndex, setPlotEndIndex] = useState(new BigNumber(-1))

  var [snappedToAddress, setSnappedToAddress] = useState(false)
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [walletText, setWalletText] = useState('')

  function fromValueUpdated(newFromNumber) {
    setPlotEndIndex(TrimBN(newFromNumber, BEAN.decimals))
    props.setIsFormDisabled(newFromNumber.isLessThanOrEqualTo(0))
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(props.plots[event.target.value])) // gives you the value at the selected plot pod value
      setPlace(event.target.value) // plot index
      console.log(event.target.value)
    } else {
      fromValueUpdated(new BigNumber(-1))
    }
  }

  async function toAddressUpdated(newToAddress) {
    if (snappedToAddress) {
      fromValueUpdated(new BigNumber(-1))
      props.setToAddress('')
      setWalletText('')
      setSnappedToAddress(false)
      return
    }

    if (newToAddress.length === 42) {
      setWalletText(`${newToAddress.substring(0, 6)}...${newToAddress.substring(newToAddress.length - 4)}`)
      setSnappedToAddress(true)
      setIsValidAddress(await isAddress(newToAddress))
    } else {
      setWalletText('')
    }
    props.setToAddress(newToAddress)
  }

  const handleChange = (event) => {
    if (event.target.value) {
      toAddressUpdated(event.target.value)
    } else {
      toAddressUpdated('')
    }
  }

  const clearHandler = () => { toAddressUpdated(walletText) }

  /* Input Fields */

  const toAddressField = (
    <AddressInputField
      address={walletText}
      setAddress={setWalletText}
      handleChange={handleChange}
      marginTop={window.innerWidth > 400 ? '8px' : '7px'}
      snapped={snappedToAddress}
      handleClear={clearHandler}
      isValidAddress={isValidAddress}
    />
  )
  const fromPlotField = (
    <ListInputField
      hidden={props.toAddress.length !== 42 || walletText === ''}
      index={props.index}
      items={props.plots}
      marginBottom={props.hasPlots === true ? '0px' : '-7px'}
      handleChange={handleFromChange}
    />
  )

  /* Transaction Details, settings and text */

  function transactionDetails() {
    if (plotEndIndex.isLessThanOrEqualTo(0)) return null

    return (
      <>
      <div style={{display: 'inline-block', width: '100%', color: 'red'}}>
        <span>{`Warning: You are sending your plots to another wallet. Beanstalk doesn't currently support buying and selling Plots. Use at your own risk.`}</span>
      </div>
      </>
    )
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (plotEndIndex.isLessThanOrEqualTo(0)) return

      if (plotEndIndex.isGreaterThan(0)) {
        const startPlot = '0'
        const placeLine = place - props.index
        const endPlot = toStringBaseUnitBN(plotEndIndex, BEAN.decimals)
        console.log('sending plots to: ' + props.toAddress)
        console.log('Index place: ' + place)
        console.log('place in line: ' + placeLine)
        console.log('Start: ' + startPlot)
        console.log('Pods: ' + endPlot)
        transferBeans(props.toAddress, endPlot, () => {
          fromValueUpdated(new BigNumber(-1), new BigNumber(-1))
        })

      } else {
        fromValueUpdated(new BigNumber(-1), new BigNumber(-1))
      }
    }
  }))

  return (
    <>
    {toAddressField}
    {fromPlotField}
    {transactionDetails()}
    </>
  )
})
