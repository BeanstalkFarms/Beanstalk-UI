import React from 'react';
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
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import tempUserIcon from 'img/interface/temp-user-icon.svg';
import { trimAddress } from 'util/index';
import { CHAIN_INFO } from 'constants/chains';

import { getAccount } from 'util/Account';
import useChainConstant from 'hooks/useChainConstant';

import balancesIcon from 'img/nav-icons/balances.svg';
import historyIcon from 'img/nav-icons/history.svg';
import etherscanIcon from 'img/nav-icons/etherscan.svg';
import disconnectIcon from 'img/nav-icons/disconnect.svg';
import { BeanstalkPalette } from '../../App/muiTheme';
import WalletDialog from './WalletDialog';
import DropdownIcon from '../DropdownIcon';
import PickBeansDialog from '../../Farmer/Unripe/PickDialog';
import useAnchor from 'hooks/display/useAnchor';
import useToggle from 'hooks/display/useToggle';
import AddressIcon from '../AddressIcon';

// -----------------------------------------------------------------

const WalletButton: React.FC<ButtonProps> = ({ ...props }) => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { disconnect } = useDisconnect();
  const chain = useChainConstant(CHAIN_INFO);

  // Theme
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));   // trim additional account text
  const isTiny = useMediaQuery('(max-width:380px)');              //

  // Menu
  const [menuAnchor, toggleMenuAnchor] = useAnchor();
  const menuVisible = Boolean(menuAnchor);

  // Dialog: Wallet
  const [selectingWallet, showWallets, hideWallets] = useToggle(); 

  // Dialog: Pick Unripe Beans 
  const [picking, showPick, hidePick] = useToggle(toggleMenuAnchor);

  // Display: Not Connected
  if (!account?.address || !activeChain?.id) {
    return (
      <>
        <Button
          variant="contained"
          color="light"
          {...props}
          onClick={showWallets}
        >
          Connect<Box component="span" display={{ xs: 'none', md: 'inline' }}>&nbsp;Wallet</Box>
        </Button>
        <WalletDialog
          open={selectingWallet}
          handleClose={hideWallets}
          fullScreen={isMedium}
        />
      </>
    );
  }

  const menu = (
    <MenuList sx={{ minWidth: 250 }} component={Card}>
      <MenuItem
        component={RouterLink}
        to="/balances"
        onClick={toggleMenuAnchor}
      >
        <ListItemText>
          <Stack direction="row" gap={1} alignItems="center">
            <img src={balancesIcon} alt="Balances" width={20} />
            Balances
          </Stack>
        </ListItemText>
      </MenuItem>
      <MenuItem
        component={RouterLink}
        to="/history"
        onClick={toggleMenuAnchor}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <img src={historyIcon} alt="History" width={20} />
          History
        </Stack>
      </MenuItem>
      <MenuItem
        component="a"
        href={`${chain.explorer}/address/${account.address}`}
        target="_blank"
        rel="noreferrer"
      >
        <Stack
          sx={{ width: '100%' }}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" gap={1} alignItems="center">
            <img src={etherscanIcon} alt="Etherscan" width={20} />
            <Typography variant="body2" color="text.primary">
              View on Etherscan
            </Typography>
          </Stack>
          <ArrowForwardIcon
            sx={{
              transform: 'rotate(-45deg)',
              fontSize: '1rem',
              color: 'text.secondary',
            }}
          />
        </Stack>
      </MenuItem>
      <MenuItem onClick={() => disconnect()}>
        <Stack direction="row" gap={1} alignItems="center">
          <img src={disconnectIcon} alt="Disconnect" width={20} />
          <Typography variant="body2" color="text.primary">
            Disconnect Wallet
          </Typography>
        </Stack>
      </MenuItem>
      <Box sx={{ px: 1, pt: 0.75, pb: 0.25 }}>
        <Button
          fullWidth
          onClick={showPick}
          sx={{
            py: 0.9,
            backgroundColor: BeanstalkPalette.brown,
            color: BeanstalkPalette.white,
            '&:hover': {
              backgroundColor: BeanstalkPalette.brown,
              opacity: 0.96
            }
          }}>
          <Stack direction="row" alignItems="center">
            <ListItemText>Pick Unripe Beans</ListItemText>
          </Stack>
        </Button>
      </Box>
    </MenuList>
  );

  // Connected
  return (
    <>
      {/* Wallet Button */}
      <Button
        disableFocusRipple
        variant="contained"
        color="light"
        startIcon={(
          isTiny
            ? null
            : process.env.REACT_APP_OVERRIDE_FARMER_ACCOUNT
            ? <WarningAmberIcon />
            : <AddressIcon address={account.address} />
        )}
        endIcon={<DropdownIcon open={menuVisible} />}
        {...props}
        onClick={toggleMenuAnchor}
      >
        <Typography variant="subtitle1">
          {trimAddress(getAccount(account.address), !isMedium)}
        </Typography>
      </Button>
      {/* Popup Menu */}
      <Menu
        elevation={0}
        anchorEl={menuAnchor}
        open={menuVisible}
        onClose={toggleMenuAnchor}
        MenuListProps={{
          sx: {
            py: 0,
            mt: 0,
          }
        }}
        disablePortal
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
          // mt: 0.5,
        }}
      >
        {menu}
      </Menu>
      {/* Pick Beans Dialog */}
      <PickBeansDialog
        open={picking}
        handleClose={hidePick}
      />
    </>
  );
};

export default WalletButton;
