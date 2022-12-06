import React, { useMemo, useRef } from 'react';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { Box, CircularProgress } from '@mui/material';
import { useAtomValue } from 'jotai';
import { FC } from '~/types';
import { MarketBaseTableProps } from '~/components/Common/Table/TabTable';
import {
  BeanstalkPalette,
  FontSize,
  FontWeight,
  hexToRgba,
} from '~/components/App/muiTheme';
import ScrollPaginationControl from '~/components/Common/ScrollPaginationControl';
import Centered from '~/components/Common/ZeroState/Centered';
import { marketBottomTabsAtom } from '../info/atom-context';
import AuthEmptyState from '~/components/Common/ZeroState/AuthEmptyState';

const scrollbarStyles = {
  '& ::-webkit-scrollbar': {
    width: '8px',
  },
  '& ::-webkit-scrollbar-track': {
    width: '8px',
    background: BeanstalkPalette.theme.winter.paleBlue,
  },
  '& ::-webkit-scrollbar-thumb': {
    borderRadius: 2,
    background: BeanstalkPalette.theme.winter.primary,
    // outline: '1px solid',
    // outlineColor: BeanstalkPalette.theme.winter.blueDark,
  },
  '& ::-webkit-scrollbar-thumb:hover': {
    background: BeanstalkPalette.theme.winter.blueLight,
  },
};

const marketplaceTableStyle = {
  '& .MuiDataGrid-root': {
    outline: 'none',
    border: 'none',
    // Footer
    '& .MuiDataGrid-footerContainer': {
      outline: 'none',
      borderBottom: 'none',
      borderTop: 'none',
      justifyContent: 'center',
    },

    // Column Header
    '& .MuiDataGrid-columnHeader': {
      outline: 'none',
      border: 'none',
      '&:focused, active': {
        border: 'none'
      }
    },
    '& .MuiDataGrid-columnHeader:focus': {
      outline: 'none',
      border: 'none',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontSize: FontSize.xs,
      color: 'text.tertiary',
      fontWeight: FontWeight.normal,
    },

    // Cell
    '& .MuiDataGrid-cell': {
      fontSize: FontSize.xs,
      color: 'text.primary',
      '&:focused': {
        border: 'none'
      }
    },
    '& .MuiDataGrid-cell:focus': {
      outline: 'none',
      border: 'none',
    },

    // Row
    '& .MuiDataGrid-row': {
      borderBottom: '1px solid',
      borderColor: hexToRgba(BeanstalkPalette.lightGrey, 0.2),
    },
    // Icon
    '& .MuiDataGrid-sortIcon': {
      color: 'text.primary',
    },
    '& .MuiDataGrid-menuIconButton': {
      color: 'text.primary',
    },
    '& .MuiDataGrid-iconSeparator': {
      color: 'transparent',
    },
  },
  ...scrollbarStyles,
};
type IActivityTable = {
  /**
   * if it's a a generic market activity table or a user's activity table
   */
  isUserTable?: boolean;
  /**
   * message fragment to display when there is no data
   */
  title?: string;
  /**
   * async function to fetch more data on scroll
   */
  fetchMore?: () => Promise<void>;
};

const sizeMap = {
  0: 56, // closed
  1: 300, // half
  2: 750, // full
};
const EmptyOverlay: React.FC<{ message?: string; isUserTable?: boolean }> = ({
  message,
  isUserTable,
}) => {
  if (isUserTable && message) {
    return <AuthEmptyState message={message} hideWalletButton />;
  }
  return (
    <Centered>
      <CircularProgress />
    </Centered>
  );
};

const TAB_CONTROL_HEIGHT = 52;

const ActivityTable: FC<
  IActivityTable & MarketBaseTableProps & DataGridProps
> = ({
  rows,
  columns,
  maxRows,
  title,
  onRowClick,
  fetchMore,
  isUserTable = false,
  ...props
}) => {
  const openState = useAtomValue(marketBottomTabsAtom);
  const tableHeight = useMemo(
    () => sizeMap[openState === 2 ? openState : 1] - TAB_CONTROL_HEIGHT,
    [openState]
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box
      ref={scrollRef}
      sx={{
        px: 0.2,
        height: tableHeight,
        width: '100%',
        ...marketplaceTableStyle,
      }}
    >
      <DataGrid
        disableSelectionOnClick
        columns={columns}
        rows={rows}
        pageSize={maxRows}
        density="compact"
        onRowClick={onRowClick}
        initialState={{
          sorting: {
            sortModel: [{ field: 'time', sort: 'asc' }],
          },
        }}
        components={{
          Footer: ScrollPaginationControl,
          NoRowsOverlay: EmptyOverlay,
          LoadingOverlay: EmptyOverlay,
        }}
        componentsProps={{
          footer: {
            scrollRef,
            handleFetchMore: fetchMore,
          },
          noRowsOverlay: {
            message: `Your ${title} will appear here`,
            isUserTable,
          },
        }}
        {...props}
        // disable loading
        loading={false}
      />
    </Box>
  );
};

export default ActivityTable;
