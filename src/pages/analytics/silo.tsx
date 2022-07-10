import React from 'react';
import { Card, Container, Stack, Tab, Tabs } from '@mui/material';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/index';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import useTabs from 'hooks/display/useTabs';

const RipeAssetCharts: React.FC<{}> = () => {
  const [tab, handleChangeTab] = useTabs();

  return (
    <Card>
      <Stack>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2 }}>
          <Tab label="Deposited Beans" />
          <Tab label="Withdrawn Beans" />
          <Tab label="Deposited LP" />
          <Tab label="Withdrawn LP" />
          <Tab label="Stalk" />
          <Tab label="Seeds" />
        </Tabs>
        {/* {tab === 0 && <DepositedBeans season={season} beanPrice={beanPrice} />}
        {tab === 1 && <WithdrawnBeans season={season} beanPrice={beanPrice} />}
        {tab === 2 && <DepositedLP season={season} beanPrice={beanPrice} />}
        {tab === 3 && <WithdrawnLP season={season} beanPrice={beanPrice} />}
        {tab === 4 && <Stalk season={season} beanPrice={beanPrice} />}
        {tab === 5 && <Seeds season={season} beanPrice={beanPrice} />} */}
      </Stack>
    </Card>
  );
};

const UnripeAssetCharts: React.FC<{}> = () => {
  const [tab, handleChangeTab] = useTabs();

  return (
    <Card>
      <Stack>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2 }}>
          <Tab label="Deposited Unripe Beans" />
          <Tab label="Deposited Unripe LP" />
        </Tabs>
        {/* {tab === 0 && <DepositedUnripeBeans season={season} beanPrice={beanPrice} />}
        {tab === 1 && <DepositedUnripeLP season={season} beanPrice={beanPrice} />} */}
      </Stack>
    </Card>
  );
};

// --------------------------------------------------------

const SiloAnalytics: React.FC<{}> = () => {
  const chainId = useChainId();
  if (chainId === SupportedChainId.MAINNET) {
    return (
      <Container maxWidth="lg">
        <ComingSoonCard title="Barn Raise Analytics" />
      </Container>
    );
  }
  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <RipeAssetCharts />
        <UnripeAssetCharts />
      </Stack>
    </Container>
  );
};

export default SiloAnalytics;
