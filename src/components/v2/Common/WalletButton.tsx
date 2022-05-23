import React, { useCallback, useState } from 'react';
import { Connector, useAccount, useConnect, useDisconnect } from 'wagmi';
import { Box, Button, Dialog, Stack } from '@mui/material';
import tempUserIcon from 'img/temp-user-icon.svg';
import { trimAddress } from 'util/index';

const SelectWalletDialog : React.FC = ({
  handleClose,
  open
}) => {
  const { connect, connectors, error, isConnecting, pendingConnector } = useConnect();
  const handleConnect = useCallback((connector: Connector) => () => {
      connect(connector);
      handleClose();
    }, [connect, handleClose]);
  return (
    <Dialog onClose={handleClose} open={open}>
      <Box sx={{ p: 2, minWidth: 340 }}>
        <Stack gap={1}>
          {connectors.map((connector) => (
            <Button
              size="large"
              key={connector.id}
              disabled={!connector.ready}
              variant="contained"
              color="secondary"
              onClick={handleConnect(connector)}
            >
              {connector.name}
              {!connector.ready && ' (unsupported)'}
              {isConnecting &&
                connector.id === pendingConnector?.id &&
                ' (connecting)'}
            </Button>
          ))}
        </Stack>
        {error && <div>{error.message}</div>}
      </Box>
    </Dialog>
  );
};

const WalletButton : React.FC = () => {
  const { data: account } = useAccount();
  const { disconnect } = useDisconnect();

  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);

  //
  if (account?.address) {
    return (
      <>
        <Button
          variant="contained"
          color="light"
          startIcon={<img src={tempUserIcon} alt="User" style={{ height: 25 }} />}
          onClick={() => disconnect()}
        >
          {trimAddress(account.address)}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color="light"
        onClick={() => setOpen(true)}
      >
        Connect Wallet
      </Button>
      <SelectWalletDialog
        open={open}
        handleClose={handleClose}
      />
    </>
  );
};

export default WalletButton;
