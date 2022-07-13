import React from 'react';
import {
  Box, Button,
  Drawer,
  IconButton,
  List, ListItemText, Stack, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BeanstalkPalette } from 'components/App/muiTheme';
import ROUTES from './routes';
import MenuItemMobile from './MenuItemMobile';

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
    <Box sx={{ backgroundColor: '#f7fafe', width: '100%', height: '100vh', position: 'relative', pt: 1 }}>
      {/* Close Button */}
      <Box sx={{ position: 'absolute', top: 10, right: 2, p: 1, zIndex: 10 }}>
        <IconButton aria-label="close" onClick={hideDrawer}>
          <CloseIcon sx={{ color: BeanstalkPalette.black }} />
        </IconButton>
      </Box>
      {/* Items */}
      <List style={{ fontSize: 22 }}>
        {ROUTES.top.map((item) => (
          <MenuItemMobile
            key={item.path}
            item={item}
            onClick={hideDrawer}
          />
        ))}
        {ROUTES.more.map((item) => (
          <MenuItemMobile
            key={item.path}
            item={item}
            onClick={hideDrawer}
          />
        ))}
        {ROUTES.additional.map((item) => (
          <MenuItemMobile
            key={item.path}
            item={item}
            onClick={hideDrawer}
          />
        ))}
        <Box sx={{ px: 1, py: 0.6 }}>
          <Button
            fullWidth
            href="#"
            sx={{
              py: 1,
              fontSize: '25px',
              backgroundColor: BeanstalkPalette.babyBlue,
              color: BeanstalkPalette.black,
              fontWeight: 400,
              '&:hover': {
                backgroundColor: BeanstalkPalette.babyBlue,
                opacity: 0.8
              }
            }}>
            {/* FIXME: duplicate of the desktop version */}
            <Stack direction="row" alignItems="center">
              <ListItemText>Contract: 0X000...</ListItemText>
              <Typography variant="body1" color="text.secondary">
                <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: 16 }} />
              </Typography>
            </Stack>
          </Button>
        </Box>
      </List>
    </Box>
  </Drawer>
);

export default NavDrawer;
