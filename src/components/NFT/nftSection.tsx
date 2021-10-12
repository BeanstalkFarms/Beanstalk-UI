import React, { useState } from 'react'
import { BaseModule, NftListTable } from '../Common'

export default function NftSection(props) {
  const [page, setPage] = React.useState(0)
  const [sectionInfo, setSectionInfo] = useState(0)

  const handleTabInfoChange = (event, newSectionInfo, newPageZero) => {
    setSectionInfo(newSectionInfo)
    setPage(newPageZero)
  }
  const handlePageChange = (event, newPage) => { setPage(newPage) }

  // create Top Sows table

  const sectionTitlesInfo = ['TOP SOWS', 'ALL']
  const sectionTitlesDescription = ['Top Sows Description - unique1234', 'All BeaNFTs Description - unique1234']

  var sectionsInfo = []
  if (props.sows.length > 0) {
    sectionsInfo.push(
      <NftListTable
        indexType='time'
        crates={props.sows}
        colTitles={['Rank', 'Time', 'Beans', 'Address']}
        description='The top 10 Sows per Season will show up here'
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={10}
        style={{width:'auto', maxWidth: '550px'}}
        title='Top 10 Sows'
      />
    )
  } else {
    sectionsInfo.push(
      <div style={{width:'auto', maxWidth: '550px', margin: '20px 0'}}>
        There are no Sows this Season yet.
      </div>
    )
  }

  // create All BeaNFT Transactions table

  if (props.nfts !== undefined && (Object.keys(props.nfts).length > 0 )) {
    sectionsInfo.push(
      <NftListTable
        indexType='number'
        crates={props.nfts}
        colTitles={['ID', 'Tx Hash', 'Address']}
        description='Every BeaNFT minted will show up here.'
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={10}
        style={{width: 'auto', maxWidth: '550px'}}
        title='All BeaNFTs'
      />
    )
  }

  // create User BeaNFT Transactions table

  if (props.userNFTs !== undefined && (Object.keys(props.userNFTs).length > 0 )) {
    sectionsInfo.push(
      <NftListTable
        indexType='number'
        assetType='nft'
        crates={props.userNFTs}
        colTitles={['ID', 'Transaction Hash']}
        description='A list of your collection of BeaNFTs.'
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={10}
        style={{width: 'auto', maxWidth: '550px'}}
        title='Your BeaNFTs'
      />
    )
    sectionTitlesInfo.push('YOURS')
    sectionTitlesDescription.push('Your BeaNFTs Description - unique1234')
  }

  // Table Wrapper with tabs

  const showListTables = (
    sectionsInfo.length > 0
      ? <div style={{marginTop: '0px', maxWidth: '550px', minWidth: '370px', width: 'calc(350px + 10vw)'}}>
          <BaseModule
            handleTabChange={handleTabInfoChange}
            section={sectionInfo}
            sectionTitles={sectionTitlesInfo}
            sectionTitlesDescription={sectionTitlesDescription}
            showButton={false}
            textTransform='none'
          >
            {sectionsInfo[sectionInfo]}
          </BaseModule>
        </div>
      : null
  )

  return (<>{showListTables}</>)
}
