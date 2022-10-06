import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Stat from '~/components/Common/Stat';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import FarmerBalances from '~/components/Common/Balances/FarmerBalances';
import Fiat from '~/components/Common/Fiat';
import useFarmerBalancesBreakdown from '~/hooks/farmer/useFarmerBalancesBreakdown';
import useWhitelist from '../../hooks/beanstalk/useWhitelist';
import WalletButton from '../Common/Connection/WalletButton';
import useAccount from '~/hooks/ledger/useAccount';

import { FC } from '~/types';

export interface TotalBalanceCardProps {
  breakdown: ReturnType<typeof useFarmerBalancesBreakdown>;
}

const TotalBalanceCard: FC<TotalBalanceCardProps> = ({ breakdown }) => {
  const account = useAccount();
  return (
    <Box>
      <Stat
        title="Balances"
        amount={<Fiat value={breakdown.totalValue.abs()} amount={breakdown.totalValue.abs()} />}
        amountIcon={undefined}
        gap={0}
      />
      <Box sx={{ width: '100%', position: 'relative' }}>
        {!account && (
          <BlurComponent>
            <Stack justifyContent="center" alignItems="center" gap={1}>
              <Typography variant="body1" color="gray">Your Beanstalk Balances will appear here.</Typography>
              <WalletButton color="primary" sx={{ height: 45 }} />
            </Stack>
          </BlurComponent>
        )}
        <FarmerBalances
          breakdown={breakdown}
          whitelist={useWhitelist()}
        />
      </Box>
    </Box>
  );
};

export default TotalBalanceCard;
