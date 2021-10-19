import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import { BaseModule, NftListTable } from '../Common';

export default function NftSection(props) {
  const [page, setPage] = React.useState(0);
  const [sectionInfo, setSectionInfo] = useState(0);

  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo);
    setPage(newPageZero);
  };
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // create Top Sows table

  const sectionTitlesInfo = ['TOP SOWS', 'ALL'];
  const sectionTitlesDescription = [
    'This tab displays the top 10 sow transactions of the current Season.',
    'This tab displays all previously created BeaNFTs. This includes minted and unminted BeaNFTs.',
  ];

  const sectionsInfo = [];
  if (props.sows.length > 0) {
    sectionsInfo.push(
      <NftListTable
        indexType="time"
        crates={props.sows}
        colTitles={['Rank', 'Time', 'Beans', 'Address']}
        description="N/A"
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={10}
        style={{ width: 'auto', maxWidth: '450px' }}
        title="Top 10 Sows"
      />
    );
  } else {
    sectionsInfo.push(
      <Box style={{ width: 'auto', maxWidth: '450px', margin: '20px 0' }}>
        There are no Sows this Season yet.
      </Box>
    );
  }

  // create All BeaNFT Transactions table

  if (props.nfts !== undefined && Object.keys(props.nfts).length > 0) {
    sectionsInfo.push(
      <NftListTable
        indexType="number"
        crates={props.nfts}
        colTitles={['ID', 'Tx Hash', 'Address']}
        description="N/A"
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={10}
        style={{ width: 'auto', maxWidth: '450px' }}
        title="All BeaNFTs"
      />
    );
  }

  // create User BeaNFT Transactions table

  if (props.userNFTs !== undefined && Object.keys(props.userNFTs).length > 0) {
    sectionsInfo.push(
      <NftListTable
        indexType="number"
        assetType="nft"
        crates={props.userNFTs}
        colTitles={['ID', 'Transaction Hash']}
        description="A list of your collection of BeaNFTs."
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={10}
        style={{ width: 'auto', maxWidth: '450px' }}
        title="Your BeaNFTs"
      />
    );
    sectionTitlesInfo.push('YOURS');
    sectionTitlesDescription.push(
      'This tab displays all of your sow transactions that have yielded a BeaNFT. This includes both minted and unminted BeaNFTs.'
    );
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

  return <>{showListTables}</>;
}
