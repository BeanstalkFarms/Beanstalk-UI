import {
  Stack,
  SxProps,
  Theme,
  Tooltip,
  ClickAwayListener,
} from '@mui/material';
import React, { useState } from 'react';
import { BeanstalkPalette } from '../App/muiTheme';

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
            sx: {
              // apply arbitrary max width. Width needs to be controlled by title component
              '& .MuiTooltip-tooltip': {
                maxWidth: '600px !important',
                padding: '0px',
                background: `${BeanstalkPalette.lightYellow} !important`,
              },
            },
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
            onClick={() => setOpen(true)}
            sx={{
              ...sx,
              ':hover': {
                transform: !disableAnimate ? 'scale(1.04)' : undefined,
                transition: !disableAnimate ? 'all .3s ease 0s' : undefined,
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
