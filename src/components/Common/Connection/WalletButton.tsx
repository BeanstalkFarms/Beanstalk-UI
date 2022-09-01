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
import gearIcon from '~/img/nav-icons/gear.svg';
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
import useGlobal from '~/hooks/app/useSettingsDialog';
import Row from '~/components/Common/Row';

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

  /// Dialog: Settings
  const [_, setSettingsOpen] = useGlobal('showSettings');

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
      <MenuItem onClick={() => {
        toggleMenuAnchor();
        setSettingsOpen(true);
      }}>
        <ListItemText>
          <Row gap={1}>
            <img src={gearIcon} alt="Settings" width={20} />
            <Typography variant="body1" color="text.primary">
              Settings
            </Typography>
          </Row>
        </ListItemText>
      </MenuItem>
      <MenuItem component={RouterLink} to="/history" onClick={toggleMenuAnchor}>
        <Row gap={1}>
          <img src={historyIcon} alt="History" width={20} />
          <Typography variant="body1" color="text.primary">
            History
          </Typography>
        </Row>
      </MenuItem>
      <MenuItem
        component="a"
        href={`${chain.explorer}/address/${account}`}
        target="_blank"
        rel="noreferrer"
      >
        <Row sx={{ width: '100%' }} justifyContent="space-between">
          <Row gap={1}>
            <img src={etherscanIcon} alt="Etherscan" width={20} />
            <Typography variant="body1" color="text.primary">
              View on Etherscan
            </Typography>
          </Row>
          <ArrowForwardIcon
            sx={{
              transform: 'rotate(-45deg)',
              fontSize: '1rem',
              color: 'text.secondary',
            }}
          />
        </Row>
      </MenuItem>
      <MenuItem onClick={() => disconnect()}>
        <Row gap={1}>
          <img src={disconnectIcon} alt="Disconnect" width={20} />
          <Typography variant="body1" color="text.primary">
            Disconnect Wallet
          </Typography>
        </Row>
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
          <Row>
            <Typography variant="h4">Pick Unripe Assets</Typography>
          </Row>
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
