import React from 'react';

class Account extends React.Component {
  render() {
    return (
      <tr>
        <td>{this.props.account.account_id}</td>
        <td>{this.props.account.account_type}</td>
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
    this.state = { data: [] };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  componentDidMount() {
    fetch('api/account/')
      .then((resp) => {
        return resp.json();
      })
      .then((data) => {
        this.setState({ data: data });
      });
  }
  render() {
    var rows = [];
    this.state.data.forEach(function(account) {
      rows.push(
        <Account
          key={account.account_id}
          account={account}
        />
      );
    });
    return (
      <table className="data">
        <thead>
          <tr>
            <th>Account</th>
            <th>Type</th>
            <th>Name</th>
            <th>Cash</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
    //console.log("state: %o", this.state);
  }
}

export default Accounts;
