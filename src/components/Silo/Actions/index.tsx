import React from 'react';
import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import { Pool } from 'classes';
import { ERC20Token } from 'classes/Token';
import { FarmerSiloBalance } from 'state/farmer/silo';
import useTabs from 'hooks/display/useTabs';
import BadgeTab from 'components/Common/BadgeTab';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Claim from './Claim';
import Deposits from './Deposits';
import Withdrawals from './Withdrawals';
import Send from './Send';
import Convert from './Convert';

/**
 * Show the three primary Silo actions: Deposit, Withdraw, Claim.
 * Displays two components:
 * (1) a Card containing the Deposit / Withdraw / Claim forms, broken
 *     up by tabs. Each tab contains a single form.
 * (2) a table of Deposits and Withdrawals, shown dependent on the
 *     selected tab. The Withdrawals table also displays an aggregated
 *     "claimable" row and is shown for both Withdraw & Claim tabs.    
 */
const SiloActions : React.FC<{
  pool: Pool;
  token: ERC20Token;
  siloBalance: FarmerSiloBalance;
}> = (props) => {
  const [tab, handleChange] = useTabs();
  const hasClaimable = props.siloBalance?.claimable?.amount.gt(0);
  return (
    <>
      <Card sx={{ position: 'relative' }}>
        <Stack gap={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
            <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
              <Tab label="Deposit" />
              <Tab label="Convert" />
              <Tab label="Withdraw" />
              <BadgeTab
                showBadge={hasClaimable}
                label="Claim"
                sx={{ overflow: 'visible' }}
              />
              <Tab label="Send" />
            </Tabs>
          </Stack>
          <Box sx={{ px: 1, pb: 1 }}>
            {tab === 0 ? (
              <Deposit
                pool={props.pool}
                token={props.token}
              />
            ) : null}
            {tab === 1 ? (
              <Convert
                pool={props.pool}
                fromToken={props.token}
              />
            ) : null}
            {tab === 2 ? (
              <Withdraw
                token={props.token}
              />
            ) : null}
            {tab === 3 ? (
              <Claim
                token={props.token}
                siloBalance={props.siloBalance}
              />
            ) : null}
            {tab === 4 ? (
              <Send />
            ) : null}
          </Box>
        </Stack>
      </Card>
      {/* Tables */}
      <Box sx={{ display: tab === 0 || tab === 1 || tab === 4 ? 'block' : 'none' }}>
        <Deposits
          token={props.token}
          balance={props.siloBalance}
        />
      </Box>
      <Box sx={{ display: tab === 2 || tab === 3 ? 'block' : 'none' }}>
        <Withdrawals
          token={props.token}
          balance={props.siloBalance}
        />
      </Box>
    </>
  );
};

export default SiloActions;
