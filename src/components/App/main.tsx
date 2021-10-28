import React from 'react';
import { Box } from '@material-ui/core';
import Footer from 'components/About/Footer';
import './index.tsx';
import { theme } from '../../constants';

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
    height: '15vw',
    left: 20,
    maxHeight: '125px',
    position: 'fixed',
    top: 100,
    zIndex: -1,
  };

  return (
    <>
      <Box className="BeanstalkBG" name={theme.name} />
      <Box>
        <img alt="Sun Icon" src={theme.sun} style={sunStyle} />
        <Box style={navCloudStyle} />
        {props.children}
        <Footer />
      </Box>
    </>
  );
}
