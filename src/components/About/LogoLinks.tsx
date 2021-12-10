import React from 'react';
import { Link, Grid } from '@material-ui/core';
import { theme } from 'constants/index';

export default function LogoLinks(props) {
  const linkStyle = {
    padding: theme.footerPadding,
    color: props.color,
  };
  const closeStyle = {
    padding: props.padding !== undefined ? props.padding : theme.footerPadding,
    paddingRight: props.paddingRight,
    paddingTop: props.paddingTop,
    color: props.color,
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
  paddingTop: '28px',
  color: 'inherit',
};
