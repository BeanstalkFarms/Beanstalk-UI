import { CircularProgress } from '@mui/material';
import {
  useGridApiContext,
  useGridSelector,
  gridPageSelector,
  gridPageCountSelector,
} from '@mui/x-data-grid';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ArrowPagination from '~/components/Common/ArrowPagination';
import Centered from '~/components/Common/ZeroState/Centered';

type IProps = {
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  handleFetchMore?: () => void;
};

type ControllerCache = {
  numRowsPrev: number;
  mayUpdatePage: boolean;
};

const ScrollPaginationControl: React.FC<IProps> = ({
  scrollRef,
  handleFetchMore,
}) => {
  const apiRef = useGridApiContext();
  const numRows = apiRef.current.getRowsCount();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  // use useRef here instead to avoid re-rendering
  const cacheRef = useRef<ControllerCache>({
    /**
     * keep track of how many rows there were prior to calling `handleFetchMore`
     */
    numRowsPrev: 0,
    /**
     * keep track of whether or not page number can update
     */
    mayUpdatePage: false,
  });

  // get the Mui Data Grid scroll container element
  const el = useMemo(
    () => scrollRef?.current?.querySelector('.MuiDataGrid-virtualScroller'),
    [scrollRef]
  );

  const hasNextPage = useMemo(
    () => !(page === pageCount - 1 || pageCount === 0),
    [page, pageCount]
  );

  /*
   * Handle scroll events. If scrolled to the bottom, call 'fetchMore()' if provided
   */
  const handleOnScroll = useCallback(() => {
    if (!handleFetchMore) return;
    const [sh, st, ch] = [el?.scrollHeight, el?.scrollTop, el?.clientHeight];
    if (sh && st && ch) {
      const isBottom = sh - st === ch;
      // only call fetchMore if we're at the bottom and we are on the last page
      if (isBottom && !hasNextPage) {
        handleFetchMore();
        cacheRef.current.mayUpdatePage = true;
      }
    }
  }, [handleFetchMore, el, hasNextPage]);

  /**
   * handle update page number if `handleFetchMore` was called.
   */
  const handleUpdatePage = useCallback(() => {
    const rowDiff = numRows !== cacheRef.current.numRowsPrev;
    const pageDiff = page + 1 !== pageCount;
    if (pageDiff && hasNextPage) {
      apiRef.current.setPage(page + 1);
      cacheRef.current.mayUpdatePage = false;
      cacheRef.current.numRowsPrev = numRows;
    } else if (rowDiff && !hasNextPage) {
      // only update rows here if we are on the last page
      cacheRef.current.numRowsPrev = numRows;
    }
  }, [apiRef, hasNextPage, numRows, page, pageCount]);

  /**
   * listen to scroll events of the Mui Data Grid virtual scroller child element
   */
  useEffect(() => {
    if (!handleFetchMore) return;
    el?.addEventListener('scroll', handleOnScroll);
    return () => {
      el?.removeEventListener('scroll', handleOnScroll);
    };
  }, [el, handleOnScroll, handleFetchMore]);

  /*
   * update page number if necessary
   */
  useEffect(() => {
    cacheRef.current.mayUpdatePage && handleUpdatePage();
  }, [handleUpdatePage]);

  return (
    <Centered height={52} width="100%">
      <ArrowPagination />
    </Centered>
  );
};

export const DataGridEmptyOverlay = () => (
  <Centered height="100%">
    <CircularProgress />
  </Centered>
);

export default ScrollPaginationControl;
