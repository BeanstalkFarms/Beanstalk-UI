import React from 'react';
import { Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { makeStyles } from '@mui/styles';
import { gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector } from '@mui/x-data-grid';
import { BeanstalkPalette, FontSize } from '../App/muiTheme';
import Row from '~/components/Common/Row';

const useStyles = makeStyles({
  arrow: {
    fontSize: FontSize.lg,
    cursor: 'pointer',
  }
});

const TablePagination: React.FC<{}> = () => {
  const classes = useStyles();
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  const handleBack = () => {
    if (page > 0) {
      apiRef.current.setPage(page - 1);
    }
  };
  
  const handleForward = () => {
    if (page < pageCount) {
      apiRef.current.setPage(page + 1);
    }
  };
  
  return (
    <Row gap={0.5}>
      <ArrowBackIcon 
        className={classes.arrow} 
        onClick={handleBack} 
        sx={{
          color: page === 0 ? 'gray' : null,
          '&:hover': {
            color: page === 0 ? 'gray' : BeanstalkPalette.logoGreen,
          }
        }}
      />
      <Typography variant="body1">Page {page + 1} of {pageCount === 0 ? pageCount + 1 : pageCount}</Typography>
      <ArrowForwardIcon
        className={classes.arrow}
        onClick={handleForward}
        sx={{
          color: page === pageCount - 1 || pageCount === 0 ? 'gray' : null,
          '&:hover': {
            color: page === pageCount - 1 || pageCount === 0 ? 'gray' : BeanstalkPalette.logoGreen,
          }
        }}
      />
    </Row>
  );
};

export default TablePagination;
