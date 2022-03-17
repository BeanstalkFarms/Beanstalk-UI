import React, { useMemo } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import Page from 'components/Page';
import SiloTransaction from 'components/Silo/SiloActions';
import TOKENS from 'constants/siloTokens';

export default function SiloDepositPage() {
  const { tokenSlug } = useParams<{ tokenSlug: string }>();
  const tokenData = useMemo(() => 
    TOKENS.filter((token) => token.slug === tokenSlug)[0],
    [tokenSlug]
  );

  if (tokenData === undefined) return <Redirect to="/silo" />;
  
  return (
    <Page title={`${tokenData.name} Silo`}>
      <SiloTransaction />
    </Page>
  );
}
