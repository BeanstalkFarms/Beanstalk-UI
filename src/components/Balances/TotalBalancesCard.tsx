import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useAccount } from 'wagmi';
import Stat from '~/components/Common/Stat';
import BlurComponent from '~/components/Common/ZeroState/BlurComponent';
import SiloBalances from '~/components/Common/SiloBalances';
import Fiat from '~/components/Common/Fiat';
import useFarmerSiloBreakdown from '~/hooks/useFarmerSiloBreakdown';
import useWhitelist from '../../hooks/useWhitelist';
import WalletButton from '../Common/Connection/WalletButton';

export interface TotalBalanceCardProps {
  breakdown: ReturnType<typeof useFarmerSiloBreakdown>;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({ breakdown }) => {
  const { data: account } = useAccount();
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
        <SiloBalances
          breakdown={breakdown}
          whitelist={useWhitelist()}
        />
      </Box>
    </Box>
  );
};

export default TotalBalanceCard;
