import React from 'react';
import { Box } from '@material-ui/core';
import { TokenImage, TokenLabel, TokenTypeImage } from '../../util';

export default function TokenTypeImageModule({
  left,
  style,
  token,
}) {
  const tokenTypeStyle = {
    height: '100%',
    left: left,
    position: 'absolute',
    top: '0',
  };
  const tokenTypeModifierStyle = {
    bottom: '0',
    height: '60%',
    left: `${parseInt(style.height, 10) / 4}px`,
    position: 'absolute',
  };

  return (
    <Box style={{ ...style, position: 'relative' }}>
      <img
        alt={TokenLabel(token)}
        src={TokenImage(token)}
        style={tokenTypeStyle}
      />
      <img
        alt=""
        src={TokenTypeImage(token)}
        style={tokenTypeModifierStyle}
      />
    </Box>
  );
}

TokenTypeImageModule.defaultProps = {
  style: { height: '20px' },
  left: '0px',
};
