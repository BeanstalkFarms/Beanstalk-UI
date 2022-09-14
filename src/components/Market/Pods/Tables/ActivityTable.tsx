import React, { useMemo } from 'react';
import { BoxProps } from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import TablePagination from '../../../Common/TablePagination';
import TabTable from '~/components/Common/Table/TabTable';
import { Module, ModuleContent } from '~/components/Common/Module';

const MAX_ROWS = 10;

const ActivityTable: React.FC<DataGridProps & BoxProps> = ({ rows, columns }) => {
  //
  const tableHeight = useMemo(() => {
    if (!rows || rows.length === 0) return '200px';
    return Math.min(rows.length, MAX_ROWS) * 35 + 112;
  }, [rows]);

  return (
    <Module sx={{ pt: 2, px: 1 }}>
      <ModuleContent>
        <TabTable
          columns={columns}
          rows={rows}
          disableSelectionOnClick
          maxRows={15}
          initialState={{
            sorting: {
              sortModel: [{ field: 'placeInLine', sort: 'asc' }],
            }
          }}
          components={{
            Pagination: TablePagination
          }}
        />
      </ModuleContent>
    </Module>
  );
};

export default ActivityTable;
