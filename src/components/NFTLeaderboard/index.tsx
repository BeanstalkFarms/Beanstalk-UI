import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Box, Grid } from '@material-ui/core';
import {
  BaseModule,
  beanftStrings,
  ContentDropdown,
  ContentSection,
} from 'components/Common';
import { MEDIUM_NFT_LINK, OPENSEA_LINK } from 'constants/index';
import NftListTable from './NftListTable';
import NftAccountsListTable from './NftAccountsListTable';
import WinterNftStatsHeader from './WinterNftStatsHeader';

export default function NftLeaderboard() {
  const [page, setPage] = React.useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);

  const { investmentNFTs, accountNFTs } = useSelector<AppState, AppState['nfts']>(
    (state) => state.nfts
  );

  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo);
    setPage(newPageZero);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const sectionTitlesInfo = ['TOP TXs', 'TOP ACCT'];
  const sectionTitlesDescription = [
    beanftStrings.topTxn,
    beanftStrings.topAcct,
  ];

  // create Top Transactions table

  const sectionsInfo = [];
  const noTxBox = (
    <Box style={{ width: 'auto', maxWidth: '450px', margin: '20px 0' }}>
      There are no transactions this Season yet.
    </Box>
  );
  if (investmentNFTs.length > 0) {
    sectionsInfo.push(
      <NftListTable
        nftList={investmentNFTs}
        colTitles={['Rank', 'Address', 'Type', 'Beans']}
        handleChange={handlePageChange}
        page={page}
        style={{ width: '100%' }}
      />
    );
  } else {
    sectionsInfo.push(noTxBox);
  }

  if (accountNFTs !== undefined && Object.keys(accountNFTs).length > 0) {
    sectionsInfo.push(
      <NftAccountsListTable
        nftList={accountNFTs}
        colTitles={['Account', '# NFTs', 'Invested Beans']}
        handleChange={handlePageChange}
        page={page}
        style={{ width: '100%' }}
      />
    );
  } else {
    sectionsInfo.push(noTxBox);
  }

  // Table Wrapper with tabs

  const showListTables =
    sectionsInfo.length > 0 ? (
      <Box style={{ marginTop: '0px', maxWidth: '450px', minWidth: '370px' }}>
        <BaseModule
          handleTabChange={handleTabInfoChange}
          section={sectionInfo}
          sectionTitles={sectionTitlesInfo}
          sectionTitlesDescription={sectionTitlesDescription}
          showButton={false}
          textTransform="none"
        >
          {sectionsInfo[sectionInfo]}
        </BaseModule>
      </Box>
    ) : null;

  const descriptionLinks = [
    {
      href: `${OPENSEA_LINK}`,
      text: 'OpenSea',
    },
    {
      href: `${MEDIUM_NFT_LINK}`,
      text: 'Read More',
    },
  ];

  return (
    <ContentSection
      id="leaderboard"
    >
      <Grid container justifyContent="center" style={{ margin: '20px 0px', zIndex: 100 }}>
        <ContentDropdown
          description={beanftStrings.beanftWinterDescription}
          descriptionTitle="What is the BeaNFT Winter Edition?"
          descriptionLinks={descriptionLinks}
        />
      </Grid>
      <WinterNftStatsHeader />
      <Grid container justifyContent="center">
        {showListTables}
      </Grid>
    </ContentSection>
  );
}
