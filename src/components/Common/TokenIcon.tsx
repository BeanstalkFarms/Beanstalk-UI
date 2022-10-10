import React from 'react';
import Token from '~/classes/Token';

import { FC } from '~/types';

const TokenIcon : FC<{
  token: Token;
  css?: any;
}> = ({ token, css }) => (
  <img
    src={token.logo}
    alt={token.symbol}
    css={{
      height: '1em',
      width: 'auto',
      verticalAlign: 'top',
      ...css
    }}
  />
);

export default TokenIcon;
