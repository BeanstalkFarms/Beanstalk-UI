import React from 'react';
import { Link, Box } from '@mui/material';
import { SLIPPAGE_LINK } from 'constants/index';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  textStyle: {
    color: 'red',
    fontSize: 'calc(9px + 0.5vmin)',
  }
});

export default function FrontrunText() {
  const classes = useStyles();
  return (
    <Box className={classes.textStyle}>
      Your transaction may be frontrun. Consider lowering slippage tolerance.
      <br />
      <Link
        href={SLIPPAGE_LINK}
        className={classes.textStyle}
        target="blank"
        underline="hover">
        Click here to learn more
      </Link>
      .
    </Box>
  );
}
