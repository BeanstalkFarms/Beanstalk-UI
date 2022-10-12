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

const PodsBalance: React.FC<{}> = () => {
  const account = useAccount();
  const authState = !account ? 'disconnected' : 'ready';
  const farmerField = useSelector<AppState, AppState['_farmer']['field']>(
    (state) => state._farmer.field
  );
  const beanstalkField = useSelector<AppState, AppState['_beanstalk']['field']>(
    (state) => state._beanstalk.field
  );
  const harvestablePods = farmerField.harvestablePods;

  const rows: any[] = useMemo(() => {
    const data: any[] = [];
    if (harvestablePods?.gt(0)) {
      data.push({
        id: harvestablePods,
        placeInLine: new BigNumber(-1),
        amount: harvestablePods,
      });
    }
    if (Object.keys(farmerField.plots).length > 0) {
      data.push(
        ...Object.keys(farmerField.plots).map((index) => ({
          id: index,
          placeInLine: new BigNumber(index).minus(
            beanstalkField.harvestableIndex
          ),
          amount: new BigNumber(farmerField.plots[index]),
        }))
      );
    }
    return data;
  }, [beanstalkField.harvestableIndex, farmerField.plots, harvestablePods]);

  return (
    <Stack spacing={1} pt={2} px={2}>
      <Stack>
        <Typography variant="bodySmall">
          <TokenIcon token={PODS} /> PODS
        </Typography>
        <Typography variant="h4" component="span">
          {displayFullBN(farmerField.pods ? farmerField.pods : ZERO_BN, 2)}
        </Typography>
      </Stack>

      <Typography>
        The Beanstalk-native debt asset, Harvestable on a FIFO basis.
      </Typography>
      <Stack>
        <Box
          sx={{
            alignSelf: 'center',
            backgroundColor: 'black',
            width: '95%',
            height: '10px',
            background: 'black',
          }}
        />
        <Row width="100%" justifyContent="space-between">
          <Typography>0</Typography>
          <Typography>{displayBN(beanstalkField.podLine)}</Typography>
        </Row>
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
            },
          },
        }}
      />
    </Stack>
  );
};

export default PodsBalance;
