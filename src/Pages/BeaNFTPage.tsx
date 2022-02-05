import React from 'react';
import { Page } from 'Pages/index';
import NFTs from 'components/NFT';
// import NFTLeaderboard from 'components/NFTLeaderboard';

export default function DAO() {
  const sectionTitles = ['BeaNFT'];
  const sections = [<NFTs />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
      textTransform="none"
      routeTitle="beanfts"
    />
  );
}
