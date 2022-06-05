import React, { useEffect } from 'react';
import BigNumber from 'bignumber.js';

import { MinBN, Token } from 'util/index';
import { BASE_SLIPPAGE } from 'constants/index';
import { TokenInputField } from './index';
import { TokenInputFieldProps } from './TokenInputField';

type InputFieldPlusProps = TokenInputFieldProps & {
  claim: boolean;
  claimableBalance: BigNumber;
  beanLPClaimableBalance: BigNumber;
  visible?: boolean;
  error?: boolean;
  isLP?: boolean;
  poolForLPRatio?: any; // FIXME
  size?: 'medium';
  token?: Token;
  // Overrides
  handleChange: (value: BigNumber) => void;
  balance: BigNumber;
  // Unused
  // buyEth: sBigNumber;
  // updateExpectedPrice: Function; // FIXME
}

const InputFieldPlus : React.FC<InputFieldPlusProps> = ({
  beanLPClaimableBalance = new BigNumber(0),
  balance = new BigNumber(-1),
  value = new BigNumber(-1),
  visible = true,
  handleChange,
  ...props
}) => {
  const isClaimEnabled = props.claim;

  // If claim is enabled, add claimable balance to base balance.
  const inputBalance = balance.plus(
    props.claim
      ? props.claimableBalance
      : new BigNumber(0)
  );

  // TODO: what's going on here?
  const minLPBeans = (beanLPClaimableBalance.isGreaterThan(0) && props.claim)
    ? beanLPClaimableBalance.multipliedBy(1 - BASE_SLIPPAGE)
    : new BigNumber(0);
  const maxBalance = inputBalance.minus(minLPBeans);

  useEffect(() => {
    if (value.isGreaterThan(inputBalance)) {
      handleChange(inputBalance);
    }
  }, [inputBalance, isClaimEnabled, value, handleChange]);

  // FIXME:
  // If `visible` becomes false without `value` being set to zero,
  // clear out the input. This seems like an antipattern - the clearing-out
  // should be controlled by the form itself, not the input.
  if (!visible) {
    if (value.isGreaterThan(0)) {
      handleChange(new BigNumber(-1));
    }
    return null;
  }

  // Handlers
  const maxHandler = () => handleChange(maxBalance);
  const _handleChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === undefined || event.target.value === '') {
      handleChange(new BigNumber(-1));
    } else {
      handleChange(MinBN(inputBalance, new BigNumber(event.target.value)));
    }
  };

  return (
    <TokenInputField
      balance={inputBalance}
      balanceLabel={props.balanceLabel}
      isLP={props.isLP}
      handleChange={_handleChangeEvent}
      maxHandler={maxHandler}
      poolForLPRatio={props.poolForLPRatio}
      locked={props.locked}
      token={props.token}
      value={value}
      size={props.size}
      error={props.error}
    />
  );
};

export default InputFieldPlus;
