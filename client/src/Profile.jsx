import React from 'react';

import ChangePassword from './subcomponents/Profile/ChangePassword';

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
