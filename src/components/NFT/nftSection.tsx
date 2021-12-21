import React, { useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import {
  BaseModule,
  beanftStrings,
  ContentDropdown,
  ContentTitle,
} from 'components/Common';
import { MEDIUM_NFT_LINK, OPENSEA_LINK } from 'constants/index';
import NftListTable from './NftListTable';

export default function NftSection({
  acctTxs,
  topTxs,
  numNFTs,
  remainingNFTs,
}) {
  const [page, setPage] = React.useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);

  const headerStyle = {
    fontFamily: 'Futura-PT-Book',
    fontSize: '20px',
    marginTop: '40px',
    padding: '5px',
    width: '100%',
  };
  const nftStyle = {
    backgroundColor: '#F5FAFF',
    borderRadius: '25px',
    boxShadow:
      '0px 2px 4px -1px rgb(0 0 0 / 20%),0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
    padding: '10px',
    fontSize: '18px',
    width: '370px',
    justifyContent: 'center',
  };

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
  if (topTxs.length > 0) {
    sectionsInfo.push(
      <NftListTable
        indexType="transactions"
        nftList={topTxs}
        colTitles={['Rank', 'Type', 'Beans', 'Address']}
        handleChange={handlePageChange}
        page={page}
        style={{ width: 'auto', maxWidth: '450px' }}
      />
    );
  } else {
    sectionsInfo.push(noTxBox);
  }

  // create Top Accounts table

  if (acctTxs !== undefined && Object.keys(acctTxs).length > 0) {
    sectionsInfo.push(
      <NftListTable
        indexType="accounts"
        nftList={acctTxs}
        colTitles={['# NFTs', 'Total Beans', 'Account']}
        handleChange={handlePageChange}
        page={page}
        style={{ width: 'auto', maxWidth: '450px' }}
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

  const eventBox = (
    <Grid
      container
      item
      xs={12}
      justifyContent="center"
      alignItems="center"
      style={{ marginBottom: '20px' }}
    >
      <Grid container item style={nftStyle}>
        <Grid
          container
          item
          xs={12}
          justifyContent="center"
          alignItems="center"
          style={{ marginTop: '10px' }}
        >
          <span>{'Your BeaNFTs:  '}</span>
          <span style={{ fontSize: '30px' }}>
            &nbsp; {numNFTs} &nbsp;
          </span>
        </Grid>
        <Grid
          container
          item
          xs={12}
          justifyContent="center"
          alignItems="center"
          style={{ marginTop: '10px' }}
        >
          <span>{'Bean Amount: '}</span>
          <span style={{ fontSize: '30px' }}>
            &nbsp; {remainingNFTs} &nbsp;
          </span>
        </Grid>
        <Grid
          container
          item
          xs={12}
          justifyContent="center"
          alignItems="center"
          style={{ marginTop: '10px' }}
        >
          <span>{'Remaining BeaNFTs: '}</span>
          <span style={{ fontSize: '30px' }}>
            &nbsp; {remainingNFTs} &nbsp;
          </span>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <>
      <ContentTitle
        style={headerStyle}
        title="BeaNFT WINTER EDITION"
        textTransform="none"
      />
      <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
        <ContentDropdown
          description={beanftStrings.beanftWinterDescription}
          descriptionTitle="What is the BeaNFT Winter Edition?"
          descriptionLinks={descriptionLinks}
        />
      </Grid>
      {eventBox}
      <Grid container item justifyContent="center">
        {showListTables}
      </Grid>
    </>
  );
}
