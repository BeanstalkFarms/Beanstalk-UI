import React, { useCallback, useState } from 'react';
import { Badge, Box, Card, Stack, Tab, Tabs } from '@mui/material';
import { Pool } from 'classes';
import { ERC20Token } from 'classes/Token';
import { FarmerSiloBalance } from 'state/farmer/silo';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Claim from './Claim';
import Deposits from './Deposits';
import Withdrawals from './Withdrawals';
import Send from './Send';

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
  const [tab, setTab] = useState(0);
  const handleChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  }, []);
  const hasClaimable = props.siloBalance?.claimable?.amount.gt(0);
  return (
    <>
      <Card sx={{ position: 'relative' }}>
        <Stack gap={1.5}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ overflow: 'visible', px: 2, pt: 2 }}>
            <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }} variant="scrollable">
              <Tab label="Deposit" />
              <Tab label="Withdraw" />
              <Tab
                label={hasClaimable ? <Badge color="primary" variant="dot">Claim</Badge> : 'Claim'}
                sx={{ overflow: 'visible' }}
              />
              <Tab label="Send" />
            </Tabs>
          </Stack>
          <Box sx={{ px: 1, pb: 1 }}>
            {/* Tab Content */}
            {tab === 0 ? (
              <Deposit
                pool={props.pool}
                siloToken={props.token}
              />
            ) : null}
            {tab === 1 ? (
              <Withdraw
                token={props.token}
              />
            ) : null}
            {tab === 2 ? (
              <Claim
                token={props.token}
                siloBalance={props.siloBalance}
              />
            ) : null}
            {tab === 3 ? (
              <Send
                // token={props.token}
                // siloBalance={props.siloBalance}
              />
            ) : null}
          </Box>
        </Stack>
      </Card>
      {/* Tables */}
      <Box sx={{ display: tab === 0 || tab === 3 ? 'block' : 'none' }}>
        <Deposits
          token={props.token}
          balance={props.siloBalance}
        />
      </Box>
      <Box sx={{ display: tab === 1 || tab === 2 ? 'block' : 'none' }}>
        <Withdrawals
          token={props.token}
          balance={props.siloBalance}
        />
      </Box>
    </>
  );
};

export default SiloActions;
