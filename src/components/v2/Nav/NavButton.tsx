import React from 'react';
import {
  Box,
  Button,
  Typography,
} from '@mui/material';
import {
  Link as RouterLink,
  useMatch,
  useResolvedPath,
} from 'react-router-dom';

const NavButton: React.FC<{ to: string; title: string, tag?: string }> = ({ to, title, tag }) => {
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
        '&:hover > h6': {
          textDecoration: match ? 'underline' : null,
          textDecorationThickness: '2px',
        },
        minWidth: 0,
        px: 1.5,
        display: 'inline-flex',
        mb: 1,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          display: 'inline-block',
          textDecoration: match ? 'underline' : null,
          textDecorationThickness: '2px',
        }}
      >
        {title}
      </Typography>
      {tag && (
        <Box sx={{
          textDecoration: 'none !important',
          display: 'inline-block',
          ml: 1,
          backgroundColor: 'rgba(255,255,255,.9)',
          px: 1,
          borderRadius: 1,
          fontSize: '0.8em',
        }}>
          {tag}
        </Box>
      )}
    </Button>

  );
};

export default NavButton;
