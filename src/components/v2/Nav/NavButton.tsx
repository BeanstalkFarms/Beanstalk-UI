import React from 'react';
import {
  Button,
  Typography,
} from '@mui/material';
import {
  Link as RouterLink,
  useMatch,
  useResolvedPath,
} from 'react-router-dom';

const NavButton: React.FC<{ to: string; title: string }> = ({ to, title }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  return (
    <Button
      disableRipple
      component={RouterLink}
      to={to}
      size="small"
      variant="text"
      color={match ? 'primary' : 'dark'}
      sx={{
        textDecoration: match ? 'underline' : null,
        '&:hover': {
          textDecoration: match ? 'underline' : null,
          textDecorationThickness: '2px',
        },
        textDecorationThickness: '2px',
        minWidth: 0,
        px: 1.5,
      }}
    >
      {' '}
      <Typography variant="subtitle1">{title}</Typography>
    </Button>
  );
};

export default NavButton;
