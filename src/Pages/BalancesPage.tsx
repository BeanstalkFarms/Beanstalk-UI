import React from 'react';
import { Page } from 'pages/index';
import Balances from 'components/Balances';

export default function DAO() {
  const sectionTitles = ['Balances'];
  const sections = [<Balances />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
