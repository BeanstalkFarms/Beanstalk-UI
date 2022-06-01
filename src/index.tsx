import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { WagmiConfig } from 'wagmi';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import { setUseWhatChange } from '@simbathesailor/use-what-changed';

import store from 'state';
import App from 'components/v2/App';
import theme from 'components/v2/App/muiTheme';
import client from './util/wagmi';

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
    <HashRouter>
      <ReduxProvider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <WagmiConfig client={client}>
              <App />
            </WagmiConfig>
          </ThemeProvider>
        </StyledEngineProvider>
      </ReduxProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
