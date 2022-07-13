import React from 'react';
import { Card, Container, Stack, Tab, Tabs } from '@mui/material';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/index';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import useTabs from 'hooks/display/useTabs';
import Weather from 'components/Analytics/Field/Weather';
import Pods from 'components/Analytics/Field/Pods';
import PodRate from 'components/Analytics/Field/PodRate';
import HarvestedPods from 'components/Analytics/Field/HarvestedPods';

const FieldAnalytics: React.FC<{}> = () => {
  const chainId = useChainId();
  const [tab, handleChangeTab] = useTabs();

  if (chainId === SupportedChainId.MAINNET) {
    return (
      <Container maxWidth="lg">
        <ComingSoonCard title="Barn Raise Analytics" />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Card>
        <Stack>
          <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2 }}>
            <Tab label="RRoR" />
            <Tab label="Weather" />
            <Tab label="Pods" />
            <Tab label="Pod Rate" />
            <Tab label="Sown" />
            <Tab label="Harvested" />
            <Tab label="Sowers" />
          </Tabs>
          {/* {tab === 0 && <RRoR season={season} beanPrice={beanPrice} />} */}
          {tab === 1 && <Weather />}
          {tab === 2 && <Pods />}
          {tab === 3 && <PodRate />}
          {/* {tab === 4 && <Sown season={season} beanPrice={beanPrice} />} */}
          {tab === 5 && <HarvestedPods />}
          {/* {tab === 6 && <Sowers season={season} beanPrice={beanPrice} />} */}
        </Stack>
      </Card>
    </Container>
  );
};

export default FieldAnalytics;
