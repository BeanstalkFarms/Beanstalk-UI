import React, { useState } from 'react';
import { Box, Card, Container, Stack, Tab, Tabs } from '@mui/material';
import useChainId from 'hooks/useChain';
import { SupportedChainId } from 'constants/index';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import TWAP from 'components/Analytics/Bean/TWAP';

const BeanAnalytics: React.FC<{}> = () => {
  const chainId = useChainId();
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  
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
            <Tab label="Bean Price" />
            <Tab label="Volume" />
            <Tab label="Liquidity" />
            <Tab label="Market Cap" />
            <Tab label="Supply" />
            <Tab label="Crosses" />
          </Tabs>
          {tab === 0 && <TWAP height={280} />}
          {/* {tab === 1 && <Volume season={season} beanPrice={beanPrice} />}
          {tab === 2 && <Liquidity season={season} beanPrice={beanPrice} />}
          {tab === 3 && <MarketCap season={season} beanPrice={beanPrice} />}
          {tab === 4 && <Supply season={season} beanPrice={beanPrice} />}
          {tab === 5 && <Crosses season={season} beanPrice={beanPrice} />} */}
        </Stack>
      </Card>
    </Container>
  );
};

export default BeanAnalytics;
