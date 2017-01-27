import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';

import Admin from './modules/Admin'
import App from './modules/App'
import Dashboard from './modules/Dashboard'
import Post from './modules/Post'
import Postings from './modules/Postings'
import Profile from './modules/Profile'
import Reconciliation from './modules/Reconciliation'

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false })

ReactDOM.render(
  <Router history={appHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Dashboard}/>

      <Route path="post" component={Post}/>
      <Route path="postings" component={Postings}/>
      <Route path="recon" component={Reconciliation}/>

      <Route path="admin" component={Admin}/>
      <Route path="profile" component={Profile}/>
    </Route>
  </Router>,
  document.getElementById('app')
);
