import React from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Stack, Typography } from '@mui/material';
import { BeanstalkPalette, IconSize } from '../../App/muiTheme';

const Warning: React.FC<{
  message: string;
}> = React.memo(({ message }) => (
  <Stack
    direction="row"
    sx={{
      p: 1,
      backgroundColor: BeanstalkPalette.lightYellow,
      borderRadius: 1,
    }}
    alignItems="center"
    gap={1}
  >
    <WarningAmberIcon
      sx={{ color: BeanstalkPalette.warningYellow, fontSize: IconSize.xs }}
    />
    <Typography variant="body1">{message}</Typography>
  </Stack>
));

export default Warning;
