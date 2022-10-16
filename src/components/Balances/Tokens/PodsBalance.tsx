import { Typography, Stack, Box, Divider } from '@mui/material';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import BigNumber from 'bignumber.js';
import { DataGrid } from '@mui/x-data-grid';
import { AppState } from '~/state';
import { displayBN, displayFullBN, PlotMap } from '~/util';
import { PODS } from '~/constants/tokens';
import Row from '~/components/Common/Row';
import { podlineColumns } from '~/pages/field';
import { BeanstalkPalette, FontSize } from '~/components/App/muiTheme';
import PointIndicator from '~/img/misc/point-indicator.svg';
import AuthEmptyState from '~/components/Common/ZeroState/AuthEmptyState';
import ArrowPagination from '~/components/Common/ArrowPagination';
import { tableStyle } from '~/components/Common/Table/styles';
import BalancePopover from './BalancePopover';

const plotsTableStyle = {
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 450,
    fontSize: `${FontSize.sm} !important`,
  },
  '& .MuiDataGrid-footerContainer': {
    justifyContent: 'center',
  },
  '& .MuiTypography-root': {
    fontSize: FontSize.sm,
  },
  '& .MuiDataGrid-virtualScroller': {
    overflowY: 'hidden'
  }
};

const PlacesInLine: React.FC<{
  plots: PlotMap<BigNumber>;
  podLine: BigNumber;
  harvestableIndex: BigNumber;
}> = ({ plots, podLine, harvestableIndex }) => {
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
        // we add 1% to prevent it from covering the previous plot
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
        <Typography variant="bodySmall">0</Typography>
        <Typography variant="bodySmall">{displayBN(podLine)}</Typography>
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
  const { harvestableIndex, podLine } = useSelector<
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
    // 58: height of pagination
    // 39: height of header
    // 27: height of cell
    return 58 + 39 + Math.min(rows.length, MAX_ROWS) * 27;
  }, [rows]);

  return (
    <BalancePopover
      items={[
        {
          token: PODS,
          title: 'PODS',
          amount: pods,
          description:
            'The Beanstalk-native debt asset, Harvestable on a FIFO basis.',
          amountModifier: harvestablePods?.gt(0)
            ? `+${displayFullBN(harvestablePods, 0)} Harvestable`
            : undefined,
        },
      ]}
    >
      <Stack spacing={1}>
        <Stack px={2} spacing={1}>
          <PlacesInLine
            podLine={podLine}
            plots={plots}
            harvestableIndex={harvestableIndex}
          />
          <Divider
            sx={{ width: '100%', color: BeanstalkPalette.lightYellow }}
          />
        </Stack>
        <Box
          sx={{
            height: tableHeight,
            width: '100%',
            ...tableStyle,
            backgroundColor: BeanstalkPalette.lightYellow,
            px: 1,
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
              '& .MuiDataGrid-root, .MuiDataGrid-row, .MuiDataGrid-cell': {
                maxHeight: '27px !important',
                minHeight: '27px !important',
                ':first-child': {
                  color: harvestablePods?.gt(0)
                    ? BeanstalkPalette.theme.fall.brown
                    : undefined,
                },
              },
              ...plotsTableStyle,
            }}
          />
        </Box>
      </Stack>
    </BalancePopover>
  );
};

export default PodsBalance;
