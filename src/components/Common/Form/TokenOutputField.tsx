import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import React from 'react';
import { displayFullBN, displayUSD } from 'util/index';
import TokenIcon from '../TokenIcon';
import OutputField from './OutputField';

const TokenOutputField : React.FC<{
  token: Token;
  amount: BigNumber;
  value?: BigNumber;
  modifier?: string;
}> = ({
  token,
  amount,
  value,
  modifier,
}) => {
  const isZero     = amount.eq(0);
  const isNegative = amount.lt(0);
  return (
    <OutputField isNegative={isNegative}>
      <Box>
        <Typography display="inline" sx={{ fontSize: 24, fontWeight: 'normal' }}>
          {isZero ? '' : isNegative ? '-' : '+'}&nbsp;{displayFullBN(amount.abs(), token.displayDecimals, token.displayDecimals)}
        </Typography>
        {value && (
          <>&nbsp;&nbsp;<Typography display="inline" fontSize={14}>(~{displayUSD(value)})</Typography></>
        )}
      </Box>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {token.logo && (
          <TokenIcon
            token={token}
            style={{ 
              height: 18,
            }}
          />
        )}
        <Typography>
          {modifier && `${modifier} `}{token.name}
        </Typography>
      </Stack>
    </OutputField>
  );
};

export default TokenOutputField;
