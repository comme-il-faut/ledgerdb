import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';

import AccountTypes from './modules/AccountTypes.jsx'
import Accounts from './modules/Accounts.jsx'
import Login from './modules/Login.jsx'

class App extends React.Component {

  constructor(props) {
    super(props);
    var auth = localStorage.getItem('auth');
    if (auth) {
      sessionStorage.auth = auth;
    }
    this.state = { auth: auth, err: null };
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  setAuth(auth) {
    sessionStorage.auth = auth;
    this.setState({ auth: auth });
  }

  handleLogOut() {
    localStorage.removeItem('auth');
    this.setState({ auth: null });
  }

  componentDidMount() {
    document.title = "LedgerDB";
  }

  render() {
    if (!this.state.auth) {
      return (
        <div className="container">
          <Login app={this}/>
        </div>
      );
    }
    return (
      <div className="container">
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container-fluid">
          <div className="navbar-header">
            {/*
            <button type="button"
                className="navbar-toggle"
                data-toggle="collapse"
                data-target="#navbar">
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>                        
            </button>
            */}
            {/* <a href="#" className="navbar-brand">LedgerDB</a> */}
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li><Link to="/">Overview</Link></li>
              <li><Link to="/account_types">Account Types</Link></li>
              <li><Link to="/accounts">Accounts</Link></li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li><a href="#" onClick={this.handleLogOut}>Log Out</a></li>
            {/*
<li><a href="#"><span className="glyphicon glyphicon-user"></span></a></li>
            */}
            </ul>
          </div>
          </div>
        </nav>
        {this.props.children}
      </div>
    )
  }

}

const appHistory = useRouterHistory(createHashHistory)({ queryKey: false })

ReactDOM.render(
  <Router history={appHistory}>
    <Route path="/" component={App}>
      {/* <IndexRoute component={Dashboard} /> */}
      <Route path="/account_types" component={AccountTypes}/>
      <Route path="/accounts" component={Accounts}/>
    </Route>
  </Router>,
  document.getElementById('app')
);
