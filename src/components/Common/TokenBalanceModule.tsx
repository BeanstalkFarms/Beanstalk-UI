import BigNumber from 'bignumber.js'
import React, { Fragment } from 'react'
import {
  CryptoAsset,
  displayBN,
  displayFullBN,
  TokenLabel
} from '../../util'
import { TokenTypeImageModule, DataBalanceModule } from './index'

export default function TokenBalanceModule(props) {
  const style = {
    color: props.balanceColor,
    display: 'inline',
    fontSize: '12px',
    fontFamily: 'Lucida Console',
    fontWeight: '400',
    lineHeight: '100%',
    margin: '2px',
  }
  const imageStyle = {
    display: 'inline-block',
    height: '20px',
    marginBottom: '-5px',
    marginLeft: '5px',
  }

  var balanceStyle = {color: props.balanceColor}

  if (props.claimPadding !== undefined) {
    balanceStyle = {
      color: props.balanceColor,
      paddingRight:'0px',
      textAlign:'center',
      width:'100%',
    }
  }

  const tokenLabel = TokenLabel(props.token)
  const content = (
    <Fragment>
      <h5 style={style}>
        {props.endText.length > 0
          ? `${displayBN(props.balance)}${props.endText}`
          : displayBN(props.balance)
        }
      </h5>
      <TokenTypeImageModule style={imageStyle} token={props.token} />
    </Fragment>
  )

  function displayLP(balance) {
    return `${displayBN(balance[0])} ${TokenLabel(CryptoAsset.Bean)}/${displayBN(balance[1])} ${TokenLabel(CryptoAsset.Ethereum)}`
  }

  var balanceContent = (
    props.balance.isGreaterThan(0)
      ? `${displayFullBN(props.balance)} ${TokenLabel(props.token)}`
      : undefined
  )
  balanceContent = (
    props.balance.isGreaterThan(0) && props.isLP
      ? displayLP(props.poolForLPRatio(props.balance))
      : balanceContent
  )

  return (
    <div style={{position: 'relative'}}>
      <DataBalanceModule
        balanceDescription={balanceContent}
        content={content}
        description={props.description}
        style={balanceStyle}
        title={props.title === undefined ? tokenLabel : props.title}
        token={props.token}
        widthTooltip={props.widthTooltip}
        {...props}
      />
    </div>
  )
}

TokenBalanceModule.defaultProps = {
  balance: new BigNumber(-1),
  balanceColor: 'black',
  endText: '',
  startText: '',

}
