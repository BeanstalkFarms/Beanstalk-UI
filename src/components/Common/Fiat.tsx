import React from 'react';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import useSiloTokenToFiat from 'hooks/currency/useSiloTokenToFiat';
import useSetting from 'hooks/useSetting';
import { displayBN, displayFullBN } from 'util/index';
import { Stack } from '@mui/material';
import { ZERO_BN } from 'constants/index';
import logo from 'img/tokens/bean-logo.svg';
import usePrice from 'hooks/usePrice';

const Fiat : React.FC<{
  /* usd value of `amount`. if defined, overrides siloTokenToFiat */
  value?: BigNumber,
  /* */
  token?: Token,
  /* */
  amount: BigNumber | undefined,
  //
  allowNegative?: boolean,
  chop?: boolean,
  truncate?: boolean,
}> = ({
  //
  value: _value,
  token,
  amount,
  //
  allowNegative = false,
  chop = true,
  truncate = false,
}) => {
  const [denomination]  = useSetting('denomination');
  const price = usePrice();
  const siloTokenToFiat = useSiloTokenToFiat();
  /// FIXME: refactor fiat calculation to accept
  /// externally provided value
  const value = _value 
    ? denomination === 'usd'
      ? _value
      : _value.div(price)
    : (amount && token)
      ? siloTokenToFiat(token, amount, denomination, chop)
      : ZERO_BN;
  const displayValue = truncate
    ? displayBN(value, allowNegative)
    : displayFullBN(value, 2, 2);
  return (
    <Stack display="inline-flex" direction="row" alignItems="center" gap={0.25}>
      {denomination === 'bdv' ? (
        <>
          <img src={logo} alt="BEAN" style={{ height: 14 }} />
          <span>
            {displayValue}
          </span>
        </> 
      ) : (
        <>
          <span>$</span>
          <span>
            {displayValue}
          </span>
        </>
      )}
    </Stack>
  );
};

export default Fiat;
