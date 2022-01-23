import React from 'react';
import { chainId } from 'util/index';

export default function Toast({ desc, hash }: { desc: string, hash?: string }) {
  return (
    <div>
      {desc}
      {hash && (
        <>
          &nbsp;&middot;&nbsp;
          <a href={`https://${chainId === 3 ? 'ropsten.' : ''}etherscan.io/tx/${hash}`} target="_blank" rel="noreferrer">View on Etherscan</a>
        </>
      )}
    </div>
  );
}

Toast.defaultProps = {
  hash: undefined,
};
