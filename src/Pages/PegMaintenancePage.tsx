import React from 'react';
import { Page } from 'Pages/index';
import Charts from 'components/Charts';
import Seasons from 'components/Seasons';
import Balances from 'components/Balances';

export default function PegMaintenancePage(props) {
  const sectionTitles = ['Peg Maintenance'];
  const sections = [<Seasons />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
