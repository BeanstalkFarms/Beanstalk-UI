import React from 'react';
import { BoxProps } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import TabTable from '~/components/Common/Table/TabTable';
import LoadMorePagination from '~/components/Common/LoadMorePagination';
import ArrowPagination from "~/components/Common/ArrowPagination";

const ActivityTable: React.FC<DataGridProps & BoxProps & {fetchMore:any}> = (props) =>
   (
     <TabTable
       columns={props.columns}
       rows={props.rows}
       disableSelectionOnClick
       // maxRows={15}
       maxRows={100}
       initialState={{
        sorting: {
          sortModel: [{ field: 'placeInLine', sort: 'asc' }],
        }
      }}
       components={{
        // Pagination: () => <LoadMorePagination fetchMore={props.fetchMore} />
        Pagination: ArrowPagination
      }}
    />
  );
export default ActivityTable;
