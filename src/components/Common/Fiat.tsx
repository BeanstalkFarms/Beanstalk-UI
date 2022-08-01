import React from 'react';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import { BEAN } from 'constants/tokens';
import useSiloTokenToFiat from 'hooks/currency/useSiloTokenToFiat';
import useSetting from 'hooks/useSetting';
import { displayTokenAmount } from 'util/index';
import { Stack } from '@mui/material';
import { ZERO_BN } from 'constants/index';
import logo from 'img/tokens/bean-logo.svg';

const Fiat : React.FC<{
  token: Token,
  amount: BigNumber | undefined,
  allowNegative?: boolean,
  chop?: boolean
}> = ({
  token,
  amount,
  allowNegative = false,
  chop = true,
}) => {
  const [denomination]  = useSetting('denomination');
  const siloTokenToFiat = useSiloTokenToFiat();
          
  return (
    <Stack display="inline-flex" direction="row" alignItems="center" gap={0.25}>
      {denomination === 'bdv' ? (
        <>
          <img src={logo} alt="BEAN" style={{ height: 14 }} />
          <span>
            {displayTokenAmount(
              amount
                ? siloTokenToFiat(token, amount, denomination, chop)
                : ZERO_BN,
              BEAN[1], // displayDecimals = 2
              { allowNegative }
            )}
          </span>
        </> 
      ) : (
        <>
          <span>$</span>
          <span>
            {displayTokenAmount(
              amount
                ? siloTokenToFiat(token, amount, denomination, chop)
                : ZERO_BN,
              BEAN[1], // displayDecimals = 2
              { allowNegative }
            )}
          </span>
        </>
      )}
    </Stack>
  );
};

export default Fiat;
