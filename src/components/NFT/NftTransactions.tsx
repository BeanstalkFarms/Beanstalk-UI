import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  TOTAL_NFTS,
  BEGINNING_NFT_SEASON,
  NFTS_PER_SEASON,
} from 'constants/index';
import { ContentSection } from 'components/Common';
import NftSection from './nftSection';

export default function NftTransactions() {
  const { season } = useSelector<AppState, AppState['season']>(
    (state) => state.season
  );
  const { claimedNFTs, accountNFTs, numNFTs } = useSelector<AppState, AppState['nfts']>(
    (state) => state.nfts
  );

  // const userNFTs = unclaimedNFTs.concat(claimedNFTs).map((u) => u.id);
  const remainingNFTs = TOTAL_NFTS -
    (String(season) - BEGINNING_NFT_SEASON) * NFTS_PER_SEASON;

  return (
    <ContentSection
      id="nft"
      title="BeaNFTs"
      textTransform="none"
      style={{ minHeight: '100px' }}
    >
      <NftSection
        remainingNFTs={remainingNFTs}
        numNFTs={numNFTs}
        topTxs={accountNFTs}
        acctTxs={claimedNFTs}
      />
    </ContentSection>
  );
}
