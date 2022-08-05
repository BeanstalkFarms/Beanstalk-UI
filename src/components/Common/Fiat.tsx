import React from 'react';
import BigNumber from 'bignumber.js';
import { Stack } from '@mui/material';
import logo from '~/img/tokens/bean-logo.svg';
import { Token } from '~/classes';
import useSiloTokenToFiat from '~/hooks/currency/useSiloTokenToFiat';
import useSetting from '~/hooks/useSetting';
import usePrice from '~/hooks/usePrice';
import { displayBN, displayFullBN } from '~/util';
import { ZERO_BN } from '~/constants';

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
    <Stack display="inline-flex" direction="row" alignItems="center" sx={{ verticalAlign: 'top', position: 'relative', }}>
      {denomination === 'bdv' ? (
        <>
          <img
            src={logo}
            alt="BEAN"
            style={{ height: '1em', marginRight: '0.25em', display: 'inline', position: 'relative', top: 0, left: 0 }}
          />
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
