import React from 'react';
import Token from '~/classes/Token';

const TokenIcon: React.FC<{
  token: Token;
  style?: React.CSSProperties;
}> = ({ token, style }) => (
  <img
    src={token.logo}
    alt={token.symbol}
    style={{
      height: '1em',
      width: 'auto',
      verticalAlign: 'top',
      ...style,
    }}
  />
);

export default TokenIcon;
