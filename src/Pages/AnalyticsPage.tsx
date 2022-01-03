import React from 'react';
import { Page } from 'Pages/index';
import Charts from 'components/Charts';

export default function AnalyticsPage() {
  const sectionTitles = ['Analytics'];
  const sections = [<Charts />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
