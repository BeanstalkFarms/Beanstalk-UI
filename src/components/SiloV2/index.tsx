import React from 'react';
import { useSelector } from 'react-redux';
import siloTokens from 'constants/siloTokens';
import Pools from 'constants/v2/pools';
import { AppState } from 'state';
import { Card } from '@mui/material';
import { PointOfSaleOutlined } from '@mui/icons-material';

export default function SiloV2() {
  const pools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const silo = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  return (
    <Card sx={{ textAlign: 'left', mx: 4 }}>
      <pre>{JSON.stringify(pools, null, 2)}</pre>
      <pre>{JSON.stringify(silo, null, 2)}</pre>
      <hr />
      {siloTokens.map((token) => {
        const pool = Pools.get(token.address);
        return (
          <div>
            <img src={token.logo} style={{ width: 20, height: 20 }} alt="" />
            <div>{token.name}: {token.address}</div>
            {pool ? (
              <div>
                Pool: {pool.name}<br />
                Tokens: {pool.tokens?.toString()}<br />
                Price: {pools[pool.address].price.toString()}<br />
                Reserves: [{pools[pool.address].reserves.map((r) => r.toString()).join(', ')}]<br />
              </div>
            ) : null}
            <div>
              Deposits: {silo.tokens[token.address]?.deposited.toString() || 'none'}<br/>
            </div>
            <br />
            <br />
          </div>
        );
      })}
    </Card>
  );
}
