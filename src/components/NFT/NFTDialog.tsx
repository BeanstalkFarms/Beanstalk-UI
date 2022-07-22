import React from 'react';
import { Button, Dialog, Divider, Stack } from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import NFTDetails from './NFTDetails';
import { ClaimStatus } from '../../util/BeaNFTs';

export interface NFTDialogProps {
  handleDialogClose: any;
  dialogOpen: boolean;
  handleMint: any;
  address: string;
  nft: any;
}

const NFTDialog: React.FC<NFTDialogProps> = ({
  handleDialogClose,
  dialogOpen,
  handleMint,
  address,
  nft
}) => (
  <Dialog
    onClose={handleDialogClose}
    open={dialogOpen}
    // fullWidth
    fullScreen={false}
    // maxWidth={'xs'}
    sx={{ width: '400px' }}

    >
    <StyledDialogTitle onClose={handleDialogClose}>BeaNFT</StyledDialogTitle>
    <StyledDialogContent sx={{ px: 1, pb: 1 }}>
      <Stack gap={1}>
        <Stack gap={1}>
          <NFTDetails nft={nft} collection={nft.subcollection} />
        </Stack>
        <Divider />
        {/* FIXME: should be a LoadingButton */}
        <Button onClick={handleMint} disabled={nft.claimed === ClaimStatus.CLAIMED} sx={{ height: '45px' }}>
          {nft.claimed === ClaimStatus.CLAIMED ? 'Minted' : 'Mint'}
        </Button>
      </Stack>
    </StyledDialogContent>
  </Dialog>
  );

export default NFTDialog;
