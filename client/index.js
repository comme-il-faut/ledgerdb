import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';

import Accounts from './src/Accounts'
import Admin from './src/Admin'
import App from './src/App'
import Dashboard from './src/Dashboard'
import Post from './src/Post'
import Postings from './src/Postings'
import Profile from './src/Profile'
import Reconciliation from './src/Reconciliation'

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false })

ReactDOM.render(
  <Router history={appHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Dashboard}/>

      <Route path="post" component={Post}/>
      <Route path="postings" component={Postings}/>
      <Route path="recon" component={Reconciliation}/>
      <Route path="accounts" component={Accounts}/>

      <Route path="admin" component={Admin}/>
      <Route path="profile" component={Profile}/>
    </Route>
  </Router>,
  document.getElementById('app')
);
