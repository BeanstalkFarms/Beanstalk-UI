import React from 'react';
import { Stack, StackProps, Typography } from '@mui/material';

/**
 * Similar to CardEmptyState, but
 * takes into account authentication
 * status.
 * */
const TableEmptyState: React.FC<{
  /** Card title */
  title: string;
  /** Loading / connection state */
  state: 'disconnected' | 'loading' | 'ready';
} & StackProps> = ({
  title,
  state,
  height
}) => (
  <Stack height={height !== undefined ? height : '100%'} alignItems="center" justifyContent="center">
    <Typography variant="body1" color="gray">
      {state === 'disconnected'
        ? `Connect a wallet to view ${title}`
        : state === 'loading'
          ? 'Loading...'
          : `No ${title}`}
    </Typography>
  </Stack>
);

export default TableEmptyState;
