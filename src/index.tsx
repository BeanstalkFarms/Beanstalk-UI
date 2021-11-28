import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Provider as StateProvider } from 'react-redux';
import store from 'state';
import App from './components/App';
import './index.css';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <StateProvider store={store}>
        <Switch>
          <Route path="/">
            <App />
          </Route>
        </Switch>
      </StateProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
