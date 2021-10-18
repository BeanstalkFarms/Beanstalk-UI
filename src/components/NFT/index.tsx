import React, { useEffect, useState } from 'react'
import { Link } from '@material-ui/core'
import {
  BEGINNING_NFT_SEASON,
  GENESIS_NFT,
  MEDIUM_NFT_LINK,
  NFTS_PER_SEASON,
  TOTAL_NFTS
} from '../../constants'
import { listenForNFTTransfers, GetWalletAddress, getMintedNFTs } from '../../util'
import { NFT_LINK } from '../../constants'
import { beanNFTQuery, beanNFTSowQuery } from '../../graph'
import { ContentSection, Grid } from '../Common'
import NftSection from './nftSection'
import ClaimNFT from './claimnft'

export default function NFTs(props) {
  let [sows, setSows] = useState([])
  let [nfts, setNFTs] = useState([])
  let [unclaimedNFTs, setUnclaimedNFTs] = useState([])
  let [claimedNFTs, setClaimedNFTs] = useState([])

  const nftStyle = {
    backgroundColor: '#F5FAFF',
    borderRadius: '25px',
    boxShadow: '0px 2px 4px -1px rgb(0 0 0 / 20%),0px 4px 5px 0px rgb(0 0 0 / 14%),0px 1px 10px 0px rgb(0 0 0 / 12%)',
    padding: '10px',
    fontSize: '18px',
    width: '370px',
    justifyContent: 'center',
  }
  useEffect(() => {
    async function loadData() {
      const [s, n] = await Promise.all([
        beanNFTSowQuery(props.season.toString()),
        beanNFTQuery(),
      ])
      setSows(s)
      setNFTs(n)
    }
    async function checkMints(data) {
      const [ownedIds, tradedIds] = await getMintedNFTs()
      const un = []
      const cn = []
      for (var i = 0; i < data.length; i++) {
        if ((ownedIds).includes(data[i]['id'])) {
          if(!tradedIds.includes(data[i]['id'])) {
            cn.push(data[i])
          } else {
            let idx = tradedIds.indexOf(data[i]['id'])
            tradedIds.splice(idx,1)
          }
        } else {
          un.push(data[i])
        }
      }
      setUnclaimedNFTs(un)
      setClaimedNFTs(cn)
      listenForNFTTransfers(getNFTs)
    }
    async function getNFTs() {
      fetch(`${NFT_LINK}?account=${(await GetWalletAddress()).toLowerCase()}`).then(response => response.json()).then(data => {
        data.forEach((d) => {
          d['id'] = parseInt(d['_id']['$numberInt'])
          delete d['_id']
        })
        checkMints(data)
      })
    }
    loadData()
    getNFTs()
  },[props.season])

  const mintedNFTs = (String(props.season) - BEGINNING_NFT_SEASON - 1) * NFTS_PER_SEASON
  const remainingNFTs = TOTAL_NFTS - mintedNFTs

  try {
    if (nfts[0].id !== GENESIS_NFT.id) {
      nfts.unshift(GENESIS_NFT)
    }
  }
  catch {}

  let userNFTs = unclaimedNFTs.concat(claimedNFTs).map((u) => u['id'])
  userNFTs = nfts.filter((n) => userNFTs.includes(n['id']))

  return (
    <ContentSection id='nft' title='BeaNFTs' textTransform='none' style={{minHeight: '600px'}}>
      <div className={"section-description"} style={{width: '370px', margin: '20px 0 0 0', padding: '12px'}}>
        {`BeaNFT Genesis Collection is a series of up to 6000 Bean NFTs which can only be minted by participating in Beanstalk. The top 10 Sows each Season are awarded a generated BeaNFT. The BeaNFT will be available to be minted ~10 minutes after the Season it is awarded.`}
        {` `}<Link href={MEDIUM_NFT_LINK} target='blank'>{'Read More'}</Link>{`.`}
      </div>
      <Grid container item xs={12} justifyContent='center' alignItems='center' style={{marginBottom: '20px'}}>
        <Grid container item style={nftStyle}>
          <Grid container item xs={12} justifyContent='center' alignItems='center' style={{marginTop: '-10px'}}>
              <span>{`Your BeaNFTs:  `}</span>
              <span style={{fontSize: '70px'}}>&nbsp; {userNFTs.length} &nbsp;</span>
          </Grid>
          <Grid container item xs={12} justifyContent='center' alignItems='center' style={{marginTop: '10px'}}>
              <span>{`Remaining BeaNFTs: `}</span>
              <span style={{fontSize: '30px'}}>&nbsp; {remainingNFTs} &nbsp;</span>
          </Grid>
        </Grid>
      </Grid>

      <NftSection
        sows={sows}
        nfts={nfts}
        userNFTs={userNFTs}
        {...props}
      />

      <ClaimNFT
        buttonDescription='Use this button to Mint all your Mintable BeaNFTs.'
        claimTitle='MINT ALL'
        claimedNfts={claimedNFTs}
        nfts={unclaimedNFTs}
        {...props}
      />

    </ContentSection>
  )
}
