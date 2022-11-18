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
import ROUTES, { RouteData } from '~/components/Nav/routes';
import MenuItem from '../../Nav/MenuItem';

// -----------------------------------------------------------------

import { FC } from '~/types';

const PercentDropdown: FC<{ showFullText?: boolean; options: string[]; selectedOption: string; setOption: any } & ButtonProps> = ({ ...props }) => {
  // Menu
  const [menuAnchor, toggleMenuAnchor] = useAnchor();
  const menuVisible = Boolean(menuAnchor);

  const menu = (
    <MenuList sx={{ zIndex: 3000 }} component={Card}>
      {props.options.map((option) => {
        const item: RouteData = { title: option, path: '#' };
        if (item.path !== ROUTES.market[0].path) {
          return (
            <MenuItem
              key={item.path}
              item={item}
              onClick={() => {
                toggleMenuAnchor();
                props.setOption(option);
              }}
              sx={{ minWidth: 'unset' }}
            />
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
      <Card sx={{ borderRadius: 0.4 }}>
        <Button
          disableFocusRipple
          variant="contained"
          color="light"
          endIcon={<DropdownIcon open={menuVisible} />}
          {...props}
          onClick={toggleMenuAnchor}
          sx={{
            minWidth: 'unset',
            ...props.sx
          }}
          size="small"
        >
          <Typography variant="caption">
            {props.selectedOption}
          </Typography>
        </Button>
      </Card>

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
        PaperProps={{
          sx: {
            width: 'fit-content'
          }
        }}
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

export default PercentDropdown;
