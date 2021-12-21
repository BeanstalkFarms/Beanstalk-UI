import React from 'react';
import { Page } from 'Pages/index';
import Field from 'components/Field';
import Trade from 'components/Trade';
import Balances from 'components/Balances';
import Silo from 'components/Silo';
import NftLeaderboardSection from 'components/NFT/NftLeaderboardSection';

export default function Farm() {
  const sectionTitles = ['Silo', 'Field', 'Trade', 'Balances', 'BeaNFTs'];
  const sections = [<Silo />, <Field />, <Trade />, <Balances />, <NftLeaderboardSection />];

  return (
    <Page sections={sections} sectionTitles={sectionTitles} />
  );
}
