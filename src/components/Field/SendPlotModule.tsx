import React, { forwardRef, useImperativeHandle, useState } from 'react'
import BigNumber from 'bignumber.js'
import { Box } from '@material-ui/core'
import { BEAN } from '../../constants'
import {
  isAddress,
  toStringBaseUnitBN,
  transferPlot,
  TrimBN
} from '../../util'
import { AddressInputField, ListInputField } from '../Common'

export const SendPlotModule = forwardRef((props, ref) => {
  const [plotIndex, setPlotIndex] = useState(new BigNumber(-1))
  const [plotEndIndex, setPlotEndIndex] = useState(new BigNumber(-1))

  var [snappedToAddress, setSnappedToAddress] = useState(false)
  const [walletText, setWalletText] = useState('')

  function fromValueUpdated(newFromNumber) {
    setPlotEndIndex(TrimBN(newFromNumber, BEAN.decimals))
    props.setIsFormDisabled(newFromNumber.isLessThanOrEqualTo(0))
  }

  const handleFromChange = (event) => {
    if (event.target.value) {
      fromValueUpdated(new BigNumber(props.plots[event.target.value])) // gives you the value at the selected plot pod value
      setPlotIndex(event.target.value) // plot index
      if(props.plots[event.target.value] === undefined) props.setIsFormDisabled(true)
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
      props.setIsValidAddress(await isAddress(newToAddress))
    } else {
      setWalletText('')
      props.setIsFormDisabled(true)
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
      isValidAddress={props.isValidAddress}
    />
  )
  const fromPlotField = (
    <ListInputField
      hidden={props.toAddress.length !== 42 || walletText === '' || props.isValidAddress !== true}
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
      <Box style={{display: 'inline-block', width: '100%', color: 'red'}}>
        <span>{`WARNING: Beanstalk doesn't currently support a market for buying and selling Plots. Use at your own risk`}</span>
      </Box>
      </>
    )
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (plotEndIndex.isLessThanOrEqualTo(0)) return

      if (plotEndIndex.isGreaterThan(0)) {
        const startPlot = '0'
        const endPlot = toStringBaseUnitBN(plotEndIndex, BEAN.decimals)
        const id = toStringBaseUnitBN(plotIndex, BEAN.decimals)
        transferPlot(props.toAddress, id, startPlot, endPlot, () => {
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
