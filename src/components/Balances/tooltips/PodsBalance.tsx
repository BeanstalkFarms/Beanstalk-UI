import { Typography, Stack, Box, Card } from '@mui/material';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import BigNumber from 'bignumber.js';
import { DataGrid } from '@mui/x-data-grid';
import { ZERO_BN } from '~/constants';
import { AppState } from '~/state';
import { displayBN, displayFullBN } from '~/util';
import TokenIcon from '~/components/Common/TokenIcon';
import { PODS } from '~/constants/tokens';
import Row from '~/components/Common/Row';
import { podlineColumns } from '~/pages/field';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import PointIndicator from '~/img/misc/point-indicator.svg';
import AuthEmptyState from '~/components/Common/ZeroState/AuthEmptyState';
import ArrowPagination from '~/components/Common/ArrowPagination';
import { tableStyle } from '~/components/Common/Table/styles';

const PlacesInLine: React.FC<{}> = () => {
  const { plots } = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  const { podLine, harvestableIndex } = useSelector<
    AppState,
    AppState['_beanstalk']['field']
  >((state) => state._beanstalk.field);

  // calculate the relative position of each plot (place in line / line length)
  const relativePlotPositions = useMemo(() => {
    const data: number[] = [];
    if (Object.keys(plots).length) {
      let prev: number;
      Object.keys(plots).forEach((index) => {
        const curr = new BigNumber(index)
          .minus(harvestableIndex)
          .dividedBy(podLine)
          .times(100)
          .toNumber();

        // if there is less than 1% difference in relative distance between plots,
        // it will cover the previous plot image, so we add 1%
        data.push(curr - prev < 1 ? curr + 1 : curr);
        prev = curr;
      });
    }
    return data;
  }, [plots, harvestableIndex, podLine]);

  return (
    <Stack spacing={1}>
      <Row position="relative" sx={{ width: '100%' }}>
        <Box
          sx={{
            width: 'calc(100% - 14px)',
            position: 'absolute',
            backgroundColor: '#7F5533B2',
            height: '10px',
            borderRadius: '20px',
            top: 0,
            left: '7px',
          }}
        />
        <Box width="100%" height="10px">
          {relativePlotPositions.map((posPct: number, i) => (
            <img
              src={PointIndicator}
              key={`plot-${i}`}
              alt=""
              style={{
                position: 'absolute',
                left: `${posPct}%`,
                top: '-5px',
                zIndex: i,
              }}
            />
          ))}
        </Box>
      </Row>
      <Row width="100%" justifyContent="space-between">
        <Typography>0</Typography>
        <Typography>{displayBN(podLine)}</Typography>
      </Row>
    </Stack>
  );
};

const MAX_ROWS = 5;

const PodsBalance: React.FC<{}> = () => {
  const { pods, plots, harvestablePods } = useSelector<
    AppState,
    AppState['_farmer']['field']
  >((state) => state._farmer.field);
  const { harvestableIndex } = useSelector<
    AppState,
    AppState['_beanstalk']['field']
  >((state) => state._beanstalk.field);

  const rows: any[] = useMemo(() => {
    const data: any[] = [];
    if (harvestablePods?.gt(0)) {
      data.push({
        id: harvestablePods,
        placeInLine: new BigNumber(-1),
        amount: harvestablePods,
      });
    }
    if (Object.keys(plots).length > 0) {
      data.push(
        ...Object.keys(plots).map((index) => ({
          id: index,
          placeInLine: new BigNumber(index).minus(harvestableIndex),
          amount: new BigNumber(plots[index]),
        }))
      );
    }
    return data;
  }, [harvestableIndex, plots, harvestablePods]);

  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '300px';
    return 60.5 + 6 + 39 - 5 + Math.min(rows.length, MAX_ROWS) * 36;
  }, [rows]);

  return (
    <Card sx={{ pt: 2, backgroundColor: BeanstalkPalette.lightYellow }}>
      <Stack spacing={1}>
        <Stack spacing={1} sx={{ px: 2 }}>
          <Stack>
            <Typography variant="bodySmall">
              <TokenIcon token={PODS} /> PODS
            </Typography>
            <Typography variant="h4" component="span">
              {displayFullBN(pods || ZERO_BN, 2)}
            </Typography>
          </Stack>
          <Typography>
            The Beanstalk-native debt asset, Harvestable on a FIFO basis.
          </Typography>
          <Stack pt={1}>
            <PlacesInLine />
          </Stack>
        </Stack>
        <Box
          sx={{
            height: tableHeight,
            width: '100%',
            ...tableStyle,
            px: 2,
            backgroundColor: BeanstalkPalette.lightYellow,
          }}
        >
          <DataGrid
            columns={podlineColumns}
            disableSelectionOnClick
            disableColumnMenu
            density="compact"
            pageSize={MAX_ROWS}
            rows={rows}
            components={{
              NoRowsOverlay() {
                return (
                  <AuthEmptyState
                    message="Your pods will appear here."
                    hideWalletButton
                  />
                );
              },
              Pagination: ArrowPagination,
            }}
            initialState={{
              sorting: {
                sortModel: [{ field: 'placeInLine', sort: 'asc' }],
              },
            }}
            sx={{
              '& .MuiDataGrid-root .MuiDataGrid-row': {
                ':first-child': {
                  color: harvestablePods?.gt(0)
                    ? BeanstalkPalette.theme.fall.brown
                    : undefined,
                },
              },
              '& .MuiDataGrid-footerContainer': {
                justifyContent: 'center',
              },
            }}
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default PodsBalance;
