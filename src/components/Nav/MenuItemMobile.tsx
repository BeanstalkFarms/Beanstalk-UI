import React from 'react';
import { MenuItem, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { RouteData } from './routes';

/** Use for mobile nav. */
const NavItemMobile: React.FC<{
  item: RouteData;
  onClick: () => void,
}> = ({
  item,
  onClick,
}) => (
  <MenuItem
    disabled={item.disabled}
    component={item.href ? 'a' : RouterLink}
    key={item.path}
    href={item.href ? item.href : undefined}
    target={item.href ? '_blank' : undefined}
    rel={item.href ? 'noreferrer' : undefined}
    to={item.href ? undefined : item.path}
    sx={{ minWidth: 250 }}
    onClick={onClick}
  >
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Typography sx={{ fontSize: item.small ? '18px' : '25px' }} variant="body1" color="text.secondary">
        {item.title}
      </Typography>
      {item.href ? (
        <Typography variant="body2" color="text.secondary">
          <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: item.small ? 12 : 16 }} />
        </Typography>
      ) : null}
    </Stack>
  </MenuItem>
);

export default NavItemMobile;
