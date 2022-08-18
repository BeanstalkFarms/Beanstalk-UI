import { Box, Card, Stack, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import useAccount from '~/hooks/ledger/useAccount';
import { displayBN, trimAddress } from '~/util';
import { AppState } from '~/state';
import AuthEmptyState from '~/components/Common/ZeroState/AuthEmptyState';
import AddressIcon from '~/components/Common/AddressIcon';
import { IconSize } from '~/components/App/muiTheme';

const StalkholderCard : React.FC = () => {
  const account = useAccount();
  const farmerSilo    = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  const beanstalkSilo = useSelector<AppState, AppState['_beanstalk']['silo']>((state) => state._beanstalk.silo);
  
  return (
    <Card sx={{ position: 'sticky', top: 120, p: 2 }}>
      <Stack gap={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Stalkholder</Typography>
          {account && (
            <Stack direction="row" alignItems="center" gap={0.3}>
              <AddressIcon address={account} size={IconSize.xs} />
              <Typography variant="body1" color="gray">{trimAddress(account)}</Typography>
            </Stack>
          )}
        </Stack>
        {account ? (
          <Stack gap={0.5}>
            <Typography variant="bodyLarge">{displayBN(farmerSilo.stalk.active)} STALK</Typography>
            <Typography variant="body1" color="gray">{displayBN((farmerSilo.stalk.active.div(beanstalkSilo.stalk.total)).multipliedBy(new BigNumber(100)))}% Ownership</Typography>
          </Stack>
        ) : (
          <Box height={{ xs: 100, md: 150 }}>
            <AuthEmptyState />
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default StalkholderCard;
