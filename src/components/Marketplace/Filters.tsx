import React, { ReactNode } from 'react';
import { Box, IconButton, Popover, Slider } from '@mui/material';
import { makeStyles, withStyles } from '@mui/styles';
import {
  FilterListRounded as FilterIcon,
} from '@mui/icons-material';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    px: 1.3,
  },
  childBox: {
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
  }
});

export const StyledSlider = withStyles({
  valueLabel: {
    top: -22,
    width: '50px',
    '& *': {
      background: 'transparent',
      color: '#000',
    },
  },
})(Slider);

export const StyledFilterButton = withStyles({
  root: {
    '&:hover': {
      // color: 'white',
    },
    '&:active': {
      // color: 'white',
    },
    '&:focus': {
      // color: 'white',
    },
  },
})(IconButton);

type FiltersProps = {
  title: string;
  children: ReactNode;
}

export default function Filters({
  title,
  children,
}: FiltersProps) {
  const classes = useStyles();
  const [popoverEl, setPopoverEl] = React.useState<any>(null);
  const openPopover = (event) => {
    setPopoverEl(event.currentTarget);
  };
  const handleClose = () => {
    setPopoverEl(null);
  };
  const open = Boolean(popoverEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <>
      <Box className={classes.root}>
        <span>{title}</span>
        <StyledFilterButton
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: '6px',
          }}
          size="small"
          onClick={openPopover}
        >
          <FilterIcon />
        </StyledFilterButton>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={popoverEl}
        onClose={handleClose}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}>
        <Box className={classes.childBox}>
          {children}
        </Box>
      </Popover>
    </>
  );
}
