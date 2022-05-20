import { Token } from 'classes';
import React from 'react';

const Deposit : React.FC<{
  token: Token
}> = (props) => {
  return (
    <div>
      {props.token.address}
    </div>
  )
}

export default Deposit;