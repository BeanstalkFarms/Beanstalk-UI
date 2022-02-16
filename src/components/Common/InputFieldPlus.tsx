import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';
import { CryptoAsset, MinBN } from 'util/index';
import { BASE_SLIPPAGE } from 'constants/index';
import { TokenInputField, TokenInputFieldProps } from './index';

type InputFieldPlusProps = TokenInputFieldProps & {

}
export default function InputFieldPlus(props: Partial<InputFieldPlusProps>) {
  /** */
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

  return (
    <TokenInputField
      balance={inputBalance}
      balanceLabel={props.balanceLabel}
      isLP={props.isLP}
      handleChange={handleChange}
      maxHandler={maxHandler}
      poolForLPRatio={props.poolForLPRatio}
      locked={props.locked}
      token={props.token}
      value={props.value}
      size={props.size}
      error={props.error}
    />
  );
}

InputFieldPlus.defaultProps = {
  balance: new BigNumber(-1),
  beanLPClaimableBalance: new BigNumber(0),
  claim: false,
  claimableBalance: new BigNumber(0),
  buyEth: new BigNumber(0),
  error: false,
  handleChange: () => {},
  isLP: false,
  poolForLPRatio: undefined,
  size: 'medium',
  token: CryptoAsset.Bean,
  updateExpectedPrice: () => {},
  value: new BigNumber(-1),
  visible: true,
  locked: false,
};
