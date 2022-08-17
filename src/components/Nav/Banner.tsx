import { Link, LinkProps } from '@mui/material';
import React from 'react';
import { FontSize } from '~/components/App/muiTheme';

const Banner : React.FC<LinkProps & { height: number }> = ({ height, children, ...props }) => (
  <Link
    target="_blank"
    rel="noreferrer"
    underline="none"
    sx={{
      color: '#333',
      fontSize: FontSize.sm,
      height,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      backgroundColor: 'white',
    }}
    {...props}
  >
    {children}
  </Link>
);

export default Banner;
