import React from 'react';
import { MenuItem, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/** Use for mobile nav. */
const NavItemMobile: React.FC<{
  to: string,
  title: string,
  onClick: () => void,
  disabled?: boolean,
  href?: string,
  small?: boolean
}> = ({
  to,
  title,
  onClick,
  disabled,
  href,
  small
}) => (
  <MenuItem
    disabled={disabled}
    component={href ? 'a' : RouterLink}
    key={to}
    href={href}
    target={href ? '_blank' : undefined}
    rel={href ? 'noreferrer' : undefined}
    to={href ? undefined : to}
    sx={{ minWidth: 200 }}
    onClick={onClick}
  >
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Typography sx={{ fontSize: small ? '18px' : '25px' }} variant="body1" color="text.secondary">
        {title}
      </Typography>
      {href ? (
        <Typography variant="body2" color="text.secondary">
          <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: small ? 12 : 16 }} />
        </Typography>
      ) : null}
    </Stack>
  </MenuItem>
);

export default NavItemMobile;
