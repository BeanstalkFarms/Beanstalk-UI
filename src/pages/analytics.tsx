import React from 'react';
import { DUNE_LINK } from 'constants/index';
import Page from 'components/Page';
import Analytics from 'components/Charts';

export default function AnalyticsPage() {
  return (
    <Page title="Analytics">
      <Analytics />
      {/* Load Dune analytics dashboard when user clicks analytics tab */}
      {/* window.open(DUNE_LINK, '_blank') */}
      {/* window.open('http://localhost:3001/balances', '_self') */}
    </Page>
  );
}
