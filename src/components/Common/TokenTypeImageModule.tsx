import React from 'react';
import { Box } from '@mui/material';
import { TokenImage, TokenLabel, TokenTypeImage } from 'util/index';

export default function TokenTypeImageModule({ left, style, token, className }) {
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
    <Box style={{ ...style, position: 'relative' }} className={className}>
      <img
        alt={TokenLabel(token)}
        src={TokenImage(token)}
        style={tokenTypeStyle}
      />
      <img alt="" src={TokenTypeImage(token)} style={tokenTypeModifierStyle} />
    </Box>
  );
}

TokenTypeImageModule.defaultProps = {
  left: '0px',
  className: undefined,
  style: { height: '20px' },
};
