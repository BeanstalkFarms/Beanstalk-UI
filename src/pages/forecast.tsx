import React from 'react';
import {
  Button,
  Card,
  Container, 
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GridColumns, GridRowsProp } from '@mui/x-data-grid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useTheme } from '@mui/material/styles';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';

import { AppState } from 'state';
import { ANALYTICS_LINK, SupportedChainId } from 'constants/index';
import { displayBN, displayFullBN } from 'util/index';
import { BeanstalkPalette } from 'components/App/muiTheme';
import PageHeader from 'components/Common/PageHeader';
import LiquidityOverTime from 'components/Forecast/LiquidityOverTime';
import useChainId from 'hooks/useChain';
import ComingSoonCard from 'components/Common/ComingSoonCard';
import PodRate from 'components/Analytics/Field/PodRate';
import TWAP from 'components/Analytics/Bean/TWAP';
import LiquidityByState from '../components/Forecast/LiquidityByState';

const columns: GridColumns = [
  {
    field: 'season',
    headerName: '⏱ Season',
    flex: 1,
  },
  {
    field: 'twap',
    headerName: '💵 TWAP',
    flex: 1,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 4)}`,
    renderCell: (params) => (
      <Typography
        sx={{ color: params.value.gte(1) ? BeanstalkPalette.logoGreen : BeanstalkPalette.washedRed }}>{displayBN(params.value)}
      </Typography>
    ),
  },
  {
    field: 'newBeans',
    headerName: '🌱 New Beans',
    headerAlign: 'right',
    flex: 1,
    align: 'right',
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 4)}`,
    renderCell: (params) => (
      <>
        {
          params.value.gt(0) ? (
            <Stack direction="row" alignItems="center">
              <ArrowUpwardIcon sx={{ color: BeanstalkPalette.logoGreen, height: '17px' }} />
              <Typography sx={{ color: BeanstalkPalette.logoGreen }}>{displayBN(params.value)}</Typography>
            </Stack>
          ) : (
            <Typography>{displayBN(params.value)}</Typography>
          )
        }
      </>
    )
  },
  {
    field: 'newSoil',
    headerName: '🚜 New Soil',
    headerAlign: 'right',
    align: 'right',
    flex: 1,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 4)}`,
    renderCell: (params) => (
      <>
        {
          params.value.gt(0) ? (
            <Stack direction="row" alignItems="center">
              <ArrowUpwardIcon sx={{ color: BeanstalkPalette.logoGreen, height: '17px' }} />
              <Typography sx={{ color: BeanstalkPalette.logoGreen }}>{displayBN(params.value)}</Typography>
            </Stack>
          ) : (
            <Typography>{displayBN(params.value)}</Typography>
          )
        }
      </>
    )
  },
  {
    field: 'weather',
    headerName: '🌤 Weather',
    align: 'right',
    headerAlign: 'right',
    flex: 1
  }
];

const rows: GridRowsProp = [
  {
    id: 1,
    season: new BigNumber(5674),
    twap: new BigNumber(1.004),
    newBeans: new BigNumber(50000),
    newSoil: new BigNumber(2000),
    weather: new BigNumber(689)
  },
  {
    id: 2,
    season: new BigNumber(5674),
    twap: new BigNumber(1.004),
    newBeans: new BigNumber(500),
    newSoil: new BigNumber(1),
    weather: new BigNumber(689)
  },
  {
    id: 3,
    season: new BigNumber(5674),
    twap: new BigNumber(1.069),
    newBeans: new BigNumber(1),
    newSoil: new BigNumber(0),
    weather: new BigNumber(689)
  },
  {
    id: 4,
    season: new BigNumber(0),
    twap: new BigNumber(0.95),
    newBeans: new BigNumber(0),
    newSoil: new BigNumber(5000),
    weather: new BigNumber(689)
  },
  {
    id: 5,
    season: new BigNumber(5673),
    twap: new BigNumber(0.9099),
    newBeans: new BigNumber(0),
    newSoil: new BigNumber(3785),
    weather: new BigNumber(689)
  },
  {
    id: 6,
    season: new BigNumber(5673),
    twap: new BigNumber(0.60009),
    newBeans: new BigNumber(0),
    newSoil: new BigNumber(1092),
    weather: new BigNumber(689)
  }
];

const ForecastPage: React.FC = () => {
  const chainId = useChainId();

  // Data
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>((state) => state._bean.token.price);
  const { season } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const { totalPods } = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const { supply: totalBeanSupply } = useSelector<AppState, AppState['_bean']['token']>((state) => state._bean.token);
  const balances = useSelector<AppState, AppState['_beanstalk']['silo']['balances']>((state) => state._beanstalk.silo.balances);
  
  // Theme
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Calculations
  const podRate = totalPods.dividedBy(totalBeanSupply).multipliedBy(100);
  // const isPriceLoading = beanPrice.eq(new BigNumber(-1));
  // const isPodRateLoading = totalPods.eq(new BigNumber(-1)) || totalBeanSupply.eq(new BigNumber(-1));

  let content;
  if (chainId === SupportedChainId.MAINNET) {
    content = (
      <ComingSoonCard title="Forecast" />
    );
  } else {
    content = (
      <>
        <Stack direction={isMobile ? 'column' : 'row'} gap={2}>
          <Card sx={{ flex: 1 }}>
            <TWAP />
          </Card>
          <Card sx={{ flex: 1 }}>
            <PodRate />
          </Card>
        </Stack>
        <LiquidityOverTime balances={balances} />
        <LiquidityByState />
      </>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title="Forecast"
          description="View conditions on the Bean Farm"
          control={(
            <Button
              href={ANALYTICS_LINK}
              target="_blank"
              rel="noreferrer"
              color="light"
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ transform: 'rotate(-45deg)' }} />}
            >
              More Analytics
            </Button>
          )}
        />
        {content}
      </Stack>
    </Container>
  );
};

export default ForecastPage;
