import React from 'react';
import { Page } from 'Pages/index';
import Balances from 'components/Balances';

export default function DAO() {
  const sectionTitles = ['Balance'];
  const sections = [<Balances />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
