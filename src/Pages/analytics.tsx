import React from 'react';
import { Page } from 'pages/index';
import Charts from 'components/Charts';

export default function AnalyticsPage() {
  const sectionTitles = ['Analytics'];
  const sections = [<Charts />];

  return (
    <Page
      title="Analytics"
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
