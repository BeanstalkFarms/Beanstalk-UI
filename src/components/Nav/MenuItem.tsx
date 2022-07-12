import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ListItemText,
  MenuItem as MuiMenuItem,
  Stack, Tooltip,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { RouteData } from './routes';
import { FontSize, IconSize } from '../App/muiTheme';

const MenuItem : React.FC<{
  item: RouteData;
  onClick?: (event: React.MouseEvent<any>) => void;
}> = ({
  item,
  onClick,
}) => (
  <MuiMenuItem
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
    {item.disabled ? (
      <Tooltip title={<>{item.title} will be available upon Unpause</>}>
        <span>
          <Stack direction="row" gap={1} alignItems="center">
            {item.icon && <img src={item.icon} alt={item.title} width={IconSize.small} />}
            <Typography variant="body1">{item.title}</Typography>
          </Stack>
        </span>
      </Tooltip>
      ) : (
        <ListItemText>
          <Stack direction="row" gap={1} alignItems="center">
            {item.icon && <img src={item.icon} alt={item.title} width={IconSize.small} />}
            <Typography variant="body1">{item.title}</Typography>
          </Stack>
        </ListItemText>
      )}
    {item.href ? (
      <Typography variant="body2" color="text.secondary">
        <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: FontSize.base }} />
      </Typography>
      ) : null}
  </MuiMenuItem>
  );

export default MenuItem;
