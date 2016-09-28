import React from 'react';

import ChangePassword from './Profile/ChangePassword.jsx'

class Profile extends React.Component {
  constructor(props) {
    super(props);
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
