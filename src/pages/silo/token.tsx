import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Page from 'components/Page';
import { SiloTokensByAddress } from 'constants/v2/tokens';
import TokenPage from 'components/SiloV2/TokenPage';

export default function SiloActionsPage() {
  const { address } = useParams<{ address: string }>();

  if(!address) return null;

  const token = SiloTokensByAddress[address.toLowerCase()];

  if (!token) {
    return (
      <div>
        Not found
      </div>
    );
  }
  
  return (
    <Page title={`${token.name} Silo`}>
      <TokenPage token={token} />
    </Page>
  );
}
