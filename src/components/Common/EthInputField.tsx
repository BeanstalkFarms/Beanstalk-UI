import React from 'react';
import BigNumber from 'bignumber.js';
import { MIN_BALANCE } from '../../constants';
import {
  CryptoAsset,
  MinBN,
  SwapMode,
} from '../../util';
import { TokenInputField } from '.';

export default function EthInputField(props) {
  if (
    !(props.mode === SwapMode.Ethereum || props.mode === SwapMode.BeanEthereum)
  ) {
    if (props.value.isGreaterThan(0)) props.handleChange(new BigNumber(-1));
    return null;
  }

  // const balance = props.balance
  const { balance } = props;

  const maxBalance = balance.isGreaterThan(MIN_BALANCE)
    ? balance.minus(MIN_BALANCE)
    : new BigNumber(0);

  const handleChange = (event) => {
    if (event.target.value === undefined || event.target.value === '') {
      props.handleChange(new BigNumber(-1));
    } else {
      props.handleChange(MinBN(balance, new BigNumber(event.target.value)));
    }
  };

  const maxHandler = () => props.handleChange(maxBalance);

  return (
    <>
      <TokenInputField
        balance={balance}
        handleChange={handleChange}
        maxHandler={maxHandler}
        token={CryptoAsset.Ethereum}
        value={props.value}
      />
    </>
 );
}

EthInputField.defaultProps = {
  balance: new BigNumber(-1),
  buyBeans: new BigNumber(0),
  claim: false,
  claimableBalance: new BigNumber(0),
  handleChange: () => {},
  updateExpectedPrice: () => {},
  value: new BigNumber(-1),
};
