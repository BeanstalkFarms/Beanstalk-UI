import React from 'react';
import { Page } from 'pages/index';
import NFTs from 'components/NFT';
// import NFTLeaderboard from 'components/NFTLeaderboard';

export default function BeaNFTPage() {
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
