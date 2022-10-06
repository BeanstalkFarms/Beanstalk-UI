import React from 'react';
import {
  Button,
  ButtonProps, Card, Drawer,
  Menu,
  MenuList,
  Typography,
} from '@mui/material';

import useAnchor from '~/hooks/display/useAnchor';
import DropdownIcon from '~/components/Common/DropdownIcon';
import ROUTES from '~/components/Nav/routes';
import MenuItem from '../../Nav/MenuItem';

// -----------------------------------------------------------------

const MoreDropdown: React.FC<{ showFullText?: boolean; } & ButtonProps> = ({ ...props }) => {
  // Menu
  const [menuAnchor, toggleMenuAnchor] = useAnchor();
  const menuVisible = Boolean(menuAnchor);
  
  const menu = (
    <MenuList sx={{ zIndex: 3000 }} component={Card}>
      {ROUTES.market.map((item) => {
        if (item.path !== ROUTES.market[0].path) {
          return (
            <MenuItem key={item.path} item={item} onClick={toggleMenuAnchor} />
          );
        }
        return null;
      })}
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
        endIcon={<DropdownIcon open={menuVisible} />}
        {...props}
        onClick={toggleMenuAnchor}
        sx={props.sx}
      >
        <Typography variant="h4">
          More
        </Typography>
      </Button>
      {/* Mobile: Drawer */}
      <Drawer anchor="bottom" open={menuVisible} onClose={toggleMenuAnchor} sx={{ display: { xs: 'block', sm: 'none' } }}>
        {menu}
      </Drawer>
      {/* Popup Menu */}
      <Menu
        sx={{ display: { xs: 'none', sm: 'block' } }}
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
    </>
  );
};

export default MoreDropdown;
