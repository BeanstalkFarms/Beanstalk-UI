import React, { useCallback, useState } from 'react';
import { Box, IconButton, Menu, Stack, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { BeanstalkPalette } from 'components/App/muiTheme';

const TransactionSettings : React.FC = ({ children }) => {
  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuVisible = Boolean(anchorEl);
  const handleToggleMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    },
    [anchorEl]
  );
  const handleHideMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);
  
  return (
    <>
      <IconButton size="small" onClick={handleToggleMenu}>
        <SettingsIcon sx={{ fontSize: 20, transform: `rotate(${anchorEl ? 30 : 0}deg)`, transition: 'transform 150ms ease-in-out' }} />
      </IconButton>
      <Menu
        elevation={0}
        anchorEl={anchorEl}
        open={menuVisible}
        onClose={handleHideMenu}
        PaperProps={{
          sx: {
            backgroundColor: BeanstalkPalette.lightestBlue,
            borderWidth: 2,
            borderColor: 'secondary.main',
            borderStyle: 'solid',
            py: 0.5,
            px: 2,
          }
        }}
        // Align the menu to the bottom 
        // right side of the anchor button. 
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Stack gap={1}>
          <Typography>Transaction Settings</Typography>
          <Box>
            {children}
          </Box>
        </Stack>
      </Menu>
    </>
  );
};

export default TransactionSettings;
