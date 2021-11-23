import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { CryptoAsset, MinBN } from 'util/index';
import { BASE_SLIPPAGE } from 'constants/index';
import { TokenInputField } from './index';

export default function InputFieldPlus(props) {
  const inputBalance = props.balance.plus(
    props.claim ? props.claimableBalance : new BigNumber(0)
  );

  const minLPBeans =
    props.beanLPClaimableBalance.isGreaterThan(0) && props.claim
      ? props.beanLPClaimableBalance.multipliedBy(1 - BASE_SLIPPAGE)
      : new BigNumber(0);

  const maxBalance = inputBalance.minus(minLPBeans);

  const isClaimEnabled = props.claim;
  const parentChangeHandler = props.handleChange;
  const { value } = props;

  useEffect(() => {
    if (value.isGreaterThan(inputBalance)) {
      parentChangeHandler(inputBalance);
    }
  }, [inputBalance, isClaimEnabled, value, parentChangeHandler]);

  if (!props.visible) {
    if (props.value.isGreaterThan(0)) props.handleChange(new BigNumber(-1));
    return null;
  }

  const handleChange = (event) => {
    if (event.target.value === undefined || event.target.value === '') {
      props.handleChange(new BigNumber(-1));
    } else {
      props.handleChange(
        MinBN(inputBalance, new BigNumber(event.target.value))
      );
    }
  };

  const maxHandler = () => props.handleChange(maxBalance);

  const tokenInputField = (
    <TokenInputField
      balance={inputBalance}
      isLP={props.isLP}
      handleChange={handleChange}
      maxHandler={maxHandler}
      poolForLPRatio={props.poolForLPRatio}
      token={props.token}
      value={props.value}
    />
  );

  return <>{tokenInputField}</>;
}

InputFieldPlus.defaultProps = {
  balance: new BigNumber(-1),
  beanLPClaimableBalance: new BigNumber(0),
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
