import React from 'react';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import useSiloTokenToFiat from 'hooks/currency/useSiloTokenToFiat';
import useSetting from 'hooks/useSetting';
import { displayBN, displayFullBN } from 'util/index';
import { Stack } from '@mui/material';
import { ZERO_BN } from 'constants/index';
import logo from 'img/tokens/bean-logo.svg';

const Fiat : React.FC<{
  token: Token,
  amount: BigNumber | undefined,
  allowNegative?: boolean,
  chop?: boolean,
  truncate?: boolean,
}> = ({
  token,
  amount,
  allowNegative = false,
  chop = true,
  truncate = false,
}) => {
  const [denomination]  = useSetting('denomination');
  const siloTokenToFiat = useSiloTokenToFiat();
  const value = amount
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
