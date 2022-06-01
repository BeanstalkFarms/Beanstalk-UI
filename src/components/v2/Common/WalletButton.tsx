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
  ButtonProps,
  CircularProgress,
  Dialog,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import tempUserIcon from 'img/temp-user-icon.svg';
import { trimAddress } from 'util/index';
import { CHAIN_INFO } from 'constants/chains';
import { CONNECTION_ERRORS_TO_MESSAGES, CONNECTOR_LOGOS } from 'constants/v2/connectors';

import { getAccount } from 'util/account';
import { StyledDialogTitle } from './Dialog';
import DropdownIcon from './DropdownIcon';

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

const WalletButton: React.FC<ButtonProps> = ({ ...props }) => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { disconnect } = useDisconnect();

  // Wallet Dialog
  const [showDialog, setShowDialog] = useState(false);
  const handleCloseDialog = useCallback(() => setShowDialog(false), []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTiny = useMediaQuery('(max-width:380px)');

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
          startIcon={(
            isTiny
              ? null
              : process.env.REACT_APP_OVERRIDE_FARMER_ACCOUNT
              ? <WarningAmberIcon />
              : <img src={tempUserIcon} alt="User" style={{ height: 25 }} />
          )}
          endIcon={<DropdownIcon open={menuVisible} />}
          onClick={handleShowMenu}
          {...props}
        >
          <Typography variant="subtitle1">
            {trimAddress(getAccount(account.address), !isMobile)}
          </Typography>
        </Button>
        <Menu
          elevation={1}
          anchorEl={anchorEl}
          open={menuVisible}
          onClose={handleHideMenu}
          MenuListProps={{
            sx: {
              // py: 0
            }
          }}
          // Align the menu to the bottom 
          // right side of the anchor button. 
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            // Give some room between the WalletButton
            // and the popper when it's opened.
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
        {...props}
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
