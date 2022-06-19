import React from 'react';
import { MenuItem, Tooltip, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/** Use for mobile nav. */
const MobileNavItem: React.FC<{ to: string, title: string, onClick: () => void, disabled?: boolean, href?: string, small?: boolean }> =
  ({
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
       {disabled ? (
         <Tooltip title={<>{title} will be available upon Unpause</>}>
           <span>
             <Typography sx={{ fontSize: (small !== undefined && small) ? '18px' : '25px' }} variant="body1" color="text.secondary">{title}</Typography>
           </span>
         </Tooltip>
        ) : (
          <Typography sx={{ fontSize: (small !== undefined && small) ? '18px' : '25px' }} variant="body1" color="text.secondary">{title}</Typography>
        )}
       {href ? (
         <Typography variant="body2" color="text.secondary">
           <ArrowForwardIcon sx={{ transform: 'rotate(-45deg)', fontSize: (small !== undefined && small) ? 12 : 16 }} />
         </Typography>
        ) : null}
     </MenuItem>
    );

export default MobileNavItem;
