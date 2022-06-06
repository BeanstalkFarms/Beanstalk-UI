import React from 'react';
import {
  Box,
  Button, Stack,
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
    // <Stack sx={{ borderBottom: match ? 3 : null, borderColor: '#67b761', pt: 1.1, pb: 1.1 }}>
    <Stack sx={{
      borderBottom: match ? 3 : null,
      mb: match ? '-2px' : null, // or else selected text will raise 3px
      borderColor: '#67b761',
      height: '100%',
      justifyContent: 'center',

    }}>
      <Button
        disableRipple
        component={RouterLink}
        to={to}
        size="small"
        variant="text"
        color={match ? 'primary' : 'dark'}
        sx={{
          '&:hover > h6': {
            // textDecoration: match ? 'underline' : null,
            textDecorationThickness: '2px',
          },
          minWidth: 0,
          px: 1.5,
          display: 'inline-flex',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            display: 'inline-block',
            // textDecoration: match ? 'underline' : null,
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
    </Stack>
  );
};

export default NavButton;
