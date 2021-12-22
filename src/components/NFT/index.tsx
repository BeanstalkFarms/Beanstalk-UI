import React from 'react';
import { AppState } from 'state';
import { useSelector } from 'react-redux';
import { Link } from '@material-ui/core';
import {
  MEDIUM_NFT_GENESIS_LINK,
  MEDIUM_NFT_WINTER_LINK,
  OPENSEA_LINK,
} from 'constants/index';
import {
  beanftStrings,
  ContentSection,
  ContentDropdown,
  Grid,
} from 'components/Common';
import ClaimNFT from './claimnft';
import NftStatsHeader from './NftStatsHeader';

export default function NFTs() {
  const { unclaimedNFTs, claimedNFTs } = useSelector<AppState, AppState['nfts']>(
    (state) => state.nfts
  );

  const description = (
    <>
      <span style={{ display: 'flex' }}>
        To date, there have been two NFT projects build on Beanstalk - the
        BeaNFT Genesis Collection and now the BeaNFT Winter Collection.
      </span>
      <span style={{ fontWeight: 'bold', display: 'flex' }}>BeaNFT Genesis Collection: </span>
      <span>
        The BeaNFT Genesis collection is a series of 2067 BeaNFTs which could only
        be minted by participating in Beanstalk during Seasons 1200 – 1800.{' '}
        <Link href={OPENSEA_LINK} target="blank" style={{ color: 'white' }}>OpenSea</Link>.&nbsp;
        <Link href={MEDIUM_NFT_GENESIS_LINK} target="blank" style={{ color: 'white' }}>Read More</Link>.
      </span>
      <span style={{ fontWeight: 'bold', display: 'flex' }}>BeaNFT Winter Collection: </span>
      <span>
        The BeaNFT Winter Collection is a the second round of BeaNFTs. Up to 2,000
        BeaNFTs will be minted by participating in Beanstalk during Seasons 3300-3900.
        The top 5 largest bean-denominated investments each Season (across the Silo
        and Field) will be awarded one of the 2,000 Winter BeaNFTs.{' '}
        <Link href={MEDIUM_NFT_WINTER_LINK} target="blank" style={{ color: 'white' }}>Read More</Link>.
      </span>
    </>
  );

  return (
    <>
      <ContentSection
        id="nft"
        title="BeaNFTs"
        textTransform="none"
        style={{ minHeight: '100px' }}
      >
        <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
          <ContentDropdown
            description={description}
            descriptionTitle="What are BeaNFTs?"
          />
        </Grid>
        <NftStatsHeader />
        <ClaimNFT
          buttonDescription={beanftStrings.mintAll}
          claimedNfts={claimedNFTs}
          nfts={unclaimedNFTs}
        />
      </ContentSection>
    </>
  );
}
