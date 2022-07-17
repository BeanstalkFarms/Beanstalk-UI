import { CircularProgress, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { Token } from 'classes';
import React from 'react';
import { displayFullBN, displayUSD } from 'util/index';
import TokenIcon from '../TokenIcon';
import OutputField from './OutputField';
import { IconSize } from '../../App/muiTheme';

const TokenOutputField : React.FC<{
  /** */
  token: Token;
  /** */
  amount: BigNumber;
  /** */
  value?: BigNumber;
  /** */
  modifier?: string;
  /** Display as a delta (show +/-). */
  isDelta?: boolean;
  /** */
  isLoading?: boolean;
}> = ({
  token,
  amount,
  value,
  modifier,
  isDelta = true,
  isLoading = false,
}) => {
  const isZero     = amount.eq(0);
  const isNegative = amount.lt(0);
  const prefix     = (!isDelta || isZero) ? '' : isNegative ? '- ' : '+ ';
  return (
    <OutputField isNegative={isNegative}>
      {!isLoading ? (
        <Typography display="inline" variant="bodyLarge">
          {prefix}{displayFullBN(amount.abs(), token.displayDecimals, token.displayDecimals)}
          {value && (
            <>&nbsp;&nbsp;<Typography display="inline" variant="bodySmall">(~{displayUSD(value)})</Typography></>
          )}
        </Typography>
      ) : (
        <CircularProgress size={16} thickness={5} />
      )}
      <Stack direction="row" alignItems="center" gap={0.5}>
        {token.logo && (
          <TokenIcon
            token={token}
            style={{ 
              height: IconSize.small,
            }}
          />
        )}
        <Typography variant="bodyMedium">
          {modifier && `${modifier} `}{token.name}
        </Typography>
      </Stack>
    </OutputField>
  );
};

export default TokenOutputField;
