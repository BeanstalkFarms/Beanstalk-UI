import React from 'react';
import { theme } from 'constants/index';
import Fall from './fall';
import Spooky from './spooky';
import Winter from './winter';
import Main from './main';

export default function ThemeBackground() {
  let selectTheme = null;

  if (theme.name === 'fall') {
    selectTheme = <Fall />;
  } else if (theme.name === 'spooky') {
    selectTheme = <Spooky />;
  } else if (theme.name === 'winter') {
    selectTheme = <Winter />;
  } else selectTheme = <Main />;

  return selectTheme;
}
