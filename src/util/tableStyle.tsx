export const tableStyle = {
  '& .MuiDataGrid-root': {
    outline: 'none',
    border: 'none',
    
    // Rows
    '& .MuiDataGrid-row.odd': {
      backgroundColor: '#F6FAFE'
    },
    '& .MuiDataGrid-iconSeparator': {
      display: 'none'
    },

    // Header
    '& .MuiDataGrid-columnHeaders': {
      border: 'none',
      color: '#000000',
      borderRadius: 0,
      // fontSize: '18px',
    },
    '& .MuiDataGrid-columnHeader': {
      '&:focus': {
        outline: 'none'
      },
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 500
    },

    // Cells
    '& .MuiDataGrid-cellContent': {
      color: '#677166',
      // fontSize: '18px'
    },
    '& .MuiDataGrid-cell': {
      '&:focus': {
        outline: 'none'
      },
      border: 'none',
    },

    // Footer
    '& .MuiDataGrid-footerContainer': {
      borderBottom: 'none',
      borderTop: 'none',
    },

    // Other
    '& .MuiDataGrid-virtualScrollerRenderZone :hover': {
      // backgroundColor: "transparent"
      // backgroundColor: "#D8F2DB"
    }
  }
};
