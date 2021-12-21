import React from 'react';
import { Page } from 'Pages/index';
import NFTs from 'components/NFT';
import NftTransactions from 'components/NFT/NftTransactions';

export default function DAO() {
  const sectionTitles = ['BeaNFT', 'Leaderboards'];
  const sections = [<NFTs />, <NftTransactions />];

  return (
    <Page sections={sections} sectionTitles={sectionTitles} textTransform="none" />
  );
}
