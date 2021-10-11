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

  // const price = props.beanTWAPPrice.dividedBy(props.usdcTWAPPrice)

  // create Top Sows table

  var sectionTitlesInfo = []
  var sectionsInfo = []
  if (props.sows.length > 0) {
    sectionsInfo.push(
      <NftListTable
        indexType='time'
        crates={props.sows}
        colTitles={['Rank', 'Time', 'Beans', 'Address']}
        description='The top 10 Sows per Season will show up here'
        handleChange={handlePageChange}
        // price={price}
        page={page}
        rowsPerPage={10}
        style={{width:'auto', maxWidth: '450px'}}
        title='Top 10 Sows'
      />
    )
    sectionTitlesInfo.push('Top Sows')
  } else {
    sectionsInfo.push(
      <div style={{width:'auto', maxWidth: '450px', margin: '20px 0'}}>
        There are no Sows this Season yet
      </div>
    )
    sectionTitlesInfo.push('Top Sows')
  }

  // create Top Deposits table

  // if (props.deposits.length > 0 && price > 1) {
  //   sectionsInfo.push(
  //     <NftListTable
  //       indexType='time'
  //       crates={props.deposits}
  //       colTitles={['Time', 'Beans', 'Address']}
  //       description='The top 10 Deposits per Season will show up here'
  //       handleChange={handlePageChange}
  //       price={price}
  //       page={page}
  //       rowsPerPage={10}
  //       style={{width:'auto', maxWidth: '450px'}}
  //       title='Top 10 Deposits'
  //     />
  //   )
  //   sectionTitlesInfo.push('Top Deposits')
  // } else if (price > 1) {
  //   sectionsInfo.push(
  //     <div style={{width:'auto', minWidth: '450px', margin: '20px 0'}}>
  //       There are no Deposits this Season yet
  //     </div>
  //   )
  //   sectionTitlesInfo.push('Top Deposits')
  // }

  // create All NFT Transactions table

  if (props.nfts !== undefined && (Object.keys(props.nfts).length > 0 )) {
    sectionsInfo.push(
      <NftListTable
        indexType='number'
        crates={props.nfts}
        colTitles={['ID', 'Tx Hash', 'Address']}
        description='Every NFT minted will show up here'
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={10}
        style={{width: 'auto', maxWidth: '450px'}}
        title='Minted NFTs'
      />
    )
    sectionTitlesInfo.push('All NFTs')
  }

  // create User NFT Transactions table

  if (props.userNFTs !== undefined && (Object.keys(props.userNFTs).length > 0 )) {
    sectionsInfo.push(
      <NftListTable
        indexType='number'
        assetType='nft'
        crates={props.userNFTs}
        colTitles={['ID', 'Transaction Hash']}
        description='A list of your collection of NFTs'
        handleChange={handlePageChange}
        page={page}
        rowsPerPage={10}
        style={{width: 'auto', maxWidth: '450px'}}
        title='Your NFTs'
      />
    )
    sectionTitlesInfo.push('Your NFTs')
  }

  // Table Wrapper with tabs

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

  return (
    <>
    {showListTables}
    </>
  )
}
