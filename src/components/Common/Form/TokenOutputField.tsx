import { Box, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import { Token } from '~/classes';
import { displayFullBN, displayUSD } from '~/util';
import TokenIcon from '../TokenIcon';
import OutputField from './OutputField';
import { IconSize } from '../../App/muiTheme';

const TokenOutputField : React.FC<{
  /** */
  token: Token;
  /** The `amount` of `token` */
  amount: BigNumber;
  /** The $ value (or other derived value) of the `amount` */
  value?: BigNumber;
  /** Annotate the token with some modifier ("Claimable", "Harvestable") */
  modifier?: string;
  /** Display as a delta (show +/-). */
  isDelta?: boolean;
  /** Display a loading spinner */
  isLoading?: boolean;
  /** */
  amountTooltip?: string | JSX.Element;
  /** Override the end adornment section */
  override?: any;
}> = ({
  token,
  amount,
  value,
  modifier,
  amountTooltip = '',
  isDelta = true,
  isLoading = false,
  override
}) => {
  const isZero     = amount.eq(0);
  const isNegative = amount.lt(0);
  const prefix     = (!isDelta || isZero) ? '' : isNegative ? '-' : '+';
  return (
    <OutputField isNegative={isNegative}>
      {!isLoading ? (
        <Tooltip title={amountTooltip}>
          <Typography display="inline" variant="bodyLarge" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
            {amount.abs().gt(new BigNumber(1000000)) ? (
              <>
                {prefix}&nbsp;{displayFullBN(amount.abs(), 0)}
              </>
            ) : (
              <>
                {prefix}&nbsp;{displayFullBN(amount.abs(), token.displayDecimals, token.displayDecimals)}
              </>
            )}
            {value && (
              <>&nbsp;&nbsp;<Typography display="inline" variant="bodySmall">(~{displayUSD(value)})</Typography></>
            )}
          </Typography>
        </Tooltip>
      ) : (
        <CircularProgress size={16} thickness={5} />
      )}
      {override === undefined ? (
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
            {modifier && `${modifier} `}{token.symbol}
          </Typography>
        </Stack>
      ) : <Box>{override}</Box>}
    </OutputField>
  );
};

export default TokenOutputField;
