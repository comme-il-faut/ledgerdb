import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import App from './App';
import ErrorBoundary from './ErrorBoundary';

ReactDOM.render((
  <HashRouter>
    <ErrorBoundary>
      <App/>
    </ErrorBoundary>
  </HashRouter>
), document.getElementById('app'));
