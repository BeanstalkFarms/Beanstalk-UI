import React from 'react';
import { Page } from 'pages/index';
import MetamasklessModule from 'components/App/MetamasklessModule';
import Charts from 'components/Charts';

export default function MetamasklessPage() {
  const sectionTitles = ['About', 'Charts'];
  const sections = [<MetamasklessModule />, <Charts />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
