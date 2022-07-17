import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { WagmiConfig } from 'wagmi';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import store from 'state';
import theme from 'components/App/muiTheme';
import client from 'util/Client';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from 'graph/client';

const Wrapper: React.FC = ({ children }) => (
  <HashRouter>
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <WagmiConfig client={client}>{children}</WagmiConfig>
          </ThemeProvider>
        </StyledEngineProvider>
      </ApolloProvider>
    </ReduxProvider>
  </HashRouter>
);

export default Wrapper;
