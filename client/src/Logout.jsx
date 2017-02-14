import React from 'react';

class Logout extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    document.title = "LedgerDB";
    localStorage.removeItem('auth');
    this.setState({ auth: null });
  }
}

export default Logout;
