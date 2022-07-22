import React from 'react';
import { Card, CircularProgress, Grid, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Nft } from 'util/BeaNFTs';
import NFTDetails from './NFTDetails';
import { BeanstalkPalette } from '../App/muiTheme';

export interface NFTGridProps {
  nfts: Nft[] | null;
  handleDialogOpen: any;
}

const NFTGrid: React.FC<NFTGridProps> = ({
 nfts,
 handleDialogOpen,
}) => {
  if (nfts === null) {
    return (
      <Stack width="100%" height={300} alignItems="center" justifyContent="center">
        <CircularProgress variant="indeterminate" />
      </Stack>
    );
  }

  return (
    <>
      {
        (nfts.length === 0) ? (
          <Box height={300} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>You don&apos;t have any NFTs from this collection!</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {nfts.map((nft) => (
              <Grid key={nft.id} item md={4} xs={12}>
                <Card
                  onClick={() => handleDialogOpen(nft)}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: BeanstalkPalette.hoverBlue,
                      opacity: 0.95
                    }
                  }}>
                  <NFTDetails
                    collection={nft.subcollection}
                    nft={nft}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      }
    </>
  );
};

export default NFTGrid;
