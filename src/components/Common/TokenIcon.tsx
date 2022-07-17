import React from 'react';
import Token from 'classes/Token';

const TokenIcon: React.FC<{ token: Token; style?: any }> = ({
  token,
  style,
}) => (
  <img
    src={token.logo}
    alt={token.symbol}
    style={{
      height: '1em',
      width: 'auto',
      verticalAlign: 'top',
      // marginTop: '1.5px',
      ...style,
    }}
  />
);

export default TokenIcon;
