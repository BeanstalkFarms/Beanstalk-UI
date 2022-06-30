import React, { useCallback, useState } from 'react';
import {
  Button,
  Card,
  MenuList,
  Tooltip,
  Typography,
} from '@mui/material';
import DropdownIcon from 'components/Common/DropdownIcon';
import ROUTES from '../routes';
import MenuItem from '../MenuItem';
import useToggle from 'hooks/display/useToggle';

const AnalyticsMenu: React.FC = () => {
  // Handlers
  const [open, show, hide] = useToggle();

  const menuContent = (
    <MenuList>
      {ROUTES.analytics.map((item) => (
        <MenuItem key={item.path} item={item} onClick={hide} />
      ))}
    </MenuList>
  );

  return (
    <Tooltip
      components={{ Tooltip: Card }}
      title={menuContent}
      open={open}
      onOpen={show}
      onClose={hide}
      enterTouchDelay={50}
      leaveTouchDelay={10000}
      placement="bottom-start"
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
        size="small"
        variant="text"
        color="dark"
        endIcon={<DropdownIcon open={open} />}
        sx={{
          px: 1.5,
          fontSize: '1rem',
          fontWeight: '400',
        }}
        className={open ? 'Mui-focusVisible' : ''}
      >
        <Typography variant="subtitle1">Analytics</Typography>
      </Button>
    </Tooltip>
  );
};

export default AnalyticsMenu;
