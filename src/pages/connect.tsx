import React from 'react';
import Page from 'components/Page/index-old';
import MetamasklessModule from 'components/App/MetamasklessModule';
import Charts from 'components/Charts';

export default function ConnectPage() {
  const sectionTitles = ['About', 'Charts'];
  const sections = [<MetamasklessModule />, <Charts />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
