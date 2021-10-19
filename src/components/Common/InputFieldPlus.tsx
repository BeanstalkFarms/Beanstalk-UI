import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { CryptoAsset, displayBN, MinBN } from '../../util';
import { TokenInputField } from './index';

export default function InputFieldPlus(props) {
  const textStyle = {
    fontSize: '12px',
    fontFamily: 'Futura-PT',
    marginTop: '-10px',
  };

  const balance = props.balance.plus(props.claim ? props.claimableBalance : 0);

  const isClaimEnabled = props.claim;
  const parentChangeHandler = props.handleChange;
  const { value } = props;

  useEffect(() => {
    if (value.isGreaterThan(balance)) {
      parentChangeHandler(balance);
    }
  }, [balance, isClaimEnabled, value, parentChangeHandler]);

  if (!props.visible) {
    if (props.value.isGreaterThan(0)) props.handleChange(new BigNumber(-1));
    return null;
  }

  const handleChange = (event) => {
    if (event.target.value === undefined || event.target.value === '') {
      props.handleChange(new BigNumber(-1));
    } else {
      props.handleChange(MinBN(balance, new BigNumber(event.target.value)));
    }
  };

  const maxHandler = () => props.handleChange(balance);

  const tokenInputField = (
    <TokenInputField
      balance={balance}
      isLP={props.isLP}
      handleChange={handleChange}
      maxHandler={maxHandler}
      poolForLPRatio={props.poolForLPRatio}
      token={props.token}
      value={props.value}
    />
  );

  const textTransaction =
    props.sellToken !== undefined
      ? `Buying About ${displayBN(
          props.buyEth
        )} ETH with ${props.sellToken.toFixed(3)} Beans for ${props
          .updateExpectedPrice(
            props.buyEth.multipliedBy(-1),
            props.sellToken.multipliedBy(-1)
          )
          .toFixed(2)} Each`
      : '';

  return (
    <>
      {tokenInputField}
      {props.buyEth.isGreaterThan(0) ? (
        <Box style={textStyle}>{textTransaction}</Box>
      ) : null}
    </>
  );
}

InputFieldPlus.defaultProps = {
  balance: new BigNumber(-1),
  claim: false,
  claimableBalance: new BigNumber(0),
  buyEth: new BigNumber(0),
  handleChange: () => {},
  isLP: false,
  poolForLPRatio: undefined,
  token: CryptoAsset.Bean,
  updateExpectedPrice: () => {},
  value: new BigNumber(-1),
  visible: true,
};
