import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider as StateProvider } from 'react-redux';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';

import store from 'state';
import App from 'components/App';
import ScrollToTop from 'components/Common/ScrollToTop';
import theme from 'components/App/muiTheme';

import './index.css';
import reportWebVitals from './reportWebVitals';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <StateProvider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </StyledEngineProvider>
      </StateProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
