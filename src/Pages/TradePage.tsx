import React from 'react';

import { Page } from 'Pages/index';
import Trade from 'components/Trade';

export default function Trade(props) {
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
