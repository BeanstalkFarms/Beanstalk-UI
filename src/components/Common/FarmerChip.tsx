import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { IconSize } from 'components/App/muiTheme';
import AddressIcon from './AddressIcon';

const FarmerChip : React.FC<{ account: string }> = ({ account }) => (
  <Button
    size="small"
    variant="outlined"
    color="secondary"
    sx={{
      fontWeight: 400,
      color: 'text.primary'
    }}
    href={`https://etherscan.io/address/${account}`}
    target="_blank"
    rel="noreferrer"
  >
    <Stack direction="row" alignItems="center" gap={0.5}>
      <AddressIcon
        address={account}
        size={IconSize.small}
      />
      <Typography>
        {account.substring(0, 6)}
      </Typography>
    </Stack>  
  </Button>
);

export default FarmerChip;
