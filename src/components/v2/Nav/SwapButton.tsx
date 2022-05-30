import { Box, IconButton } from '@mui/material';
import React from 'react';
import swapIcon from 'img/swap.svg';

const SwapButton : React.FC = () => (
  <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
    <IconButton color="light" variant="contained">
      <img src={swapIcon} alt="Swap" />
    </IconButton>
  </Box>
)

export default SwapButton;