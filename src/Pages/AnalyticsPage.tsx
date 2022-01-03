import React from 'react';
import { Page } from 'Pages/index';
import Charts from 'components/Charts';
import Seasons from 'components/Seasons';
import Balances from 'components/Balances';

export default function AnalyticsPage(props) {
  const sectionTitles = ['Analytics'];
  const sections = [<Charts />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
