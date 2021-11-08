import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Silo from 'components/Silo';
import App from 'components/App';

const Routing: React.FC = () => (
  <Switch>
    <Route exact path="/">
      <App />
    </Route>
    <Route exact path="/silo">
      <Silo />
    </Route>
  </Switch>
);

export default Routing;
