import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider as StateProvider } from 'react-redux';
import { ThemeProvider } from '@material-ui/core/styles';

import store from 'state';
import App from 'components/App';
import ScrollToTop from 'components/Common/ScrollToTop';
import theme from 'components/App/muiTheme';

import './index.css';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <StateProvider store={store}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </StateProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
