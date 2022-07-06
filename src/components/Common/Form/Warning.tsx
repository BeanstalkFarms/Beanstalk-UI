import React from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Stack, Typography } from '@mui/material';
import { BeanstalkPalette } from '../../App/muiTheme';

const Warning : React.FC<{
  message: string;
}> = React.memo(({
  message
}) => (
  <Stack direction="row" sx={{ p: 1, backgroundColor: BeanstalkPalette.lightYellow, borderRadius: 1 }} alignItems="center" gap={1}>
    <WarningAmberIcon sx={{ ml: 0.5, color: BeanstalkPalette.warningYellow }} />
    <Typography>{message}</Typography>
  </Stack>
));

export default Warning;
