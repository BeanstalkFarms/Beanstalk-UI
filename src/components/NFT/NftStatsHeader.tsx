import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { HeaderLabelList } from 'components/Common';

export default function NftStatsHeader() {
  const { winterNFTs, genesisNFTs, unmintedNFTs, unclaimedNFTs } = useSelector<AppState, AppState['nfts']>(
      (state) => state.nfts
  );

  const totalWinterNFTs = winterNFTs + unmintedNFTs;
  const totalGenesisNFTs = genesisNFTs + unclaimedNFTs.length;

  return (
    <HeaderLabelList
      balanceDescription={[
        totalGenesisNFTs,
        totalWinterNFTs,
      ]}
      description={[
        'The total minted and unminted Genesis BeaNFTs that you own.',
        'The total minted and unminted Winter BeaNFTs that you own.',
      ]}
      title={[
        'Your Genesis BeaNFTs',
        'Your Winter BeaNFTs',
      ]}
      value={[
        totalGenesisNFTs,
        totalWinterNFTs,
      ]}
      width="300px"
    />
  );
}
