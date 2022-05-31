import React, { useCallback, useState } from 'react';
import {
  Button,
  ListItemText,
  Menu,
  MenuItem,
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Handlers
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <>
      <Button
        size="small"
        variant="text"
        color="dark"
        endIcon={<DropdownIcon open={open} />}
        onMouseOver={handleClick}
        sx={{
          px: 1.5,
          fontSize: '1rem',
          fontWeight: '400',
        }}
        className={open ? 'Mui-focusVisible' : ''}
      >
        <Typography variant="subtitle1">More</Typography>
      </Button>
      <Menu
        id="basic-menu"
        elevation={1}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          onMouseLeave: handleClose,
          sx: {
            cursor: 'pointer',
          },
        }}
        // https://mui.com/material-ui/react-popover/#anchor-playground
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {ROUTES.more.map((item) => (
          <MenuItem
            disabled={item.disabled}
            component={item.href ? 'a' : RouterLink}
            key={item.path}
            href={item.href}
            target={item.href ? '_blank' : undefined}
            rel={item.href ? 'noreferrer' : undefined}
            to={item.href ? undefined : item.path}
            sx={{ minWidth: 200 }}
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
      </Menu>
    </>
  );
};

export default MoreButton;
