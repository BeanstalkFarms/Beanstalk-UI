import React from 'react';
import {
  Button,
  Container, 
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import duneIcon from 'img/dune-icon.svg';
// import activeFert from 'img/tokens/fert-logo-active.svg';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { GridColumns, GridRowsProp } from '@mui/x-data-grid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { AppState } from 'state';
import { BeanstalkPalette } from 'components/App/muiTheme';
import SeasonsTable from 'components/Forecast/SeasonsTable';
import ForecastTopBar from 'components/Forecast/ForecastTopBar';
import { ANALYTICS_LINK } from '../constants';
import { displayBN, displayFullBN } from '../util';
import TWAPCard from '../components/Forecast/TWAPCard';
import PodRateCard from '../components/Forecast/PodRateCard';
import LiquidityOverview from '../components/Forecast/LiquidityOverview';

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
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );
  const { season } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const { totalPods } = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const { supply: totalBeanSupply } = useSelector<AppState, AppState['_bean']['token']>((state) => state._bean.token);
  const balances = useSelector<AppState, AppState['_beanstalk']['silo']['tokens']>((state) => state._beanstalk.silo.tokens);
  const podRate = totalPods.dividedBy(totalBeanSupply).multipliedBy(100);

  // const isPriceLoading = beanPrice.eq(new BigNumber(-1));
  // const isPodRateLoading = totalPods.eq(new BigNumber(-1)) || totalBeanSupply.eq(new BigNumber(-1));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg">
      <Stack gap={2}>
        <PageHeader
          title={<strong>Forecast</strong>}
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
              View More Analytics
            </Button>
          )}
        />
        {/* TEMP: Hide next Season metrics on MAINNET. */}
        <ForecastTopBar />
        <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" gap={2}>
          <TWAPCard beanPrice={beanPrice} season={season} />
          <PodRateCard podRate={podRate} season={season} />
        </Stack>
        <LiquidityOverview balances={balances} />
        <SeasonsTable columns={columns} rows={rows} />
      </Stack>
    </Container>
  );
};

export default ForecastPage;
