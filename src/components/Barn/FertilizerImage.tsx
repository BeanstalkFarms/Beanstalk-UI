import { Box, Button, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import fertUnusedImage from 'img/tokens/fert-logo-unused.svg';
import fertActiveImage from 'img/tokens/fert-logo-active.svg';
import fertUsedImage   from 'img/tokens/fert-logo-used.svg';
import { BeanstalkPalette } from '../App/muiTheme';

import './FertilizerImage.css';
import BigNumber from 'bignumber.js';

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
  id?: BigNumber;
};

const FertilizerImage : React.FC<FertilizerImageProps> = ({
  state = 'unused',
  isNew = false,
  progress,
  id,
}) => {
  const inner = (
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
        '&:hover > .id': {
          display: 'block'
        }
      }}
      className="fert-item"
    >
      <img
        alt=""
        src={FERTILIZER_ICONS[state]}
        width="45%"
        style={{ position: 'relative', zIndex: 2 }}
        className={isNew ? 'fert-anim bounce' : id ? 'fert-anim bounce-hover' : undefined}
      />
      {id && (
        <Box
          className="id" 
          sx={{
            display: 'none',
            position: 'absolute',
            bottom: 5,
            left: 10,
          }}
        >
          <Typography sx={{ fontSize: 11 }} color="gray">
            #{id.toString()}
          </Typography>
        </Box>
      )}
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

  if (id) {
    return (
      <Button
        variant="outlined"
        sx={{ borderColor: 'none', p: 0 }}
        href={`https://opensea.io/assets/ethereum/0x402c84de2ce49af88f5e2ef3710ff89bfed36cb6/${id.toString()}`} 
        target="_blank"
        fullWidth
        disableRipple={false}
      >
        {inner}
      </Button>
    )
  }

  return inner;
};

export default FertilizerImage;
