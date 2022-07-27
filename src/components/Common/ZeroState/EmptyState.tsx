import React from 'react';
import { Box, BoxProps, Typography } from '@mui/material';

export interface CardEmptyStateProps {
  message: string;
}

/**
 * Similar to AuthEmptyState, but
 * does not take into account
 * authentication status.
 * */
const EmptyState: React.FC<CardEmptyStateProps & BoxProps> = ({
  message,
  height
}) => (
  <Box height={height !== undefined ? height : 300} display="flex" alignItems="center" justifyContent="center">
    <Typography variant="body1" color="gray">
      {message}
    </Typography>
  </Box>
);

export default EmptyState;
