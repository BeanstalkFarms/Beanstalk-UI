import React from 'react';
import { useSelector } from 'react-redux';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { AppState } from 'state';
import PlantsIcon from 'img/main/Planted.svg';
import FenceIcon from 'img/main/Fence.svg';
import land from 'img/main/land.svg';
import { theme } from 'constants/index';

const useStyles = makeStyles({
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
});

export default function MainUpgrade(props: any) {
  const classes = useStyles();

  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const itemStyle =
    width > 560
      ? {
          bottom: theme.groundItemHeight,
          height: '2.75vw',
          left: width < 800 ? 'calc(7% + 16vw)' : 'calc(7% + 16vw + 280px)',
          minHeight: '10px',
          position: 'fixed',
          zIndex: -12,
        }
      : {
          display: 'none',
        };
  const miscStyle =
    width > 560
      ? {
          bottom: 'calc(92px + 2vw)',
          height: '3vw',
          left: width < 800 ? 'calc(50px + 16vw)' : 'calc(50px + 16vw + 280px)',
          minHeight: '10px',
          position: 'fixed',
          zIndex: -12,
        }
      : {
          display: 'none',
        };

  return (
    <>
      <Grid container className={classes.topGround} justifyContent="center" />
      <img alt="Fence Icon" src={FenceIcon} style={miscStyle} />
      <img alt="Plants Icon" src={PlantsIcon} style={itemStyle} />
      {props.children}
    </>
  );
}
