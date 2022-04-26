import React from 'react';
import Page from 'components/Page';
// import Balances from 'components/Balances';
import ExploitBalances from 'components/ExploitBalances';

export default function BalancesPage() {
  return (
    <Page title="Balances">
      <ExploitBalances />
    </Page>
  );
}
