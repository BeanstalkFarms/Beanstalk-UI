import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@material-ui/core';
import Snowfall from 'react-snowfall';
import Footer from 'components/About/Footer';
import { FallingLeaves } from 'components/Fall';
import { theme } from 'constants/index';
import './index.tsx';
import './App.css';

export default function Main(props) {
  document.body.style.backgroundColor = theme.bodyBackground;

  const width = window.innerWidth;

  const navCloudStyle = {
    backgroundColor: 'transparent',
    backgroundImage: `url(${theme.cloud}), url(${theme.cloud})`,
    backgroundPosition: '0px 0px, 1px 0px',
    backgroundRepeat: 'repeat-x, repeat-x',
    boxShadow: 'none',
    zIndex: 2,
    backgroundSize: 'contain, contain',
    height: '90px',
    width: '100%',
    position: 'fixed',
    marginBottom: '-85px',
  };
  const sunStyle = {
    height: theme.sunHeight,
    left: theme.sunLeftPosition,
    minHeight: '150px',
    position: 'fixed',
    top: 100,
    zIndex: -11,
  };

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

  function switchBeanstalk(t) {
    if (theme.name === 'winter') {
      return (
        <Box className={`BG${t}`} name={theme.name} />
      );
    }
    return <Box className="BeanstalkBG" name={theme.name} />;
  }

  const mobileDisplay = width > 500
    ? (switchBeanstalk(count))
    : <Box className="BeanstalkBG" name={theme.name} />;

  return (
    <>
      <Box className="App">
        {mobileDisplay}
        <Box className="BeanstalkMT" name={theme.name} style={{ top: 'calc(28vh - 2vw)' }} />
        <Box className="BeanstalkSky" name={theme.name} />
        <Snowfall
          snowflakeCount={200}
          speed={[0, 0.5]}
          wind={[-0.5, 0.5]}
          style={{ position: 'fixed' }}
        />
        <Box>
          {theme.name === 'fall' ? <FallingLeaves /> : null}
          <img alt="Sun Icon" src={theme.sun} style={sunStyle} />
          <Box style={navCloudStyle} />
          {props.children}
          <Footer />
        </Box>
      </Box>
    </>
  );
}
