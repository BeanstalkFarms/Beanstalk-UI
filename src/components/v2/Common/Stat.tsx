import { Stack, Typography } from '@mui/material';
import React from 'react';

export type StatProps = {
  title: string;
  icon?: JSX.Element | string;
  amount: string;
}

const Stat : React.FC<StatProps> = ({
  title,
  icon,
  amount,
}) => (
  <Stack gap={1}>
    <Typography color="text.secondary">{title}</Typography>
    <Typography variant="h1" sx={{ marginLeft: '-3px' }}>
      {icon} {amount}
    </Typography>
  </Stack>
);

export default Stat;
