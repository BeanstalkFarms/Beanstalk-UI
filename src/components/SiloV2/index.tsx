import React from 'react';

import siloTokens from 'constants/siloTokens';
import Pools from 'constants/v2/pools';

export default function SiloV2() {
  return (
    <div>
      {siloTokens.map((token) => {
        const pool = Pools.get(token.address);
        return (
          <div>
            <img src={token.logo} style={{ width: 20, height: 20 }} alt="" />
            {token.name}: {token.address}
            {pool ? (
              <div>
                Pool: {pool.name}<br />
                Tokens: {pool.tokens.toString()}
              </div>
            ) : null}
            <br />
            <br />
          </div>
        );
      })}
    </div>
  )
}