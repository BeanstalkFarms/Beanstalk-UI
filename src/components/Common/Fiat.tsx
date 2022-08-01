import React from 'react';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import { BEAN } from 'constants/tokens';
import useSiloTokenToUSD from 'hooks/currency/useSiloTokenToUSD';
import usePrice from 'hooks/usePrice';
import useSetting from 'hooks/useSetting';
import { displayTokenAmount } from 'util/index';
import { Stack } from '@mui/material';
import { ZERO_BN } from 'constants/index';
import logo from 'img/tokens/bean-logo.svg';

const Fiat : React.FC<{
  token: Token,
  amount: BigNumber | undefined,
  bdv?: BigNumber,
  allowNegative?: boolean
}> = ({
  token,
  amount,
  bdv,
  allowNegative = false,
}) => {
  const [denomination] = useSetting('denomination');
  const poolTokenToUSD = useSiloTokenToUSD();
  const price          = usePrice();

  // switch (denomination) {
  //   case 'bdv':
  //     if (bdv) return displayBN(bdv);
  //     if (!amount) return '0 BEAN';
  //     return (
  //       <>
  //         displayTokenAmount(
  //           poolTokenToUSD(token, amount).div(price),
  //           BEAN[1],
  //           allowNegative,
  //         )
  //       </>
  //   case 'usd':
  //   default:
  //     if (!amount) return '$0';
  //     return displayUSD(
  //       poolTokenToUSD(token, amount),
  //       allowNegative,
  //     );
  // }
          
  return (
    <Stack direction="row" alignItems="center" gap={0.25}>
      {denomination === 'bdv' ? (
        <>
          <img src={logo} alt="BEAN" style={{ height: 15 }} />
          <span>
            {displayTokenAmount(
              amount ? poolTokenToUSD(token, amount).div(price) : ZERO_BN,
              BEAN[1],
              { allowNegative }
            )}
          </span>
        </> 
      ) : (
        <>
          <span>$</span>
          <span>
            {displayTokenAmount(
              amount ? poolTokenToUSD(token, amount).div(price) : ZERO_BN,
              BEAN[1],
              { allowNegative }
            )}
          </span>
        </>
      )}
    </Stack>
  );
};

export default Fiat;
