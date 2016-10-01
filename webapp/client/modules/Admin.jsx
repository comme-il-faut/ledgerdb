import React from 'react';

import AccountTypes from './Admin/AccountTypes.jsx'
import Accounts from './Admin/Accounts.jsx'

class Admin extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.title = "LedgerDB - Admin";
  }

  render() {
    return (
      <div>
        <h2>Accounts</h2>
        <Accounts/>
        <h2>Account Types</h2>
        <AccountTypes/>
      </div>
    );
  }
}

export default Admin;
