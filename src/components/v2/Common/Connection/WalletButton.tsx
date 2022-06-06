import React, { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  useAccount,
  useDisconnect,
  useNetwork,
} from 'wagmi';
import {
  Box,
  Button,
  ButtonProps,
  Card,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import tempUserIcon from 'img/temp-user-icon.svg';
import { trimAddress } from 'util/index';
import { CHAIN_INFO } from 'constants/chains';

import { getAccount } from 'util/account';
import DropdownIcon from '../DropdownIcon';
import WalletDialog from './WalletDialog';

// -----------------------------------------------------------------

const WalletButton: React.FC<ButtonProps> = ({ ...props }) => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { disconnect } = useDisconnect();

  // Wallet Dialog
  const [showDialog, setShowDialog] = useState(false);
  const handleCloseDialog = useCallback(() => setShowDialog(false), []);
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));   // trim additional account text
  const isTiny = useMediaQuery('(max-width:380px)');              //      

  // Menu
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const menuVisible = Boolean(anchorEl);
  // const handleShowMenu = useCallback(
  //   (event: React.MouseEvent<HTMLButtonElement>) => {
  //     setAnchorEl(event.currentTarget);
  //   },
  //   []
  // );
  // const handleHideMenu = useCallback(() => {
  //   setAnchorEl(null);
  // }, []);

  const [open, setOpen] = useState(false);
  const handleShowMenu = useCallback(() => {
    setOpen(true);
  }, []);
  const handleHideMenu = useCallback(() => {
    setOpen(false);
  }, []);

  // Display: Connected
  if (account?.address && activeChain?.id) {
    const menu = (
      <MenuList sx={{ minWidth: 250 }}>
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
      </MenuList>
    );

    return (
      <>
        <Tooltip    
          components={{ Tooltip: Card }}
          title={menu}
          open={open}
          onOpen={handleShowMenu}
          onClose={handleHideMenu}
          enterTouchDelay={50}
          leaveTouchDelay={10000}
          placement="bottom-end"
          sx={{ marginTop: 10 }}
          componentsProps={{
            popper: {
              sx: {
                paddingTop: 0.5
              }
            }
          }}
        >
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
            endIcon={<DropdownIcon open={open} />}
            {...props}
          >
            <Typography variant="subtitle1">
              {trimAddress(getAccount(account.address), !isMedium)}
            </Typography>
          </Button>
        </Tooltip>
        {/* <Menu
          elevation={0}
          anchorEl={anchorEl}
          open={menuVisible}
          onClose={handleHideMenu}
          components={{
            // Root: Card
          }}
          MenuListProps={{
            sx: {
              // py: 0
            }
          }}
          disablePortal
          disableScrollLock
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
        </Menu> */}
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
        Connect<Box component="span" display={{ xs: 'none', md: 'inline' }}>&nbsp;Wallet</Box>
      </Button>
      <WalletDialog
        open={showDialog}
        handleClose={handleCloseDialog}
        fullScreen={isMedium}
      />
    </>
  );
};

export default WalletButton;
