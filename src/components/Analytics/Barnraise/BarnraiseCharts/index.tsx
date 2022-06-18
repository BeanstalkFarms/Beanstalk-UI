import React, { useState } from 'react';
import { Stack,  CardProps,  Card,  Tab, Tabs } from '@mui/material';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { AppState } from '../../../../state';
import RRoR from '../../Field/FieldCharts/RRoR';
import AllFertilizer from './AllFertilizer';
import AllUnripeAssets from './AllUnripeAssets';
import Forfeitures from "./Forfeitures";

const BarnraiseCharts: React.FC<CardProps> = ({ sx }) => {
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
            <Tab label="All Fertilizer" />
            <Tab label="All Unripe Assets" />
            <Tab label="Forfeitures" />
          </Tabs>
          {tab === 0 && <AllFertilizer season={season} beanPrice={beanPrice} />}
          {tab === 1 && <AllUnripeAssets season={season} beanPrice={beanPrice} />}
          {tab === 2 && <Forfeitures season={season} beanPrice={beanPrice} />}
        </Stack>
      </Card>
    );
  };

export default BarnraiseCharts;
