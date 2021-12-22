import React from 'react';
import { Page } from 'Pages/index';
import NFTs from 'components/NFT';
import NFTLeaderboard from 'components/NFTLeaderboard';

export default function DAO() {
  const sectionTitles = ['BeaNFT', 'Earn NFTs'];
  const sections = [<NFTs />, <NFTLeaderboard />];

  return (
    <Page sections={sections} sectionTitles={sectionTitles} textTransform="none" />
  );
}
