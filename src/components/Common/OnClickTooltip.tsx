import {
  Stack,
  SxProps,
  Theme,
  Tooltip,
  ClickAwayListener,
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
  tooltip?: JSX.Element | string;
  children: JSX.Element | string;
  disableAnimate?: boolean;
  sx?: React.CSSProperties | SxProps<Theme>;
}> = ({ children, tooltip, disableAnimate = false, sx }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          onClose={() => setOpen(false)}
          open={open}
          placement="bottom"
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title={tooltip ?? ''}
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
    </>
  );
};

export default OnClickTooltip;
