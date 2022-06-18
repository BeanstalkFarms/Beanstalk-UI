import React, { useState } from 'react';
import { Stack,  CardProps,  Card,  Tab, Tabs } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../state';
import BeanPrice from '../../BeanCharts/BeanPrice';
import Volume from '../../BeanCharts/Volume';

export type UnripeAssetChartsProps = {

}

const UnripeAssetCharts: React.FC<UnripeAssetChartsProps & CardProps> = ({ sx  }) => {
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
          {tab === 0 && <BeanPrice season={season} beanPrice={beanPrice} />}
          {tab === 1 && <Volume season={season} beanPrice={beanPrice} />}
        </Stack>
      </Card>
    );
  };

export default UnripeAssetCharts;
