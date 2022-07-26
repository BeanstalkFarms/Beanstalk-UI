import React from 'react';
import { Alert, AlertTitle, Box, Link, Stack, Typography } from '@mui/material';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import { displayUSD } from 'util/index';
import Stat from 'components/Common/Stat';
import { useAccount } from 'wagmi';
import BlurComponent from 'components/Common/BlurComponent';
import SiloBalances from 'components/Common/SiloBalances';
import useChainId from '../../hooks/useChain';
import { SupportedChainId } from '../../constants';
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
      {(account && chainId === SupportedChainId.MAINNET) && (
        <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
          <AlertTitle>Note regarding balances</AlertTitle>
          Balances are currently fixed to their pre-exploit values. The USD value of Silo Deposits are calculated using a fixed $BEAN
          price of <strong>$1.02027</strong>.<br />
          Due to upgrades to the Beanstalk contract and website infrastructure, pre-exploit balances may be temporarily
          hidden or show incorrect values for some users. Please report issues in <strong>#ui-feedback</strong> and stay
          tuned for updates in <strong>#ui-updates</strong> on <Link href="https://discord.gg/beanstalk">Discord</Link>. Upgrades will 
          continue to happen between now and Replant.
        </Alert>
      )}
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
