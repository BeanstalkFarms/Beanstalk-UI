import React, { useState } from 'react';
import { Box, CircularProgress, Link, Stack, Tooltip, Typography } from '@mui/material';
import { BeanstalkPalette } from '../App/muiTheme';
import { ClaimStatus } from '../../util/BeaNFTs';
import { BASE_IPFS_LINK, BEANFT_GENESIS_ADDRESSES, BEANFT_WINTER_ADDRESSES } from '../../constants';

export interface NFTContentProps {
  collection: string;
  nft: any;
}

/** Maps an NFT collection to its ETH address. */
export const nftCollections: {[c: string]: string} = {
  Genesis: BEANFT_GENESIS_ADDRESSES[1],
  Winter: BEANFT_WINTER_ADDRESSES[1]
};

const NFTDetails: React.FC<NFTContentProps> = ({ nft, collection }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const isUnclaimed = nft.claimed === ClaimStatus.UNCLAIMED;
  console.log('COLLECTION: ', collection);
  return (
    <Stack gap={0.5} sx={{ width: '100%', aspectRatio: '1/1' }}>
      <Box display={loaded ? 'block' : 'none'}>
        <img
          onLoad={() => setLoaded(true)}
          src={`${BASE_IPFS_LINK}${nft.imageIpfsHash}`}
          alt=""
          width="100%"
          style={{ borderRadius: '7px' }}
        />
      </Box>
      {!loaded && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: '100%',
            aspectRatio: '1/1',
            borderRadius: '7px',
            backgroundColor: BeanstalkPalette.lightestBlue
          }}>
          <CircularProgress />
        </Stack>
      )}
      <Stack direction="row" alignItems="start" justifyContent="space-between">
        {isUnclaimed ? (
          <Tooltip title="Mint NFT to view it on Opensea!" placement="top-start">
            <Typography variant="h3">{`BeaNFT ${nft.id}`}</Typography>
          </Tooltip>

        ) : (
          <Box>
            <Typography variant="h3">
              <Link
                href={`https://opensea.io/assets/ethereum/${nftCollections[collection]}/${nft.id}`}
                target="_blank"
                underline="hover"
                color="inherit"
              >
                <span>{`BeaNFT ${nft.id}`}</span>
              </Link>
            </Typography>
          </Box>
        )}
        <Stack>
          <Typography variant="body1" color={BeanstalkPalette.lightishGrey}>BeaNFT {collection}</Typography>
          {nft.claimed === ClaimStatus.UNCLAIMED &&
          <Typography variant="bodySmall" textAlign="right" color={BeanstalkPalette.logoGreen}>Ready to
            mint
          </Typography>}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default NFTDetails;
