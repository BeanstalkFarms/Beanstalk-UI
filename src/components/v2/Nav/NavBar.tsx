import React, { useState } from "react";
import { AppBar, Box, Button, IconButton, Link, Menu, MenuItem, Stack } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import ethIcon from 'img/eth-logo.svg';
import beanCircleIcon from 'img/bean-circle.svg';
import swapIcon from 'img/swap.svg';
import tempUserIcon from 'img/temp-user-icon.svg';
import { useMatch, useResolvedPath } from "react-router-dom";

const NAVIGATION_MAP = {
  top: [
    {
      path: '',
      title: 'Forecast',
    },
    {
      path: 'silo',
      title: 'Silo',
    },
    {
      path: 'field',
      title: 'Field',
    },
  ],
  more: [
    {
      path: 'governance',
      title: 'DAO',
    },
    {
      path: 'balances',
      title: 'Balances',
    },
    {
      path: 'analytics',
      title: 'Analytics',
    },
    {
      path: 'peg',
      title: 'Peg Maintenance',
    },
    {
      path: 'beanfts',
      title: 'BeaNFTs',
    },
    {
      path: 'about',
      title: 'About',
    },
  ],
};

const NavButton : React.FC<{ to: string; title: string }> = ({ to, title }) => {
  // const resolved = useResolvedPath(to);
  // const match = useMatch({ path: resolved.pathname, end: true });
  const match = to === "";
  return (
    <Button variant="text" color={match ? "primary" : "dark"}>
      {title}
    </Button>
  )
}

const MoreButton : React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <>
      <Button variant="text" color="dark" endIcon={<ArrowDropDownIcon />} onClick={handleClick}>
        More
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        // https://mui.com/material-ui/react-popover/#anchor-playground
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  )
}

const NavBar : React.FC<{}> = () => {
  //
  return (
    <AppBar sx={{ px: 1, py: 1 }}>
      <Stack direction="row" gap={1} alignItems="center">
        <Button
          color="light"
          startIcon={<img src={beanCircleIcon} alt="Bean" style={{ height: 25 }} />}
          endIcon={<ArrowDropDownIcon />}>
          $1.0031
        </Button>
        <Stack direction="row" sx={{ flex: 1 }} gap={0.5}>
          {NAVIGATION_MAP.top.map((item) => (
            <NavButton to={item.path} title={item.title} />
          ))}
          <MoreButton />
        </Stack>
        <IconButton color="light" variant="contained">
          <img src={swapIcon} alt="Swap" />
        </IconButton>
        <Button
          color="light"
          startIcon={<img src={ethIcon} alt="Bean" style={{ height: 25 }} />}
          endIcon={<ArrowDropDownIcon />}
        >
          Ethereum
        </Button>
        <Button
          color="light"
          startIcon={<img src={tempUserIcon} alt="User" style={{ height: 25 }} />}
        >
          0x1594a...0f5
        </Button>
      </Stack>
    </AppBar>
  );
}

export default NavBar;