import React, { useCallback, useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Link as RouterLink,
} from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ROUTES from './routes';

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
        endIcon={<ArrowDropDownIcon />}
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
            component={RouterLink}
            key={item.path}
            to={item.path}
            sx={{ minWidth: 200 }}
          >
            {item.title}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default MoreButton;