import React from 'react';

import { Page } from 'pages/index';
import Trade from 'components/Trade';

export default function TradePage(props) {
  const sectionTitles = ['Trade'];
  const sections = [<Trade />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
      sectionNumber={props.sectionNumber}
    />
  );
}
