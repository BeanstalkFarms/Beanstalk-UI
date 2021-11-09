import React from 'react';
import { ContentSection } from '../Common';
import Balances from '../Balances';
import Charts from '../Charts';
import Seasons from '../Seasons';

export default function Analytics(props) {
  return (
    <>
      <ContentSection id="analytics" title="Analytics">
        <Balances {...props} />
        <Charts />
        <Seasons {...props} />
      </ContentSection>
    </>
  );
}
