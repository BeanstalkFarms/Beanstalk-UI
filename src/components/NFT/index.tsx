import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { Link } from '@mui/material';
import {
  MEDIUM_NFT_GENESIS_LINK,
  MEDIUM_NFT_WINTER_LINK,
  OPENSEA_LINK_COLLECTION,
  OPENSEA_LINK_GENESIS,
} from 'constants/index';
import {
  beanftStrings,
  ContentSection,
  ContentDropdown,
  Grid,
} from 'components/Common';
import { mintAllAccountNFTs, mintAllNFTs } from 'util/index';
import ClaimNft from './ClaimNft';
import NftStatsHeader from './NftStatsHeader';

export default function NFTs() {
  const {
    unclaimedWinterNFTs,
    claimedWinterNFTs,
    unclaimedNFTs,
    claimedNFTs,
  } = useSelector<AppState, AppState['nfts']>(
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
        <Link
          href={OPENSEA_LINK_GENESIS}
          target="blank"
          style={{ color: 'white' }}
          underline="hover">
          OpenSea
        </Link>.
        &nbsp;
        <Link
          href={MEDIUM_NFT_GENESIS_LINK}
          target="blank"
          style={{ color: 'white' }}
          underline="hover">
          Read More
        </Link>.
      </span>
      <span style={{ fontWeight: 'bold', display: 'flex' }}>BeaNFT Winter Collection: </span>
      <span>
        The BeaNFT Winter Collection is the second minting event for BeaNFTs and is a collection of 751 BeaNFTs which could only be earned by participating in Beanstalk from Season 3300 to 3900. The top 5 largest bean-denominated investments each Season (across the Silo and Field) were be awarded one Winter BeaNFT.{' '}
        <Link
          href={OPENSEA_LINK_COLLECTION}
          target="blank"
          style={{ color: 'white' }}
          underline="hover">
          OpenSea
        </Link>.
        &nbsp;
        <Link
          href={MEDIUM_NFT_WINTER_LINK}
          target="blank"
          style={{ color: 'white' }}
          underline="hover">
          Read More
        </Link>.
      </span>
    </>
  );

  return (
    <>
      <ContentSection
        id="nft"
        title="BeaNFTs"
        textTransform="none"
        style={{
          paddingTop: 20, // FIXME
        }}
      >
        <NftStatsHeader />
        <Grid container>
          <Grid item xl={2} lg={1} md={false} />
          <Grid item xl={6} lg={5} md={6} xs={12}>
            <ClaimNft
              buttonDescription={beanftStrings.mintAll}
              claimedNFTs={claimedNFTs}
              unclaimedNFTs={unclaimedNFTs}
              title="Genesis"
              mintable
              mintAll={() => {
                const accounts = unclaimedNFTs.map((u) => u.account);
                const ids = unclaimedNFTs.map((u) => u.id);
                const hashes = unclaimedNFTs.map((u) => u.metadataIpfsHash);
                const signatures = unclaimedNFTs.map((u) => u.signature);
                mintAllNFTs(accounts, ids, hashes, signatures);
              }}
            />
          </Grid>
          <Grid item lg={5} md={6} xs={12}>
            <ClaimNft
              buttonDescription={beanftStrings.mintAll}
              claimedNFTs={claimedWinterNFTs}
              unclaimedNFTs={unclaimedWinterNFTs}
              title="Winter"
              mintable
              mintAll={() => {
                const ids = unclaimedWinterNFTs.map((u) => u.id);
                const signatures = unclaimedWinterNFTs.map((u) => u.signature2);
                mintAllAccountNFTs(ids, signatures);
              }}
            />
          </Grid>
        </Grid>
        <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
          <ContentDropdown
            description={description}
            descriptionTitle="What are BeaNFTs?"
          />
        </Grid>
      </ContentSection>
    </>
  );
}
