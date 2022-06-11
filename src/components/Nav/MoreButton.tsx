import React, { useCallback, useState } from 'react';
import {
  Button,
  Card,
  ListItemText,
  MenuItem,
  MenuList,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Link as RouterLink,
} from 'react-router-dom';
import ROUTES from './routes';
import DropdownIcon from '../Common/DropdownIcon';

const MoreButton: React.FC = () => {
  // Handlers
  const [open, setOpen] = useState(false);
  const handleShowMenu = useCallback(() => {
    setOpen(true);
  }, []);
  const handleHideMenu = useCallback(() => {
    setOpen(false);
  }, []);

  const menu = (
    <MenuList>
      {ROUTES.more.map((item) => (
        <MenuItem
          disabled={item.disabled}
          component={item.href ? 'a' : RouterLink}
          key={item.path}
          href={item.href ? item.href : undefined}
          target={item.href ? '_blank' : undefined}
          rel={item.href ? 'noreferrer' : undefined}
          to={item.href ? undefined : item.path}
          sx={{ minWidth: 200 }}
          onClick={handleHideMenu}
        >
          {item.disabled ? (
            <Tooltip title={<>{item.title} will be available upon Unpause</>}>
              <span>
                <ListItemText>{item.title}</ListItemText>
              </span>
            </Tooltip>
          ) : (
            <ListItemText>{item.title}</ListItemText>
          )}
          {item.href ? (
            <Typography variant="body2" color="text.secondary">
              <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: 12 }} />
            </Typography>
          ) : null}
        </MenuItem>
      ))}
    </MenuList>
  );

  return (
    <Tooltip
      components={{ Tooltip: Card }}
      title={menu}
      onOpen={handleShowMenu}
      onClose={handleHideMenu}
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
        <Typography variant="subtitle1">More</Typography>
      </Button>
    </Tooltip>
  );
};

export default MoreButton;
