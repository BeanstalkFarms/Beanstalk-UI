import React, { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from 'wagmi';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import tempUserIcon from 'img/temp-user-icon.svg';
import { trimAddress } from 'util/index';
import { CHAIN_INFO } from 'constants/chains';

import metamaskLogo from 'img/metamask-icon.png';
import walletConnectLogo from 'img/walletconnect-logo.svg';
import { StyledDialogTitle } from './Dialog';

// -----------------------------------------------------------------

const CONNECTOR_LOGOS : { [key: string] : string } = {
  MetaMask: metamaskLogo,
  'Coinbase Wallet': metamaskLogo,
  WalletConnect: walletConnectLogo,
};

const CONNECTION_ERRORS_TO_MESSAGES : { 
  [key: string] : (c?: Connector) => string } = {
  UserRejectedRequestError: () => 'The connection was cancelled while in progress. Try connecting again.',
  'Already processing eth_requestAccounts. Please wait.': (c) => `Connection already in progress. Try unlocking ${c?.name || 'your wallet'} to allow Beanstalk to connect.`,
};

// -----------------------------------------------------------------

const SelectWalletDialog: React.FC<{
  handleClose: () => void;
  open: boolean;
}> = ({ handleClose, open }) => {
  const { connect, connectors, error, isConnecting, pendingConnector } =
    useConnect({
      onConnect() {
        handleClose();
      }
    });
  const handleConnect = useCallback(
    (connector: Connector) => () => connect(connector),
    [connect]
  );
  return (
    <Dialog onClose={handleClose} open={open}>
      <StyledDialogTitle onClose={handleClose}>
        Connect a wallet
      </StyledDialogTitle>
      <Box sx={{ p: 2, pt: 0, width: '90vw', maxWidth: 400 }}>
        <Stack gap={1}>
          {connectors.map((connector) => (
            <Button
              variant="outlined"
              color="primary"
              key={connector.id}
              disabled={!connector.ready}
              onClick={handleConnect(connector)}
              sx={{
                py: 1
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                <Typography color="text.primary" sx={{ fontSize: 20 }}>
                  {isConnecting && (connector.id === pendingConnector?.id)
                    ? <CircularProgress variant="indeterminate" color="primary" size={20} />
                    : connector.name}
                </Typography>
                {CONNECTOR_LOGOS[connector.name] && (
                  <img src={CONNECTOR_LOGOS[connector.name]} alt="" style={{ height: 40 }} />
                )}
              </Stack>
            </Button>
          ))}
          {error && (
            <Alert severity="error">
              {CONNECTION_ERRORS_TO_MESSAGES[error.name || error.message](pendingConnector) || error.message}
            </Alert>
          )}
        </Stack>
      </Box>
    </Dialog>
  );
};

const WalletButton: React.FC = () => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { disconnect } = useDisconnect();

  // Wallet Dialog
  const [showDialog, setShowDialog] = useState(false);
  const handleCloseDialog = useCallback(() => setShowDialog(false), []);

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuVisible = Boolean(anchorEl);
  const handleShowMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );
  const handleHideMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Display: Connected
  if (account?.address && activeChain?.id) {
    return (
      <>
        <Button
          disableFocusRipple
          variant="contained"
          color="light"
          startIcon={<img src={tempUserIcon} alt="User" style={{ height: 25 }} />}
          endIcon={<ExpandMoreIcon />}
          onClick={handleShowMenu}
        >
          <Typography variant="subtitle1">
            {trimAddress(account.address)}
          </Typography>
        </Button>
        <Menu
          elevation={1}
          anchorEl={anchorEl}
          open={menuVisible}
          onClose={handleHideMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
            sx: {
              py: 0
            }
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
          sx={{
            mt: 0.5,
          }}
        >
          <Box sx={{ minWidth: 250 }}>
            <MenuItem
              component={RouterLink}
              to="/balances"
              onClick={handleHideMenu}
            >
              <ListItemText>Balances</ListItemText>
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to="/history"
              onClick={handleHideMenu}
            >
              <ListItemText>History</ListItemText>
            </MenuItem>
            <MenuItem
              component="a"
              href={`${CHAIN_INFO[activeChain.id].explorer}/address/${
                account.address
              }`}
              target="_blank"
              rel="noreferrer"
            >
              <Stack
                sx={{ width: '100%' }}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="body2" color="text.primary">
                  View on Etherscan
                </Typography>
                <ArrowForwardIcon
                  sx={{
                    transform: 'rotate(-45deg)',
                    fontSize: '1rem',
                    color: 'text.secondary',
                  }}
                />
              </Stack>
            </MenuItem>
            <MenuItem onClick={() => disconnect()}>Disconnect</MenuItem>
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
