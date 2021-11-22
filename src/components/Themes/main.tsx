import React from 'react';
import { theme } from 'constants/index';

export default function Main(props) {
  const barnStyle = {
    bottom: theme.groundItemHeight,
    height: '15vw',
    left: 10,
    minHeight: '135px',
    position: 'fixed',
    zIndex: -1,
  };

  return (
    <>
      <img alt="Barn Icon" src={theme.barn} style={barnStyle} />
      {props.children}
    </>
  );
}
