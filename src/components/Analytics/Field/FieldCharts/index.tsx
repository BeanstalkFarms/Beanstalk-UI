import React, { useState } from 'react';
import { Stack,  CardProps,  Card,  Tab, Tabs } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../state';
import RRoR from './RRoR';
import Weather from './Weather';
import Pods from './Pods';
import PodRate from './PodRate';
import Sown from './Sown';
import Harvested from './Harvested';
import Sowers from './Sowers';

const FieldCharts: React.FC<CardProps> = ({ sx }) => {
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
            <Tab label="RRoR" />
            <Tab label="Weather" />
            <Tab label="Pods" />
            <Tab label="Pod Rate" />
            <Tab label="Sown" />
            <Tab label="Harvested" />
            <Tab label="Sowers" />
          </Tabs>
          {tab === 0 && <RRoR season={season} beanPrice={beanPrice} />}
          {tab === 1 && <Weather season={season} beanPrice={beanPrice} />}
          {tab === 2 && <Pods season={season} beanPrice={beanPrice} />}
          {tab === 3 && <PodRate season={season} beanPrice={beanPrice} />}
          {tab === 4 && <Sown season={season} beanPrice={beanPrice} />}
          {tab === 5 && <Harvested season={season} beanPrice={beanPrice} />}
          {tab === 6 && <Sowers season={season} beanPrice={beanPrice} />}
        </Stack>
      </Card>
    );
  };

export default FieldCharts;
