import React from 'react';
import { Alert, AlertTitle, Box, Link } from '@mui/material';
import useFarmerSiloBreakdown from 'hooks/useFarmerSiloBreakdown';
import { displayFullBN, displayUSD } from 'util/index';
import Stat from 'components/Common/Stat';
import { useAccount } from 'wagmi';
import BlurComponent from 'components/Common/BlurComponent';
import SiloBalances from 'components/Common/SiloBalances';
import useChainId from '../../../hooks/useChain';
import { SupportedChainId } from '../../../constants';
import useWhitelist from '../../../hooks/useWhitelist';

export interface TotalBalanceCardProps {
  breakdown: ReturnType<typeof useFarmerSiloBreakdown>;
}

const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({ breakdown }) => {
  const { data: account } = useAccount();
  const chainId = useChainId();

  return (
    <Box>
      <Stat
        title="My Total Balance"
        amount={displayUSD(breakdown.totalValue.abs())}
        icon={undefined}
      />
      {(account && chainId === SupportedChainId.MAINNET) && (
        <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
          <AlertTitle>Note regarding balances</AlertTitle>
          Balances are currently fixed to their pre-exploit values. The USD value of Silo Deposits are calculated using a fixed $BEAN
          price of <strong>$1.02027</strong>.<br />
          Due to upgrades to the Beanstalk contract and website infrastructure, pre-exploit balances may be temporarily
          hidden or show incorrect values for some users. Please report issues in <strong>#ui-feedback</strong> and stay
          tuned for updates in <strong>#ui-updates</strong> on <Link href="https://discord.gg/beanstalk">Discord</Link>. Upgrades will 
          between now and Replant.
        </Alert>
      )}
      <Box sx={{ width: '100%', position: 'relative' }}>
        {!account && (
          <BlurComponent>
            Connect your wallet to see your Beanstalk balances.
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
