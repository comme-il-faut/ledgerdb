import React from 'react';

class Account extends React.Component {
  render() {
    return (
      <tr>
        <td>{this.props.account.accountId}</td>
        <td>{this.props.account.accountType}</td>
        <td>{this.props.account.name}</td>
        <td>{this.props.account.cash}</td>
        <td>{this.props.account.active}</td>
      </tr>
    );
  }
}

class Accounts extends React.Component {

  constructor(props) {
    super(props);
    this.state = { data: [], err: null };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    document.title = "LedgerDB - Accounts";
    fetch('api/account/', {
      method: 'get',
      headers: { 'Authorization': sessionStorage.token }
    })
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

    return (
      <table className="table table-striped table-condensed">
        <thead>
          <tr>
            <th>Account</th>
            <th>Type</th>
            <th>Name</th>
            <th>Cash</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {this.state.data.map((account) => (
            <Account
              key={account.accountId}
              account={account}
            />
          ))}
        </tbody>
      </table>
    );
  }

}

export default Accounts;
