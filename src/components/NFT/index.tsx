import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { Box, Container, Grid, Link, Stack } from '@mui/material';
// import { makeStyles } from '@mui/styles';
import {
  MEDIUM_NFT_GENESIS_LINK,
  MEDIUM_NFT_WINTER_LINK,
  OPENSEA_LINK_COLLECTION,
  OPENSEA_LINK_GENESIS,
} from 'constants/index';
import {
  beanftStrings,
  ContentDropdown,
} from 'components/Common';
import { mintAllAccountNFTs, mintAllNFTs } from 'util/index';
import ClaimNft from './ClaimNft';
import NftStatsHeader from './NftStatsHeader';

// const NFT_PAGE_MAX_WIDTH = '1300px';
// const LG_MEDIA_QUERY = {
//   below: '@media (max-width: 1000px)',
//   above: '@media (min-width: 1001px)',
// };

// const useStyles = makeStyles(() => ({
//   container: {
//     display: 'flex',
//     width: '100%',
//     flexDirection: 'column',
//     maxWidth: NFT_PAGE_MAX_WIDTH,
//   },
//   nfts: {
//     display: 'flex',
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     [LG_MEDIA_QUERY.below]: {
//       flexDirection: 'column',
//     },
//     [LG_MEDIA_QUERY.above]: {
//       flexDirection: 'row',
//     },
//   },
//   dropdown: {
//     display: 'flex',
//     width: '100%',
//     justifyContent: 'center',
//     margin: '20px 0',
//   },
// }));

export default function NFTs() {
  const { unclaimedWinterNFTs, claimedWinterNFTs, unclaimedNFTs, claimedNFTs } =
    useSelector<AppState, AppState['nfts']>((state) => state.nfts);

  // const classes = useStyles();

  const description = (
    <>
      <span style={{ display: 'flex' }}>
        To date, there have been two NFT projects build on Beanstalk - the
        BeaNFT Genesis Collection and now the BeaNFT Winter Collection.
      </span>
      <span style={{ fontWeight: 'bold', display: 'flex' }}>
        BeaNFT Genesis Collection:{' '}
      </span>
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
      <span style={{ fontWeight: 'bold', display: 'flex' }}>
        BeaNFT Winter Collection:{' '}
      </span>
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
    <Container maxWidth="lg">
      <Stack spacing={4} direction="column" alignItems="center">
        {/* Counts of each type of BeaNFT */}
        <Box sx={{ width: '300px' }}>
          <NftStatsHeader />
        </Box>
        {/* Genesis vs. Winter columns */}
        <Grid container>
          <Grid item xl={6} lg={6} md={12} xs={12}>
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
          <Grid item xl={6} lg={6} md={12} xs={12}>
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
        {/* About BeaNFTs */}
        <Container maxWidth="sm">
          <ContentDropdown
            description={description}
            descriptionTitle="What are BeaNFTs?"
          />
        </Container>
      </Stack>
    </Container>
  );
}
