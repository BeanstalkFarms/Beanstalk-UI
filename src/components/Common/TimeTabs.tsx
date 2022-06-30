import React from 'react';
import { Button, Divider, Stack, StackProps, Typography } from '@mui/material';
import { BeanstalkPalette } from '../App/muiTheme';

const DISPLAY = [
  { label: 'HR', index: 0 },
  { label: 'DAY', index: 1 },
];

const WINDOWS = [
  { label: '1W', index: 0 },
  { label: '1M', index: 1 },
  { label: 'All', index: 2 },
];

export interface TimeTabProps {
  tab: number[];
  setState: (i: number[]) => void;
}

const TimeTabs: React.FC<
  TimeTabProps & 
  StackProps
> = ({ 
  sx, 
  setState, 
  tab 
}) => {
  const handleChangeX = (i: number) => {
    setState([i, tab[1]]);
  };

  const handleChangeY = (i: number) => {
    setState([tab[0], i]);
  };

  return (
    <Stack direction="row" sx={{ ...sx }} gap={0.2} alignItems="center">
      {DISPLAY.map((d) => (
        <Button
          onClick={() => handleChangeX(d.index)}
          key={d.label}
          variant="text"
          size="small"
          color="dark"
          sx={{
            borderRadius: 0.5,
            px: 0.3,
            py: 0.3,
            minWidth: 0,
            '&:hover': {
              // backgroundColor: 'transparent'
            }
          }}
          disableRipple
        >
          <Typography color={tab[0] === d.index ? BeanstalkPalette.logoGreen : 'text.primary'}>
            {d.label}
          </Typography>
        </Button>
      ))}
      <Divider orientation="vertical" sx={{ height: '14px', ml: 0.1, mr: 0.1 }} />
      {WINDOWS.map((w) => (
        <Button
          onClick={() => handleChangeY(w.index)}
          key={w.label}
          variant="text"
          size="small"
          color="dark"
          sx={{
            borderRadius: 0.5,
            px: 0.3,
            py: 0.3,
            minWidth: 0,
            '&:hover': {
              // backgroundColor: 'transparent'
            }
          }}
          disableRipple
        >
          <Typography color={tab[1] === w.index ? BeanstalkPalette.logoGreen : 'text.primary'}>
            {w.label}
          </Typography>
        </Button>
      ))}
    </Stack>
  );
};

export default TimeTabs;
