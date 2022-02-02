import React from 'react';
import { theme } from 'constants/index';
import Fall from './fall';
import Spooky from './spooky';
import Winter from './winter';
import WinterUpgrade from './winterUpgrade';
// import Main from './main';
import MainUpgrade from './mainUpgrade';

export default function ThemeBackground() {
  let selectTheme = null;

  if (theme.name === 'fall') {
    selectTheme = <Fall />;
  } else if (theme.name === 'spooky') {
    selectTheme = <Spooky />;
  } else if (theme.name === 'winter') {
    selectTheme = <Winter />;
  } else if (theme.name === 'winterUpgrade') {
    selectTheme = <WinterUpgrade />;
  } else selectTheme = <MainUpgrade />;

  return selectTheme;
}
