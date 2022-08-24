import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDisconnect, useNetwork , useAccount as useWagmiAccount } from 'wagmi';
import {
  Box,
  Button,
  ButtonProps,
  Card,
  Divider, Drawer,
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
import { IMPERSONATED_ACCOUNT, trimAddress } from '~/util';
import useChainConstant from '~/hooks/chain/useChainConstant';
import balancesIcon from '~/img/nav-icons/balances.svg';
import historyIcon from '~/img/nav-icons/history.svg';
import etherscanIcon from '~/img/nav-icons/etherscan.svg';
import disconnectIcon from '~/img/nav-icons/disconnect.svg';
import useAnchor from '~/hooks/display/useAnchor';
import useToggle from '~/hooks/display/useToggle';
import useAccount from '~/hooks/ledger/useAccount';
import { CHAIN_INFO } from '~/constants/chains';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import WalletDialog from './WalletDialog';
import DropdownIcon from '~/components/Common/DropdownIcon';
import PickBeansDialog from '~/components/Farmer/Unripe/PickDialog';
import AddressIcon from '~/components/Common/AddressIcon';

const WalletButton: React.FC<{ showFullText?: boolean; } & ButtonProps> = ({ ...props }) => {
  const account = useAccount();
  const { data: accountRaw } = useWagmiAccount();
  const { activeChain } = useNetwork();
  const { disconnect } = useDisconnect();
  const chain = useChainConstant(CHAIN_INFO);

  /// Theme
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down('md')); // trim additional account text

  /// Menu
  const [menuAnchor, toggleMenuAnchor] = useAnchor();
  const menuVisible = Boolean(menuAnchor);

  /// Dialog: Wallet
  const [selectingWallet, showWallets, hideWallets] = useToggle();

  /// Dialog: Pick Unripe Beans
  const [picking, showPick, hidePick] = useToggle(toggleMenuAnchor);

  /// Display: Not Connected
  if (!account || !activeChain?.id) {
    return (
      <>
        <Button
          variant="contained"
          color="primary"
          // color="light"
          {...props}
          onClick={showWallets}
        >
          Connect
          <Box component="span" display={{ xs: props.showFullText ? 'inline' : 'none', md: 'inline' }}>
            &nbsp;Wallet
          </Box>
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
            <Typography variant="body1" color="text.primary">
              Balances
            </Typography>
          </Stack>
        </ListItemText>
      </MenuItem>
      <MenuItem component={RouterLink} to="/history" onClick={toggleMenuAnchor}>
        <Stack direction="row" gap={1} alignItems="center">
          <img src={historyIcon} alt="History" width={20} />
          <Typography variant="body1" color="text.primary">
            History
          </Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        component="a"
        href={`${chain.explorer}/address/${account}`}
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
            <Typography variant="body1" color="text.primary">
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
          <Typography variant="body1" color="text.primary">
            Disconnect Wallet
          </Typography>
        </Stack>
      </MenuItem>
      <Divider sx={{ mx: 1 }} />
      <Box sx={{ px: 1, pb: 0.25 }}>
        <Button
          fullWidth
          onClick={showPick}
          sx={{
            py: 1.25,
            backgroundColor: BeanstalkPalette.lightBrown,
            color: BeanstalkPalette.brown,
            '&:hover': {
              backgroundColor: BeanstalkPalette.lightBrown,
              opacity: 0.94,
            },
          }}
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="h4">Pick Unripe Assets</Typography>
          </Stack>
        </Button>
      </Box>
      <Box sx={{ px: 1, pt: 0.75, pb: 0.25 }}>
        <Button
          fullWidth
          href="/#/chop"
          sx={{
            py: 1.25,
            backgroundColor: BeanstalkPalette.brown,
            color: BeanstalkPalette.white,
            '&:hover': {
              backgroundColor: BeanstalkPalette.brown,
              opacity: 0.96,
            },
          }}
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="h4">Chop Unripe Assets</Typography>
          </Stack>
        </Button>
      </Box>
    </MenuList>
  );

  /// Connected
  return (
    <>
      {/* Wallet Button */}
      <Button
        disableFocusRipple
        variant="contained"
        color="light"
        startIcon={<AddressIcon address={account} />}
        endIcon={<DropdownIcon open={menuVisible} />}
        {...props}
        onClick={toggleMenuAnchor}
        sx={import.meta.env.VITE_OVERRIDE_FARMER_ACCOUNT ? {
          borderBottomColor: 'red',
          borderBottomWidth: 2,
          borderBottomStyle: 'solid',
          ...props.sx,
        } : props.sx}
      >
        <Typography variant="bodyMedium" display={{ xs: 'none', sm: 'block' }}>
          {/* Use `accountRaw` to match capitalization of wallet provider
            * assert existence of accountRaw.address since we check `account` prior. */}
          {trimAddress(IMPERSONATED_ACCOUNT || accountRaw?.address || '')}
        </Typography>
      </Button>
      {/* Mobile: Drawer */}
      <Drawer anchor="bottom" open={menuVisible} onClose={toggleMenuAnchor} sx={{ display: { xs: 'block', lg: 'none' } }}>
        {menu}
      </Drawer>
      {/* Popup Menu */}
      <Menu
        sx={{ display: { xs: 'none', lg: 'block' } }}
        elevation={0}
        anchorEl={menuAnchor}
        open={menuVisible}
        onClose={toggleMenuAnchor}
        MenuListProps={{
          sx: {
            py: 0,
            mt: 0,
          },
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
