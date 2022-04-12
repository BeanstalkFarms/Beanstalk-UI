import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Box, Grid } from '@mui/material';
import {
  BaseModule,
  beanftWinterStrings,
  ContentDropdown,
  ContentSection,
} from 'components/Common';
import { MEDIUM_NFT_WINTER_LINK } from 'constants/index';
import { makeStyles } from '@mui/styles';
import NftListTable from './NftListTable';
import NftAccountsListTable from './NftAccountsListTable';
import WinterNftStatsHeader from './WinterNftStatsHeader';

const useStyles = makeStyles({
  noTxBox: {
    width: 'auto', 
    maxWidth: '450px', 
    margin: '20px 0'
  },
  listTablesBox: {
    marginTop: '0px',
    maxWidth: '450px',
    minWidth: '360px'
  },
  winterNFTStatsGrid: {
    margin: '20px 0px',
    zIndex: 100
  }
});

export default function NftLeaderboard() {
  const classes = useStyles();
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
    beanftWinterStrings.topTxn,
    beanftWinterStrings.topAcct,
  ];

  // create Top Transactions table
  const sectionsInfo = [];
  const noTxBox = (
    <Box className={classes.noTxBox}>
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
      <Box className={classes.listTableBox}>
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
      href: `${MEDIUM_NFT_WINTER_LINK}`,
      text: 'Read More',
    },
  ];

  return (
    <ContentSection id="leaderboard">
      <Grid container justifyContent="center" className={classes.winterNFTStatsGrid}>
        <ContentDropdown
          description={beanftWinterStrings.beanftDescription}
          descriptionTitle="What is the BeaNFT Winter Collection?"
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
