import React, { useState } from 'react';
import { Box } from '@mui/material';
import { BASE_IPFS_LINK, BEANFT_GENESIS_ADDRESSES, BEANFT_WINTER_ADDRESSES } from '../../constants';

export interface NFTContentProps {
  nft: any;
}

/** Maps an NFT collection to its ETH address. */
export const nftCollections: {[c: string]: string} = {
  Genesis: BEANFT_GENESIS_ADDRESSES[1],
  Winter: BEANFT_WINTER_ADDRESSES[1]
};

const NFTImage: React.FC<NFTContentProps> = ({
  nft,
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  return (
    <>
      <Box display={loaded ? 'block' : 'none'}>
        <img
          onLoad={() => setLoaded(true)}
          src={`${BASE_IPFS_LINK}${nft.imageIpfsHash}`}
          alt=""
          width="100%"
          style={{ display: 'block', borderRadius: '7px', aspectRatio: '1/1' }}
        />
      </Box>
      {/* {!loaded && (
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
      )} */}
    </>
  );
};

export default NFTImage;
