import React from 'react';
import { CircularProgress, CircularProgressProps, Stack } from '@mui/material';
import beanGhostWhite from '~/img/beanstalk/interface/seasonTheme/bean-ghost-white.svg';
import beanGhostGreen from '~/img/beanstalk/interface/seasonTheme/bean-ghost-green.svg';
import beanSpiderWhite from '~/img/beanstalk/interface/seasonTheme/bean-spider-white.svg';
import beanSpiderGreen from '~/img/beanstalk/interface/seasonTheme/bean-spider-green.svg';
import beanPumpkin from '~/img/beanstalk/interface/seasonTheme/bean-pumpkin.svg';
import { FC } from '~/types';

const PROGRESS_THICKNESS = 2;
const PROGRESS_GAP = 3.5;

const BeanProgressIcon : FC<CircularProgressProps & {
  size: number;
  enabled: boolean;
  progress?: number;
}> = ({
  size,
  enabled,
  variant,
  progress
}) => {
  const halloweenIcons = [
    { 
      src: beanSpiderGreen,
      css: { width: enabled ? size : 'auto' } 
    },
    {
      src: beanPumpkin,
      css: { width: size, height: enabled ? size * 0.88 : size }
    },
    {
      src: beanGhostWhite,
      css: { width: 'auto' }
    },
    {
      src: beanSpiderWhite,
      css: { width: enabled ? size : 'auto' } 
    },
    {
      src: beanGhostGreen,
      css: { width: 'auto' }
    },
  ];

  const date = new Date();
  const item = halloweenIcons[(date.getDay() % halloweenIcons.length)];

  return (
    <Stack sx={{ position: 'relative' }}>
      {enabled ? (
        <CircularProgress
          variant={variant}
          color="primary"
          size={size + PROGRESS_GAP * 2}
          value={progress}
          sx={{
            position: 'absolute',
            left: -PROGRESS_GAP,
            top: -PROGRESS_GAP,
            zIndex: 10,
          }}
          thickness={PROGRESS_THICKNESS}
        />
      ) : null}
      <img
        src={item.src}
        alt="Bean"
        css={{ 
          height: size,
          ...item.css
        }}
      />
    </Stack>
  );
};
export default BeanProgressIcon;
