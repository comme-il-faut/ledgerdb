import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';

import Admin from './modules/Admin.jsx'
import App from './modules/App.jsx'
import Dashboard from './modules/Dashboard.jsx'
import Post from './modules/Post.jsx'
import Postings from './modules/Postings.jsx'
import Profile from './modules/Profile.jsx'
import Reconciliation from './modules/Reconciliation.jsx'

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
