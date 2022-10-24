import React from 'react';
import Token from '~/classes/Token';

import { FC } from '~/types';

const TokenIcon : FC<{
  token: Token;
  css?: any;
}> = ({ token, ...props }) => (
  <img
    src={token.logo}
    alt={token.symbol}
    css={{
      height: '1em',
      width: 'auto'
    }}
    {...props}
  />
);

export default TokenIcon;
