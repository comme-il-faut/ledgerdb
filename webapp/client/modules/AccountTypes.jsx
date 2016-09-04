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
    this.state = { data: [] };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  componentDidMount() {
    fetch('http://localhost:8080/application/api/account_type/')
      .then((resp) => {
        return resp.json();
      })
      .then((data) => {
        this.setState({ data: data });
      });
  }
  render() {
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
      <table>
        <thead>
          <tr>
            <th>Account Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
    //console.log("state: %o", this.state);
  }
}

export default AccountTypes;
