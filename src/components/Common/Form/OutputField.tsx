import { Stack, StackProps } from '@mui/material';
import React from 'react';

const OutputField : React.FC<{
  isNegative?: boolean;
} & StackProps> = ({
  //
  isNegative = false,
  children,
  //
  sx,
  ...props
}) => {
  return (
    <Stack
      sx={{
        backgroundColor: isNegative ? '#FFE5DF' : '#F6FAFE',
        borderRadius: 1,
        px: 2,
        py: 2,
        color: isNegative ? 'hsla(12, 63%, 52%, 1)' : 'inherit',
        ...sx
      }}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      {...props}
    >
      {children}
    </Stack>
  )
}

export default OutputField;