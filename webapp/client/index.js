import React from 'react';
import ReactDOM from 'react-dom';

import AccountTypes from './modules/AccountTypes.jsx'
import Accounts from './modules/Accounts.jsx'

ReactDOM.render(
  <div>
    <AccountTypes/>
    <br/>
    <Accounts/>
  </div>,
  document.getElementById('app')
);
