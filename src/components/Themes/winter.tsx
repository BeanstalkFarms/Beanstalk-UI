import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SnowmanIcon from 'img/winter/Snowman.svg';
import land from 'img/winter/land.svg';
import { theme } from 'constants/index';

export default function mainUpgrade(props) {
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
  const width = window.innerWidth;

  const barnStyle = {
    bottom: theme.groundItemHeight,
    height: '12vw',
    left: 10,
    minHeight: '135px',
    position: 'fixed',
    zIndex: -1,
  };
  const miscStyle =
    width > 750
      ? {
          bottom: '72px',
          // height: '6vw',
          maxHeight: '70px',
          left: 'calc(70px + 3vw)',
          minHeight: '5px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };

  return (
    <>
      <Grid container className={classes.topGround} justifyContent="center" />
      <img alt="Barn Icon" src={theme.barn} style={barnStyle} />
      <img alt="Snowman Icon" src={SnowmanIcon} style={miscStyle} />
      {props.children}
    </>
  );
}
