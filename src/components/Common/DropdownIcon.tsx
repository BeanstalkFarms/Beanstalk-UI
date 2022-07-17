import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconProps } from '@mui/material';

const DropdownIcon : React.FC<{ open: boolean; } & IconProps> = ({ open, sx }) => (
  <ExpandMoreIcon
    sx={{
      marginLeft: '-4px',
      marginRight: '-4px',
      // Flip the icon when the popover or drawer is open.
      transition: 'all 200ms linear',
      transform: open ? 'scaleY(-1)' : '',
      ...sx,
    }}
  />
);

export default DropdownIcon;
