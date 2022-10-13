import { Grid, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import { ERC20Token, NativeToken } from '~/classes/Token';
import { displayFullBN } from '~/util';
import { BeanstalkPalette } from '../App/muiTheme';
import Row from '../Common/Row';

export type BalanceRow = {
  token: ERC20Token | NativeToken;
  amount: BigNumber;
  value: BigNumber;
};

const BalanceTable: React.FC<{ rows: BalanceRow[] }> = ({ rows }) => (
  <Stack spacing={1}>
    <Grid container direction="row">
      <Grid item xs={5}>
        <Typography variant="bodySmall" color="lightGrey">
          Token
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="bodySmall" color="lightGrey">
          Amount
        </Typography>
      </Grid>
      <Grid item xs={3}>
        <Stack>
          <Typography variant="bodySmall" color="lightGrey" textAlign="right">
            Value
          </Typography>
        </Stack>
      </Grid>
    </Grid>
    {rows.map(({ token, amount, value }, i) => (
      <Stack
        key={i}
        sx={{
          px: '20px',
          py: '10px',
          border: `1px solid ${BeanstalkPalette.lightestGrey}`,
          borderRadius: '6px',
        }}
      >
        <Grid container direction="row" spacing={2}>
          <Grid item xs={5}>
            <Row gap={1} alignItems="center">
              <img
                src={token.logo}
                alt=""
                width="20px"
                height="20px"
                style={{ borderRadius: '50%' }}
              />
              <Typography>{token.symbol}</Typography>
            </Row>
          </Grid>
          <Grid item xs={4}>
            <Typography>
              {displayFullBN(amount, token.displayDecimals)} {token.symbol}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Stack>
              <Typography textAlign="right">
                ${displayFullBN(value, 2)}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    ))}
  </Stack>
);

export default BalanceTable;
