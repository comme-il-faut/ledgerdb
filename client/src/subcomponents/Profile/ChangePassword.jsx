import React from 'react';

import Message from '../../shared/Message';

class PasswordChange extends React.Component {
  constructor(props) {
    super(props);
    this.state = { oldpw: '', newpw: '', newpw2: '', running: false, result: null };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <div className="panel panel-default pull-left">
        <div className="panel-heading">
          <h3 className="panel-title">Change Password</h3>
        </div>
        <div className="panel-body">
          <form onSubmit={this.handleSubmit}>
            {this.renderPasswordInput('oldpw', 'Old Password')}
            {this.renderPasswordInput('newpw', 'New Password')}
            {this.renderPasswordInput('newpw2', 'Confirm New Password')}
            {this.renderButton()}
          </form>
        </div>
        <Message message={this.state.result}/>
      </div>
    );
  }

  renderPasswordInput(id, label) {
    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <input type="password" className="form-control" id={id}
          placeholder={label}
          value={this.state[id]}
          onChange={this.handleChange.bind(this, id)}
          />
      </div>
    );
  }

  renderButton() {
    if (this.state.running)
      return (
        <button className="btn btn-primary btn-block le-loading" type="submit" disabled>
          <i className="fa fa-spinner fa-pulse fa-fw" aria-hidden="true"></i> Change Password
        </button>
      );
    else
      return (
        <button className="btn btn-primary btn-block" type="submit">Change Password</button>
      );
  }

  handleChange(field, e) {
    let state = {};
    state[field] = e.target.value;
    this.setState(state);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ running: true });

    if (this.state.newpw != this.state.newpw2) {
      this.setState({
        running: false,
        result: new Error("Please retype and confirm your new password.")
      });
      return;
    }
    if (this.state.oldpw == this.state.newpw) {
      this.setState({
        running: false,
        result: new Error("New and old passwords cannot be same.")
      });
      return;
    }

    fetch('api/chpasswd', {
      method: 'post',
      headers: { 'Authorization': sessionStorage.token },
      body: JSON.stringify({ oldpw: this.state.oldpw, newpw: this.state.newpw })
    })
      .then(res => {
        if (res.ok) {
          let result = "Your password has been changed successfully.";
          sessionStorage.token = 'Basic ' + btoa(sessionStorage.user + ':' + this.state.newpw);
          this.setState({ oldpw: '', newpw: '', newpw2: '', running: false, result: result });
        } else {
          return res.text()
            .then(text => {
              if (text)
                throw new Error(text);
              else
                throw new Error(res.statusText);
            })
            .catch(err => {
              throw new Error(res.statusText);
            });
        }
      })
      .catch(err => {
        this.setState({ running: false, result: err });
      });
  }

}

export default PasswordChange;
