import React from 'react';
import ReactDOM from 'react-dom';
import { Theme } from '@mui/material/styles';

import App from '~/components/App';
import Wrapper from '~/components/App/Wrapper';

import './index.css';
import reportWebVitals from './reportWebVitals';

// @ts-ignore
// BigNumber.prototype.toJSON = function toJSON() {
//   return {
//     type: 'BigNumber.js',
//     // bignumber can rehydrate hex numbers with decimals
//     // 0x4.5c316a055757d5a9eb2 = 4.360129
//     hex: `0x${this.toString(16)}`,
//   };
// };
declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

if (import.meta.env.DEV) {
  const showErrorOverlay = (err: any) => {
    // must be within function call because that's when the element is defined for sure.
    const ErrorOverlay = customElements.get('vite-error-overlay');
    // don't open outside vite environment
    if (!ErrorOverlay) { return; }
    console.log(err);
    const overlay = new ErrorOverlay(err);
    document.body.appendChild(overlay);
  };
  window.addEventListener('error', ({ error }) => showErrorOverlay(error));
  window.addEventListener('unhandledrejection', ({ reason }) => showErrorOverlay(reason));
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
