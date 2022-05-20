import React from 'react';
import { Box } from '@mui/material';
import { theme } from 'constants/index';
import Footer from 'components/About/Footer';
import './index.tsx';

function Barn() {
  return (
    <>
      <div
        className="BeanstalkBG"
        name={theme.name}
      />
      <div
        className="Barn"
        name={theme.name}
        style={{ bottom: theme.barnHeight, left: '0px' }}
      />
    </>
  );
}

export default function PageBackground() {
  document.body.style.backgroundColor = theme.bodyBackground; // FIXME
  return (
    <div>
      <Box>
        {/* Blur */}
        <Box sx={{
          background: 'rgba(255,255,255,0.1)',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }} />
        {/* Barn (bottom left corner) */}
        <Barn />
        {/* "mountain" in background */}
        <div
          className="BeanstalkMT"
          name={theme.name}
        />
        {/* Sky */}
        <div
          className="BeanstalkSky"
          name={theme.name}
        />
        {/* Sun (top left corner) */}
        {/* <img alt="" src={theme.sun} style={sunStyle} /> */}
        {/* {!theme.rainbow ? null : <img alt="" src={theme.rainbow} style={rainbowStyle} />} */}
      </Box>
      <Box
        sx={{
          backgroundColor: 'transparent',
          backgroundImage: `url(${theme.ground})`,
          backgroundPosition: '0% 0%',
          backgroundRepeat: 'repeat',
          backgroundSize: theme.groundSize,
          display: 'flex',
          alignContent: 'space-around',
          height: theme.groundHeight,
          width: '100%',
          zIndex: 11,
          paddingTop: !theme.groundPaddingTop ? '0px' : theme.groundPaddingTop,
          position: 'fixed',
          bottom: 0,
          left: 0,
        }}
      />
      {/* <Footer /> */}
    </div>
  );
}
