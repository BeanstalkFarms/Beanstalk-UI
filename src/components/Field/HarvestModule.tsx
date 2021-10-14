import BigNumber from 'bignumber.js'
import React, { forwardRef, useImperativeHandle } from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { BEAN } from '../../constants'
import {
  harvest,
  toStringBaseUnitBN,
  TrimBN
} from '../../util'
import {
  CryptoAsset,
  FarmAsset,
  TokenInputField,
  TokenOutputField
} from '../Common'

export const HarvestModule = forwardRef((props, ref) => {

  /* Input Fields */

  const fromPodField = (
    <TokenInputField
      balance={props.harvestablePodBalance}
      token={FarmAsset.Pods}
      value={TrimBN(props.harvestablePodBalance, 6)}
    />
  )

  /* Output Fields */

  const toBeanField = (
    <TokenOutputField
      mint
      token={CryptoAsset.Bean}
      value={TrimBN(props.harvestablePodBalance, BEAN.decimals)}
    />
  )

  function transactionDetails() {
    if (props.harvestablePodBalance.isLessThanOrEqualTo(0)) return null

    return (
      <>
      <ExpandMoreIcon color='primary' style={{marginBottom: '-14px', width: '100%'}} />
      <div style={{display: 'inline-block', width: '100%'}}>{toBeanField}</div>
      </>
    )
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (props.harvestablePodBalance.isLessThanOrEqualTo(0)) return

      harvest(Object.keys(props.harvestablePlots).map(key => (toStringBaseUnitBN(new BigNumber(key), BEAN.decimals))), () => {})
    }
  }))

  return (
    <>
    {fromPodField}
    {transactionDetails()}
    </>
  )
})
