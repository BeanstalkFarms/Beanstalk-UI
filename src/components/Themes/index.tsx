import React from 'react';
import MainUpgrade from './mainUpgrade';

// import { theme } from 'constants/index';
// import Fall from './fall';
// import Spooky from './spooky';
// import Winter from './winter';
// import WinterUpgrade from './winterUpgrade';

export default function ThemeBackground() {
  // let selectTheme = null;
  // if (theme.name === 'fall') {
  //   selectTheme = <Fall />;
  // } else if (theme.name === 'spooky') {
  //   selectTheme = <Spooky />;
  // } else if (theme.name === 'winter') {
  //   selectTheme = <Winter />;
  // } else if (theme.name === 'winterUpgrade') {
  //   selectTheme = <WinterUpgrade />;
  // } else selectTheme = <MainUpgrade />;
  return <MainUpgrade />;
}
