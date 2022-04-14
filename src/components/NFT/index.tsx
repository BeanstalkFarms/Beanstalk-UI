import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { Box, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
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
} from 'components/Common';
import { mintAllAccountNFTs, mintAllNFTs } from 'util/index';
import ClaimNft from './ClaimNft';
import NftStatsHeader from './NftStatsHeader';

const NFT_PAGE_MAX_WIDTH = '1300px';
const LG_MEDIA_QUERY = {
  below: '@media (max-width: 1000px)',
  above: '@media (min-width: 1001px)',
};

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    maxWidth: NFT_PAGE_MAX_WIDTH,
  },
  nfts: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    [LG_MEDIA_QUERY.below]: {
      flexDirection: 'column',
    },
    [LG_MEDIA_QUERY.above]: {
      flexDirection: 'row',
    },
  },
  dropdown: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    margin: '20px 0',
  },
}));

export default function NFTs() {
  const { unclaimedWinterNFTs, claimedWinterNFTs, unclaimedNFTs, claimedNFTs } =
    useSelector<AppState, AppState['nfts']>((state) => state.nfts);

  const classes = useStyles();

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
        The BeaNFT Genesis collection is a series of 2067 BeaNFTs which could
        only be minted by participating in Beanstalk during Seasons 1200 – 1800.{' '}
        <Link
          href={OPENSEA_LINK_GENESIS}
          target="blank"
          style={{ color: 'white' }}
        >
          OpenSea
        </Link>
        .&nbsp;
        <Link
          href={MEDIUM_NFT_GENESIS_LINK}
          target="blank"
          style={{ color: 'white' }}
        >
          Read More
        </Link>
        .
      </span>
      <span style={{ fontWeight: 'bold', display: 'flex' }}>
        BeaNFT Winter Collection:{' '}
      </span>
      <span>
        The BeaNFT Winter Collection is the second minting event for BeaNFTs and
        is a collection of 751 BeaNFTs which could only be earned by
        participating in Beanstalk from Season 3300 to 3900. The top 5 largest
        bean-denominated investments each Season (across the Silo and Field)
        were be awarded one Winter BeaNFT.{' '}
        <Link
          href={OPENSEA_LINK_COLLECTION}
          target="blank"
          style={{ color: 'white' }}
        >
          OpenSea
        </Link>
        .&nbsp;
        <Link
          href={MEDIUM_NFT_WINTER_LINK}
          target="blank"
          style={{ color: 'white' }}
        >
          Read More
        </Link>
        .
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
        <Box className={classes.container}>
          <NftStatsHeader />

          <Box className={classes.nfts}>
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
          </Box>

          <Box className={classes.dropdown}>
            <ContentDropdown
              description={description}
              descriptionTitle="What are BeaNFTs?"
              descriptionLinks={undefined}
              accordionStyles={undefined}
            />
          </Box>
        </Box>
      </ContentSection>
    </>
  );
}
