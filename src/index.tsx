import React from 'react';
import ReactDOM from 'react-dom';
import { Theme } from '@mui/material/styles';
import { setUseWhatChange } from '@simbathesailor/use-what-changed';

import App from 'components/App';
import Wrapper from 'components/App/Wrapper';

import './index.css';
import BigNumber from 'bignumber.js';
import reportWebVitals from './reportWebVitals';

// @ts-ignore
BigNumber.prototype.toJSON = function () {
  return {
    type: 'BigNumber.js',
    // bignumber can rehydrate hex numbers with decimals
    // 0x4.5c316a055757d5a9eb2 = 4.360129
    hex: `0x${this.toString(16)}`,
  };
};

// Debug
setUseWhatChange(process.env.NODE_ENV === 'development');

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

ReactDOM.render(
  <React.StrictMode>
    <Wrapper>
      <App />
    </Wrapper>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
