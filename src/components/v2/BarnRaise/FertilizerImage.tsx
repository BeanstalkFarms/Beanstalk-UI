import { Box, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import fertUnusedIcon from 'img/icon/fertilizer/unused.svg';
import fertActiveIcon from 'img/icon/fertilizer/active.svg';
import fertUsedIcon   from 'img/icon/fertilizer/used.svg';
import { BeanstalkPalette } from '../App/muiTheme';

import './FertilizerImage.css';

export type FertilizerState = 'unused' | 'active' | 'used'
export const FERTILIZER_ICONS : { [key in FertilizerState]: string } = {
  unused: fertUnusedIcon,
  active: fertActiveIcon,
  used:   fertUsedIcon,
};
export type FertilizerImageProps = {
  state?: FertilizerState;
  isNew? : boolean;
  progress?: number;
};

const FertilizerImage : React.FC<FertilizerImageProps> = ({
  state = 'unused',
  isNew = false,
  progress,
}) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    sx={{
      width: '100%',
      aspectRatio: '1/1',
      borderColor: isNew ? BeanstalkPalette.logoGreen : grey[300],
      borderWidth: 1,
      borderStyle: 'solid',
      borderRadius: 1,
      position: 'relative',
    }}
  >
    <img
      alt=""
      src={FERTILIZER_ICONS[state]}
      width="45%"
      style={{ position: 'relative', zIndex: 2 }}
      className={isNew ? 'fert bounce' : undefined}
    />
    {progress && (
      <Box
        sx={{
          background: BeanstalkPalette.logoGreen,
          opacity: 0.2,
          width: '100%',
          height: `${progress * 100}%`,
          position: 'absolute',
          bottom: 0,
          left: 0,
          zIndex: 0,
        }}
      />
    )}
  </Stack>
);

export default FertilizerImage;