import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';

import AccountBalances from './AccountBalances';
import Admin from './Admin';
import App from './App';
import Dashboard from './Dashboard';
import Post from './Post';
import Postings from './Postings';
import Profile from './Profile';
import Reconciliation from './Reconciliation';
import promisedComponent from './promisedComponent';

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false })

ReactDOM.render(
  <Router history={appHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Dashboard}/>

      <Route path="post" component={Post}/>
      <Route path="postings" component={promisedComponent(Postings)}/>
      <Route path="recon" component={promisedComponent(Reconciliation)}/>
      <Route path="balance" component={promisedComponent(AccountBalances)}/>

      <Route path="admin" component={Admin}/>
      <Route path="profile" component={Profile}/>
    </Route>
  </Router>,
  document.getElementById('app')
);
