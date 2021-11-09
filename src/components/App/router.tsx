import React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { CssBaseline, Box } from '@material-ui/core';
import { Switch, Route } from 'react-router-dom';
import Silo from 'components/Silo';
import App from 'components/App';
import theme from 'components/App/theme';
import Main from 'components/App/main';

const Routing: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />

    <Box className="App">
      <Main>
        <Switch>
          <Route exact path="/">
            <App />
          </Route>
          <Route exact path="/silo">
            <Silo />
          </Route>
        </Switch>
      </Main>
    </Box>
  </ThemeProvider>
);

export default Routing;
