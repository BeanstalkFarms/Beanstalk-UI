import React from 'react';
import { ContentSection } from 'components/Common';
import Charts from 'components/Charts';
import Seasons from 'components/Seasons';
import NFTs from 'components/NFT';
import Governance from 'components/Governance';
import Balances from 'components/Balances';

export default function Analytics(props) {
  return (
    <>
      <ContentSection id="analytics" title="Analytics">
        <Balances {...props} />
        <Charts />
        <NFTs {...props} />
        <Seasons {...props} />
      </ContentSection>
      <Governance
        key="governance"
        bips={props.bips}
        season={props.season}
        totalRoots={props.totalRoots}
        userRoots={props.userRoots}
        votedBips={props.votedBips}
      />
    </>
  );
}
