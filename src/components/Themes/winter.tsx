import React, { useRef, useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SnowmanIcon from 'img/winter/Snowman.svg';
import land from 'img/winter/land.svg';
import Barn1 from 'img/winter/Barn-1.svg';
import Barn2 from 'img/winter/Barn-2.svg';
import Barn3 from 'img/winter/Barn-3.svg';
import Barn4 from 'img/winter/Barn-4.svg';
import Barn5 from 'img/winter/Barn-5.svg';
import { theme } from 'constants/index';
import 'components/App/App.css';

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
  const width = window.innerWidth;

  const barnStyle = {
    bottom: theme.groundItemHeight,
    height: '16vw',
    left: 10,
    minHeight: '95px',
    position: 'fixed',
    zIndex: -1,
  };
  const miscStyle =
    width > 750
      ? {
          bottom: '72px',
          height: '6vw',
          maxHeight: '120px',
          left: 'calc(65px + 5vw)',
          minHeight: '5px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };

  const imgUrl = [
    Barn1,
    Barn2,
    Barn3,
    Barn4,
    Barn5,
  ];

  const increment = (c) => {
    if (c === 5) {
      return c - 4;
    }
    return c + 1;
  };

  const timer = useRef();
  const [count, setCount] = useState(increment(1));

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setCount(increment(count));
    }, 1000);
    return () => {
      window.clearInterval(timer.current);
    };
  }, [count]);

  function SwitchBarn(t) {
    return (
      <img alt="Barn Icon" src={imgUrl[t - 1]} style={barnStyle} />
    );
  }

  return (
    <>
      <Grid container className={classes.topGround} justifyContent="center" />
      {SwitchBarn(count)}
      <img alt="Snowman Icon" src={SnowmanIcon} style={miscStyle} />
      {props.children}
    </>
  );
}
