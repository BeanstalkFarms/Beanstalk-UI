import React, { useState } from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
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
}) {
  const { unclaimedWinterNFTs, unclaimedNFTs, claimedNFTs } = useSelector<AppState, AppState['nfts']>(
    (state) => state.nfts
  );

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

  // create Unminted Winter NFTs tab
  if (unclaimedWinterNFTs !== undefined && Object.keys(unclaimedWinterNFTs).length > 0) {
    sectionsInfo.push(
      <NftPicTable
        canClaimNFT={false}
        nftList={unclaimedWinterNFTs}
        handleChange={handlePageChange}
        page={page}
        style={{ width: 'auto', maxWidth: '450px' }}
      />
    );
    sectionTitlesInfo.push('WINTER');
    sectionTitlesDescription.push(beanftStrings.winter);
  }

  // create Unminted NFTs tab
  if (unclaimedNFTs !== undefined && Object.keys(unclaimedNFTs).length > 0 && canClaimNFT) {
    sectionsInfo.push(
      <NftPicTable
        canClaimNFT={canClaimNFT}
        nftList={unclaimedNFTs}
        handleChange={handlePageChange}
        page={page}
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
        const accounts = unclaimedNFTs.map((u) => u.account);
        const ids = unclaimedNFTs.map((u) => u.id);
        const hashes = unclaimedNFTs.map((u) => u.metadataIpfsHash);
        const signatures = unclaimedNFTs.map((u) => u.signature);
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
