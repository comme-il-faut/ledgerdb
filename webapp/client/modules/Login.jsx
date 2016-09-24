import React from 'react';

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = { err: null, running: false, user: '', pass: '' };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    document.title = "LedgerDB";
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ running: true });

    var auth = btoa(this.state.user + ':' + this.state.pass);

    fetch('api/login', {
      method: 'get',
      headers: { 'Authorization': 'Basic ' + auth }
    })
      .then(res => {
        if (res.ok) {
          this.setState({ err: null, running: false });
          this.props.app.setAuth(auth);
        } else {
          throw Error(res.statusText);
        }
      })
      .catch(err => {
        this.setState({ err: err, running: false });
      });
  }

  handleChange(field, e) {
    var state = this.state;
    state[field] = e.target.value;
    this.setState(state);
  }

  renderButton() {
    //var disabled = !this.state.user && !this.state.running;
    var disabled = this.state.running ? true : false;
    var text = this.state.running ? "Logging in..." : "Log in";
    return (
      <button className="btn btn-lg btn-primary btn-block" type="submit"
        disabled={disabled}>{text}</button>
    );
  }

  render() {
    var err;
    if (this.state.err) {
      err = (
        <div className="alert alert-danger">
          {this.state.err.message}
        </div>
      );
    }
    return (
      <div className="container">
        <form onSubmit={this.handleSubmit} className="form-signin">
          <h2 className="form-signin-heading">Log in</h2>
          {err}
          <label for="inputUser" className="sr-only">Username</label>
          <input type="text" id="inputUser" className="form-control"
            placeholder="Username" required autofocus
            onChange={this.handleChange.bind(this, 'user')}
            />
          <label for="inputPass" className="sr-only">Password</label>
          <input type="password" id="inputPass" className="form-control"
            placeholder="Password"
            onChange={this.handleChange.bind(this, 'pass')}
            />
          {/*
          <div className="checkbox">
            <label>
              <input type="checkbox" value="remember-me"/> Remember me
            </label>
          </div>
          */}
          {this.renderButton()}
        </form>
      </div>
    );
  }

}

export default Login;
