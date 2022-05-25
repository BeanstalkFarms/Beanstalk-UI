export const tableStyle = {
  '& .MuiDataGrid-root': {
    outline: 'none',
    border: "none",
    '& .MuiDataGrid-row.odd': {
      backgroundColor: "#F6FAFE"
    },
    '& .MuiDataGrid-iconSeparator': {
      display: "none"
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 500
    },
    '& .MuiDataGrid-cellContent': {
      color: "#677166",
      fontSize: "18px"
    },
    '& .MuiDataGrid-cell': {
      outline: 'none',
      border: "none",
    },
    '& .MuiDataGrid-footerContainer': {
      outline: 'none',
      borderBottom: "none",
      borderTop: "none",
    },
    '& .MuiDataGrid-columnHeaders': {
      outline: 'none',
      border: "none",
      fontSize: "18px",
      color: "#000000"
    },
    '& .MuiDataGrid-virtualScrollerRenderZone :hover': {
      // backgroundColor: "transparent"
      // backgroundColor: "#D8F2DB"
    }
  }
}