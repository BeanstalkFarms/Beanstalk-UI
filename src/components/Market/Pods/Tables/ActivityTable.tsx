import React from 'react';
import { BoxProps } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import TablePagination from '../../../Common/TablePagination';
import TabTable from '~/components/Common/Table/TabTable';

const ActivityTable: React.FC<DataGridProps & BoxProps & {fetchMore:any}> = (props) =>
   (
     <TabTable
       columns={props.columns}
       rows={props.rows}
       disableSelectionOnClick
       maxRows={15}
       initialState={{
        sorting: {
          sortModel: [{ field: 'placeInLine', sort: 'asc' }],
        }
      }}
       components={{
        Pagination: () => <TablePagination fetchMore={props.fetchMore} />
      }}
    />
  );
export default ActivityTable;
