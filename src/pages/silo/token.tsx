import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Deposit from 'components/SiloV2/Actions/Deposit';
import Deposits from 'components/SiloV2/Deposits';

const TokenPage : React.FC<{}> = () => {
  const { address } = useParams<{ address: string }>();
  const silo  = useSelector<AppState, AppState['_farmer']['silo']>((state) => state._farmer.silo);
  // const pools = useSelector<AppState, AppState['_bean']['pools']>((state) => state._bean.pools);

  if (!address) return null;

  // const token = SiloTokensByAddress[address.toLowerCase()];

  return (
    <div>
      {/* {token.logo}<br />
      {silo.tokens[token.address].deposited.toString()}
      <Deposit
        token={token}
      />
      <Deposits
        token={token}
      /> */}
    </div>
  );
};

export default TokenPage;
