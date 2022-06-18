import React from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import ROUTES from './routes';
import NavListItem from './NavListItem';

const NavDrawer: React.FC<{
  open: boolean;
  hideDrawer: () => void;
}> = ({
  open,
  hideDrawer
}) => (
  <Drawer
    anchor="bottom"
    open={open}
    onClose={hideDrawer}
    sx={{ height: '100vh' }}
    transitionDuration={0}
  >
    <Box sx={{ backgroundColor: 'white', width: '100%', height: '100vh', position: 'relative' }}>
      {/* Close Button */}
      <Box sx={{ position: 'absolute', top: 4, right: 4, p: 1, zIndex: 10 }}>
        <IconButton aria-label="close" onClick={hideDrawer}>
          <CloseIcon />
        </IconButton>
      </Box>
      {/* Items */}
      <List style={{ fontSize: 22 }}>
        {ROUTES.top.map((item) => (
          <NavListItem
            key={item.path}
            to={item.path}
            title={item.title}
            onClick={hideDrawer}
          />
        ))}
        {ROUTES.analytics.map((item) => (
          <NavListItem
            key={item.path}
            to={item.path}
            title={item.title}
            // href={item.href}
            onClick={hideDrawer}
            disabled={item.disabled}
          />
        ))}
        {ROUTES.more.map((item) => (
          <NavListItem
            key={item.path}
            to={item.path}
            title={item.title}
            href={item.href}
            onClick={hideDrawer}
            disabled={item.disabled}
          />
        ))}
      </List>
    </Box>
  </Drawer>
);

export default NavDrawer;
