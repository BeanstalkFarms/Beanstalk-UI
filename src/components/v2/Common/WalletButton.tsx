import React, { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Connector, useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi';
import { Box, Button, Dialog, Divider, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material';
import tempUserIcon from 'img/temp-user-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { trimAddress } from 'util/index';
import { CHAIN_INFO } from 'constants/chains';

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
  const { activeChain } = useNetwork();
  const { disconnect } = useDisconnect();

  // Wallet Dialog
  const [showDialog, setShowDialog] = useState(false);
  const handleCloseDialog = useCallback(() => setShowDialog(false), []);

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuVisible = Boolean(anchorEl);
  const handleShowMenu = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleHideMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Display: Connected
  if (account?.address && activeChain?.id) {
    return (
      <>
        <Button
          variant="contained"
          color="light"
          startIcon={<img src={tempUserIcon} alt="User" style={{ height: 25 }} />}
          onClick={handleShowMenu}
        >
          {trimAddress(account.address)}
        </Button>
        <Menu
          elevation={1}
          anchorEl={anchorEl}
          open={menuVisible}
          onClose={handleHideMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          // https://mui.com/material-ui/react-popover/#anchor-playground
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ minWidth: 250 }}>
            <MenuItem component={RouterLink} to="/balances" onClick={handleHideMenu}>
              <ListItemText>
                Balances
              </ListItemText>
            </MenuItem>
            <MenuItem component={RouterLink} to="/history" onClick={handleHideMenu}>
              <ListItemText>
                History
              </ListItemText>
            </MenuItem>
            <MenuItem component="a" href={`${CHAIN_INFO[activeChain.id].explorer}/address/${account.address}`} target="_blank" rel="noreferrer">
              <Stack sx={{ width: '100%' }} direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.primary">
                  View on Etherscan
                </Typography>
                <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: '1rem', color: 'text.secondary' }} />
              </Stack>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => disconnect()}>
              Disconnect
            </MenuItem>
          </Box>
        </Menu>
      </>
    );
  }

  // Display: Not Connected
  return (
    <>
      <Button
        variant="contained"
        color="light"
        onClick={() => setShowDialog(true)}
      >
        Connect Wallet
      </Button>
      <SelectWalletDialog
        open={showDialog}
        handleClose={handleCloseDialog}
      />
    </>
  );
};

export default WalletButton;
