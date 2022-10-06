import React from 'react';
import Token from '~/classes/Token';

import { FC } from '~/types';

const TokenIcon : FC<{
  token: Token;
  style?: any;
}> = ({ token, style }) => (
  <img
    src={token.logo}
    alt={token.symbol}
    style={{
      height: '1em',
      width: 'auto',
      verticalAlign: 'top',
      ...style
    }}
  />
);

export default TokenIcon;
