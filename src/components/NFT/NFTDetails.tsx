import React, { useState } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { BeanstalkPalette } from '../App/muiTheme';
import { ClaimStatus } from '../../util/BeaNFTs';
import { BASE_IPFS_LINK } from '../../constants';

export interface NFTContentProps {
  collection: string;
  nft: any;
}

const NFTDetails: React.FC<NFTContentProps> = ({ nft, collection }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  return (
    <Stack gap={1} sx={{ width: '100%', aspectRatio: '1/1' }}>
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
        <Typography variant="h3">{`BeaNFT ${nft.id}`}</Typography>
        <Stack>
          <Typography color={BeanstalkPalette.lightishGrey}>BeaNFT {collection}</Typography>
          {nft.claimed === ClaimStatus.UNCLAIMED &&
          <Typography fontSize="14px" textAlign="right" color={BeanstalkPalette.logoGreen}>Ready to
            mint
          </Typography>}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default NFTDetails;
