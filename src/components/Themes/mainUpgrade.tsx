import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import PlantsIcon from 'img/main/Planted.svg';
import FenceIcon from 'img/main/Fence.svg';
import ground from 'img/main/land.png';
import { theme } from 'constants/index';

export default function mainUpgrade(props) {
  const classes = makeStyles({
    topGround: {
      backgroundColor: 'transparent',
      backgroundImage: `url(${ground})`,
      backgroundPosition: '0% 0%',
      backgroundRepeat: 'repeat',
      backgroundSize: theme.groundSize,
      display: theme.groundGrass,
      alignContent: 'space-around',
      height: theme.groundHeight,
      zIndex: -2,
      position: 'fixed',
      bottom: '74px',
    },
  })();
  const width = window.innerWidth;

  const barnStyle = {
    bottom: theme.groundItemHeight,
    height: '15vw',
    left: 10,
    minHeight: '135px',
    position: 'fixed',
    zIndex: -1,
  };
  const itemStyle =
    width > 650
      ? {
          bottom: '80px',
          // height: '6vw',
          maxHeight: '20px',
          left: '20%',
          minHeight: '5px',
          position: 'fixed',
          zIndex: -2,
        }
      : {
          display: 'none',
        };
  const miscStyle =
    width > 750
      ? {
          bottom: '110px',
          height: '2vw',
          maxHeight: '30px',
          left: '18%',
          minHeight: '5px',
          position: 'fixed',
          zIndex: -2,
        }
      : {
          display: 'none',
        };

  return (
    <>
      <Grid container className={classes.topGround} justifyContent="center" />
      <img alt="Barn Icon" src={theme.barn} style={barnStyle} />
      <img alt="Barn Accent Icon" src={FenceIcon} style={miscStyle} />
      <img alt="Fence Icon" src={PlantsIcon} style={itemStyle} />
      {props.children}
    </>
  );
}
