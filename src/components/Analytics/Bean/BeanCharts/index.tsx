import React, { useState } from 'react';
import { Stack,  CardProps,  Card,  Tab, Tabs } from '@mui/material';
import { useSelector } from 'react-redux';
import BeanPrice from './BeanPrice';
import Volume from './Volume';
import Liquidity from './Liquidity';
import MarketCap from './MarketCap';
import Supply from './Supply';
import { AppState } from '../../../../state';
import Crosses from './Crosses';

const BeanCharts: React.FC<CardProps> = ({ sx }) => {
  const { season } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
  (state) => state._bean.token.price
  );

  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Card sx={{ width: '100%', ...sx }}>
      <Stack>
        <Tabs value={tab} onChange={handleChangeTab} sx={{ px: 2, pt: 2 }}>
          <Tab label="Bean Price" />
          <Tab label="Volume" />
          <Tab label="Liquidity" />
          <Tab label="Market Cap" />
          <Tab label="Supply" />
          <Tab label="Crosses" />
        </Tabs>
        {tab === 0 && <BeanPrice season={season} beanPrice={beanPrice} />}
        {tab === 1 && <Volume season={season} beanPrice={beanPrice} />}
        {tab === 2 && <Liquidity season={season} beanPrice={beanPrice} />}
        {tab === 3 && <MarketCap season={season} beanPrice={beanPrice} />}
        {tab === 4 && <Supply season={season} beanPrice={beanPrice} />}
        {tab === 5 && <Crosses season={season} beanPrice={beanPrice} />}
      </Stack>
    </Card>
  );
};

export default BeanCharts;
