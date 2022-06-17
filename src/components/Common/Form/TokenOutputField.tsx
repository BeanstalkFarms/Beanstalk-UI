import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import React from 'react';
import { displayFullBN } from 'util/index';
import TokenIcon from '../TokenIcon';

const TokenOutputField : React.FC<{
  token: Token;
  value: BigNumber;
}> = ({
  token,
  value
}) => {
  const isNegative = value.lt(0);
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
        <Typography sx={{ fontSize: 24, fontWeight: 'normal' }}>
          {isNegative ? '-' : '+'}&nbsp;{displayFullBN(value.abs(), token.displayDecimals+2, token.displayDecimals)}
        </Typography>
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
