import React, { ReactNode } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

const FieldWrapper : React.FC<{
  label?: ReactNode | string;
  tooltip?: string
}> = ({
  label,
  tooltip,
  children
}) => (
  <Box>
    {label && (
      <Tooltip
        title={tooltip !== undefined ? tooltip : ''}
        placement="right-start"
      >
        <Typography
          sx={{
            fontSize: 'bodySmall',
            px: 1,
            mb: 0.25
          }}
          display="inline-block"
        >
          {label}
        </Typography>
      </Tooltip>
    )}
    {children}
  </Box>
);

export default FieldWrapper;
