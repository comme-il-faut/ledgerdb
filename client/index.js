import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, Link, useRouterHistory } from 'react-router';
import { createHashHistory } from 'history';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Admin from './modules/Admin.jsx'
import Dashboard from './modules/Dashboard.jsx'
import Login from './modules/Login.jsx'
import Post from './modules/Post.jsx'
import Postings from './modules/Postings.jsx'
import Profile from './modules/Profile.jsx'
import Reconciliation from './modules/Reconciliation.jsx'

class App extends React.Component {

  constructor(props) {
    super(props);
    let auth = localStorage.getItem('auth');
    if (auth) {
      if (typeof auth === 'string')
        auth = JSON.parse(auth);
      sessionStorage.token = auth.token;
      sessionStorage.user = auth.user;
      auth.verified = false;
    }
    this.state = { auth: auth, err: null };
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  setAuth(auth, remember) {
    if (remember)
      localStorage.setItem('auth', JSON.stringify(auth));
    sessionStorage.token = auth.token;
    sessionStorage.user = auth.user;
    auth.verified = true;
    this.setState({ auth: auth });
  }

  handleLogOut(e) {
    //e.preventDefault();
    localStorage.removeItem('auth');
    sessionStorage.clear();
    this.setState({ auth: null });
  }

  componentDidMount() {
    document.title = "LedgerDB";
    if (this.state.auth && !this.state.auth.verified) {
      fetch('api/login', {
        method: 'get',
        headers: { 'Authorization': this.state.auth.token }
      })
        .then(res => {
          if (res.ok) {
            this.state.auth.verified = true;
            this.setState({ auth: this.state.auth });
          } else {
            throw Error(res.statusText);
          }
        })
        .catch(err => {
          this.setState({ auth: null, err: err });
        });
    }
  }

  render() {
    if (this.state.auth && !this.state.auth.verified) {
      return (
        <div className="container">
          <div className="text-center">
            <p>
              <i className="fa fa-circle-o-notch fa-spin"></i> Logging in...
            </p>
          </div>
        </div>
      );
    }

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
          <div className="container">
          <div className="navbar-header">
            <button type="button"
                className="navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link to="/" className="navbar-brand">
              <i className="fa fa-bar-chart" aria-hidden="true"></i> LedgerDB
            </Link>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav navbar-left">
              <li>
                <Link to="/post">
                  <i className="fa fa-plus" aria-hidden="true"></i> Post
                </Link>
              </li>
              <li>
                <Link to="/postings">
                  <i className="fa fa-search" aria-hidden="true"></i> Postings
                </Link>
              </li>
              <li>
                <Link to="/recon">
                  <i className="fa fa-handshake-o" aria-hidden="true"></i> Reconciliation
                </Link>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li>
                <Link to="/admin">
                  <i className="fa fa-lock" aria-hidden="true"></i> Administration
                </Link>
              </li>
              <li className="dropdown">
                <a href="#"
                  className="dropdown-toggle"
                  data-toggle="dropdown"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="fa fa-user" aria-hidden="true"></i>
                  {" Profile "}
                  <span className="caret"></span>
                </a>
                <ul className="dropdown-menu">
                  <li className="dropdown-header">{this.state.auth.user}</li>
                  <li><Link to="/profile">Profile</Link></li>
                  <li role="separator" className="divider"></li>
                  <li><Link to="/" onClick={this.handleLogOut}>Log Out</Link></li>
                </ul>
              </li>
            </ul>
          </div>
          </div>
        </nav>
        <ReactCSSTransitionGroup
          component="div"
          transitionName="transition-fade"
          transitionEnterTimeout={500}
          transitionLeave={false}
        >
        {React.cloneElement(this.props.children, { key: this.props.location.pathname })}
        </ReactCSSTransitionGroup>
      </div>
    )
  }

}

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
