import React from 'react';
import { useSelector } from 'react-redux';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AppState } from 'state';
import SnowmanIcon from 'img/winter/Snowman.svg';
import land from 'img/winter/land.svg';
import { theme } from 'constants/index';

export default function Winter(props) {
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
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const miscStyle =
    width > 750
      ? {
          bottom: '72px',
          height: '6vw',
          maxHeight: '120px',
          left: width < 800 ? 'calc(65px + 6vw)' : 'calc(65px + 6vw + 280px)',
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
      <img alt="Snowman Icon" src={SnowmanIcon} style={miscStyle} />
      {props.children}
    </>
  );
}
