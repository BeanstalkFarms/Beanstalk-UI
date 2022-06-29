import { BeanstalkPalette } from '../components/App/muiTheme';

export const marketplaceTableStyle = {
  '& .MuiDataGrid-root': {
    outline: 'none',
    border: 'none',
    '& .MuiDataGrid-row.odd': {
      backgroundColor: '#F6FAFE'
    },
    '& .MuiDataGrid-iconSeparator': {
      display: 'none'
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 500,
    },
    '& .MuiDataGrid-columnHeader:focus': {
      outline: 'none'
    },
    '& .MuiDataGrid-columnHeaderDraggableContainer:focus': {
      outline: 'none'
    },
    '& .MuiDataGrid-cellContent': {
      color: '#677166',
      fontSize: '18px'
    },
    '& .MuiDataGrid-cell': {
      outline: 'none',
      border: 'none',
      '&:focused': {
        border: 'none'
      }
    },
    '& .MuiDataGrid-cell:focus': {
      outline: 'none',
      border: 'none',
    },
    '& .MuiDataGrid-row': {
      border: 1,
      borderColor: BeanstalkPalette.lightBlue,
      borderRadius: 2,
      py: 2.4,
      mb: 0.8,
      alignItems: 'center',
      cursor: 'pointer',
      width: 'calc(100% - 2.5px)',
      '&:hover': {
        background: BeanstalkPalette.hoverBlue
      }
    },
    '& .MuiDataGrid-footerContainer': {
      outline: 'none',
      borderBottom: 'none',
      borderTop: 'none',
    },
    '& .MuiDataGrid-columnHeaders': {
      outline: 'none',
      border: 'none',
      fontSize: '18px',
      color: '#000000'
    },
    '& .MuiDataGrid-virtualScrollerRenderZone :hover': {
      // backgroundColor: "transparent"
      // backgroundColor: "#D8F2DB"
    }
  }
};
