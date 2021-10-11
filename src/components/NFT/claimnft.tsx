import React, { useState } from 'react'
import { mintAllNFTs } from '../../util/index'
import {
  BaseModule,
  Grid,
  NftPicTable,
  SingleButton
} from '../Common'

export default function ClaimNFT(props) {
  const [page, setPage] = React.useState(0)
  const [sectionInfo, setSectionInfo] = useState(0)

  const headderStyle = {
    fontFamily: 'Futura-PT-Book',
    fontSize: '24px',
    marginTop: '40px',
    padding: '5px',
    textTransform: 'uppercase',
    width: '100%'
  }

  const [nfts, claimedNfts] = [props.nfts, props.claimedNfts]

  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo)
    setPage(newPageZero)
  }
  const handlePageChange = (event, newPage) => { setPage(newPage) }

  var sectionTitlesInfo = []
  var sectionsInfo = []
  const canClaimNFT = nfts.length > 0
  if (nfts !== undefined && Object.keys(nfts).length > 0 && canClaimNFT) {
    sectionsInfo.push(
      <NftPicTable
        indexType='number'
        assetType='nft'
        canClaimNFT={canClaimNFT}
        crates={nfts}
        colTitles={['ID', 'Transaction Hash']}
        description='A list of your collection of NFTs'
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={1}
        style={{width: 'auto', maxWidth: '450px'}}
        title='Unminted NFTs'
      />
    )
    sectionTitlesInfo.push('Unminted NFTs')
  }
  if (claimedNfts !== undefined && (Object.keys(claimedNfts).length > 0)) {
    sectionsInfo.push(
      <NftPicTable
        indexType='number'
        assetType='nft'
        claimed={true}
        crates={claimedNfts}
        colTitles={['ID', 'Transaction Hash']}
        description='A list of your collection of NFTs'
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={1}
        style={{width: 'auto', maxWidth: '450px'}}
        title='Minted NFTs'
      />
    )
    sectionTitlesInfo.push('Minted NFTs')
  }

  // Table Wrapper

  const showListTables = (
    sectionsInfo.length > 0
      ? <div style={{marginTop: '0px', maxWidth: '450px', minWidth: '370px'}}>
          <BaseModule
            handleTabChange={handleTabInfoChange}
            section={sectionInfo}
            sectionTitles={sectionTitlesInfo}
            showButton={false}
          >
            {sectionsInfo[sectionInfo]}
          </BaseModule>
        </div>
      : null
  )

  // Claim all Unclaimed NFTs Button

  const showButton = (
    canClaimNFT
    ? <SingleButton
        backgroundColor='#3B3B3B'
        color='white'
        description={props.buttonDescription}
        handleClick={ () => {
          const accounts = nfts.map((u) => u.account)
          const ids = nfts.map((u) => u.id)
          const hashes = nfts.map((u) => u.metadataIpfsHash)
          const signatures = nfts.map((u) => u.signature)
          mintAllNFTs(accounts, ids, hashes, signatures)
        }}
        margin='-13px 7px 0 0'
        marginTooltip='0 0 -5px 20px'
        size='small'
        title={props.claimTitle}
        width='80%'
        widthTooltip='150px'
      />
    : null
  )

  const showSection = (
    canClaimNFT || claimedNfts.length > 0
    ? <div style={headderStyle}>
        Your NFTs
      </div>
    : null
  )

  return (
    <Grid container justifyContent='center'>
      {showSection}
      <Grid container item xs={6} style={{width: '50%'}}>
        <Grid container item justifyContent='center' alignItems='flex-start' style={{marginBottom: '20px'}}>
          {showListTables}
        </Grid>
        <Grid container item justifyContent='center' >
          {showButton}
        </Grid>
      </Grid>
    </Grid>
  )
}
