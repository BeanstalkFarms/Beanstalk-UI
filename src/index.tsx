import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as StateProvider } from 'react-redux';
import store from 'state';
import App from './components/App';
import './index.css';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <StateProvider store={store}>
      <App />
    </StateProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
