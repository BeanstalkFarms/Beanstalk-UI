import { Box, Divider, Tooltip, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import useGasUSD from 'hooks/ledger/useGasUSD';
import React from 'react';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { AppState } from '~/state';
import { displayUSD } from '~/util/index';

const GasTag : React.FC<{
  gasLimit: BigNumber | null;
}> = ({
  gasLimit
}) => {
  const prices    = useSelector<AppState, AppState['app']['ethPrices']>((state) => state.app.ethPrices);
  const getGasUSD = useGasUSD();
  const gasUSD    = gasLimit ? getGasUSD(gasLimit) : null;
  return (
    <Tooltip title={(
      <>
        Gas limit: {gasLimit?.toString() || '?'}<br />
        Base fee: {prices?.gas.safe || '?'} gwei<br />
        ETH price: ${prices?.ethusd || '?'}<br />
        {prices?.lastRefreshed && (
          <>
            <Divider color="secondary" sx={{ my: 1 }} />
            <Typography variant="bodySmall" color="gray">
              Refreshed at {DateTime.fromMillis(parseInt(prices.lastRefreshed, 10)).toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}
            </Typography>
          </>
        )}
      </>
    )}>
      <Box sx={{ px: 1, py: 0.5 }}>
        ⛽&nbsp;{gasUSD ? displayUSD(gasUSD) : '$-.--'}
      </Box>
    </Tooltip>
  );
};

export default GasTag;
