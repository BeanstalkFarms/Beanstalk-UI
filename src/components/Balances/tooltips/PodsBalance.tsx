import { Typography, Stack, Box } from '@mui/material';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAccount } from 'wagmi';
import BigNumber from 'bignumber.js';
import { ZERO_BN } from '~/constants';
import { AppState } from '~/state';
import { displayBN, displayFullBN } from '~/util';
import TokenIcon from '~/components/Common/TokenIcon';
import { PODS } from '~/constants/tokens';
import Row from '~/components/Common/Row';
import { podlineColumns } from '~/pages/field';
import TableCard from '~/components/Common/TableCard';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import PointIndicator from '~/img/misc/point-indicator.svg';

const PlaceInLineBar: React.FC<{}> = () => (
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
);

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
        <PlaceInLineBar />
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

type PodLineRow = {
  id: BigNumber | string;
  placeInLine: BigNumber;
  amount: BigNumber;
};

const PodsBalance: React.FC<{}> = () => {
  const account = useAccount();
  const authState = !account ? 'disconnected' : 'ready';
  const { pods, plots, harvestablePods } = useSelector<
    AppState,
    AppState['_farmer']['field']
  >((state) => state._farmer.field);
  const { harvestableIndex } = useSelector<
    AppState,
    AppState['_beanstalk']['field']
  >((state) => state._beanstalk.field);

  const rows: PodLineRow[] = useMemo(() => {
    const data: PodLineRow[] = [];
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

  return (
    <Stack
      spacing={1}
      py={2}
      px={2}
      sx={{ backgroundColor: BeanstalkPalette.lightYellow }}
    >
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
      <TableCard
        title="Pod Balance"
        state={authState}
        rows={rows}
        columns={podlineColumns}
        sort={{ field: 'placeInLine', sort: 'asc' }}
        token={PODS}
        onlyTable
        tableCss={{
          backgroundColor: BeanstalkPalette.lightYellow,
          paddingLeft: '0px !important',
          paddingRight: '0px !important',
          '& .MuiDataGrid-root .MuiDataGrid-row': {
            ':first-child': {
              color: BeanstalkPalette.theme.fall.brown,

              // color: harvestablePods?.gt(0)
              //   ? BeanstalkPalette.theme.fall.brown
              //   : undefined,
            },
          },
        }}
      />
    </Stack>
  );
};

export default PodsBalance;
