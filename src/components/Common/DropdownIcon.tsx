import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconProps } from '@mui/material';

import { FC } from '~/types';

const DropdownIcon : FC<{
  open: boolean;
  mode?: 'vertical' | 'right-rotate',
} & IconProps> = ({
  open,
  mode = 'vertical',
  sx
}) => (
  <ExpandMoreIcon
    sx={{
      color: 'primary.main',
      marginLeft: '-4px',
      marginRight: '-4px',
      // Flip the icon when the popover or drawer is open.
      transition: `all ${mode === 'vertical' ? 200 : 100}ms linear`,
      transform: (mode === 'vertical' 
        ? open ? 'scaleY(-1)' : ''
        : open ? '' : 'rotate(-90deg)'),
      ...sx,
    }}
  />
);

export default DropdownIcon;
