import { Stack, Typography, TypographyProps } from '@mui/material';
import React from 'react';

export type StatProps = {
  title: string;
  icon?: JSX.Element | string;
  amount: string;
  variant?: TypographyProps['variant'];
  sx?: TypographyProps['sx'];
}

const Stat : React.FC<StatProps> = ({
  title,
  icon,
  amount,
  sx,
  variant = 'h1',
}) => (
  <Stack gap={1}>
    <Typography>{title}</Typography>
    <Typography variant={variant} sx={{ marginLeft: '-3px', ...sx }}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        {icon} {amount}
      </Stack>

    </Typography>
  </Stack>
);

export default Stat;
