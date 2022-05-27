import React from 'react';
import Token from 'classes/Token';

const TokenIcon : React.FC<{ token: Token }> = ({ token }) => (
  <img
    src={token.logo}
    alt={token.symbol}
    style={{
      height: '1em',
      width: 'auto',
      verticalAlign: 'top',
      marginTop: '1px'
    }}
  />
);

export default TokenIcon;
