import React from 'react';
import { Box, BoxProps } from '@mui/system';

const Dot : React.FC<BoxProps & {
  color?: BoxProps['color'],
  size?: number;
}> = ({
  size  = 8,
  color = 'primary.main',
  sx,
  ...props
}) => (
  <Box
    className="B-badge"
    sx={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size / 2,
      ...sx
    }}
    {...props}
  />
);

export default Dot;
