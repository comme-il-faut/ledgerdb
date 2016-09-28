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

    let token = 'Basic ' + btoa(this.state.user + ':' + this.state.pass);

    fetch('api/login', {
      method: 'get',
      headers: { 'Authorization': token }
    })
      .then(res => {
        if (res.ok) {
          this.setState({ err: null, running: false });
          let auth = { user: this.state.user, token: token };
          let remember = document.getElementById('inputRemember').checked;
          this.props.app.setAuth(auth, remember);
        } else {
          throw Error(res.statusText);
        }
      })
      .catch(err => {
        this.setState({ err: err, running: false });
      });
  }

  handleChange(field, e) {
    let state = this.state;
    state[field] = e.target.value;
    this.setState(state);
  }

  renderButton() {
    if (this.state.running)
      return (
        <button className="btn btn-lg btn-primary btn-block disabled" type="submit" disabled>
          <i className="fa fa-circle-o-notch fa-spin"></i> Loggin in...
        </button>
      );
    else
      return (
        <button className="btn btn-lg btn-primary btn-block" type="submit">Log in</button>
      );
  }

  render() {
    let err;
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
          <h2 className="form-signin-heading">
            <i className="fa fa-bar-chart" aria-hidden="true"></i>
          </h2>
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
          <div className="checkbox">
            <label>
              <input type="checkbox" id="inputRemember" value="remember-me"/> Remember me
            </label>
          </div>
          {this.renderButton()}
        </form>
      </div>
    );
  }

}

export default Login;
