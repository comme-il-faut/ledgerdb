import React from 'react';

import ChangePassword from './Profile/ChangePassword.jsx'

class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    document.title = "LedgerDB - Profile";
  }

  render() {
    return (
      <div className="row">
        <ChangePassword/>
      </div>
    );
  }
}

export default Profile;
