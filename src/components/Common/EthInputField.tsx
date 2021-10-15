import { Box } from '@material-ui/core' 
import BigNumber from 'bignumber.js'
import { MIN_BALANCE } from '../../constants'
import {
  displayBN,
  CryptoAsset,
  MinBN,
  SwapMode
} from '../../util'
import { TokenInputField } from './index'

export default function EthInputField(props) {
  if (!(props.mode === SwapMode.Ethereum || props.mode === SwapMode.BeanEthereum)) {
    if (props.value.isGreaterThan(0)) props.handleChange(new BigNumber(-1))
    return null
  }

  const textStyle = {
    // fontSize: '12px',
    fontFamily: 'Futura-PT-Book',
    marginTop: '-5px'
  }

  const balance = props.balance

  const maxBalance = (
    balance.isGreaterThan(MIN_BALANCE)
      ? balance.minus(MIN_BALANCE)
      : new BigNumber(0)
  )

  const handleChange = (event) => {
    if (event.target.value === undefined || event.target.value === '') {
      props.handleChange(new BigNumber(-1))
    } else {
      props.handleChange(MinBN(balance, new BigNumber(event.target.value)))
    }
  }

  const maxHandler = () => props.handleChange(maxBalance)

  const textTransaction = `Buying About ${displayBN(props.buyBeans)} Beans ${props.sellEth !== undefined ? `with ${props.sellEth.toFixed(3)} ETH `: null}for ${props.updateExpectedPrice(props.sellEth !== undefined ? props.sellEth : props.value, props.buyBeans).toFixed(2)} Each`

  return (
    <>
    <TokenInputField
      balance={balance}
      handleChange={handleChange}
      maxHandler={maxHandler}
      token={CryptoAsset.Ethereum}
      value={props.value}
    />
   {props.buyBeans.isGreaterThan(0)
     ? <Box style={textStyle}>{textTransaction}</Box>
     : null
    }
   </>
  )
}

EthInputField.defaultProps = {
  balance: new BigNumber(-1),
  buyBeans: new BigNumber(0),
  claim: false,
  claimableBalance: new BigNumber(0),
  handleChange: (value: BigNumber) => {},
  updateExpectedPrice: (a,b) => {},
  value: new BigNumber(-1),
}
