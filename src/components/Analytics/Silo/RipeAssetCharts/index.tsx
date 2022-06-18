import React, { useState } from 'react';
import { Stack,  CardProps,  Card,  Tab, Tabs } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../state';
import BeanPrice from '../../Bean/BeanCharts/BeanPrice';
import Volume from '../../Bean/BeanCharts/Volume';
import Liquidity from '../../Bean/BeanCharts/Liquidity';
import MarketCap from '../../Bean/BeanCharts/MarketCap';
import Supply from '../../Bean/BeanCharts/Supply';
import Crosses from '../../Bean/BeanCharts/Crosses';
import DepositedBeans from "./DepositedBeans";
import WithdrawnBeans from "./WithdrawnBeans";
import DepositedLP from "./DepositedLP";
import WithdrawnLP from "./WithdrawnLP";
import Stalk from "./Stalk";
import Seeds from "./Seeds";

export type RipeAssetChartsProps = {
}

const RipeAssetCharts: React.FC<RipeAssetChartsProps & CardProps> = ({ sx }) => {
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
            <Tab label="Deposited Beans" />
            <Tab label="Withdrawn Beans" />
            <Tab label="Deposited LP" />
            <Tab label="Withdrawn LP" />
            <Tab label="Stalk" />
            <Tab label="Seeds" />
          </Tabs>
          {tab === 0 && <DepositedBeans season={season} beanPrice={beanPrice} />}
          {tab === 1 && <WithdrawnBeans season={season} beanPrice={beanPrice} />}
          {tab === 2 && <DepositedLP season={season} beanPrice={beanPrice} />}
          {tab === 3 && <WithdrawnLP season={season} beanPrice={beanPrice} />}
          {tab === 4 && <Stalk season={season} beanPrice={beanPrice} />}
          {tab === 5 && <Seeds season={season} beanPrice={beanPrice} />}
        </Stack>
      </Card>
    );
  };

export default RipeAssetCharts;
