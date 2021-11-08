import React from 'react';
import { Box } from '@material-ui/core';
import Footer from 'components/About/Footer';
import './index.tsx';
import { theme } from '../../constants';
import { FallingLeaves } from '../Fall';

export default function Main(props) {
  const navCloudStyle = {
    backgroundColor: 'transparent',
    backgroundImage: `url(${theme.cloud}), url(${theme.cloud})`,
    backgroundPosition: '0px 0px, 1px 0px',
    backgroundRepeat: 'repeat-x, repeat-x',
    boxShadow: 'none',
    zIndex: 2,
    backgroundSize: 'contain, contain',
    height: '85px',
    width: '100%',
    position: 'fixed',
    marginBottom: '-85px',
  };
  const sunStyle = {
    height: theme.sunHeight,
    left: 20,
    minHeight: '150px',
    position: 'fixed',
    top: 100,
    zIndex: -1,
  };

  return (
    <>
      <Box className="BeanstalkBG" name={theme.name} />
      <Box className="BeanstalkMT" name={theme.name} style={{ top: '35vh' }} />
      <Box>
        {theme.name === 'fall' ? <FallingLeaves /> : null}
        <img alt="Sun Icon" src={theme.sun} style={sunStyle} />
        <Box style={navCloudStyle} />
        {props.children}
        <Footer />
      </Box>
    </>
  );
}
