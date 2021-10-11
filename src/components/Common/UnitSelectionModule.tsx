import React from 'react'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import BeanEthIcon from '../../img/bean-eth-logo.svg'
import BeanEthSwapIcon from '../../img/bean-eth-swap-logo.svg'
import { CryptoAsset, SwapMode, TokenImage } from '../../util'

export default function UnitSelectionModule(props) {
  const change = (event, value) => {
    if (value !== null)
      props.setValue(value)
  }

  const imageStyle = {
     display: 'inline',
     height: '20px',
     width: '20px',
  }

  return (
    <ToggleButtonGroup
      aria-label='text alignment'
      exclusive
      onChange={change}
      style={{padding: '5px'}}
      value={props.value}
    >
      {props.lp
        ? <ToggleButton aria-label='right aligned' value={SwapMode.LP}>
            <img alt='LP' src={TokenImage(CryptoAsset.LP)} style={imageStyle} />
          </ToggleButton>
        : null
      }
      {props.bean
        ? <ToggleButton aria-label='left aligned' value={SwapMode.Bean}>
            <img alt='Bean' src={TokenImage(CryptoAsset.Bean)} style={imageStyle} />
          </ToggleButton>
        : null
      }
      {props.ethereum
        ? <ToggleButton aria-label='right aligned' value={SwapMode.Ethereum}>
            <img alt='Eth' src={TokenImage(CryptoAsset.Ethereum)} style={imageStyle} />
          </ToggleButton>
        : null
      }
      {props.beanEthereum
        ? <ToggleButton aria-label='centered' value={SwapMode.BeanEthereum}>
            <img alt='Bean/Eth' src={BeanEthIcon} style={imageStyle} />
          </ToggleButton>
        : null
      }
      {props.beanEthereumSwap
        ? <ToggleButton aria-label='right aligned' value={SwapMode.BeanEthereumSwap}>
            <img alt='Bean/Eth Swap' src={BeanEthSwapIcon} style={imageStyle} />
          </ToggleButton>
        : null
      }
    </ToggleButtonGroup>
  )
}

UnitSelectionModule.defaultProps = {
  bean: true,
  beanEthereum: true,
  beanEthereumSwap: false,
  ethereum: true,
  lp: false,
  value: 0,
}
