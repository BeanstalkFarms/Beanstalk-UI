import React from 'react';
import { Page } from 'Pages/index';
import Field from 'components/Field';
import Trade from 'components/Trade';
import Balances from 'components/Balances';
import Silo from 'components/Silo';
import NFTLeaderboard from 'components/NFTLeaderboard';

export default function Farm(props) {
  const sectionTitles = ['Silo'];
  const sections = [<Silo />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
      sectionNumber={props.sectionNumber}
    />
  );
}
