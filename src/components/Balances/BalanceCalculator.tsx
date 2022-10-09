import { Card, Stack, Typography } from '@mui/material';
import React from 'react';
import ChangeHistoryOutlinedIcon from '@mui/icons-material/ChangeHistoryOutlined';
import { BeanstalkPalette } from '../App/muiTheme';

const BalanceCalculator: React.FC<{}> = () => (
  <Card
    sx={{
      px: 2,
      py: 1.5,
      background: BeanstalkPalette.lightYellow,
      border: 'none',
      maxWidth: '440px',
    }}
  >
    <Stack spacing={1} alignItems="center">
      <ChangeHistoryOutlinedIcon
        color="primary"
        sx={{ width: '20px', height: '20px' }}
      />
      <Typography textAlign="center" color="primary">
        How might my balances change if Beanstalk grows next season?
      </Typography>
    </Stack>
  </Card>
);

export default BalanceCalculator;
