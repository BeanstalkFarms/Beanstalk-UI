import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import duneIcon from 'img/dune-icon.svg';
// import activeFert from 'img/tokens/fert-logo-active.svg';
import Stat from 'components/Common/Stat';
import TokenIcon from 'components/Common/TokenIcon';
import { BEAN } from 'constants/tokens';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColumns, GridRowsProp } from '@mui/x-data-grid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { displayBN, displayFullBN } from '../util';
import { ANALYTICS_LINK, SupportedChainId } from '../constants';
import SiloBalances from '../components/Common/SiloBalances';
import useBeanstalkSiloBreakdown from '../hooks/useBeanstalkSiloBreakdown';
import { AppState } from '../state';
import { tableStyle } from '../util/tableStyle';
import { BeanstalkPalette } from '../components/App/muiTheme';

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
    newBeans: new BigNumber(5),
    newSoil: new BigNumber(2000),
    weather: new BigNumber(689)
  },
  {
    id: 3,
    season: new BigNumber(5674),
    twap: new BigNumber(0.996),
    newBeans: new BigNumber(0),
    newSoil: new BigNumber(0),
    weather: new BigNumber(689)
  },
  {
    id: 4,
    season: new BigNumber(5674),
    twap: new BigNumber(1),
    newBeans: new BigNumber(1),
    newSoil: new BigNumber(0),
    weather: new BigNumber(689)
  }
];

const MAX_ROWS = 5;

const ForecastPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  const breakdown = useBeanstalkSiloBreakdown();
  const beanPrice = useSelector<AppState, AppState['_bean']['token']['price']>(
    (state) => state._bean.token.price
  );
  const { season } = useSelector<AppState, AppState['_beanstalk']['sun']>((state) => state._beanstalk.sun);
  const { totalPods } = useSelector<AppState, AppState['_beanstalk']['field']>((state) => state._beanstalk.field);
  const { supply: totalBeanSupply } = useSelector<AppState, AppState['_bean']['token']>((state) => state._bean.token);
  const podRate = totalPods.dividedBy(totalBeanSupply).multipliedBy(100);

  const isPriceLoading = beanPrice.eq(new BigNumber(-1));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 52 + 112;
  }, []);

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
        <Card sx={{ width: '100%', p: 2 }}>
          <Typography>PLACEHOLDER</Typography>
        </Card>
        <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between" gap={2}>
          <Card sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
              <Stat
                title="Time Weighted Average Price"
                color="primary"
                amount={`$${(isPriceLoading ? 0.0000 : beanPrice).toFixed(4)}`}
                icon={undefined}
                topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
                bottomText={`Season ${displayBN(season)}`}
              />
              <Box>
                <Typography>Last cross: 2m ago</Typography>
              </Box>
            </Stack>
            <Typography>test</Typography>
          </Card>
          <Card sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
              <Stat
                title="Pod Rate"
                amount={`${displayBN(podRate)}%`}
                icon={undefined}
                topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
                bottomText={`Season ${displayBN(season)}`}
              />
            </Stack>
            <Typography>test</Typography>
          </Card>
        </Stack>
        <Card sx={{ p: 2, width: '100%' }}>
          <Tabs value={tab} onChange={handleChangeTab}>
            <Tab label="Liquidity Over Time" />
            <Tab label="Liquidity By State" />
          </Tabs>
          <Stat
            title="Total Beanstalk Liquidity"
            amount={`$${displayFullBN(breakdown.totalValue.abs(), 2)}`}
            icon={undefined}
          />
          <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
            <Typography>TEST</Typography>
          </Box>
          <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
            <SiloBalances breakdown={breakdown} />
          </Box>
        </Card>
        <Card sx={{ p: 1 }}>
          <Box
            width="100%"
            height={tableHeight}
            sx={{
              ...tableStyle,
              '& .MuiDataGrid-row': {
                borderBottom: 1,
                borderColor: BeanstalkPalette.lightBlue,
              },
              '& .MuiDataGrid-columnHeadersInner': {
                borderBottom: 2, // TODO: why 2 here but 1 above?
                borderColor: BeanstalkPalette.lightBlue,
              }
            }}>
            <DataGrid
              columns={columns}
              rows={rows}
              pageSize={8}
              disableSelectionOnClick
              density="compact"
            />
          </Box>
        </Card>
      </Stack>
    </Container>
  );
};

export default ForecastPage;
