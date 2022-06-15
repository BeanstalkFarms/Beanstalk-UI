import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container, Divider,
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
import ForecastCard from '../components/Forecast/ForecastCard';
import SimpleLineChart, { DataPoint } from '../components/Charts/SimpleLineChart';
import { mockPodRateData, mockTWAPData } from '../components/Charts/SimpleLineChart.mock';
import TimeTabs from '../components/TimeTabs';

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

  // const isPriceLoading = beanPrice.eq(new BigNumber(-1));
  // const isPodRateLoading = totalPods.eq(new BigNumber(-1)) || totalBeanSupply.eq(new BigNumber(-1));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 52 + 112;
  }, []);

  const [displayTWAP, setDisplayTWAP] = useState<BigNumber[]>([new BigNumber(-1)]);

  const [isHoveringTWAP, setIsHoveringTWAP] = useState(false);
  const handleCursorTWAP = useCallback(
    (dps?: DataPoint[]) => {
      setDisplayTWAP(dps ? dps.map((dp) => new BigNumber(dp.value)) : [beanPrice]);
      setIsHoveringTWAP(!!dps);
    },
    [beanPrice]
  );

  const [displayPodRate, setDisplayPodRate] = useState<BigNumber[]>([new BigNumber(-1)]);
  const [isHoveringPodRate, setIsHoveringPodRate] = useState(false);
  const handleCursorPodRate = useCallback(
    (dps?: DataPoint[]) => {
      setDisplayPodRate(dps ? dps.map((dp) => new BigNumber(dp.value)) : [podRate]);
      setIsHoveringPodRate(!!dps);
    },
    [podRate]
  );

  const [timeTab, setTimeTab] = useState(0);
  const handleChangeTimeTab = (i: number) => {
    setTimeTab(i);
  };

  useEffect(() => {
    console.log('TAB');
    console.log(timeTab);
  }, [timeTab]);

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
          <ForecastCard
            showLastCross
            stats={(
              <Stat
                title="Time Weighted Average Price"
                color="primary"
                amount={`$${(isHoveringTWAP ? displayTWAP[0] : beanPrice).toFixed(4)}`}
                icon={undefined}
                topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
                bottomText={`Season ${displayBN(season)}`}
              />
            )}
            graphSection={(
              // TODO: componentize graphSection
              <>
                <Box sx={{ width: '100%', height: '175px', position: 'relative' }}>
                  <SimpleLineChart series={[mockTWAPData]} onCursor={handleCursorTWAP} />
                </Box>
                <Box>
                  <Divider color={BeanstalkPalette.lightBlue} />
                  <Stack direction="row" justifyContent="space-between" sx={{ p: 0.75, pr: 2, pl: 2 }}>
                    <Typography color={BeanstalkPalette.lightishGrey}>2/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>3/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>4/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>5/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>6/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>7/21</Typography>
                  </Stack>
                </Box>
              </>
            )}
            topRight={(
              <>
                <Stack alignItems="right">
                  <TimeTabs tab={timeTab} setState={handleChangeTimeTab} />
                  <Typography sx={{ textAlign: 'right', pr: 0.5 }}>Last cross: 2m ago</Typography>
                </Stack>
              </>
            )}
          />
          <ForecastCard
            stats={(
              <Stat
                title="Pod Rate"
                amount={`${displayBN(isHoveringPodRate ? displayPodRate[0] : podRate)}%`}
                icon={undefined}
                topIcon={<TokenIcon token={BEAN[SupportedChainId.MAINNET]} />}
                bottomText={`Season ${displayBN(season)}`}
              />
            )}
            graphSection={(
              // TODO: componentize graphSection
              <>
                <Box sx={{ width: '100%', height: '175px', position: 'relative' }}>
                  <SimpleLineChart series={[mockPodRateData]} onCursor={handleCursorPodRate} />
                </Box>
                <Box>
                  <Divider color={BeanstalkPalette.lightBlue} />
                  <Stack direction="row" justifyContent="space-between" sx={{ p: 0.75, pr: 2, pl: 2 }}>
                    <Typography color={BeanstalkPalette.lightishGrey}>2/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>3/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>4/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>5/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>6/21</Typography>
                    <Typography color={BeanstalkPalette.lightishGrey}>7/21</Typography>
                  </Stack>
                </Box>
              </>
            )}
          />
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
