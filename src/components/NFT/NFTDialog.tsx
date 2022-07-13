import React from 'react';
import { Button, Dialog, Divider, Stack } from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import NFTDetails from './NFTDetails';
import WalletCard from './WalletCard';
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
    fullWidth
    fullScreen={false}
    >
    <StyledDialogTitle onClose={handleDialogClose}>BeaNFT</StyledDialogTitle>
    <StyledDialogContent>
      <Stack gap={2}>
        <Stack gap={1}>
          <NFTDetails nft={nft} collection={nft.subcollection} />
          <WalletCard address={address} />
        </Stack>
        <Divider />
        {/* FIXME: should be a LoadingButton */}
        <Button onClick={handleMint} disabled={nft.claimed === ClaimStatus.CLAIMED}>Mint</Button>
      </Stack>
    </StyledDialogContent>
  </Dialog>
  );

export default NFTDialog;
