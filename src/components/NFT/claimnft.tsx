import React, { useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { mintAllNFTs } from 'util/index';
import {
  beanftStrings,
  BaseModule,
  SingleButton,
} from 'components/Common';
import NftPicTable from './NftPicTable';

export default function ClaimNFT({
  buttonDescription,
  claimedNfts,
  nfts,
}) {
  const [page, setPage] = React.useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);

  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo);
    setPage(newPageZero);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const canClaimNFT = nfts.length > 0;

  const sectionsInfo = [];
  const sectionTitlesInfo = [];
  const sectionTitlesDescription = [];

  // create Unminted NFTs tab
  if (nfts !== undefined && Object.keys(nfts).length > 0 && canClaimNFT) {
    sectionsInfo.push(
      <NftPicTable
        canClaimNFT={canClaimNFT}
        nftList={nfts}
        handleChange={handlePageChange}
        page={page}
        style={{ width: 'auto', maxWidth: '450px' }}
      />
    );
    sectionTitlesInfo.push('UNMINTED');
    sectionTitlesDescription.push(beanftStrings.unminted);
  }

  // create Minted NFTs tab
  if (claimedNfts !== undefined && Object.keys(claimedNfts).length > 0) {
    sectionsInfo.push(
      <NftPicTable
        claimed
        nftList={claimedNfts}
        handleChange={handlePageChange}
        page={page}
        style={{ width: 'auto', maxWidth: '450px' }}
      />
    );
    sectionTitlesInfo.push('MINTED');
    sectionTitlesDescription.push(beanftStrings.minted);
  }

  // Table Wrapper

  const showListTables =
    sectionsInfo.length > 0 ? (
      <Box style={{ marginTop: '0px', maxWidth: '450px', minWidth: '360px' }}>
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

  // Claim all Unminted BeaNFTs Button

  const showButton = canClaimNFT ? (
    <SingleButton
      backgroundColor="#3B3B3B"
      color="white"
      description={buttonDescription}
      handleClick={() => {
        const accounts = nfts.map((u) => u.account);
        const ids = nfts.map((u) => u.id);
        const hashes = nfts.map((u) => u.metadataIpfsHash);
        const signatures = nfts.map((u) => u.signature);
        mintAllNFTs(accounts, ids, hashes, signatures);
      }}
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
      <Grid container item xs={6} style={{ width: '50%' }}>
        <Grid
          container
          item
          justifyContent="center"
          alignItems="flex-start"
          style={{ marginBottom: '20px' }}
        >
          {showListTables}
        </Grid>
      </Grid>
      <Grid
        container
        item
        justifyContent="center"
        alignItems="flex-start"
        style={{ marginBottom: '100px' }}
      >
        {showButton}
      </Grid>
    </Grid>
  );
}
