import React from 'react';
import { Link, Box } from '@mui/material';
import { SLIPPAGE_LINK } from 'constants/index';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    linkStyle: {
        color: 'red',
        fontFamily: 'Futura-PT-Book',
        fontSize: 'calc(9px + 0.5vmin)',
        marginTop: '-9px',
    },
    textStyle: {
        color: 'red',
        fontFamily: 'Futura-PT-Book',
        fontSize: 'calc(9px + 0.5vmin)',
        marginTop: '-4px',
    }
});

export default function FrontrunText() {
  const classes = useStyles();

  return (
    <Box className={classes.textStyle}>
      Your Transaction may be Frontrun. Consider Lowering Slippage Tolerance.
      <br />
      <Link
        href={SLIPPAGE_LINK}
        target="blank"
        className={classes.linkStyle}
        underline="hover">
        Click Here to Learn More
      </Link>
      .
    </Box>
  );
}
