import React from 'react';
import { Card, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import NFTDetails from './NFTDetails';
import { BeanstalkPalette } from '../App/muiTheme';

export interface NFTGridProps {
  nfts: any[];
  handleDialogOpen: any;
}

const NFTGrid: React.FC<NFTGridProps> = ({
 nfts,
 handleDialogOpen,
}) => (
  <>
    {
      (nfts.length === 0) ? (
        <Box height={300} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>You don&apos;t have any NFTs from this collection!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ px: 3 }}>
          {nfts.map((nft, i) => (
            <Grid item md={4} xs={12}>
              <Card
                onClick={() => handleDialogOpen(nft)}
                sx={{
                  p: 1.5,
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

export default NFTGrid;
