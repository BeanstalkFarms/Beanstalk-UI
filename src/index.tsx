import React from 'react';
import ReactDOM from 'react-dom';
import { Theme } from '@mui/material/styles';
import { setUseWhatChange } from '@simbathesailor/use-what-changed';

import App from 'components/App';
import Wrapper from 'components/App/Wrapper';

import './index.css';
import reportWebVitals from './reportWebVitals';

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
