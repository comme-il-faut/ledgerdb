import React from 'react';
import { Link, NavLink, Route, Switch } from 'react-router-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import AccountBalances from './AccountBalances';
import Dashboard from './Dashboard';
import Login from './Login';
import Post from './Post';
import Postings from './Postings';
import Profile from './Profile';
import Reconciliation from './Reconciliation';
import Reports from './Reports';
import promisedComponent from './promisedComponent';

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
          console.log("Error: %o", err)
          this.setState({ auth: null, err: err });
        });
    }
  }

  render() {
    if (this.state.err) {
      /*
      return (
        <div className="container">
          <div className="alert alert-danger">
            <strong>Oh sorrow!</strong> {this.state.err.toString()}
          </div>
        </div>
      );
      */
      // TODO try key attr on div container ???
      return (
        <div className="container alert alert-danger">
          <strong>Oh sorrow!</strong> {this.state.err.toString()}
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

    if (this.state.auth && !this.state.auth.verified) {
      return (
        <div className="container">
          <div className="text-center">
            {/* Logging in... */}
          </div>
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
              LedgerDB
            </Link>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav navbar-left">
              <li>
                <NavLink to="/post" activeClassName="active">
                  <i className="fa fa-plus" aria-hidden="true"></i> Post
                </NavLink>
              </li>
              <li>
                <NavLink to="/postings" activeClassName="active">
                  <i className="fa fa-search" aria-hidden="true"></i> Postings
                </NavLink>
              </li>
              <li>
                <NavLink to="/recon" activeClassName="active">
                  <i className="fa fa-handshake-o" aria-hidden="true"></i> Reconciliation
                </NavLink>
              </li>
              <li>
                <NavLink to="/balance" activeClassName="active">
                  <i className="fa fa-balance-scale" aria-hidden="true"></i> Balances
                </NavLink>
              </li>
              <li>
                <NavLink to="/reports" activeClassName="active">
                  <i className="fa fa-bar-chart" aria-hidden="true"></i> Reports
                </NavLink>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              {/*
              <li>
                <NavLink to="/admin">
                  <i className="fa fa-lock" aria-hidden="true"></i> Administration
                </NavLink>
              </li>
              */}
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
          <Switch key={/^\w*/.exec(location.hash.replace(/^\W+/, ""))[0]}>
            <Route exact path="/" component={Dashboard}/>

            <Route path="/post" component={Post}/>
            <Route path="/postings" component={Postings}/>
            <Route path="/recon" component={promisedComponent(Reconciliation)}/>
            <Route path="/balance" component={promisedComponent(AccountBalances)}/>
            <Route path="/reports" component={Reports}/>

            {/*<Route path="/admin" component={Admin}/>*/}
            <Route path="/profile" component={Profile}/>
          </Switch>
        </ReactCSSTransitionGroup>
      </div>
    );
  }

}

export default App;
