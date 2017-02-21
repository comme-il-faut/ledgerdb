import React from 'react';

import AccountTypes from './subcomponents/Admin/AccountTypes';
import Accounts from './subcomponents/Admin/Accounts';

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
        <div className="panel panel-default pull-left">
          <div className="panel-heading">
            <h4>Account Types</h4>
          </div>
          <AccountTypes/>
        </div>
        <div className="panel panel-default pull-left">
          <div className="panel-heading">
            <h4>Accounts</h4>
          </div>
          <Accounts/>
        </div>
      </div>
    );
  }
}

export default Admin;
