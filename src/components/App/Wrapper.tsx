import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { WagmiConfig } from 'wagmi';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';

import theme from '~/components/App/muiTheme';
import client from '~/util/Client';
import { apolloClient } from '~/graph/client';
import store from '~/state';
import { SDKProvider } from '~/components/App/SDKProvider';

const Wrapper: React.FC = ({ children }) => (
  <HashRouter>
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <WagmiConfig client={client}>
              <SDKProvider>
                {children}
              </SDKProvider>
            </WagmiConfig>
          </ThemeProvider>
        </StyledEngineProvider>
      </ApolloProvider>
    </ReduxProvider>
  </HashRouter>
);

export default Wrapper;
