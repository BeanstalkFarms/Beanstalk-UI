import React from 'react';
import { Button, Dialog, Divider, Stack } from '@mui/material';
import { StyledDialogContent, StyledDialogTitle } from '../Common/Dialog';
import NFTDetails from './NFTDetails';
import WalletCard from './WalletCard';

export interface NFTDialogProps {
  handleDialogClose: any;
  dialogOpen: boolean;
  address: string;
}

const NFTDialog: React.FC<NFTDialogProps> = ({
  dialogOpen,
  handleDialogClose,
  address
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
          <NFTDetails />
          <WalletCard address={address} />
        </Stack>
        <Divider />
        {/* FIXME: should be a LoadingButton */}
        <Button>Mint</Button>
      </Stack>
    </StyledDialogContent>
  </Dialog>
  );

export default NFTDialog;
