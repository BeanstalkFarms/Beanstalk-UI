import React from 'react';
import { Button, Card, Stack, Typography } from '@mui/material';
import AddressIcon from '../Common/AddressIcon';
import { trimAddress } from '../../util';
import { getAccount } from '../../util/Account';

export interface WalletCardProps {
  address: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ address }) => (
  <Card sx={{ width: 'min-content' }}>
    <Stack direction="row" gap={0.3}>
      <Button
        disableFocusRipple
        variant="contained"
        color="light"
        startIcon={<AddressIcon address={address} />}
      >
        <Typography variant="subtitle1">
          {trimAddress(getAccount(address), true)}
        </Typography>
      </Button>
    </Stack>
  </Card>
);

export default WalletCard;
