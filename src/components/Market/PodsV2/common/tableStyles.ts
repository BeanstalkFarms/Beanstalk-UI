import {
  BeanstalkPalette,
  FontSize,
  FontWeight,
} from '~/components/App/muiTheme';

export const scrollbarStyles = {
  '& ::-webkit-scrollbar': {
    width: '4px',
    height: '4px',
    // '@media (max-width: 800px)': {
    //   height: '4px',
    // },
  },
  '& ::-webkit-scrollbar-track': {
    width: '4px',
    background: BeanstalkPalette.theme.winter.paleBlue,
  },
  '& ::-webkit-scrollbar-thumb': {
    borderRadius: 2,
    background: BeanstalkPalette.theme.winter.primary,
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
    '& .MuiDataGrid-columnHeaders': {
      outline: 'none',
      border: 'none',
      '&:focused, active': {
        border: 'none',
      },
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
        outline: 'none',
      },
      minHeight: '0 !important',
      maxHeight: '24px !important',
      pt: '4px !important',
      pb: '4px !important',
      border: 'none',
    },
    '& .MuiDataGrid-cell:focus': {
      outline: 'none',
      border: 'none',
    },

    // Row
    '& .MuiDataGrid-row': {
      minHeight: '0 !important',
      maxHeight: '24px !important',
      pt: '4px !important',
      pb: '4px !important',
      borderBottom: 'none',
      // borderColor: hexToRgba(BeanstalkPalette.lightGrey, 0.8),
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

export default marketplaceTableStyle;