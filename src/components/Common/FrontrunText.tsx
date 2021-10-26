import React from 'react';
import { Link, Box } from '@material-ui/core';
import { SLIPPAGE_LINK } from '../../constants';

export default function FrontrunText() {
  const linkStyle = {
    color: 'red',
    fontFamily: 'Futura-PT-Book',
    fontSize: 'calc(9px + 0.5vmin)',
    marginTop: '-9px',
  };
  const textStyle = {
    color: 'red',
    fontFamily: 'Futura-PT-Book',
    fontSize: 'calc(9px + 0.5vmin)',
    marginTop: '-4px',
  };

  return (
    <Box style={textStyle}>
      Your Transaction may be Frontrun. Consider Lowering Slippage Tolerance.
      <br />
      <Link href={SLIPPAGE_LINK} target="blank" style={linkStyle}>
        Click Here to Learn More
      </Link>
      .
    </Box>
  );
}
