import React from 'react';
import { Button, Stack, StackProps, Typography } from '@mui/material';
import { BeanstalkPalette } from './App/muiTheme';

const WINDOWS = [
  { label: '1H', index: 0 },
  { label: '1D', index: 1 },
  { label: '1W', index: 2 },
  { label: '1M', index: 3 },
  { label: '1Y', index: 4 },
  { label: 'All', index: 5 },
];

export interface TimeTabProps {
  tab: number;
  setState: (i: number) => void;
}

const TimeTabs: React.FC<TimeTabProps & StackProps> = ({ sx, setState, tab }) => {
  const handleChange = (i: number) => {
    setState(i);
  };
  return (
    <Stack direction="row" sx={{ ...sx }}>
      {WINDOWS.map((w) => (
        <Button
          onClick={() => handleChange(w.index)}
          key={w.label}
          variant="text"
          size="small"
          color="dark"
          sx={{
            px: 0.3,
            py: 0.3,
            minWidth: 0,
            '&:hover': {
              backgroundColor: 'transparent'
            }
          }}
          disableRipple
        >
          <Typography color={tab === w.index ? BeanstalkPalette.logoGreen : 'text.primary'}>
            {w.label}
          </Typography>
        </Button>
      ))}
    </Stack>
  );
};

export default TimeTabs;
