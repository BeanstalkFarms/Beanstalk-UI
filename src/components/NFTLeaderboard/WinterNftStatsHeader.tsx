import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import {
  TOTAL_NFTS,
} from 'constants/index';
import { beanftWinterStrings, HeaderLabelList } from 'components/Common';

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
          beanftWinterStrings.earnedNFTs,
          beanftWinterStrings.investedBeans,
          beanftWinterStrings.remainingNFTs,
        ]}
        title={[
          'Your Winter BeaNFTs',
          'Your Invested Beans',
          'Remaining BeaNFTs',
        ]}
        value={[
          earnedNFTs,
          Math.floor(investedBeans),
          remainingNFTs,
        ]}
      />
    );
}
