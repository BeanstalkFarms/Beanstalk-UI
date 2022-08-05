import React from 'react';
import { Box, Card, Stack, Tab, Tabs } from '@mui/material';
import { Pool } from 'classes';
import { ERC20Token } from 'classes/Token';
import { FarmerSiloBalance } from '~/state/farmer/silo';
import useTabs from '~/hooks/display/useTabs';
import BadgeTab from 'components/Common/BadgeTab';
import AlmTab from 'components/Common/Almanac/AlmTab';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Claim from './Claim';
import Deposits from './Deposits';
import Withdrawals from './Withdrawals';
import Transfer from './Transfer';
import Convert from './Convert';

const SLUGS = ['deposit', 'convert', 'transfer', 'withdraw', 'claim'];

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
  const [tab, handleChange] = useTabs(SLUGS, 'action');
  const hasClaimable = props.siloBalance?.claimable?.amount.gt(0);
  return (
    <>
      <Card sx={{ position: 'relative' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            overflow: 'visible',
            px: 2,
            pt: 2,
            pb: 1.5,
          }}
        >
          <Tabs
            value={tab}
            onChange={handleChange}
            sx={{ minHeight: 0 }}
          >
            <AlmTab label="Deposit" almHref="https://docs.bean.money/farm/silo#withdraw" />
            <Tab label="Convert" />
            <Tab label="Transfer" />
            <Tab label="Withdraw" />
            <BadgeTab
              showBadge={hasClaimable}
              label="Claim"
              sx={{ overflow: 'visible' }}
            />
          </Tabs>
        </Stack>
        <Stack gap={1.5}>
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
              <Transfer token={props.token} />
            ) : null}
            {tab === 3 ? (
              <Withdraw
                token={props.token}
              />
            ) : null}
            {tab === 4 ? (
              <Claim
                token={props.token}
                siloBalance={props.siloBalance}
              />
            ) : null}
          </Box>
        </Stack>
      </Card>
      {/* Tables */}
      <Box sx={{ display: tab === 0 || tab === 1 || tab === 2 ? 'block' : 'none' }}>
        <Deposits
          token={props.token}
          balance={props.siloBalance}
        />
      </Box>
      <Box sx={{ display: tab === 3 || tab === 4 ? 'block' : 'none' }}>
        <Withdrawals
          token={props.token}
          balance={props.siloBalance}
        />
      </Box>
    </>
  );
};

export default SiloActions;
