import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  TOTAL_NFTS,
} from 'constants/index';
import { HeaderLabelList } from 'components/Common';

export default function WinterNftStatsHeader() {
    const { totalNFTs, earnedNFTs, investedBeans } = useSelector<AppState, AppState['nfts']>(
        (state) => state.nfts
    );

    const remainingNFTs = TOTAL_NFTS - totalNFTs;

    return (
      <HeaderLabelList
        balanceDescription={[
          earnedNFTs,
          investedBeans,
          remainingNFTs,
        ]}
        description={[
          'The number of Winter BeaNFTs you have earned during the Winter BeaNFT event.',
          'The amount of Beans you have invested during the Winter BeaNFT event.',
          'The number of remaining Winter BeaNFTs in the Winter BeaNFT event.',
        ]}
        title={[
          'Your Winter BeaNFTs',
          'Your Invested Beans',
          'Remaining BeaNFTs',
        ]}
        value={[
          earnedNFTs,
          investedBeans,
          remainingNFTs,
        ]}
        width="300px"
      />
    );
}
