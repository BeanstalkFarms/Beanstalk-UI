import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import { displayUSD } from 'util/index';
import Stat from 'components/Common/Stat';
import { useAccount } from 'wagmi';
import BlurComponent from 'components/Common/ZeroState/BlurComponent';
import SiloBalances from 'components/Common/SiloBalances';
import useChainId from '../../hooks/useChain';
import useWhitelist from '../../hooks/useWhitelist';
import WalletButton from '../Common/Connection/WalletButton';

export interface TotalBalanceCardProps {
  breakdown: ReturnType<typeof useFarmerSiloBreakdown>;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({ breakdown }) => {
  const { data: account } = useAccount();
  const chainId = useChainId();

  return (
    <Box>
      <Stat
        title="Total Balances"
        amount={displayUSD(breakdown.totalValue.abs())}
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
