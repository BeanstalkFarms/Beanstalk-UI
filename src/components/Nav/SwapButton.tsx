import { Box, Button } from '@mui/material';
import React from 'react';
import swapIcon from 'img/swap.svg';

const SwapButton : React.FC = () => (
  <Box sx={{ display: { lg: 'block', xs: 'none' } }}>
    <Button color="light" variant="contained">
      <img src={swapIcon} alt="Swap" />
    </Button>
  </Box>
);

export default SwapButton;
