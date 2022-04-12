import React, { useState } from 'react';
import { Box, Link, Grid } from '@mui/material';
import {
  beanftStrings,
  BaseModule,
  SingleButton,
  ContentTitle,
} from 'components/Common';
import {
  OPENSEA_LINK_GENESIS,
  OPENSEA_LINK_COLLECTION,
} from 'constants/index';
import { makeStyles } from '@mui/styles';
import NftPicTable from './NftPicTable';

const useStyles = makeStyles({
  listTablesBox: {
    marginTop: '0px', 
    maxWidth: '450px', 
    minWidth: '360px'
  }
});

export default function ClaimNFT({
  title,
  buttonDescription,
  unclaimedNFTs,
  claimedNFTs,
  mintAll,
  mintable,
}) {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);

  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo);
    setPage(newPageZero);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const canClaimNFT = unclaimedNFTs.length > 0;

  const sectionsInfo = [];
  const sectionTitlesInfo = [];
  const sectionTitlesDescription = [];

  // create Unminted NFTs tab
  if (unclaimedNFTs !== undefined && Object.keys(unclaimedNFTs).length > 0 && canClaimNFT) {
    sectionsInfo.push(
      <NftPicTable
        canClaimNFT={canClaimNFT && mintable}
        nftList={unclaimedNFTs}
        handleChange={handlePageChange}
        page={page}
        showButton={mintable}
        style={{ width: 'auto', maxWidth: '450px' }}
      />
    );
    sectionTitlesInfo.push('UNMINTED');
    sectionTitlesDescription.push(beanftStrings.unminted);
  }

  // create Minted NFTs tab
  if (claimedNFTs !== undefined && Object.keys(claimedNFTs).length > 0) {
    sectionsInfo.push(
      <NftPicTable
        claimed
        nftList={claimedNFTs}
        handleChange={handlePageChange}
        page={page}
        style={{ width: 'auto', maxWidth: '450px' }}
      />
    );
    sectionTitlesInfo.push('MINTED');
    sectionTitlesDescription.push(beanftStrings.minted);
  }

  if (sectionsInfo.length === 0) {
    sectionsInfo.push(
      <>
        <Box> You have no BeaNFTs.</Box>
        <Link href={title === 'Genesis' ? OPENSEA_LINK_GENESIS : OPENSEA_LINK_COLLECTION} color="inherit" target="blank"> Buy BeaNFTs on OpenSea.</Link>
      </>
    );
    sectionTitlesInfo.push('NFTs');
    sectionTitlesDescription.push(beanftStrings.default);
  }

  // Table Wrapper
  const showListTables =
    sectionsInfo.length > 0 ? (
      <Box className={classes.listTablesBox}>
        <BaseModule
          handleTabChange={handleTabInfoChange}
          section={sectionInfo}
          sectionTitles={sectionTitlesInfo}
          sectionTitlesDescription={sectionTitlesDescription}
          showButton={false}
          style={{ width: '95%', marginLeft: '2.5%', marginTop: '0' }}
          textTransform="none"
        >
          {sectionsInfo[sectionInfo]}
        </BaseModule>
      </Box>
    ) : null;

  // Claim all Unminted BeaNFTs Button
  const showButton = canClaimNFT && mintable ? (
    <SingleButton
      backgroundColor="#3B3B3B"
      color="white"
      isDisabled={!mintable}
      description={buttonDescription}
      handleClick={mintAll}
      margin="-13px 7px 0 0"
      marginTooltip="0 0 -5px 20px"
      size="small"
      title="Mint All"
      width="80%"
      widthTooltip="150px"
    />
  ) : null;

  return (
    <Grid container justifyContent="center">
      <ContentTitle title={title} />
      <Grid
        container
        item
        justifyContent="center"
        alignItems="flex-start"
        style={{ marginBottom: '20px' }}
      >
        {showListTables}
      </Grid>
      <Grid
        container
        item
        justifyContent="center"
        alignItems="flex-start"
      >
        {showButton}
      </Grid>
    </Grid>
  );
}
