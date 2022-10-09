import {
  Box,
  ClickAwayListener,
  Stack,
  SxProps,
  Theme,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';

const Component = React.forwardRef(
  (
    props: {
      children: React.ReactNode;
      onClick: () => void;
      sx: any;
    },
    ref: React.ForwardedRef<HTMLDivElement>
  ) => (
    <Stack {...props} ref={ref}>
      {props.children}
    </Stack>
  )
);

const OnClickTooltip: React.FC<{
  children: React.ReactNode;
  tooltip?: JSX.Element | string;
  disableAnimate?: boolean;
  sx?: React.CSSProperties | SxProps<Theme>;
}> = ({ children, tooltip, disableAnimate = false, sx }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          onClose={() => setOpen(false)}
          open={open}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title={tooltip ?? <div> hello </div>}
          placement="bottom"
        >
          <Component
            onClick={() => setOpen(!open)}
            sx={{
              ...sx,
              ':hover': {
                transform: !disableAnimate ? 'scale(1.04)' : undefined,
                transition: !disableAnimate ? 'all .2s ease 0s' : undefined,
              },
              cursor: 'pointer',
            }}
          >
            {children}
          </Component>
        </Tooltip>
      </ClickAwayListener>
    </Box>
  );
};

export default OnClickTooltip;
