import React from 'react';
import { Page } from 'pages/index';
import Governance from 'components/Governance';

export default function DAO() {
  const sectionTitles = ['Governance'];
  const sections = [<Governance />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
