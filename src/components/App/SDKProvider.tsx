import React, { useEffect, useMemo, useState } from 'react';
import { BeanstalkSDK } from '@beanstalk/sdk';
import { useSigner } from '~/hooks/ledger/useSigner';

// This funk is due to an HMR bug in Vite
// https://github.com/vitejs/vite/issues/3301#issuecomment-1191530937
// @ts-ignore
// eslint-disable-next-line no-undef
export const SDKContext = __preserveRef('SDKContext', React.createContext());

export const SDKProvider: React.FC = ({ children }) => {
  const [address, setAddress] = useState('');
  const { data: signer } = useSigner();

  useEffect(() => {
    async function getAddress() {
      const res = await signer?.getAddress();
      setAddress(res ?? '');
    }

    getAddress();
  }, [signer]);

  const sdk = useMemo(() => {
    if (signer && address) {
      // @ts-ignore
      return new BeanstalkSDK({ signer: signer, DEBUG: true });
    }

    return new BeanstalkSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps  -- FIXME? if we add signer, it executes twice
  }, [address]);

  return <SDKContext.Provider value={sdk}>{children}</SDKContext.Provider>;
};
