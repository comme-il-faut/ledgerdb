import React from 'react';

import ProgressBar from './shared/ProgressBar';

class Dashboard extends React.PureComponent {

  componentDidMount() {
    document.title = "LedgerDB";
  }

  render() {
    /*
    return (
      <div>
        TODO
      </div>
    );
    */
    return (
      <div>
        <ProgressBar/>
      </div>
    );
  }
}

export default Dashboard;
