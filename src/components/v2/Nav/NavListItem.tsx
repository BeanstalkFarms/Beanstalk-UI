import React from 'react';
import {
  ListItem,
  ListItemButton,
  Typography,
} from '@mui/material';
import {
  Link as RouterLink,
  useMatch,
  useResolvedPath,
} from 'react-router-dom';

const NavListItem : React.FC<{ to: string, title: string, onClick: () => void }> = ({ to, title, onClick }) => {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });
  return (
    <RouterLink to={to} style={{ textDecoration: 'none' }}>
      <ListItem disablePadding>
        <ListItemButton
          disableRipple
          onClick={onClick}
          color="primary"
          sx={{
            py: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 24,
              color: match ? 'text.primary' : 'text.secondary'
            }}
          >
            {title}
          </Typography>
        </ListItemButton>
      </ListItem>
    </RouterLink>
  );
};

export default NavListItem;
