import React from 'react';

class AccountType extends React.Component {
  render() {
    return (
      <tr>
        <td>{this.props.account_type.account_type}</td>
        <td>{this.props.account_type.description}</td>
      </tr>
    );
  }
}

class AccountTypes extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: [], err: null };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  componentDidMount() {
    document.title = "LedgerDB - Account Types";
    fetch('api/account_type/')
      .then(res => {
        if (res.ok) {
          res.json().then(json => {
            this.setState({ data: json, err: null });
          });
        } else {
          throw Error(res.statusText);
        }
      })
      .catch(err => {
        this.setState({ data: [], err: err });
      });
  }
  render() {
    if (this.state.err) {
      return (
        <div className="alert alert-danger">
          <strong>Oh snap!</strong> {this.state.err.toString()}
        </div>
      );
    }
    if (this.state.data.length == 0) {
      return null;
    }
    var rows = [];
    this.state.data.forEach(function(account_type) {
      rows.push(
        <AccountType
          key={account_type.account_type}
          account_type={account_type}
        />
      );
    });
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Account Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}

export default AccountTypes;
