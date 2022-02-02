import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import land from 'img/winter/land.svg';
import { theme } from 'constants/index';

export default function WinterUpgrade(props) {
  const classes = makeStyles({
    topGround: {
      backgroundColor: 'transparent',
      backgroundImage: `url(${land})`,
      backgroundPosition: '0% 0%',
      backgroundRepeat: 'no-repeat',
      backgroundSize: theme.groundSize,
      display: theme.groundGrass,
      alignContent: 'space-around',
      height: theme.landHeight,
      zIndex: -11,
      position: 'fixed',
      bottom: '24px',
    },
  })();

  return (
    <>
      <Grid container className={classes.topGround} justifyContent="center" />
      {props.children}
    </>
  );
}
