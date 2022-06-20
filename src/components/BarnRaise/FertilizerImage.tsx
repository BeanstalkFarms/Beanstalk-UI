import { Box, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import fertUnusedImage from 'img/tokens/fert-logo-unused.svg';
import fertActiveImage from 'img/tokens/fert-logo-active.svg';
import fertUsedImage   from 'img/tokens/fert-logo-used.svg';
import { BeanstalkPalette } from '../App/muiTheme';

import './FertilizerImage.css';

export type FertilizerState = 'unused' | 'active' | 'used'
export const FERTILIZER_ICONS : { [key in FertilizerState]: string } = {
  unused: fertUnusedImage,
  active: fertActiveImage,
  used:   fertUsedImage,
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
    {/* <Box sx={{
      position: 'absolute',
      top: 10,
      left: 10,
    }}>
      <Typography variant="body2" color="text.secondary">6,074</Typography>
    </Box> */}
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
          borderBottomLeftRadius: 9,
          borderBottomRightRadius: 9
        }}
      />
    )}
  </Stack>
);

export default FertilizerImage;
