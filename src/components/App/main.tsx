import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import Snowfall from 'react-snowfall';
import Footer from 'components/About/Footer';
import { FallingLeaves } from 'components/Fall';
import { theme } from 'constants/index';
import './index.tsx';
import 'components/Themes/winterApp.css';

function BarnBeanstalk() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

  const increment = (c) => (c) % 5 + 1;

  const timer = useRef();
  const [count, setCount] = useState(increment(1));

  useEffect(() => {
    if (width > 500 && theme.name === 'winter') {
      timer.current = window.setInterval(() => {
        setCount(increment(count));
      }, 750);
      return () => {
        window.clearInterval(timer.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (theme.name === 'winter') {
    return (
      <>
        <Box className={`BG${count}`} name={theme.name} />
        <Box className={`B${count}`} name={theme.name} />
      </>
    );
  }
  return <Box className="BeanstalkBG" name={theme.name} />;
}

export default function Main(props) {
  document.body.style.backgroundColor = theme.bodyBackground;

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
    zIndex: -101,
  };

  return (
    <>
      <Box className="App">
        <BarnBeanstalk />
        <Box className="BeanstalkMT" name={theme.name} style={{ top: 'calc(28vh - 2vw)' }} />
        <Box className="BeanstalkSky" name={theme.name} />
        {theme.name === 'winter'
          ? <Snowfall
              snowflakeCount={200}
              speed={[0, 0.5]}
              wind={[-0.5, 0.5]}
              style={{ position: 'fixed' }}
            />
          : null
        }
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
