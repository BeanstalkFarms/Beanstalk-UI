import React from 'react';
import { Token } from 'classes';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Deposit from './Actions/Deposit';
import Deposits from './Deposits';

const TokenPage : React.FC<{
  token: Token
}> = ({
  token,
  ...props
}) => {
  const pools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);
  const silo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);

  return (
    <div>
      {token.logo}<br/>
      {silo.tokens[token.address].deposited.toString()}
      <Deposit
        token={token}
      />
      <Deposits
        token={token}
      />
    </div>
  )
}

export default TokenPage;