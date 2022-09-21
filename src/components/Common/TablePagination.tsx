import React, { useCallback, useMemo } from 'react';
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

const TablePagination: React.FC<{
  /** A function called to query the next set of data. */
  fetchMore: any,
  /** Hardcode number of pages the pagination has. */
  numPages?: number
}> = (props) => {
  const classes = useStyles();
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  // const [params, update] = useSearchParams();

   const handleBack = useCallback(() => {
    if (page > 0) {
      // update({ t: (page - 1).toString() });
      apiRef.current.setPage(page - 1);
    }
  }, [apiRef, page]);

  const handleForward = useCallback(() => {
    // if (props.fetchMore && page + 1 === pageCount) {
    //   props.fetchMore();
    // }
    if (page < pageCount) {
      // update({ t: (page + 1).toString() });
      apiRef.current.setPage(page + 1);
    }
  }, [apiRef, page, pageCount]);

  /** Determines color of next arrow. */
  const hasNextPage = useMemo(() => !(
    props.numPages
      ? (page === props.numPages - 1)
      : (page === pageCount - 1)
      || pageCount === 0), [page, pageCount, props.numPages]);

  // useEffect(() => {
  //   const pageParam = params.get('t');
  //   if (pageParam) {
  //     apiRef.current.setPage(Number(params.get('t')));
  //   }
  // }, [apiRef, params]);

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
      <Typography variant="body1">
        Page {page + 1} of {pageCount === 0 ? pageCount + 1 : (
        props.numPages
          // ? props.numPages
          ? pageCount
          : pageCount
      )}
      </Typography>
      <ArrowForwardIcon
        className={classes.arrow}
        onClick={handleForward}
        sx={{
          color: hasNextPage ? null : 'gray',
          '&:hover': {
            color: page === pageCount - 1 || pageCount === 0 ? 'gray' : BeanstalkPalette.logoGreen,
          }
        }}
      />
    </Row>
  );
};

export default TablePagination;
