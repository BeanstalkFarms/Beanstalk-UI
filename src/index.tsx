import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import { Provider } from 'wagmi';

import store from 'state';
import App from 'components/v2/App';
import ScrollToTop from 'components/Common/ScrollToTop';
import theme from 'components/v2/App/muiTheme';
import client from './util/wagmi';

import './index.css';
import reportWebVitals from './reportWebVitals';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <ScrollToTop />
      <ReduxProvider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider client={client}>
              <App />
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      </ReduxProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
