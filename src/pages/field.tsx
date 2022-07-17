import React, { useMemo } from 'react';
import {
  Container,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import PageHeader from 'components/Common/PageHeader';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import BigNumber from 'bignumber.js';
import { DataGridProps } from '@mui/x-data-grid';
import { displayBN, displayFullBN } from 'util/index';
import FieldActions from 'components/Field/Actions';
import TableCard from 'components/Common/TableCard';
import FieldConditions from '../components/Field/FieldConditions';
import { PODS } from '../constants/tokens';

const columns: DataGridProps['columns'] = [
  {
    field: 'placeInLine',
    headerName: 'Place In Line',
    flex: 1,
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 0)}`,
    renderCell: (params) => (
      (params.value.eq(-1))
        ? (<Typography color="primary">Harvestable</Typography>)
        : (<Typography>{displayBN(params.value)}</Typography>)
    )
  },
  {
    field: 'amount',
    headerName: 'Number of Pods',
    flex: 1,
    disableColumnMenu: true,
    align: 'left',
    headerAlign: 'left',
    valueFormatter: (params) =>
      `${displayFullBN(params.value as BigNumber, 2)}`,
    renderCell: (params) => (
      <Tooltip title={<>{displayFullBN(params.value)}</>}>
        <Typography>{displayBN(params.value, true)}</Typography>
      </Tooltip>
    ),
  },
];

const FieldPage: React.FC = () => {
  /// Data
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
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <PageHeader
          title="The Field"
          description="Earn yield by lending Beans to Beanstalk in exchange for Pods"
        />
        <FieldConditions
          beanstalkField={beanstalkField}
        />
        <FieldActions />
        <TableCard
          title="My Pods"
          state="ready"
          amount={farmerField.pods}
          rows={rows}
          columns={columns}
          sort={{ field: 'placeInLine', sort: 'asc' }}
          token={PODS}
        />
      </Stack>
    </Container>
  );
};
export default FieldPage;
