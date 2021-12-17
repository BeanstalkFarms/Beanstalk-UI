import React from 'react';
import { Page } from 'Pages/index';
import Charts from 'components/Charts';
import Seasons from 'components/Seasons';
import Balances from 'components/Balances';

export default function Analytics() {
  const sectionTitles = ['Charts', 'Seasons', 'Balances'];
  const sections = [<Charts />, <Seasons />, <Balances />];

  return (
    <Page sections={sections} sectionTitles={sectionTitles} />
  );
}
