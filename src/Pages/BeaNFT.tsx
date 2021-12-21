import React from 'react';
import { Page } from 'Pages/index';
import NFTs from 'components/NFT';
import NftLeaderboardSection from 'components/NFT/NftLeaderboardSection';

export default function DAO() {
  const sectionTitles = ['BeaNFT', 'Earn NFTs'];
  const sections = [<NFTs />, <NftLeaderboardSection />];

  return (
    <Page sections={sections} sectionTitles={sectionTitles} textTransform="none" />
  );
}
