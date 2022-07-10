import React from 'react';
import { Stack, Typography } from '@mui/material';
import { BeanstalkPalette } from '../App/muiTheme';
import { ClaimStatus } from '../../util/BeaNFTs';
import { BASE_IPFS_LINK } from '../../constants';

export interface NFTContentProps {
  collection: string;
  nft: any;
}

const NFTDetails: React.FC<NFTContentProps> = ({ nft, collection }) => (
  <Stack gap={1}>
    <img src={`${BASE_IPFS_LINK}${nft.imageIpfsHash}`} alt="" width="100%" style={{ borderRadius: '7px' }} />
    <Stack direction="row" alignItems="start" justifyContent="space-between">
      <Typography variant="h3">{`BeaNFT ${nft.id}`}</Typography>
      <Stack>
        <Typography color={BeanstalkPalette.lightishGrey}>BeaNFT {collection}</Typography>
        {nft.claimed === ClaimStatus.UNCLAIMED && <Typography fontSize="14px" textAlign="right" color={BeanstalkPalette.logoGreen}>Ready to mint</Typography>}
      </Stack>
    </Stack>
  </Stack>
  );

export default NFTDetails;
