import React from 'react';
import { Link, Grid } from '@material-ui/core';
import { theme } from 'constants/index';

export default function LogoLinks(props) {
  const linkStyle = {
    padding: theme.footerPadding,
  };
  const closeStyle = {
    padding: theme.footerPadding,
    paddingRight: props.paddingRight,
  };

  return (
    <>
      <Grid item style={props.close ? closeStyle : linkStyle}>
        <Link href={props.link} color="inherit" target="blank">
          {props.children}
        </Link>
      </Grid>
    </>
  );
}

LogoLinks.defaultProps = {
  close: false,
  paddingRight: '7px',
};
