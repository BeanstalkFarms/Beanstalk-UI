import React from 'react';
import { Button } from '@mui/material';

const LoadMorePagination: React.FC<{
  /** A function called to query the next set of data. */
  fetchMore: any,
}> = (props) => (
  <Button onClick={() => props.fetchMore()}>Load More</Button>
  );

export default LoadMorePagination;
