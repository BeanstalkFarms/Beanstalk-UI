import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

import TurkeyIcon from 'img/fall/turkey.svg';
import FenceIcon from 'img/fall/fence-fall.svg';
import fallGround from 'img/fall/ground-grass.png';
import { theme } from 'constants/index';

export default function Fall(props) {
  const classes = makeStyles({
    topGround: {
      backgroundColor: 'transparent',
      backgroundImage: `url(${fallGround})`,
      backgroundPosition: '0% 0%',
      backgroundRepeat: 'repeat',
      backgroundSize: theme.groundSize,
      display: theme.groundGrass,
      alignContent: 'space-around',
      height: theme.groundHeight,
      zIndex: -2,
      position: 'fixed',
      bottom: '14px',
    },
  })();
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const itemStyle =
    width > 650
      ? {
          bottom: theme.groundItemHeight,
          height: '5vw',
          left: '80%',
          minHeight: '75px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };
  const rightItemStyle =
    width > 850
      ? {
          bottom: theme.groundItemHeight,
          height: '3vw',
          left: 'calc(80% + 4.4vw)',
          minHeight: '55px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };
  const miscStyle =
    width > 650
      ? {
          bottom: theme.groundItemHeight,
          height: '5vw',
          maxHeight: '100px',
          left: '60%',
          minHeight: '55px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };

  return (
    <>
      <Grid container className={classes.topGround} justifyContent="center" />
      <img alt="Fence Icon" src={FenceIcon} style={miscStyle} />
      <img alt="Turkey Icon" src={TurkeyIcon} style={itemStyle} />
      <img alt="Turkey Icon" src={TurkeyIcon} style={rightItemStyle} />
      {props.children}
    </>
  );
}
