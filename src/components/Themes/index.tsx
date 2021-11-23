// export { default as Fall } from './fall';
import React from 'react';
import { theme } from 'constants/index';
import Fall from './fall';
import Spooky from './spooky';
import Main from './main';

export default function ThemeBackground() {
  let selectTheme = null;

  if (theme.name === 'fall') {
    selectTheme = <Fall />;
  } else if (theme.name === 'spooky') {
    selectTheme = <Spooky />;
  } else selectTheme = <Main />;

  return selectTheme;
}
