import { Box, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import React from 'react';
import { displayFullBN } from 'util/index';

const TokenOutputField : React.FC<{
  token: Token;
  value: BigNumber;
}> = ({
  token,
  value
}) => {
  return (
    <Stack
      sx={{
        backgroundColor: "#F6FAFE",
        borderRadius: 1,
        px: 2,
        py: 2
      }}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box>
        <Typography sx={{ fontSize: 24, fontWeight: 'normal' }}>
          +&nbsp;{displayFullBN(value)}
        </Typography>
      </Box>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {token.logo && (
          <img
            src={token.logo}
            alt={token.name}
            style={{ height: 18 }}
          />
        )}
        <Typography>
          {token.name}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default TokenOutputField;