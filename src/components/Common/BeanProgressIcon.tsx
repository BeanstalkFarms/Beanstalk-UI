import React from 'react';
import { CircularProgress, CircularProgressProps, Stack } from '@mui/material';
import santaHat from '~/img/beanstalk/interface/seasonTheme/santa-hat.svg';
import stocking from '~/img/beanstalk/interface/seasonTheme/christmas-stocking.svg';
import christmasBox from '~/img/beanstalk/interface/seasonTheme/christmas-box.svg';
import { FC } from '~/types';

const PROGRESS_THICKNESS = 2;
const PROGRESS_GAP = 3.5;

const rotation = [santaHat, stocking, christmasBox];

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
  const day = new Date().getDate();
  const rotationIndex = day % rotation.length;

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
        src={rotation[rotationIndex]}
        alt="Bean"
        css={{ height: enabled ? size * 0.88 : size, width: size }} />
    </Stack>
  );
};

export default BeanProgressIcon;
