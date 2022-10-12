import React, { useState } from 'react';
import { SxProps, Theme, Popover, Box, Card } from '@mui/material';

const AnimatedPopper: React.FC<{
  children: React.ReactNode;
  popperEl: JSX.Element;
  id: string;
  disableAnimate?: boolean;
  openCondition?: boolean;
  sx?: React.CSSProperties | SxProps<Theme>;
}> = ({ children, popperEl, id, disableAnimate, openCondition, sx }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const open = Boolean(anchorEl);
  const _id = open ? `simple-popover-${id}` : undefined;

  const handleOpen = (e: React.MouseEvent<HTMLDivElement>) => {
    if (openCondition === false) return;
    setAnchorEl(e.currentTarget);
  };

  return (
    <>
      <Box
        sx={{
          ':hover': {
            transform: !disableAnimate ? 'scale(1.03)' : undefined,
            transition: !disableAnimate ? 'all .3s ease 0s' : undefined,
            transformOrigin: 'top center',
          },
          cursor: 'pointer',
          ...sx,
        }}
        onClick={handleOpen}
      >
        {children}
      </Box>
      <Popover
        id={_id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{}}
      >
        <Card>{popperEl}</Card>
      </Popover>
    </>
  );
};

export default AnimatedPopper;
