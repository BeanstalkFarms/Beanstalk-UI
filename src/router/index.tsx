import React from 'react';
import { Switch, Route } from 'react-router-dom';

const Routing: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/">
        <App />
      </Route>
      <Route exact path="/silo">
        <Silo />
      </Route>
    </Switch>
  );
};

export default Routing;
