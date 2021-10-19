import React from 'react';
import { ContentSection } from '../Common';
import Balances from '../Balances';
import Charts from '../Charts';
import Seasons from '../Seasons';
import Governance from '../Governance';

export default function Analytics(props) {
  return (
    <>
      <ContentSection id="analytics" title="Analytics">
        <Balances {...props} />
        <Charts />
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
