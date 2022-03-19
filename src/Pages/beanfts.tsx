import React from 'react';
import Page from 'components/Page';
import NFTs from 'components/NFT';

export default function BeaNFTPage() {
  const sectionTitles = ['BeaNFT'];
  const sections = [<NFTs />];

  return (
    <Page title="Balances">
      <NFTs />
    </Page>
  );
}
