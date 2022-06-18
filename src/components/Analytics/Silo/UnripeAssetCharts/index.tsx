import React, { useState } from 'react';
import { Stack,  CardProps,  Card,  Tab, Tabs } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../state';
import BeanPrice from '../../Bean/BeanCharts/BeanPrice';
import Volume from '../../Bean/BeanCharts/Volume';
import DepositedUnripeBeans from "./DepositedUnripeBeans";
import DepositedUnripeLP from "./DepositedUnripeLP";

const UnripeAssetCharts: React.FC<CardProps> = ({ sx  }) => {
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
            <Tab label="Deposited Unripe Beans" />
            <Tab label="Deposited Unripe LP" />
          </Tabs>
          {tab === 0 && <DepositedUnripeBeans season={season} beanPrice={beanPrice} />}
          {tab === 1 && <DepositedUnripeLP season={season} beanPrice={beanPrice} />}
        </Stack>
      </Card>
    );
  };

export default UnripeAssetCharts;
