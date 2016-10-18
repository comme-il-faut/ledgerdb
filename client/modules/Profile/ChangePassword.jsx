import React from 'react';

import Message from '../Message.jsx';

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
            {this.renderTextInput('oldpw', 'Old Password')}
            {this.renderTextInput('newpw', 'New Password')}
            {this.renderTextInput('newpw2', 'Confirm New Password')}
            {this.renderButton()}
          </form>
        </div>
        {/* this.renderMessage() */}
        <Message message={this.state.result}/>
      </div>
    );
  }

  renderTextInput(id, label) {
    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <input type="password" className="form-control" id={id} ref={id} key={id}
          placeholder={label}
          onChange={this.handleChange.bind(this, id)}
          />
      </div>
    );
  }

  renderButton() {
    if (this.state.running)
      return (
        <button className="btn btn-primary btn-block disabled" type="submit" disabled>
          <i className="fa fa-circle-o-notch fa-spin"></i> Change Password
        </button>
      );
    else
      return (
        <button className="btn btn-primary btn-block" type="submit">Change Password</button>
      );
  }

  renderMessage() {
    if (!this.state.result)
      return null;

    let title, body;
    if (this.state.result instanceof Error) {
      title = (
        <h4 className="modal-title text-danger">
          <i className="fa fa-exclamation-circle" aria-hidden="true"></i> Error
        </h4>
      );
      body = (
        <p>{this.state.result.message}</p>
      );
    } else {
      title = (
        <h4 className="modal-title text-success">
          <i className="fa fa-check-circle" aria-hidden="true"></i> Great Success
        </h4>
      );
      body = (
        <p>{this.state.result}</p>
      );
    }

    return (
      <div className="modal fade" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-sm" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close" aria-label="Close" data-dismiss="modal" type="button">
                <span aria-hidden="true">&times;</span>
              </button>
              {title}
            </div>
            <div className="modal-body">
              {body}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleChange(field, e) {
    let state = this.state;
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

    let setError = (err) => {
        this.setState({ running: false, result: err });
    };

    fetch('api/chpasswd', {
      method: 'post',
      headers: { 'Authorization': sessionStorage.token },
      body: JSON.stringify({ oldpw: this.state.oldpw, newpw: this.state.newpw })
    })
      .then(res => {
        if (res.ok) {
          let result = "Your password has been changed successfully.";
          sessionStorage.token = 'Basic ' + btoa(sessionStorage.user + ':' + this.state.newpw);
          $('input:password').val('');
          this.setState({ oldpw: '', newpw: '', newpw2: '', running: false, result: result });
        } else {
          res.text()
            .then(text => {
              if (text) throw new Error(text);
              else throw new Error(res.statusText);
            })
            .catch(err => setError(err));
        }
      })
      .catch(err => setError(err));
  }

  componentDidUpdate() {
    if (this.state.result) {
      this.state.result = null;
    }
  }

}

export default PasswordChange;
