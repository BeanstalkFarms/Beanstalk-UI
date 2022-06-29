import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import React from 'react';
import { displayFullBN, displayUSD } from 'util/index';
import TokenIcon from '../TokenIcon';

const TokenOutputField : React.FC<{
  token: Token;
  amount: BigNumber;
  value?: BigNumber;
}> = ({
  token,
  amount,
  value,
}) => {
  const isNegative = amount.lt(0);
  return (
    <Stack
      sx={{
        backgroundColor: isNegative ? '#FFE5DF' : '#F6FAFE',
        borderRadius: 1,
        px: 2,
        py: 2,
        color: isNegative ? 'hsla(12, 63%, 52%, 1)' : 'inherit',
      }}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      >
      <Box>
        <Typography display="inline" sx={{ fontSize: 24, fontWeight: 'normal' }}>
          {isNegative ? '-' : '+'}&nbsp;{displayFullBN(amount.abs(), token.displayDecimals + 2, token.displayDecimals)}
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
              color: 'red',
              fill: 'red',
            }}
          />
        )}
        <Typography>
          {token.name}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default TokenOutputField;
