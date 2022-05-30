import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DropdownIcon : React.FC<{ open: boolean; }> = ({ open }) => (
  <ExpandMoreIcon
    sx={{
      height: 15,
      marginLeft: '-4px',
      marginRight: '-4px',
      // Flip the icon when the popover or drawer is open.
      transition: 'all 200ms linear',
      transform: open ? 'scaleY(-1)' : ''
    }}
  />
);

export default DropdownIcon;